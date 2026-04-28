---
layout: post
title: "Multi-Tenant Identity Architecture"
date: 2023-02-19
tags: [identity, architecture, saas]
---

SaaS applications serve multiple customers from shared infrastructure. Identity architecture must isolate tenants while enabling efficient operations.

## Isolation Models

**Siloed:** Separate identity providers per tenant
**Pooled:** Shared identity provider with tenant claims
**Hybrid:** High-value tenants isolated, others pooled

## Tenant Resolution

Identify tenant from:

- Subdomain (acme.app.com)
- Path (/acme/dashboard)
- Header (X-Tenant-ID)
- Token claim

## Authorization Patterns

```python
def check_access(user, resource):
    if user.tenant_id != resource.tenant_id:
        raise Forbidden()
    return has_permission(user, resource)
```

## Cross-Tenant Scenarios

Some scenarios require cross-tenant access:

- Support staff access
- Parent-child tenants
- Partner integrations

Model these explicitly with scoped permissions.
