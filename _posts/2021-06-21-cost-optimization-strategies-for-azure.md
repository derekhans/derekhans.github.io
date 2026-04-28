---
layout: post
title: "Cost Optimization Strategies for Azure"
date: 2021-06-21
tags: [azure, finops, cloud]
---

Cloud costs can spiral quickly without proper governance. After reviewing dozens of Azure environments, I've identified patterns that consistently reduce spend by 30-40%.

## Reserved Instances

For predictable workloads, reserved instances offer significant savings:

| Commitment | Savings |
|------------|---------|
| 1 Year     | ~30%    |
| 3 Year     | ~50%    |

## Right-sizing

Most VMs are over-provisioned. Use Azure Advisor recommendations and actual metrics:

```kusto
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| summarize avg(CounterValue) by Computer, bin(TimeGenerated, 1h)
```

## Auto-shutdown

Development environments don't need to run 24/7. Implement auto-shutdown policies and save 65% on non-production costs.

## Tags and Accountability

You can't optimize what you can't measure. Implement a tagging strategy that assigns costs to business owners.
