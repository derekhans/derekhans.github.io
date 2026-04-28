---
layout: post
title: "Evolutionary Architecture Principles"
date: 2025-03-15
tags: [architecture, practices, design]
---

Systems must evolve. Evolutionary architecture embraces change through fitness functions, incremental change, and appropriate coupling.

## Fitness Functions

Automated checks for architectural characteristics:

```python
def check_modularity():
    dependencies = analyze_dependencies()
    cycles = find_cycles(dependencies)
    assert len(cycles) == 0, f"Cyclic dependencies: {cycles}"
```

## Incremental Change

Avoid big bang rewrites:

1. Strangle old functionality
2. Migrate incrementally
3. Verify with fitness functions
4. Remove old code

## Appropriate Coupling

Not all coupling is bad. Appropriate coupling:

- Within bounded contexts: tight
- Between contexts: loose
- To external systems: anti-corruption layer

## Last Responsible Moment

Defer decisions until you have enough information. But not longer—delayed decisions have costs too.

## Reversibility

Prefer reversible decisions. When irreversible decisions are necessary, invest more in getting them right.
