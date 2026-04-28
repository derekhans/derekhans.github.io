---
layout: post
title: "Securing the Software Supply Chain"
date: 2021-08-16
tags: [security, devops, architecture]
---

The software supply chain is under attack. SolarWinds, Log4j, and countless npm package compromises have shown that your security is only as strong as your dependencies.

## The Attack Surface

- Source code repositories
- Build systems
- Package registries
- Container registries
- Deployment pipelines

## SBOM: Software Bill of Materials

Know what's in your software:

```json
{
  "bomFormat": "CycloneDX",
  "components": [
    {
      "name": "lodash",
      "version": "4.17.21",
      "type": "library"
    }
  ]
}
```

## Dependency Scanning

Automate vulnerability detection:

```yaml
- task: dependency-check
  inputs:
    scanPath: '$(Build.SourcesDirectory)'
    failOnCVSS: 7
```

## Signed Commits and Builds

Verify provenance at every step:

- GPG-signed commits
- Signed container images
- Attestations for builds

## Supply Chain Levels for Software Artifacts (SLSA)

A framework for supply chain integrity. Aim for SLSA Level 3 for critical software.
