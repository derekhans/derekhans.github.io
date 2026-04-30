---
layout: post
title: "Building a Technology Radar"
date: 2025-02-11
tags: [architecture, strategy, practices]
---

Every engineering organization faces the same problem: too many technology choices, not enough context to make them well.

Your platform team wants to use gRPC. Your data team wants Apache Arrow. Your infrastructure team found a new container runtime. Meanwhile, you already have three different logging frameworks and four different test frameworks in the codebase.

Without a shared framework for technology decisions, you end up with:

- Duplicate tools that do the same thing
- Teams blocked on technology choices that were already made
- Inconsistent standards that create friction between teams
- Shiny-object syndrome where every new project uses different tech

A technology radar is a structured way to communicate technology decisions. It is not about mandates. It is about making the collective wisdom of the organization visible.

This article explains what a technology radar is, why it matters, and how to build one that actually influences behavior without becoming bureaucratic.

## What Is a Technology Radar?

A technology radar is a map of technology decisions that the organization is making or considering. It answers the question: "What technologies should we use, and why?"

The radar was popularized by ThoughtWorks as a way to communicate their technology opinions. Since then, organizations including Amazon, Zalando, and the UK government have adopted their own radars.

A radar typically has two dimensions:

**Four rings (maturity levels):**

1. **Adopt** - Use by default for this type of problem
2. **Trial** - Experiment with in low-risk projects
3. **Assess** - Research and evaluate, not ready for production
4. **Hold** - Do not start new work with this technology; migrate away from existing usage

**Four quadrants (technology categories):**

1. **Languages & Frameworks** - Programming languages, web frameworks, libraries
2. **Platforms** - Cloud providers, container orchestration, databases
3. **Tools** - Build tools, CI/CD, monitoring, IDEs
4. **Techniques** - Practices and approaches (microservices, event-driven, IaC)

Each technology is plotted in one position on the radar. The position communicates the organization's stance and maturity level.

## Why a Technology Radar Matters

The radar solves real organizational problems.

### Problem 1: Technology proliferation

Without a radar, teams independently choose technologies. Over time, you accumulate:

- Three different testing frameworks (Mocha, Jest, Vitest)
- Multiple ORMs (Sequelize, TypeORM, Prisma)
- Different logging patterns (Bunyan, Pino, Winston)
- Overlapping tools that do the same thing

This is extremely expensive. Each tool requires:

- Training for new team members
- Maintenance and security updates
- Integration with other tooling
- Operational understanding

With a radar, you consolidate. "We chose Vitest for testing" means all new projects start with Vitest. Existing projects migrate over time. Training materials focus on one tool, not three.

### Problem 2: Decision fatigue

New projects should not require architecture decisions about logging, testing, and ORM. Those decisions should already be made.

A radar removes decision fatigue by pre-deciding the standard choices. Teams can focus on what actually matters for the project, not on evaluating commodity tools.

### Problem 3: Inconsistent standards

Without a radar, different teams have different standards. Platform team uses Kubernetes, but one team uses Docker Compose. Some teams use PostgreSQL, others use MongoDB. This creates friction when teams need to collaborate.

A radar establishes a baseline consistency. Not absolute conformity, but a shared understanding of what is standard and what is an exception.

### Problem 4: Technology debt accumulates silently

When technologies are scattered across the codebase with no clear decisions, no one knows what you are actually running. You find deprecated, unsupported frameworks in production by accident.

A radar makes your technology portfolio visible. You can see what is in "Hold" and actively migrate. You can see what is in "Trial" and move things to "Adopt" or back to "Hold."

## The Radar Structure in Practice

### Ring definitions with examples

**Adopt**

These are the default choices. They are proven in your organization, supported by training materials, and used in most new projects.

Example entries:

- **Kubernetes** for container orchestration
- **TypeScript** for backend services
- **React** for web UI
- **PostgreSQL** for relational data
- **GitHub Actions** for CI/CD
- **Observability-first** as a technique

Teams can deviate from "Adopt" choices, but they need justification. "We chose Cassandra instead of PostgreSQL because our write patterns require distributed writes" is a valid exception. "We felt like it" is not.

**Trial**

These technologies are being evaluated in low-risk projects. The organization has committed to learning but not yet to standardizing.

Example entries:

- **Pulumi** (exploring for infrastructure as code beyond Terraform)
- **Apache Arrow** (evaluating for data interchange)
- **gRPC** (testing for service-to-service communication)
- **SQLite** (for local caching in edge scenarios)
- **Deno** (exploring as alternative runtime)

Trial entries have a sponsor—usually a team that is actively using the technology. The sponsor is responsible for reporting back on experiences, pitfalls, and whether the technology should graduate to "Adopt" or drop to "Hold."

**Assess**

These technologies are on the organization's radar, but they are not ready for production yet. The team is monitoring them, reading about them, and understanding their trade-offs.

Example entries:

- **WebAssembly** (promising for compute at edge, not ready yet)
- **Triton** (new inference framework, evaluating)
- **NATS** (alternative to Kafka, assessing)
- **Temporal** (workflow engine, watching)

"Assess" is not "do not use." It means "if you use this, you are on your own. Do not expect support from the platform team. Be prepared to maintain it yourself."

**Hold**

These technologies are in the organization's codebase, but no new projects should start with them. Existing usage should be actively migrated.

Example entries:

- **CloudFormation** (replaced by Terraform)
- **Mocha** (replaced by Vitest)
- **RabbitMQ** (being replaced by Kafka)
- **Node.js 14** (sunset in April 2023)

"Hold" is not "forbidden," but it is a strong discouragement. If a team is starting a new project and considering a "Hold" technology, the conversation should be: "Why? What is your justification?" Usually, the answer is "I did not know it was on Hold," followed by adoption of the standard.

### Quadrant examples

**Languages & Frameworks**

Technologies that shape how code is written.

Example entries:

- TypeScript (Adopt)
- Python 3.11+ (Adopt)
- Go (Trial)
- Rust (Assess)
- PHP (Hold)

**Platforms**

Infrastructure and runtime environments.

Example entries:

- AWS (Adopt)
- Azure (Trial)
- Kubernetes on managed services (Adopt)
- Docker (Adopt)
- serverless functions (Trial)

**Tools**

Build, deployment, and operational tools.

Example entries:

- GitHub for version control (Adopt)
- GitHub Actions for CI/CD (Adopt)
- Terraform for IaC (Adopt)
- Pulumi (Trial)
- Prometheus for metrics (Adopt)
- Honeycomb for observability (Trial)

**Techniques**

Practices and architectural approaches.

Example entries:

- Microservices within service boundaries (Adopt)
- Infrastructure as Code (Adopt)
- Observability-first (Adopt)
- Test-driven development (Adopt)
- Event-driven architecture (Trial)
- AI-assisted code generation (Assess)

## How Radars Actually Look

There is no perfect format. Different organizations present radars differently.

### The quadrant visualization

The classic ThoughtWorks format is a circle divided into four quadrants, with four concentric rings. Technologies are plotted as points or bubbles.

The advantage is that it is visually compact and shows all information at once. The disadvantage is that text labels get crowded, and the exact position within a ring can be ambiguous.

### The table format

Some organizations use a simple table:

| Technology | Category | Ring | Notes | Sponsor |
|-----------|----------|------|-------|---------|
| Kubernetes | Platforms | Adopt | Production standard | Platform Team |
| TypeScript | Languages | Adopt | Default for services | Frontend + Backend leads |
| Pulumi | Tools | Trial | Exploring for complex IaC | Infrastructure team |
| Apache Arrow | Tools | Assess | Evaluating for data interchange | Data Engineering |
| RabbitMQ | Platforms | Hold | Migrating to Kafka | Platform Team |

The advantage is clarity and searchability. The disadvantage is that it is less visually striking.

### The timeline approach

Some organizations show how the radar has evolved:

Q1 2025:
- Moved TypeScript from Trial to Adopt
- Moved RabbitMQ from Adopt to Hold
- Added Deno to Assess

Q4 2024:
- Moved Kubernetes from Trial to Adopt
- Moved OpenStack from Hold to Assess (reevaluating)

This shows the organization's actual learning and evolution.

## Building Your First Radar

Here's how to build a technology radar in an organization that does not have one.

### Step 1: Audit your technology portfolio

Before you build the radar, understand what you actually use.

Go through your codebases and infrastructure:

- What programming languages are in production?
- What databases are you running?
- What frameworks are you using?
- What deployment tools do you have?
- What monitoring and logging?

You will probably find 30-50 different technologies. Group them by quadrant.

### Step 2: Clarify your architectural vision

The radar should align with your architecture strategy. If your vision is "microservices on Kubernetes," the radar should reflect that. If your vision is "minimal infrastructure, serverless first," the radar looks different.

Make sure the vision and radar are consistent. Conflicting signals create confusion.

### Step 3: Define your default choices

For each quadrant, pick the default choice.

- Which programming language is the default?
- Which platform do you standardize on?
- Which testing framework?
- Which CI/CD tool?

Start conservative. Do not adopt 20 technologies at once. Pick 3-5 per quadrant. Get consensus that these are the defaults.

### Step 4: Identify what you want to explore

What new technologies are interesting but not ready to adopt?

Pick 2-3 per quadrant to put in "Trial" or "Assess." These should have clear sponsors (teams that are actively evaluating them).

### Step 5: Identify migration targets

What technologies are you moving away from?

Put them in "Hold" with a clear migration plan. "We are moving from RabbitMQ to Kafka. RabbitMQ is in Hold. Target migration date: Q3 2025."

### Step 6: Create the communication

Design the radar in whatever format works for your org:

- Visual diagram (can use tools like Miro or create it as SVG)
- Structured table
- Document with detailed descriptions

Include:

- What each ring means
- When the radar was last updated
- How to propose changes
- Who decides

### Step 7: Socialize and get feedback

Do not release the radar as a top-down mandate. Present it to engineering teams.

- "Here is what we are thinking. Do you agree?"
- "What are we missing?"
- "What technology are you using that is not on here?"

Use the feedback to adjust before finalizing.

## Best Practices for Radar Governance

### 1. Make it visible and discoverable

Put the radar somewhere every engineer can see it. Not in a wiki that no one reads. Put it in your engineering handbook homepage, in your GitHub org README, or in Slack pinned messages.

### 2. Update quarterly

Review the radar every quarter (or every six months if you are small). Make changes only with good reason.

This prevents thrashing. If something moves from Adopt to Trial, there should be a clear reason documented.

### 3. Create a lightweight proposal process

Anyone should be able to propose a change. The process should take 30 minutes, not 3 weeks.

Proposal template:

```
Technology: [name]
Current status: [Adopt/Trial/Assess/Hold]
Proposed status: [target ring]
Justification: [why the change]
Sponsor: [who is championing this]
Impact: [what changes]
```

### 4. Assign ownership to rings

Each ring should have an owner responsible for it.

- **Adopt owner**: Ensures defaults are well-documented and adopted. Creates onboarding materials. Helps new teams use the standard.
- **Trial owner**: Follows ongoing evaluations. Decides when to promote or demote.
- **Assess owner**: Monitors the landscape. Tracks new technologies. Proposes what to move to Trial.
- **Hold owner**: Tracks migrations. Ensures deprecated technologies are actually being phased out.

The owners do not make unilateral decisions, but they drive the conversation.

### 5. Document the why

For each entry, include:

- **What it is**: One sentence description
- **Why we chose it**: Trade-offs considered
- **When to use it**: Good use cases
- **When not to use it**: Where alternatives are better
- **How to get started**: Links to tutorials, internal examples, who to ask

Bad entry: "PostgreSQL - Adopt"

Good entry: "PostgreSQL - Adopt. Relational database for transactional systems. Chose for ACID guarantees, JSON support, and team expertise. Use when you need strong consistency and querying across relations. Don't use for time-series data (use InfluxDB) or document storage (use MongoDB for those specific cases). Getting started: See the platform team docs."

### 6. Track decisions with ADRs

For significant radar changes, write an Architecture Decision Record (ADR).

Example: Deciding to move from RabbitMQ to Kafka.

The ADR documents:

- The problem (scaling, ordering, replay)
- Why RabbitMQ is insufficient
- Why Kafka is better for this use case
- Migration plan and risks
- Decision date and owners

This prevents re-litigating the same decision in three years.

### 7. Use the radar to inform hiring and learning

Your radar defines what technologies new team members should learn. Use it for:

- Onboarding guides ("Here are the technologies we use by default")
- Learning budgets ("We will sponsor your learning in these areas")
- Interview prep ("You should know TypeScript and Kubernetes")

### 8. Avoid mandate creep

The radar is a recommendation, not a law. Teams can deviate with justification.

A reasonable exception: "We chose Cassandra for this project because we need distributed writes across regions and eventual consistency is acceptable."

An unreasonable exception: "We wanted to try Scala."

The difference: The first is a technical justification. The second is preference.

Enforce reasonable exceptions. Allow unreasonable exceptions only with clear signoff (and tracking).

## Common Pitfalls and How to Avoid Them

### Pitfall 1: The radar becomes a tech debt list

Teams see "Hold" as a threat. They hide deprecated technologies instead of migrating them. The radar loses credibility.

Solution: "Hold" means "we are actively helping you migrate, not investigating why you didn't." Provide migration tooling and support, not punishment.

### Pitfall 2: Too many entries

A radar with 200 entries is useless. It becomes a catalog, not a decision framework.

Solution: Keep it to 3-5 per ring, per quadrant. If it doesn't fit on one page, it is too big.

### Pitfall 3: Never updates

A radar from two years ago is worse than no radar. Teams ignore it because it is out of date.

Solution: Update quarterly, even if nothing changed. At minimum, note "reviewed, no changes" so it feels current.

### Pitfall 4: Top-down without consensus

If the CTO mandates the radar without input from teams, it will be resented and ignored.

Solution: Build it collaboratively. Teams propose entries. The architecture team facilitates consensus.

### Pitfall 5: No migration support for "Hold"

Technologies don't migrate themselves. If you put something in "Hold" without helping teams move away, nothing happens.

Solution: For each "Hold" entry, provide:
- Clear migration path
- Migration tools or helpers
- Timeline expectations
- Support for the work

## Evolving the Radar

The radar is not static. Technologies change, new solutions emerge, and your organization learns.

### How to evolve responsibly

**Quarter 1-2: Observe**

New technology appears. You put it in "Assess" and watch. Some teams may experiment. You gather feedback.

**Quarter 3-4: Evaluate**

One or two teams are using it successfully. The case is becoming clear. Move it to "Trial" with explicit sponsors.

**Quarter 5-6: Decide**

Trial teams report back. Is this better than the current standard? Does the team like it? Is it production-ready?

Move to "Adopt" (replace existing standard) or move back to "Assess" (not ready yet).

**Ongoing: Monitor and migrate**

New standard is in "Adopt." Old technology moves to "Hold." Migration timeline is set. Teams begin moving.

The whole cycle typically takes 6-12 months. Too fast and you have thrashing. Too slow and you are not learning.

### Handling disruption

Sometimes new technologies emerge that change the game (like Kubernetes did for containers).

When this happens:

1. Put it in "Assess" immediately, even if unproven
2. Sponsor aggressive evaluation (allocate team time)
3. If it solves real problems, fast-track to "Trial"
4. Move current standard to "Hold" with clear migration plan

You might go from "Assess" to "Adopt" in 6-9 months if the technology is transformative.

## Communicating the Radar

The radar is useless if no one knows it exists.

### Communication channels

- **Handbook**: Host the current radar in your engineering handbook
- **Quarterly presentations**: Walk through changes and rationale
- **Onboarding**: New team members learn the radar in week one
- **Architecture meetings**: Regularly discuss and propose changes
- **Slack/Teams**: Announce significant changes
- **RFCs/ADRs**: Link to decision records from radar entries

### Handling pushback

Some teams will disagree with radar choices. That is healthy.

When a team pushes back:

- Listen to their concerns
- If the concern is valid, adjust the radar
- If the concern is preference, document the trade-off but hold the line
- Never silently override disagreement

You want teams to adopt the radar because they see it as valuable, not because they are forced.

## Conclusion

A technology radar is not about standardization for its own sake. It is about making collective knowledge visible and reducing decision fatigue.

The best radars are:

- **Visible**: Everyone knows what the current decisions are
- **Justified**: Each entry has a clear reason and a sponsor
- **Evolving**: Changes happen when justified, not randomly
- **Helpful**: Teams can make fast decisions without architectural debate

Start with a small radar. Audit what you have. Define defaults. Put some things in Trial to explore. Get consensus. Update it quarterly.

You do not need a perfect radar to start. You need a clear radar. Start with that, and let it evolve as the organization learns.

Over time, the radar becomes part of your culture. Teams reference it automatically. New projects check it before choosing technologies. The collective knowledge of the organization is captured in one artifact.

That is when the radar becomes valuable—not as a document, but as a working part of how decisions are made.
