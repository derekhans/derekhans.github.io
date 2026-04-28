---
layout: post
title: "Microservices Anti-Patterns"
date: 2024-05-10
tags: [architecture, microservices, practices]
---

Microservices promise agility but often deliver distributed complexity. Here are the anti-patterns I've seen sink microservices initiatives.

## Distributed Monolith

Services that must deploy together aren't microservices:

```
Service A ←→ Service B ←→ Service C
    ↑____________↑____________↑
         Lockstep deployment
```

## Shared Database

Multiple services writing to the same database destroys independence.

## Synchronous Everywhere

Chains of synchronous calls multiply latency and failure risk.

## Service Per Entity

Not every database table needs a service. Start coarser, split when needed.

## Golden Hammer

Microservices aren't always the answer. Sometimes a modular monolith is better.

## No Observability

Without distributed tracing, debugging distributed systems is impossible.

## Premature Decomposition

You need to understand the domain before splitting it. Build the monolith first, then decompose.
