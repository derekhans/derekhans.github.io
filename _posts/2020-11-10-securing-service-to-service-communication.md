---
layout: post
title: "Securing Service-to-Service Communication"
date: 2020-11-10
tags: [identity, security, architecture]
---

Services talking to services need identity too. Managed identities and workload identity federation eliminate secrets for cloud-native authentication.

## The Problem with Secrets

Service accounts with passwords:

- Rotate frequently
- Store securely
- Risk exposure
- Audit usage

## Managed Identities

Azure assigns identity to resources:

```python
from azure.identity import DefaultAzureCredential
credential = DefaultAzureCredential()
# No secrets needed!
```

## Workload Identity Federation

Trust external identity providers:

```
GitHub Actions → Azure AD App → Azure Resources
```

No secrets in GitHub—JWT assertion establishes identity.

## Service Mesh mTLS

Mutual TLS between services:

- Automatic certificate rotation
- Service-level authentication
- Encrypted traffic

## Zero Trust for Services

Apply the same principles:

- Verify identity
- Check authorization
- Assume compromise
- Log everything
