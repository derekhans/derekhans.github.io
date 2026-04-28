---
layout: post
title: "Architecture Decision Records"
date: 2023-09-05
tags: [architecture, documentation, practices]
---

Architecture Decision Records (ADRs) capture the why behind technical decisions. When future teams ask "why did we choose X?", ADRs provide the answer.

## ADR Structure

```markdown
# ADR 001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need a relational database for our customer data.
Options considered: PostgreSQL, MySQL, SQL Server.

## Decision
We will use PostgreSQL.

## Consequences
- Need PostgreSQL expertise
- Can use advanced features like JSONB
- Open source, no licensing costs
```

## When to Write ADRs

Write an ADR when:

- Choosing between alternatives
- Making irreversible decisions
- Setting precedents for future work
- Deviating from standards

## ADR Lifecycle

1. **Proposed** - Under discussion
2. **Accepted** - Decision made
3. **Deprecated** - No longer applies
4. **Superseded** - Replaced by another ADR

## Discovery

Store ADRs with code. Make them searchable. Link to them from design documents.
