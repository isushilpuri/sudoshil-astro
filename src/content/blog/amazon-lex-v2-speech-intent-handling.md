---
title: "Amazon Lex V2: Speech & Intent Handling"
description: "Deep dive into slot validation, retries, and codehook patterns in Lex V2."
date: "April 2025"
pubDate: "2025-04-01"
readTime: "10 min read"
tags: ["Amazon Lex", "NLU", "AWS"]
headerGradient: "linear-gradient(135deg, #1e549f 0%, #695aa6 100%)"
accentColor: "#1e549f"
calloutBg: "#e8f0fe"
---

Amazon Lex V2 is the NLU (Natural Language Understanding) engine that powers conversational interfaces in AWS. When integrated with Amazon Connect, it lets callers speak naturally — *"I want to check my account balance"* — instead of navigating DTMF menus. Under the hood, Lex converts speech to text, identifies the *intent*, extracts *slots* (structured parameters), and either fulfills the request or asks follow-up questions.

This post covers the concepts that trip people up in production: slot elicitation, validation via codehooks, retry flows, and FallbackIntent handling.

## Core Concepts

### Intents

An **intent** represents something the user wants to do. For a banking bot you might have intents like `CheckBalance`, `TransferFunds`, `ReportLostCard`. Each intent has:

- **Sample utterances** — example phrases Lex uses to train the classifier (e.g., *"what's my balance"*, *"show me my account balance"*).
- **Slots** — parameters Lex needs to fulfill the intent.
- **Fulfillment** — what happens when all slots are filled (a Lambda call or a closure message).

### Slots and Slot Types

A **slot** is a piece of information the bot collects. Slot types can be:

- **Built-in** — `AMAZON.Date`, `AMAZON.Number`, `AMAZON.PhoneNumber`, etc. Lex handles recognition and normalization.
- **Custom** — your own enumerated list (e.g., `AccountType` with values *savings*, *checking*, *credit*) or a regular expression pattern.

### Dialog Codehook vs Fulfillment Codehook

| Codehook type | When it runs | Primary use |
|---|---|---|
| Dialog | After each turn, while slots are being filled | Validate slot values, dynamically change prompts, elicit a different slot |
| Fulfillment | Once all required slots are filled | Execute the business logic (API call, DB lookup) and return a final response |

## The Lex V2 Lambda Event Shape

Understanding the event structure is essential before writing any codehook logic:

```json
{
  "sessionId": "abc123",
  "inputMode": "Speech",
  "interpretations": [
    {
      "intent": {
        "name": "CheckBalance",
        "slots": {
          "AccountType": {
            "value": {
              "originalValue": "savings",
              "interpretedValue": "savings",
              "resolvedValues": ["savings"]
            }
          }
        },
        "state": "InProgress",
        "confirmationState": "None"
      },
      "nluConfidence": { "score": 0.94 }
    }
  ],
  "sessionState": {
    "activeContexts": [],
    "sessionAttributes": {},
    "intent": {}
  },
  "invocationSource": "DialogCodeHook"
}
```

## Writing a Dialog Codehook for Slot Validation

Let's say the user is transferring funds and we ask for the amount. We want to reject amounts over $10,000 and re-elicit the slot with a clear explanation.

```python
import json

def lambda_handler(event, context):
    invocation_source = event['invocationSource']
    intent = event['sessionState']['intent']
    slots = intent.get('slots', {})
    session_attrs = event['sessionState'].get('sessionAttributes', {})

    if invocation_source == 'DialogCodeHook':
        return validate_and_elicit(intent, slots, session_attrs, event)

    # FulfillmentCodeHook
    return fulfill(slots, session_attrs)


def validate_and_elicit(intent, slots, session_attrs, event):
    amount_slot = slots.get('TransferAmount')

    if amount_slot and amount_slot.get('value'):
        amount_str = amount_slot['value']['interpretedValue']
        try:
            amount = float(amount_str.replace(',', ''))
        except ValueError:
            return elicit_slot(
                intent, slots, session_attrs,
                slot_to_elicit='TransferAmount',
                message="I didn't catch a valid amount. How much would you like to transfer?"
            )

        if amount > 10000:
            return elicit_slot(
                intent, slots, session_attrs,
                slot_to_elicit='TransferAmount',
                message=f"Transfers over $10,000 require branch authorisation. "
                         f"Please enter an amount of $10,000 or less."
            )

    # All checks passed — delegate back to Lex to continue the dialog
    return delegate(intent, slots, session_attrs)


def delegate(intent, slots, session_attrs):
    return {
        "sessionState": {
            "sessionAttributes": session_attrs,
            "dialogAction": {"type": "Delegate"},
            "intent": {"name": intent['name'], "slots": slots, "state": "InProgress"}
        }
    }


def elicit_slot(intent, slots, session_attrs, slot_to_elicit, message):
    return {
        "sessionState": {
            "sessionAttributes": session_attrs,
            "dialogAction": {
                "type": "ElicitSlot",
                "slotToElicit": slot_to_elicit
            },
            "intent": {"name": intent['name'], "slots": slots, "state": "InProgress"}
        },
        "messages": [{"contentType": "PlainText", "content": message}]
    }
```

<div class="callout">
<strong>Key rule:</strong> Always return the full <code>sessionState</code> object in your Lambda response. Missing any field causes Lex to throw a cryptic <em>ResourceNotFoundException</em>.
</div>

## Handling Retries Gracefully

By default, Lex will retry a slot elicitation up to the number of times you configure in the bot (typically 2–3). After that it moves to the intent's *failure* path. You can track retry count yourself using `sessionAttributes`:

```python
def validate_and_elicit(intent, slots, session_attrs, event):
    retry_key = 'AmountRetryCount'
    retry_count = int(session_attrs.get(retry_key, '0'))

    amount_slot = slots.get('TransferAmount')
    if amount_slot and amount_slot.get('value'):
        # ... validation logic ...
        if invalid:
            if retry_count >= 2:
                # Give up, transfer to agent
                session_attrs[retry_key] = '0'
                return close_and_transfer(intent, session_attrs)

            session_attrs[retry_key] = str(retry_count + 1)
            return elicit_slot(intent, slots, session_attrs, 'TransferAmount',
                               f"Still didn't catch that (attempt {retry_count+1} of 3). "
                                "Please say an amount less than $10,000.")

    session_attrs[retry_key] = '0'
    return delegate(intent, slots, session_attrs)
```

## FallbackIntent — The Safety Net

Lex routes to `AMAZON.FallbackIntent` when it can't confidently match any of your intents (confidence score below the threshold, usually 0.40). Always handle it — ignoring it leaves callers in silence.

```python
def lambda_handler(event, context):
    intent_name = event['sessionState']['intent']['name']

    if intent_name == 'FallbackIntent':
        return {
            "sessionState": {
                "sessionAttributes": event['sessionState'].get('sessionAttributes', {}),
                "dialogAction": {"type": "Close"},
                "intent": {"name": "FallbackIntent", "state": "Fulfilled"}
            },
            "messages": [{
                "contentType": "PlainText",
                "content": "I'm sorry, I didn't understand that. Let me transfer you to an agent."
            }]
        }
    # ... rest of your logic
```

In your Amazon Connect flow, check the Lex output attribute `$.Lex.Intent.Name`. If it equals `FallbackIntent`, route the call to an agent queue instead of proceeding with self-service.

## SSML for Better Voice Responses

When Lex reads a response back to the caller via Connect's text-to-speech engine, you can use SSML to control pronunciation and pacing:

```python
messages = [{
    "contentType": "SSML",
    "content": (
        "<speak>"
        "Your balance is "
        "<say-as interpret-as='cardinal'>2450</say-as> "
        "dollars and "
        "<say-as interpret-as='cardinal'>75</say-as> cents. "
        "<break time='500ms'/>"
        "Is there anything else I can help you with?"
        "</speak>"
    )
}]
```

## Quick Checklist Before Going Live

- Every slot has a clear, unambiguous elicitation prompt.
- Dialog codehook validates every slot that could hold bad data.
- Retry count is tracked in session attributes; caller is handed to an agent after 2–3 failures.
- `FallbackIntent` has a handler that triggers an agent transfer in Connect.
- Lambda timeout is < 8 seconds (Connect's hard limit for Lex codehook Lambdas).
- All Lambda responses include the full `sessionState` block.
