---
layout: post
title: "Domain-Driven Design in Practice"
date: 2023-07-23
tags: [architecture, ddd, design]
---

Domain-Driven Design (DDD) aligns software with business domains. After years of applying DDD, here's what actually works.

## Strategic Patterns

**Bounded Contexts:**
Define clear boundaries around models. The same word means different things in different contexts.

**Context Mapping:**
Document how contexts interact:

- Partnership
- Customer-Supplier
- Conformist
- Anticorruption Layer

## Tactical Patterns

**Aggregates:**
Consistency boundaries. One aggregate, one transaction.

**Domain Events:**
Capture business occurrences:

```python
class OrderPlaced(DomainEvent):
    order_id: str
    customer_id: str
    timestamp: datetime
```

## Ubiquitous Language

Use business terms in code:

```python
# Bad
def process_item(user_id, item_id):

# Good
def place_order(customer: Customer, product: Product):
```

## When to Apply DDD

DDD adds complexity. Use it for:

- Complex business logic
- Long-lived systems
- Collaborative domains

Skip it for CRUD apps.
