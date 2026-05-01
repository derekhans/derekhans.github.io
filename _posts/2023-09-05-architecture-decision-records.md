---
layout: post
title: "Architecture Decision Records"
date: 2023-09-05
tags: [architecture, documentation, practices]
---

You join a new team. You see the codebase uses MongoDB. You ask: "Why did you choose MongoDB instead of PostgreSQL?" Your colleague responds: "I do not know. The person who made that decision left two years ago."

Later, the team discovers MongoDB is causing performance problems. They consider migrating to PostgreSQL. But they do not know why MongoDB was chosen in the first place. Was there a specific reason? Did the reasons still apply? Or was it a random choice?

This is the problem that Architecture Decision Records (ADRs) solve.

An ADR is a document that captures a significant technical decision, the context of the decision, the options considered, and the reasoning behind the choice. It serves as a historical record of why the architecture looks the way it does.

The team that built the system gradually leaves. The knowledge leaves with them. ADRs are how knowledge stays.

This article covers what an ADR is, why they matter, when to write them, how to maintain them, tools for managing them, how to adopt them, and best practices.

## What Is an Architecture Decision Record?

An ADR is a short document that records a significant technical decision made by a team.

It captures:

- **What**: The decision (e.g., use PostgreSQL as primary database)
- **Why**: The context and reasoning (e.g., we need a relational database that scales, has strong ACID guarantees, and is open source)
- **Alternatives**: Other options considered and why they were rejected
- **Consequences**: The tradeoffs and long-term implications of the decision
- **When**: When the decision was made and when it might be reconsidered

ADRs are not:

- Detailed technical specifications (too much detail)
- Project plans (too specific to one project)
- General guidelines or best practices (ADRs are specific decisions)
- Meeting notes (too informal)

ADRs are a bridge between informal decision-making and formal documentation. They capture the decision-making process in a way that future teams can understand.

### Why not just use wiki pages or design docs?

Wiki pages are useful but they have problems:

- **Visibility**: People do not know wiki pages exist. They are buried in the wiki.
- **Version control**: When someone updates a wiki page, you do not know what changed or when.
- **Permanence**: Wiki pages get deleted or moved, losing history.
- **Searchability**: Hard to search for a specific decision.
- **Relationship**: No clear relationship between decision and code (decision is in wiki, code is in repo).

ADRs live with the code. They are versioned in Git. They are searchable. They are linked from the code.

## What an ADR Should Record

A good ADR has these sections:

### 1. ADR number and title

```
ADR 001: Use PostgreSQL for Primary Database
ADR 002: Implement API with GraphQL instead of REST
ADR 003: Deploy on Kubernetes instead of EC2 directly
```

Sequential numbering makes it easy to reference (ADR 001 = first major decision).

### 2. Status

```
Status: Proposed       (Under discussion)
Status: Accepted       (Decision made, implemented or planned)
Status: Deprecated     (No longer in use)
Status: Superseded     (Replaced by ADR XXX)
```

Status shows the lifecycle of the decision.

### 3. Date

When was the decision made? When was it last updated?

### 4. Context

What was the situation that led to this decision? What problem were you trying to solve?

Example:

> We need a relational database for customer data. It must handle 1M+ transactions per day, support complex queries, and integrate with our existing PostgreSQL infrastructure.

Be specific. Vague context leads to vague decisions.

### 5. Options considered

What were the alternatives? For each option, list pros and cons.

Example:

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| PostgreSQL | Open source, ACID guarantees, JSON support, scales well | Need to manage infrastructure | Selected |
| MySQL | Open source, familiar, simpler than PostgreSQL | Less feature-rich, weaker JSON support | Considered but rejected |
| SQL Server | Rich features, enterprise support | Expensive license, Windows-centric | Considered but rejected |
| MongoDB | Flexible schema, good for rapid development | Weaker ACID guarantees, harder to query than SQL | Considered but rejected |

The comparison should be honest. Do not dismiss options without good reason.

### 6. Decision

What was chosen and why?

Example:

> We will use PostgreSQL as our primary database. PostgreSQL provides the reliability and scalability we need, supports both structured and semi-structured data (JSON), and is open source. The team has experience with PostgreSQL from our current infrastructure, reducing the learning curve.

Be clear and concise. One or two paragraphs.

### 7. Consequences

What are the implications of this decision?

Pros:

- Open source (no licensing costs)
- ACID guarantees (reliable transactions)
- JSONB support (can store semi-structured data)
- Team expertise (team knows PostgreSQL)

Cons:

- Operational complexity (need to manage PostgreSQL infrastructure)
- Learning curve for new team members (those who only know MongoDB)
- Migration effort (if moving from existing database)
- Scaling limit (PostgreSQL has vertical scaling limits, horizontal scaling is complex)

Be honest about tradeoffs. No decision is perfect.

### 8. Alternatives rejected and why

For each option you considered but rejected, explain why.

Example:

> **MongoDB rejected**: While MongoDB's flexible schema is appealing for rapid development, the weaker ACID guarantees are problematic for financial transactions. We need strong consistency guarantees.

> **MySQL rejected**: MySQL is simpler but lacks features we need (JSONB, window functions, better scaling). PostgreSQL is not significantly more complex and provides better long-term flexibility.

### 9. Reconsidering this decision

When would you reconsider this decision? What would need to change?

Example:

> We will reconsider this decision if:
> - We need to process >10M transactions per day (PostgreSQL vertical scaling limit)
> - We find the need for flexible schema outweighs need for ACID guarantees
> - Team expertise shifts to other databases
> - New database technology emerges that better fits our requirements

This gives future teams guidance on when to revisit the decision.

## When to Write an ADR

Not every technical decision warrants an ADR. Write an ADR when:

### 1. Irreversible or hard to change

- Choice of primary database (hard to change later)
- Choice of programming language (expensive to rewrite)
- Choice of deployment platform (infrastructure investment)

Do not write ADR for: choice of logging library (easy to swap later).

### 2. Multiple options were seriously considered

- Decision between PostgreSQL and MongoDB (both viable)
- REST vs. GraphQL (both valid architectures)

Do not write ADR for: obvious choice with no alternatives.

### 3. Decision affects multiple teams or long-term direction

- Deployment platform chosen
- API design patterns established
- Data model standards set

Do not write ADR for: decision that affects only one team and one project.

### 4. Setting a precedent

- First use of a new technology
- New architectural pattern
- Significant deviation from existing standards

Example: If this is the first time the company uses Kubernetes, write an ADR. If you are deploying a third Kubernetes cluster, probably do not need a new ADR (ADR 001 covers the Kubernetes decision).

### 5. Controversial or debated decision

- Decision that team members disagreed on
- Decision where tradeoffs are significant
- Decision that trades off short-term for long-term

Document the reasoning so future teams understand why the choice was made despite the tradeoffs.

## ADR Lifecycle: When to Update and Deprecate

ADRs are not static. They evolve as the system evolves.

### Updating an ADR

Update an ADR when:

- New information emerges that changes the decision
- The decision is implemented differently than planned
- Consequences become clearer

Example: ADR 001 says we will use PostgreSQL. A year later, you discover PostgreSQL's JSONB is slower than expected. Update the ADR:

```
## Consequences (updated)

Pros:
- Open source (no licensing costs)
- ACID guarantees (reliable transactions)
- Team expertise (team knows PostgreSQL)

Cons:
- Operational complexity (need to manage PostgreSQL infrastructure)
- JSONB performance (slower than expected for deeply nested data)
- Scaling limit (PostgreSQL has vertical scaling limits)
```

Keep old version in Git history (do not rewrite). Just update the current version.

### Deprecating an ADR

Deprecate an ADR when the decision no longer applies:

```
Status: Deprecated

Deprecated: May 2026
Reason: This decision was superseded by ADR 025 (Use DynamoDB for semi-structured data)
```

The decision may have been correct at the time but is no longer relevant.

### Superseding an ADR

Supersede an ADR when a newer decision replaces it:

```
ADR 025: Use DynamoDB for semi-structured data

Status: Accepted
Supersedes: ADR 001 (Use PostgreSQL for all data)
```

And update the old ADR:

```
ADR 001: Use PostgreSQL for Primary Database

Status: Superseded
Superseded by: ADR 025 (Use DynamoDB for semi-structured data)
```

This creates a clear record of how decisions evolved.

## Benefits of Using ADRs

When done well, ADRs provide substantial benefits.

### 1. Institutional memory

Team members leave. Knowledge leaves with them. ADRs capture the knowledge.

New team member joins. Instead of asking "why PostgreSQL?", they read ADR 001 and understand the reasoning.

Cost savings: Reduced onboarding time (weeks faster), fewer "why is it this way?" questions.

### 2. Better decision-making

When forced to document a decision, you think more carefully. You consider alternatives. You document tradeoffs honestly.

Result: Better decisions (not just "let us use the shiny new technology").

### 3. Preventing repeated mistakes

If a decision was made and failed, the ADR documents why. If the decision comes up again, you can refer to the ADR.

Example: Team considers MongoDB again three years later. They read ADR 001, see why it was rejected before, and avoid making the same mistake.

### 4. Alignment across teams

When all teams document their decisions in ADRs, standards emerge. Teams align on technologies and patterns.

Without ADRs: Each team makes independent decisions, leading to fragmentation (5 different databases, 3 different API styles).

With ADRs: Decision is made once (e.g., PostgreSQL is standard database), documented, and reused across teams.

### 5. Faster onboarding

New team members understand the architecture faster because decisions are documented.

Cost savings: Onboarding time reduced 30-50%.

### 6. Audit trail and compliance

Regulators want to know: "Why did you make this security decision? Why do you store data this way?"

ADRs provide the audit trail. Compliance teams are happy.

### 7. Supporting long-term planning

When considering major changes (migrate to cloud, redesign architecture, adopt new technology), ADRs provide context.

You can see how previous decisions were made, what the team learned, what worked and what did not.

## Risks of Not Using ADRs

Organizations without ADRs face these problems:

### 1. Lost context

Years pass. Team members who made decisions leave. Context is lost.

New team inherits system with unclear rationale:

> Why do we use MongoDB for this data? Why not PostgreSQL? Is there a reason or just historical accident?

Without context, team cannot make good decisions about maintenance or changes.

### 2. Repeated mistakes

If a technology was tried and failed, but the failure is not documented, the team might try it again.

Example: Company tried Redis for caching three years ago. It did not work well. Knowledge is lost. Team tries Redis again. Same failure.

Cost: Wasted time and money on the same mistake.

### 3. Fragmentation

Without decisions documented and standardized, each team goes their own way.

Team A uses PostgreSQL, Team B uses MongoDB, Team C uses DynamoDB.

Result: Multiple databases to maintain, knowledge fragmented across teams, data migration difficult.

### 4. Politics and revisiting decisions constantly

Without documented reasoning, decisions become subject to politics.

Engineer says: "Let us use Kubernetes"

Manager says: "Why?"

Engineer says: "Because it is good for scaling"

Manager says: "We use EC2 directly, why change?"

Engineer says: "Kubernetes is better"

Manager says: "I think EC2 is fine"

Endless debate with no resolution because there is no documented decision-making process.

With ADRs: "Refer to ADR 015 for Kubernetes decision. Context was XYZ, we considered these options, and decided Kubernetes for these reasons."

### 5. Slower onboarding

New team members have to figure out why architecture is the way it is.

Tribal knowledge: "Oh, you have to ask John about why we use this technology. John is the only one who knows."

When John leaves, knowledge is lost.

### 6. Hard to change architecture

When the team does not understand why a decision was made, they are reluctant to change it. Fear of breaking something.

Result: Stale architecture, difficult to modernize.

## Tools for ADRs

ADRs are documents. You need a system to author, review, approve, publish, and search them.

### Option 1: Git repository with Markdown files (Recommended for most)

Store ADRs as Markdown files in Git alongside code.

Pros:

- Versioned (each change is tracked)
- Searchable (using grep or GitHub search)
- Linked from code (reference ADR in code comments)
- Accessible (everyone has access)
- No additional tools needed

Cons:

- Requires Git and Markdown knowledge
- Less formal approval process
- Less discoverability (must know to look)

Example structure:

```
docs/adr/
  001-use-postgresql.md
  002-graphql-api.md
  003-kubernetes-deployment.md
```

### Option 2: Wiki (Confluence, MediaWiki)

Store ADRs in organizational wiki.

Pros:

- Familiar to many organizations
- Rich formatting
- Easy to link between documents
- Search built-in

Cons:

- Not versioned (hard to see what changed)
- Not easily searchable outside wiki
- Separated from code
- Can be slow to load
- Requires login to view

### Option 3: Google Docs or similar

Document ADRs in Google Docs, shared drive.

Pros:

- Easy to create and edit
- Rich formatting
- Easy to share
- Access control

Cons:

- Not versioned (hard to track changes)
- Not linked from code
- Scattered (lost in sea of documents)
- Not searchable easily
- Requires active maintenance to keep organized

### Option 4: Specialized ADR tools

Tools designed specifically for ADRs:

- **ADR Tools** (command-line tool to generate ADR template)
- **Adr-log** (generates index of ADRs)
- **Architecture Decision Record Viewer** (web UI to browse ADRs)

Pros:

- Built for ADRs
- Streamlined workflow
- Templates

Cons:

- Added complexity
- Requires training
- May not integrate well with existing tools

### Recommendation

For most organizations: **Git + Markdown + pull request workflow**

Reasoning:

- ADRs live with code (same repository, easy to reference)
- Changes are versioned (Git history)
- Pull request workflow enables review and discussion
- Searchable (GitHub search, grep)
- No additional tools needed
- Works for teams of any size

Example workflow:

1. Engineer creates ADR in branch: `git checkout -b adr/004-event-driven-architecture`
2. Engineer writes ADR as Markdown file
3. Engineer pushes branch and creates pull request
4. Team reviews and discusses in pull request comments
5. Once approved, pull request is merged
6. ADR is now part of the main branch, searchable, versioned

## Adoption Process: From No ADRs to ADR Culture

Adopting ADRs requires organizational change. Plan for it.

### Phase 1: Setup (Week 1-2)

**Step 1: Create ADR structure**

Set up directory and template:

```
docs/adr/
  000-record-architecture-decisions.md (template)
  README.md (how to write ADRs)
```

**Step 2: Write a template**

Create a template that teams use for all ADRs:

```markdown
# ADR XXX: [Title]

**Date**: [Date]
**Status**: [Proposed / Accepted / Deprecated / Superseded]

## Context

[What is the problem we are trying to solve?]

## Options Considered

[What alternatives did we evaluate?]

| Option | Pros | Cons |
|--------|------|------|
| Option A | ... | ... |
| Option B | ... | ... |

## Decision

[What did we decide and why?]

## Consequences

Pros:
- 

Cons:
- 

## Reconsidering

When would we reconsider this decision?
```

**Step 3: Document process**

Write a README explaining:

- When to write ADRs
- How to write ADRs
- Review process
- Naming convention

**Step 4: Identify owner**

Who is responsible for ADR process? (Usually principal architect or tech lead)

### Phase 2: Backfill Major Decisions (Week 3-8)

**Step 5: Identify past decisions**

What major decisions have already been made?

- Database choice
- Programming language
- Deployment platform
- API design
- Authentication system

**Step 6: Write backfill ADRs**

Document past decisions as ADRs.

Status: Accepted (since decision is already made and implemented)

This is tedious but important. It establishes the context for all future decisions.

Effort: 30-60 minutes per ADR. For 10 major decisions, 5-10 hours.

**Step 7: Get team buy-in**

Have team review backfilled ADRs. Are they accurate? Did they miss anything?

This is good way to get team comfortable with ADR format.

### Phase 3: New Decision Process (Week 9+)

**Step 8: Use ADRs for new decisions**

All new significant technical decisions are documented as ADRs.

When: New decision is made (or about to be made)

Process:

1. Engineer proposes ADR (Status: Proposed)
2. Team discusses options
3. Team makes decision
4. Engineer updates ADR with decision (Status: Accepted)
5. ADR is merged to main branch

**Step 9: Reference ADRs in code**

When making a decision that affects code, reference the ADR in code comments:

```python
# See ADR 001: Use PostgreSQL for primary database
# We chose PostgreSQL because...
connection = psycopg2.connect(...)
```

This creates a link between decision and code.

**Step 10: Review and update regularly**

Monthly: Are we following our ADRs?

Quarterly: Are any ADRs obsolete? Do any need updating?

Annually: Are we missing any ADRs? Are there decisions that should be documented?

### Phase 4: Expansion (Month 6+)

**Step 11: Extend beyond architecture**

Once team is comfortable with ADRs, extend to other domains:

- **Infrastructure Decision Records** (IDRs): Infrastructure decisions (cloud platform, networking)
- **Security Decision Records** (SDRs): Security decisions (authentication, encryption)
- **Process Decision Records** (PDRs): Process decisions (code review, release process)

Basically, ADRs for any significant decision.

## Potential Issues and Solutions

Adopting ADRs faces common challenges:

### Issue 1: ADRs become stale

Problem: ADRs are written but never updated. They become outdated.

Solution:

- Schedule quarterly ADR reviews
- Have process owner responsible for keeping ADRs current
- Review ADRs during major architecture changes
- Link ADRs from documentation so changes are obvious

### Issue 2: Too many ADRs

Problem: Team writes ADRs for every minor decision, creating noise.

Solution:

- Define clear criteria for when to write ADRs (only significant decisions)
- Reject ADRs that are too trivial
- Use alternative formats for minor decisions (design docs, comments)

### Issue 3: Bikeshedding in ADR review

Problem: Team members debate every ADR endlessly, slowing down decision-making.

Solution:

- Set a time limit for ADR discussion (e.g., 1 week, then decide)
- Have a clear decision-maker (tech lead, architect)
- Use ADR review for learning, not rehashing decisions
- Once decided, move forward (can always revisit later with new ADR)

### Issue 4: No one reads ADRs

Problem: ADRs are written and filed away. No one knows they exist.

Solution:

- Link ADRs from code and documentation
- Share ADRs in team meetings ("Today we are reviewing ADR 010")
- Reference ADRs in discussions ("This relates to ADR 005, see it for context")
- Create index or visualization of ADRs
- Make ADRs easily discoverable (searchable, organized)

### Issue 5: Organizational change resistance

Problem: Team says "We do not have time for ADRs" or "This is bureaucracy."

Solution:

- Show value: "ADRs save us from repeating mistakes, speed up onboarding, align teams"
- Make ADRs low-friction: Simple template, quick to write, light review process
- Start small: Maybe just 3-5 ADRs in first year
- Leadership modeling: Have leadership write ADRs for their decisions
- Celebrate ADRs: Share good ADRs, show examples

### Issue 6: Complex decisions are hard to document

Problem: Some decisions are nuanced, with many tradeoffs. Hard to capture in ADR format.

Solution:

- ADRs do not need to be short (can be 2-3 pages)
- Use tables and structured format to organize complexity
- Link to supporting documents if needed
- Be honest about complexity and tradeoffs

### Issue 7: Distributed teams do not agree on ADRs

Problem: Teams in different locations or time zones disagree on decision.

Solution:

- Allow async discussion (ADRs in pull request enable async review)
- Set clear process (who gets final say, deadline for feedback)
- Document disagreement (mention that some team members disagreed, why decision was made anyway)
- Allow superseding (if decision proves wrong, can write new ADR)

## Best Practices for ADRs

### 1. Write for the future

Imagine someone reading this ADR 5 years from now, with no context. Will they understand?

Be explicit:

Bad: "We chose PostgreSQL because it is good"

Good: "We chose PostgreSQL because it provides ACID guarantees for financial transactions, handles our data volume (1M+ TPS), and the team has expertise in it. We rejected MongoDB because weaker ACID guarantees are too risky for financial data."

### 2. Document tradeoffs honestly

No decision is perfect. Be honest about what you are giving up.

Example:

> Microservices provide better scaling but add operational complexity. We are accepting the operational complexity because the improved scaling is worth it.

This helps future teams understand the reasoning.

### 3. Include numbers where possible

"Better performance" is vague. "40% faster response time" is specific.

Include:

- Performance metrics (latency, throughput)
- Cost metrics (license cost, infrastructure cost)
- Complexity metrics (team size needed to operate)

### 4. Keep it concise

ADRs should be 1-2 pages. If it is 10 pages, it is not an ADR, it is a specification.

Write concisely. Remove fluff. Get to the point.

### 5. Make ADRs searchable

Use keywords that future teams will search for:

> ADR 001: **Use PostgreSQL** for **primary database**
>
> Keywords: relational database, SQL, ACID, scaling

This helps people find relevant ADRs.

### 6. Link related ADRs

If ADR 025 relates to ADR 001, link them:

> Related: ADR 001 (Use PostgreSQL for primary database)

This helps teams understand how decisions relate.

### 7. Use consistent format

All ADRs should follow the same template. This makes them easier to read and compare.

### 8. Have clear ownership

Who wrote this ADR? Who is responsible for it? Include names.

> Author: Alice (architect)
> Reviewed by: Bob (engineering lead), Carol (ops)
> Approved by: Dan (VP Engineering)

This creates accountability and makes it clear who to ask questions to.

### 9. Include implementation guidance

For decisions with broad scope, include guidance on how to implement:

> For new services: Use PostgreSQL as primary database (see schema template at [link])
> For existing services: No action required unless you hit scaling limits
> For services considering database choice: Refer to this ADR before choosing

This helps teams apply the decision.

### 10. Review ADRs regularly

Set calendar reminders to review ADRs:

- Monthly: Are we following our ADRs?
- Quarterly: Are any ADRs obsolete?
- Annually: Are there decisions we should have documented?

Regular review keeps ADRs relevant.

## Organizational Benefits of ADRs

When done well, ADRs provide significant organizational benefits.

### 1. Institutional knowledge preserved

When team members leave, the knowledge they held is preserved in ADRs.

Cost savings: Reduced tribal knowledge, easier to hire and onboard replacements.

### 2. Faster decision-making

When ADRs document similar decisions, teams can make decisions faster by referring to precedent.

Example: New team needs a database. Refer to ADR 001 (Use PostgreSQL). Decision made in 5 minutes instead of weeks.

### 3. Better architecture over time

Because decisions are documented and visible, teams can see the evolution of architecture. This enables better long-term planning.

### 4. Reduced technical debt

When teams understand why architecture is the way it is, they make better maintenance and upgrade decisions.

Cost savings: 10-20% reduction in technical debt accumulation.

### 5. Compliance and audit

Regulators want to know decisions were made with reasoning, not arbitrarily.

ADRs provide the audit trail.

### 6. Aligned decision-making

When all teams use ADRs, standards emerge. Decisions are made consistently across the organization.

Cost savings: Reduced fragmentation, easier integration, less duplicated effort.

### 7. Mentoring and learning

ADRs are teaching tools. Junior engineers learn by reading ADRs how experienced engineers make decisions.

Cost savings: Better decision-making across the organization over time.

### 8. Reduced rework

When decisions are documented and teams understand the reasoning, there is less "let me rewrite this my way" rework.

Cost savings: 10-30% reduction in rework.

### 9. AI, search, and context for modern development

ADRs embedded in code repositories unlock capabilities that isolated documentation cannot provide.

**Search and discoverability**: When ADRs live in Git alongside code, they are indexed by GitHub search, GitLab search, and other repository tools. Engineers can find relevant decisions instantly using the same search interface they use for code. Search time: 1-2 minutes instead of 15-30 minutes digging through scattered documentation.

**AI context and summarization**: Modern code intelligence tools (GitHub Copilot, Claude, other LLMs) can analyze code, understand the decision history by reading ADRs in the same repository, and provide context-aware assistance.

Examples:

- Engineer asks: "Why is this service using DynamoDB?" AI reads ADR 012 (archived in the repo) and explains the decision, tradeoffs, and when to reconsider.
- During code review, AI references the relevant ADR: "This change relates to ADR 008 (Use microservices for scalability). The decision expects services to be independently deployable."
- When proposing architectural changes, AI suggests: "This might conflict with ADR 004. Have you considered why that decision was made?"

**Reduced context switching**: Engineers no longer context-switch between code repository and documentation wiki. Everything is in one place. AI tools have complete context: code + decisions + rationale. This enables better code review, better suggestions, better onboarding.

**Automated decision tracking**: Automation can:
- Detect when code violates documented decisions (e.g., commit uses MongoDB when ADR 001 mandates PostgreSQL for relational data) and flag it in CI/CD
- Suggest when ADRs need updating based on code changes
- Track decision implementation progress (which services have migrated to new standard?)
- Correlate incidents with decisions (did the database choice contribute to this incident?)

**Contextual AI onboarding**: New team members ask an AI assistant "Why is our architecture this way?" AI reads all ADRs from the repo and provides a comprehensive summary with specific rationale. This cuts onboarding time for architectural understanding from weeks to days.

**Decision analytics**: Tools can analyze ADR patterns to identify:
- Decisions that were superseded quickly (potential early mistakes)
- Decisions that have remained stable for years (good choices)
- Decisions with missing implementation guidance
- Trend in decision types (are we making more security decisions, more scaling decisions?)

Cost savings: 15-25% faster issue resolution due to better context. 40-50% faster architecture understanding for new team members. Reduced AI hallucination risk (AI grounded in documented decisions rather than making assumptions).

Total 5-year benefit: Reduced training costs, reduced rework, faster decisions, better architecture, AI-assisted development. Estimated: $750K-1.5M for a 100-person engineering organization.

## Common Mistakes

### Mistake 1: Bikeshedding

Debating every decision endlessly instead of documenting it.

Result: Slow decision-making.

Fix: Set time limit. Make decision. Document reasoning. Move forward.

### Mistake 2: ADRs only for controversial decisions

Documenting only when there is disagreement.

Result: Most decisions are not documented.

Fix: Document all significant decisions, not just controversial ones.

### Mistake 3: No process for updating ADRs

ADRs are written once and never updated.

Result: ADRs become obsolete, no one trusts them.

Fix: Have explicit process for updating ADRs when circumstances change.

### Mistake 4: ADRs buried in wiki or drive

ADRs are created but hard to find.

Result: New teams do not know they exist, do not benefit from them.

Fix: Store ADRs with code. Make them searchable. Link from documentation.

### Mistake 5: ADRs written after decision

Documenting a decision that was already made, without team input.

Result: Team does not feel ownership of decision, trusts ADR less.

Fix: Involve team in writing ADR. Or involve team early in decision and write ADR as you decide.

### Mistake 6: Perfectionism

Team spends weeks perfecting an ADR, debating every word.

Result: ADR is never completed, decision is not documented.

Fix: Good enough is fine. Document the decision reasonably well, move forward. Can refine later.

## Wrap It Up

Architecture Decision Records are a simple practice with enormous impact.

When team members understand why architecture is the way it is, they make better decisions, maintain the system better, and transition knowledge more effectively.

When new teams join, they learn from ADRs instead of reinventing the wheel.

Start small. Pick your 5 most important past decisions. Document them as ADRs. Use ADRs for new decisions. Review quarterly. Over time, ADRs become invaluable institutional knowledge.

The best time to start writing ADRs is when you made the decision. The second best time is now.

