---
layout: post
title: "Infrastructure as Code Maturity Model"
date: 2023-06-06
tags: [platform-engineering, infrastructure, devops]
---

Infrastructure as code (IaC) adoption happens in stages. Understanding where you are helps plan where to go next.

## Level 1: Scripts

Bash scripts and manual runbooks. Better than clicking in consoles, but fragile and hard to maintain.

## Level 2: Configuration Management

Tools like Ansible or Chef. Idempotent, but still focused on configuration rather than infrastructure.

## Level 3: Declarative IaC

Terraform, ARM templates, CloudFormation. Declare desired state, let the tool figure out how to get there.

```hcl
resource "azurerm_resource_group" "example" {
  name     = "example-resources"
  location = "eastus"
}
```

## Level 4: Platform Abstraction

Higher-level constructs that hide cloud complexity:

```typescript
new ApplicationStack(this, 'MyApp', {
  runtime: Runtime.NODE_18,
  scaling: { min: 2, max: 10 }
});
```

## Level 5: Self-Service

Developers request infrastructure through APIs or portals. Platforms provision automatically within guardrails.
