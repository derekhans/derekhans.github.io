---
layout: post
title: "Privileged Identity Management in Practice"
date: 2020-07-20
tags: [identity, azure, governance]
---

Standing admin access is dangerous. Privileged Identity Management (PIM) enforces just-in-time access for administrative roles.

## The Problem with Standing Access

Permanent admin rights mean:

- Larger attack surface
- No audit trail for why access was needed
- Difficult compliance reporting
- Risk of accidental damage

## PIM Concepts

**Eligible Assignments:**
User can activate the role when needed

**Active Assignments:**
User has the role right now

**Time-Bound Access:**
Access expires automatically

## Activation Workflow

```
1. User requests role activation
2. Justification required
3. Approval (optional)
4. MFA verification
5. Role activated for limited time
6. Actions logged with justification
7. Role automatically expires
```

## Access Reviews

Regular reviews ensure access remains appropriate. PIM automates the review process and tracks remediation.
