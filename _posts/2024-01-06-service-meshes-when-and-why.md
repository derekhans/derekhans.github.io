---
layout: post
title: "Service Meshes: When and Why"
date: 2024-01-06
tags: [platform-engineering, kubernetes, architecture]
---

Service meshes add observability, security, and traffic management to microservices. But they also add complexity. When are they worth it?

## What Service Meshes Provide

- mTLS between services
- Traffic splitting for deployments
- Observability without code changes
- Retries and circuit breaking

## Popular Options

**Istio:** Feature-rich, complex
**Linkerd:** Lightweight, simple
**Consul Connect:** HashiCorp ecosystem

## When to Adopt

Consider a service mesh when:

- You have many services (20+)
- You need mutual TLS everywhere
- You want traffic control
- You need service-level metrics

## When to Avoid

Skip the mesh when:

- You have few services
- Teams can't support complexity
- Latency requirements are extreme

## Sidecar Alternatives

eBPF-based meshes like Cilium offer mesh features without sidecars.
