---
layout: post
title: "Azure AD Conditional Access Patterns"
date: 2025-11-12
tags: [identity, azure, security]
---

Conditional Access is the policy engine at the heart of Azure AD security. It evaluates signals and enforces access decisions in real-time.

## Signal Types

Conditional Access considers:

- User and group membership
- Device state and compliance
- Application sensitivity
- Location and IP reputation
- Real-time risk detection

## Common Patterns

**Require MFA for admins:**

```
IF: User is in Admin role
THEN: Require MFA
```

**Block legacy authentication:**

```
IF: Client app is legacy
THEN: Block
```

**Require compliant device for sensitive apps:**

```
IF: App is in "Sensitive Apps" group
THEN: Require compliant device
```

## Named Locations

Define trusted networks:

```json
{
  "displayName": "Corporate Network",
  "ipRanges": [
    { "cidrAddress": "203.0.113.0/24" }
  ],
  "isTrusted": true
}
```

## Testing Policies

Always use report-only mode before enforcing. Review sign-in logs to understand impact.
