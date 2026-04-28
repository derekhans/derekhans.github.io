---
layout: post
title: "Building Developer Portals with Backstage"
date: 2025-12-22
tags: [platform-engineering, backstage, developer-experience]
---

Backstage, originally developed at Spotify, has become the de facto standard for building developer portals. It solves the discovery problem—how do developers find and understand services?

## The Service Catalog

At its core, Backstage provides a service catalog:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payment-service
  description: Handles payment processing
spec:
  type: service
  owner: payments-team
  lifecycle: production
```

## Software Templates

Scaffolding new projects consistently:

- Choose a template
- Fill in parameters
- Get a working project with CI/CD, monitoring, and documentation

## TechDocs

Documentation lives with code and renders in Backstage. No more hunting for outdated wikis.

## Plugin Ecosystem

Backstage's plugin architecture lets you integrate anything—cloud providers, monitoring tools, security scanners.
