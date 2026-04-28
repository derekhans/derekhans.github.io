---
layout: post
title: "Golden Paths: Reducing Cognitive Load"
date: 2018-04-05
tags: [platform-engineering, developer-experience, architecture]
---

The concept of golden paths is central to platform engineering. A golden path is the supported, recommended way to accomplish a task—not the only way, but the easiest way.

## Why Golden Paths Work

Developers face decision fatigue. Every project involves dozens of choices:

- Which CI system?
- What deployment target?
- How to handle secrets?
- What monitoring stack?

Golden paths eliminate these decisions for common cases.

## Principles of Good Golden Paths

1. **Opinionated but not rigid** - Provide escape hatches
2. **Documented thoroughly** - Make the path discoverable
3. **Maintained actively** - Update dependencies, fix bugs
4. **Measured continuously** - Track adoption and satisfaction

## Example: New Service Path

```
1. Run: platform create service
2. Answer prompts
3. Get: repo, pipeline, deployment, monitoring
4. Time: 15 minutes
```

Compare this to the hours or days of setup without a golden path.
