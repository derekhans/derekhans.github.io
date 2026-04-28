---
layout: post
title: "Security Operations in the Cloud Era"
date: 2024-06-20
tags: [security, operations, azure]
---

Traditional security operations don't translate directly to cloud. The speed of change, the API-driven nature, and the shared responsibility model require new approaches.

## Cloud-Native SIEM

Azure Sentinel (now Microsoft Sentinel) collects logs from everywhere:

```kusto
SecurityEvent
| where EventID == 4625
| summarize FailedLogins = count() by TargetAccount
| where FailedLogins > 10
```

## Detection as Code

Version control your detection rules:

```yaml
name: Suspicious Azure AD Sign-in
query: |
  SigninLogs
  | where ResultType == 50074
  | where Location != "US"
severity: Medium
tactics:
  - InitialAccess
```

## Automation and SOAR

Automate response to common scenarios:

1. Alert triggers
2. Playbook executes
3. Context gathered
4. Containment applied
5. Ticket created

## Cloud Forensics

When incidents happen:

- Preserve logs before retention expires
- Snapshot affected resources
- Document timeline
- Coordinate with cloud provider if needed
