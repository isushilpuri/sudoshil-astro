---
title: "Getting Started with Amazon Connect"
description: "A beginner's guide to building your first IVR contact center flow using Amazon Connect."
date: "May 2025"
pubDate: "2025-05-01"
readTime: "8 min read"
tags: ["Amazon Connect", "AWS", "IVR"]
headerGradient: "linear-gradient(135deg, #695aa6 0%, #1e549f 100%)"
accentColor: "#695aa6"
calloutBg: "#f3f0ff"
---

If you've ever called a bank's helpline and navigated through a phone menu — "Press 1 for account balance, Press 2 for card services" — you've already experienced an IVR (Interactive Voice Response) system. Amazon Connect is AWS's cloud-based contact center service that lets you build these kinds of systems without managing any telephony infrastructure.

In this post I'll walk you through the core concepts and show you how to build your first real contact flow from scratch.

## What is Amazon Connect?

Amazon Connect is a self-service, omnichannel cloud contact center. At its core it provides:

- **Phone numbers** — claim a DID (Direct Inward Dialing) number in minutes.
- **Contact flows** — the visual drag-and-drop logic that decides what a caller hears and where they get routed.
- **Queues & routing profiles** — assign agents to queues and control who handles which call.
- **Amazon Lex integration** — add NLU (Natural Language Understanding) so callers can speak naturally instead of pressing keys.
- **Real-time & historical metrics** — see what's happening on the floor live.

<div class="callout">
<strong>Cost model:</strong> You pay per minute of usage and per active agent. There is no upfront commitment and the free tier covers 90 minutes/month.
</div>

## Key Concepts You Must Know First

### Contact Flows

A contact flow is the brain of your IVR. Think of it as a flowchart where each box is a *block*. Blocks can play audio, get input, invoke a Lambda, transfer to a queue, or disconnect. Connect has several flow types:

- **Inbound contact flow** — triggered when a customer calls in.
- **Customer queue flow** — plays hold music while a customer waits in queue.
- **Transfer to agent flow** — runs when a call is transferred to a specific agent.
- **Whisper flow** — plays a message to the agent right before the call connects.

### Queues and Routing Profiles

A **queue** holds contacts waiting for an agent. A **routing profile** maps queues to agents, with priority and delay settings so you can control which queue an agent picks up from first.

### Contact Attributes

Attributes are key-value pairs that travel with the contact throughout its lifecycle. You set them using the *Set contact attributes* block and read them anywhere downstream — in Lambda functions, in whisper flows, or in reporting.

## Building Your First Flow: A Simple Balance Inquiry IVR

We'll build a flow that:

1. Greets the caller.
2. Asks them to press 1 for account balance or 2 to speak to an agent.
3. On press 1 — invokes a Lambda to fetch a mock balance and reads it back.
4. On press 2 — transfers the caller to a queue.

### Step 1 — Create your Connect instance

In the AWS Console, open **Amazon Connect** and click *Create instance*. Choose *Store users in Amazon Connect*, set an access URL (e.g., `mybank.my.connect.aws`), skip data storage customisation for now, and finish the wizard.

### Step 2 — Claim a phone number

In your Connect instance dashboard go to **Channels → Phone numbers → Claim a number**. Pick a DID number in your country. Leave the contact flow as *Default inbound flow* for now — we'll change it after we build ours.

### Step 3 — Create the Lambda function

Our flow will call a Lambda to retrieve a balance. Create a Python Lambda with this handler:

```python
import json

def lambda_handler(event, context):
    # event['Details']['ContactData']['CustomerEndpoint']['Address'] gives the caller's phone number
    caller = event['Details']['ContactData']['CustomerEndpoint']['Address']

    return {
        "balance": "2,450.00",
        "currency": "USD",
        "caller": caller
    }
```

After deploying, go to your Connect instance in the console → **Flows → AWS Lambda** and add the function ARN so Connect is allowed to invoke it.

### Step 4 — Build the contact flow

Open **Routing → Contact flows → Create contact flow**. You'll see a canvas with just an *Entry point* block.

1. **Play prompt** — drag a *Play prompt* block, set text-to-speech text: *"Welcome to Sudoshil Bank. For account balance press 1. To speak to an agent press 2."*
2. **Get customer input** — add a *Get customer input* block. Set the prompt to silence (already announced above), type *DTMF*, timeout 5 seconds, add two options: `1` and `2`.
3. **Branch on 1** — Invoke AWS Lambda: select your function. Store the returned `balance` in a contact attribute called `AccountBalance`.
4. **Play balance** — Play prompt using dynamic text: *"Your current balance is $.Attributes.AccountBalance dollars."*
5. **Disconnect** — Add a *Disconnect / hang up* block after the balance readback.
6. **Branch on 2** — Add a *Set working queue* block pointing to your *BasicQueue*, then a *Transfer to queue* block.

Wire all the blocks together, connect the *Timeout* and *Error* branches to a friendly error prompt followed by disconnect, and click **Save & Publish**.

### Step 5 — Assign the flow to your phone number

Go back to **Channels → Phone numbers**, edit your claimed number, and change *Contact flow / IVR* to your new flow. Call the number — you should hear your greeting!

## Common Gotchas

- **Lambda timeout** — Connect waits up to 8 seconds for a Lambda response. Keep your functions fast; use async patterns for anything slower.
- **Text-to-speech quirks** — Numbers read digit-by-digit unless you use SSML: `<say-as interpret-as="cardinal">2450</say-as>`.
- **Contact attribute size** — Each attribute value is capped at 32 KB. Don't try to pass large JSON blobs; store data in DynamoDB and pass a reference key.
- **Error handling** — Every block that can fail (Lambda invoke, Get customer input) has an *Error* and *Timeout* branch. Always wire them up — a dead end causes an abrupt disconnect.

## What's Next?

Once you're comfortable with basic flows, the natural next step is adding conversational AI with Amazon Lex so callers can say *"What's my balance?"* instead of pressing keys. I cover that in depth in the next post.

<div class="callout">
<strong>Further reading:</strong> The official <a href="https://docs.aws.amazon.com/connect/" target="_blank" rel="noreferrer">Amazon Connect documentation</a> is surprisingly good. The <em>Administrator Guide</em> is especially useful for understanding routing and metrics.
</div>
