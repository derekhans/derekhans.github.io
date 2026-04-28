---
layout: post
title: "Container Security: From Build to Runtime"
date: 2023-04-19
tags: [security, containers, devops]
---

Container security spans the entire lifecycle. Each phase presents unique risks and requires specific controls.

## Build Time

- Scan base images for vulnerabilities
- Use minimal base images
- Don't run as root
- Sign images

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine
USER nonroot
```

## Registry Security

- Private registries only
- Image signing and verification
- Vulnerability scanning on push

## Runtime Protection

- Network policies
- Pod security standards
- Runtime threat detection
- Resource limits

## Supply Chain

Know what's in your containers:

```bash
syft packages my-image:latest -o spdx-json
```

Verify everything, trust nothing.
