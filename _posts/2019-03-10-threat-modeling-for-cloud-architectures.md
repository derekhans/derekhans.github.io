---
layout: post
title: "Threat Modeling for Cloud Architectures"
date: 2019-03-10
tags: [security, architecture, cloud]
---

Threat modeling identifies security issues before they become vulnerabilities. For cloud architectures, the attack surface is different but the methodology remains valuable.

## STRIDE Framework

- **Spoofing** - Pretending to be someone else
- **Tampering** - Modifying data or code
- **Repudiation** - Denying actions
- **Information Disclosure** - Exposing data
- **Denial of Service** - Preventing access
- **Elevation of Privilege** - Gaining unauthorized access

## Cloud-Specific Threats

Consider:

- Cross-tenant attacks
- Metadata service exploitation
- Storage misconfigurations
- Network segmentation failures
- Identity federation weaknesses

## Data Flow Diagrams

Map your architecture:

```
[User] → [CDN] → [App Gateway] → [App Service] → [Database]
                        ↓
                 [Key Vault]
```

## Trust Boundaries

Every boundary crossing needs security controls. Don't assume cloud provider boundaries are sufficient.

## Prioritization

Not all threats are equal. Use risk scoring:

Risk = Likelihood × Impact

Focus on high-risk items first.
