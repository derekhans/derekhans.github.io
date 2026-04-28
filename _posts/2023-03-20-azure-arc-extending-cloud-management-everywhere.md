---
layout: post
title: "Azure Arc: Extending Cloud Management Everywhere"
date: 2023-03-20
tags: [azure, hybrid-cloud, kubernetes]
---

Azure Arc represents Microsoft's vision for hybrid and multi-cloud management. It extends Azure's control plane to resources running anywhere—on-premises, edge, or other clouds.

## What Arc Enables

With Arc, you can:

- Manage servers across environments from Azure
- Deploy Azure data services anywhere
- Run Azure application services on Kubernetes
- Apply Azure Policy to non-Azure resources

## Arc-enabled Kubernetes

```bash
az connectedk8s connect --name my-cluster --resource-group my-rg
```

Once connected, you can deploy applications using GitOps, apply policies, and monitor from Azure.

## The Hybrid Reality

Most enterprises won't be 100% cloud for years. Arc acknowledges this reality and provides a path forward without forcing a complete migration.
