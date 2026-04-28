---
layout: post
title: "Building a Technology Radar"
date: 2025-02-11
tags: [architecture, strategy, practices]
---

A technology radar provides a structured way to evaluate and communicate technology choices. Inspired by ThoughtWorks, it helps organizations make consistent decisions.

## Radar Structure

Four rings:

1. **Adopt** - Use by default
2. **Trial** - Use in low-risk projects
3. **Assess** - Explore and evaluate
4. **Hold** - Don't start new work

Four quadrants:

- Techniques
- Platforms
- Tools
- Languages & Frameworks

## Example Entries

| Technology | Ring | Notes |
|-----------|------|-------|
| Kubernetes | Adopt | Standard for containers |
| Terraform | Adopt | IaC tool of choice |
| Pulumi | Trial | Exploring for complex logic |
| Serverless | Trial | Good for event-driven |
| OpenTofu | Assess | Watching license situation |
| CloudFormation | Hold | Moving away |

## Governance Process

1. Anyone can propose
2. Architecture team reviews
3. Decisions documented
4. Radar updated quarterly
5. Changes communicated

## Avoiding Anarchy and Bureaucracy

The radar enables informed choices without mandates. Teams can deviate with justification.
