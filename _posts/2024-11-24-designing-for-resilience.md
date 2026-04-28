---
layout: post
title: "Designing for Resilience"
date: 2024-11-24
tags: [architecture, reliability, cloud]
---

Systems will fail. The question is whether failures cascade into outages or are contained and recovered automatically.

## Failure Modes

Design for:

- Network partitions
- Service unavailability
- Data corruption
- Capacity exhaustion
- Configuration errors

## Patterns for Resilience

**Circuit Breaker:**
Stop calling failing services

```python
@circuit_breaker(failure_threshold=5, recovery_timeout=30)
def call_service():
    return requests.get(url)
```

**Bulkhead:**
Isolate failures to prevent cascade

**Retry with Backoff:**
Handle transient failures

```python
@retry(wait=wait_exponential(multiplier=1, max=60))
def flaky_operation():
    return do_something()
```

## Chaos Engineering

Intentionally inject failures:

- Kill random instances
- Add network latency
- Fill disks
- Exhaust memory

Find weaknesses before they find you.

## Game Days

Practice incident response. Run through scenarios. Build muscle memory for high-stress situations.
