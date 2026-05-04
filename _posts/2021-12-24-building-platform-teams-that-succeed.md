---
layout: post
title: "Building Platform Teams That Succeed"
date: 2021-12-24
tags: [platform-engineering, leadership, organization]
---

Platform engineering is not DevOps rebranded. It's a different organizational pattern built on a different assumption: that the cost of supporting many independent teams to own infrastructure and operations outweighs the cost of building a centralized platform that abstracts away that complexity.

Whether that assumption holds depends on scale, organizational maturity, and how well the platform team is structured and funded.

## What Platform Engineering Actually Is

A platform team is a group of engineers tasked with building and maintaining an internal product—the platform—that other engineering teams (product teams) consume to deliver their own services.

The platform abstracts infrastructure, deployment, and operational concerns. Product teams write application code and push it to the platform. The platform handles provisioning, deployment, monitoring, incident response, and scaling.

### The core value proposition

Instead of each team managing:

- infrastructure provisioning
- deployment pipelines and release processes
- observability and alerting
- incident detection and response
- security and compliance enforcement
- cost optimization

Teams can focus on application code and business logic.

### What platform teams actually build

This varies by organization and maturity, but typically includes:

- **deployment infrastructure**: kubernetes, lambda, or managed services
- **CI/CD systems**: build pipelines, deployment orchestration, rollback automation
- **observability stack**: logging, metrics, tracing, alerting
- **networking and security**: service mesh, identity and access management, encryption
- **data infrastructure**: database provisioning, backups, migration tools
- **developer experience tooling**: SDKs, templates, code generation, documentation
- **operational runbooks**: incident response, troubleshooting guides, escalation procedures

The specifics depend on the organization's scale, workload diversity, and architectural model.

## How Platform Teams Fit in Organizational Structure

Platform engineering requires rethinking how technical organizations are structured.

### Product teams own their service

Product teams own the code, features, roadmap, and performance of their service. They decide on business logic, data model, and API contracts.

### Platform teams own the substrate

Platform teams own the infrastructure, deployment, observability, and operational mechanics that enable product teams to operate their services independently.

### The boundary between them

This boundary is critical. If it's unclear, the platform team becomes a helpdesk for every problem that isn't strictly application code.

Good boundaries look like:

- Product teams deploy code to the platform; platform team maintains the deployment system.
- Product teams write business logic; platform team provides libraries and templates for common patterns.
- Product teams define their observability requirements; platform team provides the observability infrastructure and enforces standards.

## The Role of Enterprise Architecture in Platform Teams

Enterprise architecture is often misunderstood as a governance and restriction function. In a healthy platform organization, it's the opposite. Enterprise architecture defines the constraints, standards, and patterns that enable teams to move independently while maintaining coherence.

### What enterprise architecture in a platform context looks like

**Architectural principles**: "Services should be stateless" or "external dependencies should be versioned" or "all state should be in persistent data stores."

These are not restrictions—they're enabling constraints that make platform automation possible.

**Integration patterns**: How do services discover each other? How do they communicate? Are there standard request/response formats, error codes, retry semantics?

Services that follow these patterns work seamlessly on the platform. Services that don't become special cases that require manual work.

**Data governance**: How should services manage data? Are there shared data stores? How do services share data across boundaries?

This is where many platform efforts fail. Teams adopt the platform for deployment but diverge on data architecture, creating maintenance nightmares.

**Security and compliance patterns**: What does authentication and authorization look like? How are secrets managed? How do services expose compliance requirements?

A platform that makes it easy for teams to do the secure thing is a platform that actually ships security in practice.

### Architecture as enabler, not as obstacle

The best platform teams use architecture to remove toil and reduce coordination overhead. Instead of "you must do X," it's "here's the standard way to do X, and we've automated it for you."

## When Platform Engineering Works Well

### Product team experience

- onboarding: 1–2 weeks to get first service deployed
- common tasks: deploying code, checking metrics, responding to alerts
- friction: mostly comes from business requirements, not infrastructure friction

### Operational stability

- deployment confidence: teams can deploy during business hours without fear
- incident response: most incidents are detected and alerts fire within minutes
- incident recovery: typical incident takes 30 minutes to resolve, not 4 hours

### Organizational velocity

- release cadence: product teams release multiple times per week
- time-to-market: features go from idea to production in weeks, not quarters
- technical leverage: new services start with the same operational standards as mature ones

### Cost efficiency

- resource utilization: infrastructure is used efficiently across workloads
- no waste: nobody maintains duplicate infrastructure tools or processes
- cost visibility: product teams understand the cost of their choices and can optimize

## When Platform Engineering Fails

### Poor platform design

The platform imposes constraints that make product team work harder, not easier.

Example: A platform that requires all services to use the same database technology. Product teams work around it by running their own database instances outside the platform.

Result: No consolidation of infrastructure. Product teams spend time managing databases instead of writing application code. Platform team wonders why adoption is low.

### Misaligned incentives

Product teams are measured on feature delivery. Platform team is measured on adoption. When feature delivery and platform migration conflict, features win.

Example: A platform team spends months building a new deployment system. When product teams are asked to migrate, they refuse because they're in the middle of a feature push.

Result: The old system stays in production forever. Platform investment pays no return. Platform team morale drops because their work isn't being used.

### Lack of organizational buy-in

A platform can't succeed if it's perceived as optional. But it also can't succeed if it's forced on teams without support.

Example: Leadership mandates that all teams use the new platform by a deadline. No additional support is provided. Teams that aren't ready scramble and have bad experiences.

Result: Platform gets a bad reputation. Teams avoid it when possible. Adoption stalls. Platform team burns out supporting requests.

### Insufficient engineering depth

Building a good platform requires senior engineers who understand operational complexity, can think systematically about developer experience, and can make trade-off decisions.

Example: A team staffed mostly with junior engineers, mentored by a single architect. When the architect leaves, decision-making breaks down.

Result: Platform drifts. Technical debt accumulates. New features take longer. Platform team becomes stretched.

### Wrong abstraction level

The platform either abstracts too much (teams can't do what they need) or too little (teams still manage too much infrastructure).

Example: A platform that only provides container orchestration but leaves networking, storage, and monitoring to individual teams.

Result: Teams end up managing similar infrastructure problems in parallel. No consolidation. Platform work doesn't pay for itself.

## Business Benefits and Measurable Outcomes

### Developer productivity

**Metric**: Time from code commit to production.

Good platform: 30 minutes to 2 hours. Teams can iterate quickly.

Bad platform: 2 days to 1 week. Teams batch changes to reduce deployment friction.

**Impact**: A product team that ships 2x per week instead of 1x per quarter can respond to market feedback 50x faster. That's a competitive advantage.

### Operational stability

**Metric**: Mean time between failures (MTBF) and mean time to resolution (MTTR).

Good platform: MTBF of 2–4 weeks at scale. MTTR of 30–60 minutes for most incidents.

Bad platform: MTBF of 2–3 days. MTTR of 4–8 hours. Teams spend a lot of time fighting fires.

**Impact**: Every incident that doesn't happen is a day engineers spend on feature work instead. At scale, this compounds to months of engineering time per quarter.

### Cost efficiency

**Metric**: Cost per transaction or cost per service.

Good platform: Infrastructure cost scales linearly (or sub-linearly) with workload. Idle resources are shared across services.

Bad platform: Each team maintains duplicate tooling. Infrastructure is not shared. Cost grows faster than workload.

**Impact**: A company running 50 services on a good platform might spend $2M/year on infrastructure. The same company with ad-hoc infrastructure might spend $5M/year. That's engineering capacity that could go to product.

### Release velocity and quality

**Metric**: Deployment frequency and change failure rate.

Good platform: High-performing teams deploy 10+ times per day. Change failure rate is <1%.

Bad platform: Teams deploy 1–2 times per week. Change failure rate is 5–10%.

**Impact**: Higher deployment frequency means faster feedback loops, which means better quality and faster learning.

### Time to deliver new services

**Metric**: How long does it take to spin up a new service and get it to production?

Good platform: 2–4 weeks from project start to deployed service handling real requests.

Bad platform: 3–4 months. Teams spend time building infrastructure before writing application code.

**Impact**: A company can move faster in new markets. Can staff engineers on new services with confidence that infrastructure won't be a blocker.

## Adopting a Platform: The Path Forward

### Phase 1: Build clarity on what you're solving

Platform engineering is expensive to do well. Before starting, be clear on what problems you're trying to solve.

Common starting points:

- deployment complexity: too many teams managing bespoke deployment tooling
- operational toil: teams spending too much time on infrastructure work
- scaling friction: adding new services takes too long
- cost visibility: nobody knows what compute costs

Talk to product teams. Find the pain points that cross multiple teams. Start there.

### Phase 2: Build incrementally

Don't try to migrate everything at once. Pick a pilot group of 2–3 product teams who have moderate pain and are willing to try something new.

Work with them to understand their workflows. Build a minimal platform that solves their specific problems. Learn what works and what doesn't.

Important: The goal is to establish a pattern that other teams can follow, not to build perfection.

### Phase 3: Establish the feedback loop

Treat the platform as a product. Have regular reviews with platform users. Understand what's working and what's slowing them down.

Iterate. Maybe your first deployment mechanism was great. Maybe it needs redesign after six weeks of real use.

### Phase 4: Grow adoption gradually

As other teams see the pilot teams move faster and spend less time on infrastructure, they'll want to join. Let them.

Each new team will surface new requirements. Some will be genuinely important. Others will be special cases. Make good decisions about which is which.

## Common Adoption Challenges and Deployment Issues

### The "build it and they will come" failure

Many platform initiatives fail because they build in isolation and then try to migrate teams at the end.

Problem: By the time the platform is ready, it doesn't match how teams actually work. Teams resist adoption because they've already built their own solutions.

Better approach: Get real teams involved from week one. Don't build anything that hasn't been validated by actual users.

### The integration debt problem

A platform that requires ripping out all existing infrastructure and processes is a hard sell. But a platform that requires managing two deployment systems indefinitely is also a failure.

Challenge: How do you support legacy and modern approaches without creating unmaintainable technical debt?

Approach: Set a migration deadline. Support both systems during transition, but with clear timelines. This gives teams time to migrate while creating urgency.

### The scaling regression

A platform that works great for one team might fail at scale. Adding ten more teams surface edge cases nobody anticipated.

Example: A platform built for services with <10 QPS doesn't handle services with 100k QPS. Now you need to rearchitect.

Approach: Test the platform with diverse workloads early. Get a mix of batch processing, real-time services, and high-throughput services on the platform before you declare it ready for large-scale adoption.

### The knowledge concentration problem

Initially, the platform team has most of the knowledge about how to use the platform. Product teams depend on platform engineers to solve problems. This becomes a bottleneck.

Approach: Invest heavily in documentation and self-service. Train product team leads to troubleshoot common issues. Create runbooks and debugging guides.

### The organizational misalignment

Product teams are measured on features. The platform team is measured on adoption. When these conflict, product teams win and platform adoption stalls.

Approach: Align incentives. Product teams should be measured on features *and* operational stability. Platform teams should be measured on user satisfaction and operational outcomes, not just adoption numbers.

### The technical debt transfer

Sometimes teams use the platform as an excuse to stop maintaining their code. "The platform should handle this." But the platform has limitations, and nobody wants to maintain it.

Approach: Set clear expectations about what the platform handles and what product teams handle. Create visibility into technical debt. Make platform reliability and product code quality joint concerns.

## Best Practices for Platform Teams

### 1. Start with user research

Don't build what you think product teams need. Ask them. Observe their workflows. Understand their pain.

### 2. Build incrementally and iterate

Ship a minimal platform. Get feedback. Improve. Repeat. Don't try to build the perfect platform in isolation.

### 3. Make self-service the default

Every time a product team asks the platform team for help with a common task, that's a failure of the platform's user experience. The goal is for most product team tasks to be self-service.

### 4. Maintain the boundary

Product teams should not need to understand how the platform works internally. The platform should handle operational complexity invisibly.

But product teams should understand the platform's constraints and make informed decisions about how they use it.

### 5. Invest in observability of the platform itself

If the platform is unavailable or degraded, every product team is affected. Platform observability is critical. Make it a core investment.

### 6. Create a feedback channel

Establish a lightweight process for product teams to request features, report bugs, and provide feedback. Prioritize feedback from multiple teams—that's a signal that it's widely valuable.

### 7. Document ruthlessly

Platform documentation is not luxury. It's foundational to adoption. Invest in guides, API documentation, troubleshooting articles, and architectural overviews.

### 8. Establish SLAs and communicate them

What's the expected availability of the platform? What's the support model? When product teams know what to expect, they can plan accordingly.

### 9. Manage the platform team's capacity

Platform teams get pulled in many directions. Establish a process for prioritizing work. Some capacity should go to reactive support, some to addressing technical debt, some to new features.

### 10. Hire for product thinking

Platform teams need traditional infrastructure engineering skills. But they also need people who think like product managers—who care about user experience, who ask "why," and who measure impact.

## Organizational Benefits and Long-Term Impact

### Strategic flexibility

Teams buried in infrastructure work can't pivot. A company with a solid platform can respond to market changes because teams aren't stuck maintaining bespoke deployment systems.

### Competitive velocity

Companies that can release faster, more reliably, and more cheaply have a competitive advantage. A good platform is the foundation for that velocity.

### Talent attraction and retention

Senior engineers want to work on problems that matter. A platform team that's building something used by dozens of teams is interesting. A platform team that's spending 80% of their time on support tickets is not.

### Cost control

A good platform surfaces cost. Teams understand the cost of their choices. The organization can optimize efficiently.

### Technical coherence

When teams go completely independent, you often get drift: different languages, different databases, different operational patterns. A platform creates coherence without imposing rigid standardization.

### Organizational learning

A platform team is also an organizational repository of infrastructure knowledge. They learn from each team's problems and share learnings across the organization.

## The Reality of Platform Engineering

Platform engineering is not a project. It's an organizational capability that needs sustained investment, senior leadership, and product thinking.

The best platform teams think like service providers. They listen to their users (product teams). They iterate on their product (the platform). They measure impact (time-to-production, deployment confidence, operational stability). And they accept feedback.

The worst platform teams build in isolation, impose requirements on product teams, and wonder why adoption is low.

If you're considering building a platform, start by understanding the pain points you're solving. Get a diverse group of product teams involved from day one. Build incrementally. Measure outcomes. And be prepared for the long game.

A well-built platform is one of the highest-leverage investments an engineering organization can make. It pays returns for years. But it requires commitment and the right team to build it.
