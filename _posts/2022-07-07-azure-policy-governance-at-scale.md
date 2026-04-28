---
layout: post
title: "Azure Policy: Governance at Scale"
date: 2022-07-07
tags: [azure, governance, compliance]
---

Azure Policy is the backbone of cloud governance. It enables you to enforce organizational standards and assess compliance at scale.

## Policy vs. RBAC

Policy controls what resources can do. RBAC controls who can do what to resources. Both are essential.

## Built-in Initiatives

Azure provides policy initiatives for common compliance frameworks:

- CIS Benchmarks
- NIST 800-53
- ISO 27001
- PCI DSS

## Custom Policies

When built-in policies aren't enough:

```json
{
  "if": {
    "allOf": [
      { "field": "type", "equals": "Microsoft.Storage/storageAccounts" },
      { "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly", "notEquals": true }
    ]
  },
  "then": { "effect": "deny" }
}
```

## Remediation

Policy isn't just about prevention. Remediation tasks can automatically fix non-compliant resources, bringing your environment into compliance without manual intervention.
