---
title: "CloudFormation, Without the Fog: My Journey from Console Clicks to Infrastructure as Code"
description: "A practical guide to AWS CloudFormation, stacks, templates, resources, parameters, outputs, intrinsic functions, and how it fits with Boto3."
date: "August 2026"
pubDate: "2026-08-10"
readTime: "10 min read"
tags: ["Cloud Formation", "DevOps", "AWS"]
headerGradient: "linear-gradient(135deg, #1e549f 0%, #695aa6 100%)"
accentColor: "#1e549f"
calloutBg: "#e8f0fe"
---


# CloudFormation, Without the Fog

*My notes on going from “I can create it in the AWS Console” to “I can describe it as code.”*

There is something oddly satisfying about creating an AWS resource from the console.

Click a few buttons. Choose a region. Fill in some fields. Hit **Create**.

It works.

Then, a few weeks later, you need the same thing in another environment.

So you click everything again.

And again.

And eventually you start wondering:

> **“What if I could just describe what I want and let AWS build it for me?”**

That question is where **AWS CloudFormation** starts to make sense.

This is my learning journal for CloudFormation — starting from the absolute basics and gradually connecting it to the AWS services I work with, especially Lambda and Amazon Lex.

---

## The idea in one sentence

**CloudFormation lets you describe AWS infrastructure as code and then have AWS create, update, and manage that infrastructure for you.**

Instead of:

```text
AWS Console
   ↓
Click
Click
Click
Click
Create
```

you can have:

```text
template.yaml
     ↓
CloudFormation
     ↓
AWS resources
```

That's the fundamental idea.

---

# 1. Before CloudFormation: the Console

Imagine I want an S3 bucket.

Without Infrastructure as Code, I might do this:

```text
AWS Console
   ↓
S3
   ↓
Create bucket
   ↓
Enter bucket name
   ↓
Configure settings
   ↓
Create
```

Nothing is inherently wrong with this.

The problem starts when infrastructure becomes more complicated.

Imagine an application that needs:

```text
Lambda
DynamoDB
IAM Role
S3
API Gateway
CloudWatch
```

Now imagine recreating all of that for:

```text
DEV
UAT
PROD
```

Manual configuration becomes tedious and, more importantly, difficult to reproduce reliably.

CloudFormation gives us another approach.

---

# 2. Infrastructure as Code

CloudFormation is an **Infrastructure as Code (IaC)** service.

The idea is simple:

> Infrastructure should be describable in a file, just like application code.

For example:

```yaml
Resources:

  MyBucket:
    Type: AWS::S3::Bucket
```

This doesn't tell CloudFormation *how* to create the bucket step by step.

It tells CloudFormation:

> “I want an S3 bucket to exist.”

That distinction is important.

---

# 3. Declarative vs Imperative

This is one of the first concepts that clicked for me.

With something like Boto3, I can write:

```python
import boto3

s3 = boto3.client("s3")

s3.create_bucket(...)
```

I'm essentially saying:

> **Perform this operation.**

That's an imperative style.

CloudFormation is different.

I write:

```yaml
Resources:

  MyBucket:
    Type: AWS::S3::Bucket
```

I'm saying:

> **This is the state I want.**

That's declarative.

Think about it like this:

```text
Boto3
────────────────────────
"Create this bucket."

CloudFormation
────────────────────────
"I want this bucket to exist."
```

CloudFormation then determines what AWS API operations are necessary to make reality match the template.

---

# 4. Template vs Stack

This distinction confused me initially, so it is worth making very clear.

## Template = Blueprint

A CloudFormation template is a YAML or JSON file describing the infrastructure we want.

For example:

```yaml
Resources:

  MyBucket:
    Type: AWS::S3::Bucket
```

Think of the template as an architectural blueprint.

## Stack = Deployed infrastructure

When we deploy that template, CloudFormation creates a **stack**.

```text
template.yaml
     │
     │ deploy
     ▼
MyApplicationStack
     │
     └── S3 Bucket
```

So:

```text
Template = Blueprint
Stack    = Deployed collection of resources
```

A stack is essentially the unit CloudFormation uses to create, update, and manage a collection of AWS resources.

---

# 5. Your first CloudFormation template

Let's start with something tiny.

Create:

```text
template.yaml
```

and put this inside:

```yaml
AWSTemplateFormatVersion: "2010-09-09"

Resources:

  MyBucket:
    Type: AWS::S3::Bucket
```

That's a valid basic CloudFormation template.

Let's break it down.

### `AWSTemplateFormatVersion`

```yaml
AWSTemplateFormatVersion: "2010-09-09"
```

This identifies the template format.

You will see this in many examples.

### `Resources`

```yaml
Resources:
```

This is the main section where we define the AWS resources that CloudFormation should manage.

### Logical ID

```yaml
MyBucket:
```

`MyBucket` is the **logical ID**.

It is an identifier used inside the template.

It doesn't necessarily mean that the physical S3 bucket will literally be named `MyBucket`.

### Resource type

```yaml
Type: AWS::S3::Bucket
```

This tells CloudFormation what we're creating.

The pattern is generally:

```text
AWS::<Service>::<Resource>
```

Examples include:

```text
AWS::S3::Bucket
AWS::Lambda::Function
AWS::DynamoDB::Table
AWS::IAM::Role
```

---

# 6. Creating the stack

There are several ways to deploy a CloudFormation template.

The easiest way to understand it initially is through the AWS Console.

Go to:

```text
AWS Console
    ↓
CloudFormation
    ↓
Create stack
    ↓
Upload template
    ↓
Select template.yaml
    ↓
Choose stack name
    ↓
Create stack
```

CloudFormation will then create the resource described by the template.

The result looks conceptually like:

```text
CloudFormation
└── MyApplicationStack
      └── MyBucket
            └── Actual S3 Bucket
```

---

# 7. Deploying from the CLI

Once the concept makes sense, the CLI becomes much more interesting.

For example:

```bash
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name my-first-stack
```

Now the workflow can become:

```text
template.yaml
     ↓
Git
     ↓
AWS CLI / CI/CD
     ↓
CloudFormation
     ↓
AWS infrastructure
```

This is where CloudFormation starts becoming useful in real engineering workflows.

---

# 8. Adding properties

Resources can have properties.

For example, let's enable versioning on our S3 bucket:

```yaml
AWSTemplateFormatVersion: "2010-09-09"

Resources:

  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      VersioningConfiguration:
        Status: Enabled
```

The structure is:

```text
Resource
├── Type
└── Properties
      └── VersioningConfiguration
```

Different AWS resource types have different properties.

You learn those properties from the AWS CloudFormation resource documentation.

---

# 9. Multiple resources in one stack

Now things get more interesting.

A real application rarely consists of a single resource.

For example:

```yaml
Resources:

  MyBucket:
    Type: AWS::S3::Bucket

  MyTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
```

One stack can now contain:

```text
MyApplicationStack
│
├── S3 Bucket
└── DynamoDB Table
```

This is where the word **stack** starts to make more sense.

CloudFormation can manage a collection of related resources as one unit.

---

# 10. Resources can depend on each other

Applications often have relationships between resources.

A Lambda function might need an IAM role.

```text
Lambda
   │
   └── needs → IAM Role
```

CloudFormation can express this relationship.

For example:

```yaml
Resources:

  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - lambda.amazonaws.com
            Action:
              - sts:AssumeRole

  MyFunction:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.12
      Handler: index.lambda_handler
      Role: !GetAtt LambdaRole.Arn
      Code:
        ZipFile: |
          def lambda_handler(event, context):
              return {
                  "statusCode": 200,
                  "body": "Hello from Lambda!"
              }
```

The interesting part is:

```yaml
Role: !GetAtt LambdaRole.Arn
```

We're telling CloudFormation:

> Get the ARN of the `LambdaRole` resource and use it here.

This brings us to **intrinsic functions**.

---

# 11. Intrinsic functions

CloudFormation has built-in functions that help resources reference and construct values.

Some of the most useful ones to learn first are:

```text
!Ref
!GetAtt
!Sub
```

Don't try to memorize every CloudFormation function immediately.

Start with these three.

---

# 12. `!Ref`

Suppose we have:

```yaml
Resources:

  MyBucket:
    Type: AWS::S3::Bucket
```

We can reference that resource with:

```yaml
!Ref MyBucket
```

For many resources, `Ref` returns the resource's primary identifier.

For example, for an S3 bucket it can resolve to the bucket name.

---

# 13. `!GetAtt`

Sometimes we need a specific attribute of a resource.

For example:

```yaml
Role: !GetAtt LambdaRole.Arn
```

This means:

```text
LambdaRole
    ↓
Get its Arn attribute
    ↓
Use that value
```

This is extremely common when connecting AWS resources.

---

# 14. `!Sub`

`!Sub` is useful for building strings using variables.

For example:

```yaml
Parameters:

  Environment:
    Type: String
    Default: dev

Resources:

  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "my-company-${Environment}-bucket"
```

If:

```text
Environment = dev
```

the resulting name could be:

```text
my-company-dev-bucket
```

If we deploy with:

```text
Environment = prod
```

we get:

```text
my-company-prod-bucket
```

This is one of the ways the same template can be reused across environments.

---

# 15. Parameters

Hardcoding values is rarely ideal.

CloudFormation gives us **Parameters**.

For example:

```yaml
Parameters:

  Environment:
    Type: String
    Default: dev
```

Now the template can receive a value when the stack is deployed.

A more complete example:

```yaml
AWSTemplateFormatVersion: "2010-09-09"

Parameters:

  Environment:
    Type: String
    Default: dev
    AllowedValues:
      - dev
      - uat
      - prod

Resources:

  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "my-company-${Environment}-bucket"
```

Now the same template can be used for:

```text
DEV
UAT
PROD
```

without maintaining three completely different templates.

---

# 16. Outputs

Sometimes a stack creates something that other people or systems need to know about.

For example, after creating an S3 bucket, we might want to expose its name.

```yaml
Outputs:

  BucketName:
    Description: Name of the S3 bucket
    Value: !Ref MyBucket
```

After deployment, CloudFormation can show:

```text
BucketName
my-company-dev-bucket
```

Outputs are useful for things like:

```text
S3 bucket name
Lambda ARN
API Gateway URL
DynamoDB table name
Lex bot ID
Lex alias ARN
```

---

# 17. A small complete example

Let's put several concepts together.

```yaml
AWSTemplateFormatVersion: "2010-09-09"

Parameters:

  Environment:
    Type: String
    Default: dev
    AllowedValues:
      - dev
      - uat
      - prod

Resources:

  ApplicationBucket:
    Type: AWS::S3::Bucket
    Properties:
      VersioningConfiguration:
        Status: Enabled

  ApplicationTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH

Outputs:

  BucketName:
    Description: Application S3 bucket
    Value: !Ref ApplicationBucket

  TableName:
    Description: Application DynamoDB table
    Value: !Ref ApplicationTable
```

This template defines:

```text
ApplicationStack
│
├── S3 Bucket
│   └── Versioning enabled
│
└── DynamoDB Table
    └── PAY_PER_REQUEST
```

and exposes both resource names as outputs.

---

# 18. What happens when we update the template?

This is where CloudFormation becomes much more powerful than a simple deployment script.

Suppose our current stack is:

```text
MyApplicationStack
│
├── S3 Bucket
└── DynamoDB Table
```

Then we modify the template:

```text
MyApplicationStack
│
├── S3 Bucket
├── DynamoDB Table
└── Lambda Function   ← new
```

We deploy the updated template.

CloudFormation compares the desired configuration with the current stack and determines what needs to happen.

Conceptually:

```text
Current state
      │
      │ compare
      ▼
Desired state
      │
      ▼
CloudFormation
      │
      ├── Create
      ├── Update
      └── Delete
```

You don't have to manually tell it:

```text
create this
then create that
then update this
```

You describe the desired state.

---

# 19. CloudFormation is state-aware

This is an important mental model.

Suppose the template says:

```yaml
Resources:

  MyBucket:
    Type: AWS::S3::Bucket
```

and the bucket already exists as part of the stack.

Deploying the same template again doesn't mean:

> “Create another bucket.”

CloudFormation knows the resource belongs to the stack and manages its lifecycle.

That is one of the fundamental differences between a CloudFormation deployment and simply running a collection of AWS CLI commands.

---

# 20. Change Sets

When working with important environments, especially production, blindly applying changes isn't a great idea.

CloudFormation has **Change Sets**.

They let you preview what CloudFormation plans to change.

Conceptually:

```text
New template
     ↓
CloudFormation
     ↓
Change Set
     ↓
"What will change?"
     ↓
Review
     ↓
Execute
```

For example:

```text
Change Set

MyLambda
    Update

MyDynamoDB
    No change

MyBucket
    No change
```

That gives you an opportunity to catch unintended changes before applying them.

---

# 21. Rollbacks

What if an update fails?

CloudFormation can roll back changes depending on the stack operation and configuration.

Conceptually:

```text
Current stack
     ↓
Update
     ↓
Something fails
     ↓
Rollback
     ↓
Previous stable state
```

This is particularly valuable when a stack contains several related resources.

---

# 22. Drift

Here's a problem Infrastructure as Code tries to prevent.

Suppose CloudFormation creates:

```text
Lambda Function
```

Then six months later, someone manually changes its configuration through the AWS Console.

Now we have:

```text
CloudFormation template
        ≠
Actual AWS configuration
```

This is called **configuration drift**.

CloudFormation provides drift detection so you can identify resources whose actual configuration differs from what the stack expects.

This is one reason teams often prefer:

```text
Git
  ↓
CloudFormation
  ↓
AWS
```

instead of:

```text
Everyone
  ↓
AWS Console
  ↓
Random changes
```

---

# 23. CloudFormation and Boto3

Since I work with Boto3, this comparison helped me understand CloudFormation.

With Boto3:

```python
import boto3

s3 = boto3.client("s3")

s3.create_bucket(...)
```

I'm directly interacting with an AWS API.

With CloudFormation:

```yaml
Resources:

  MyBucket:
    Type: AWS::S3::Bucket
```

I'm declaring infrastructure.

The conceptual relationship is:

```text
Boto3
   ↓
AWS API
   ↓
AWS Service
```

while:

```text
CloudFormation Template
   ↓
CloudFormation
   ↓
AWS APIs
   ↓
AWS Services
```

CloudFormation is therefore another layer of abstraction around the infrastructure lifecycle.

---

# 24. CloudFormation and the AWS Console

The console isn't fundamentally a different universe.

When you change something through the AWS Console, the console is also interacting with AWS APIs.

So you can think of:

```text
AWS Console ───────┐
                   │
Boto3 ─────────────┼──→ AWS APIs → AWS Services
                   │
CloudFormation ────┘
```

The difference is what each tool is optimized for.

```text
Console
→ Manual interaction

Boto3
→ Programmatic API calls

CloudFormation
→ Declarative infrastructure management
```

---

# 25. CloudFormation vs Terraform

This was another question I had while learning IaC.

Do I need Terraform if I'm using CloudFormation?

Not necessarily.

Both are Infrastructure as Code tools.

For example:

```text
CloudFormation
       ↓
      AWS
```

and:

```text
Terraform
       ↓
      AWS
```

Both can manage AWS infrastructure.

If your organization already uses CloudFormation, learning CloudFormation first makes a lot of sense.

Terraform becomes particularly interesting when an organization standardizes on it or when infrastructure spans multiple providers.

The important thing is:

> Don't have two IaC tools independently managing the same resource.

For example, avoid:

```text
Terraform ───────┐
                 ├──→ Same Lex Bot
CloudFormation ──┘
```

That creates ownership and state problems.

---

# 26. Why this matters for Amazon Lex

This is where CloudFormation becomes directly relevant to my work.

Today, a Lex workflow might look like:

```text
AWS Console
   ↓
Lex
   ↓
Open Bot
   ↓
Modify Intent
   ↓
Add Utterance
   ↓
Configure Slot
   ↓
Configure Lambda
   ↓
Build
   ↓
Version
   ↓
Update Alias
```

With Infrastructure as Code, the goal can become:

```text
Git
 │
 ▼
CloudFormation template
 │
 ▼
DEV
 │
 ▼
UAT
 │
 ▼
PROD
```

The configuration becomes something we can:

- version control
- review
- reproduce
- audit
- deploy consistently
- roll back when appropriate

For example, instead of an utterance existing only inside the console:

```text
"I want to check my balance"
```

it can be represented as configuration in a template.

A simplified Lex configuration might look conceptually like:

```yaml
BotLocales:
  - LocaleId: en_US

    Intents:

      - Name: BalanceIntent

        SampleUtterances:
          - Utterance: "I want to check my balance"
          - Utterance: "What's my balance?"
          - Utterance: "Show me my balance"
```

The exact CloudFormation schema and supported properties depend on the Lex V2 resource you're configuring, but the idea is the same:

> **The bot configuration becomes part of your source-controlled infrastructure.**

---

# 27. A realistic AWS architecture

Eventually, a stack could represent something like:

```text
                    CloudFormation Stack
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       Lex Bot          Lambda          DynamoDB
          │                │                │
          │                │                │
          └──────────┬─────┘                │
                     │                      │
                     ▼                      │
               Amazon Connect              │
                     │                      │
                     └──────────────────────┘
```

And the whole thing can be represented as code.

That is the real promise of Infrastructure as Code.

---

# 28. What I actually need to learn

I don't need to memorize hundreds of CloudFormation properties.

I'd learn these concepts first:

### Fundamentals

```text
Template
Stack
Resource
Type
Properties
```

### Connecting resources

```text
Ref
GetAtt
Sub
```

### Reusability

```text
Parameters
Mappings
Conditions
```

### Communication

```text
Outputs
```

### Production management

```text
Change Sets
Rollback
Drift Detection
DeletionPolicy
UpdateReplacePolicy
```

### Advanced

```text
Nested Stacks
StackSets
CloudFormation Modules
CI/CD
```

I would learn the first group thoroughly before worrying about the advanced features.

---

# 29. The mental model I want to remember

After learning the basics, this is the picture I want in my head:

```text
                    TEMPLATE
                       │
                       │
                       ▼
                 CLOUDFORMATION
                       │
                       ▼
                    STACK
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Lambda        Lex          DynamoDB
          │            │            │
          └────────────┴────────────┘
                       │
                       ▼
                  AWS Services
```

And the lifecycle:

```text
Write template
      ↓
Create stack
      ↓
CloudFormation creates resources
      ↓
Change template
      ↓
Create/update stack
      ↓
CloudFormation calculates changes
      ↓
Review / Change Set
      ↓
Apply
      ↓
Monitor / detect drift
```

---

# 30. Final takeaway

The biggest shift in thinking is this:

**Don't think of CloudFormation as another way to click the AWS Console.**

Think of it as a way to turn infrastructure into something that can live alongside your application code.

Instead of saying:

> “Someone created this Lex bot three years ago and I don't know exactly how it was configured.”

you can eventually have:

```text
lex-bot.yaml
```

in Git, where the configuration is visible, reviewable, reproducible, and deployable.

That's the part of CloudFormation I find most powerful.

And that is the point where AWS infrastructure starts feeling less like a collection of console settings and more like **software engineering**.
