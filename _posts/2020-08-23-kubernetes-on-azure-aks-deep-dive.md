---
layout: post
title: "Kubernetes on Azure: AKS Deep Dive"
date: 2020-08-23
tags: [azure, kubernetes, containers]
---

Azure Kubernetes Service handles the control plane so you can focus on workloads. But running production Kubernetes still requires understanding the platform deeply.

## Cluster Design

Consider:

- Node pool sizing
- Availability zones
- Network plugin (Azure CNI vs. kubenet)
- Private clusters

## Workload Identity

Replace pod identity with workload identity:

```yaml
serviceAccount:
  annotations:
    azure.workload.identity/client-id: <client-id>
```

## GitOps with Flux

Declarative deployments from Git:

```bash
az k8s-configuration flux create \
  --name my-config \
  --cluster-name my-cluster \
  --resource-group my-rg \
  --url https://github.com/org/repo
```

## Monitoring

Enable Container Insights for visibility into cluster and workload health.
