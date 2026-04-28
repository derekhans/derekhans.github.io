---
layout: post
title: "Implementing Security Guardrails at Scale"
date: 2022-09-14
tags: [security, governance, cloud]
---

Security guardrails prevent mistakes before they happen. Instead of reviewing after the fact, encode security requirements into the platform.

## Policy as Code

Define what's allowed:

```rego
deny[msg] {
    input.kind == "Deployment"
    not input.spec.template.spec.securityContext.runAsNonRoot
    msg = "Containers must run as non-root"
}
```

## Admission Controllers

Kubernetes admission controllers enforce policy at deploy time:

- OPA Gatekeeper
- Kyverno
- Built-in PSPs/PSS

## Infrastructure Guardrails

Terraform Sentinel policies:

```python
import "tfplan/v2" as tfplan

main = rule {
    all tfplan.resources as _, resources {
        all resources as _, r {
            r.values.public_network_access_enabled is false
        }
    }
}
```

## Shift Left

Catch issues in pull requests, not production. Integrate policy checks into CI/CD pipelines.
