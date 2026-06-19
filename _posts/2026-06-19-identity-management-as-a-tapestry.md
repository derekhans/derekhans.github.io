---
layout: post
title: "Identity Management as a Tapestry"
date: 2026-06-19
tags: [identity, entra, security, governance]
---

Identity is the primary attack surface for modern enterprise security. In 2025, roughly 90% of incident response investigations found identity weaknesses, and 65% of initial access began with compromised credentials rather than a vulnerability in code or infrastructure. The network perimeter organizations spent decades building no longer defines what attackers try to cross. Identity does.

That context matters for how to think about identity management, because the typical framing of a platform to buy, a product to configure, a checkbox on an audit list does not match how identity actually behaves in practice. It is not one thing. It is a woven system of directories, authentication, authorization, lifecycle management, privileged access, governance, non-human identity, and detection. If one thread is weak, the rest feel it.

The right model is not a stack. It is a tapestry.

## Why the Tapestry Metaphor Matters

Identity programs fail in a specific way. Each capability gets treated as a separate initiative, owned by a separate team, with no one accountable for how the pieces connect.

One team configures single sign-on. Another adds multi-factor authentication. A third manages privileged roles through a separate process with separate tooling. Application owners create local accounts because the shared path moves too slowly. The security team finds the gaps after an incident or an audit.

What that produces is a collection of partial answers, not a coherent program.

The tapestry model shifts the question from what controls are in place to how the controls reinforce each other:

- The directory provides a source of truth for users, groups, devices, applications, and traditionally non-human identities.
- Authentication proves who or what is signing in.
- Authorization decides what that identity can do after it authenticates.
- Conditional Access shapes the sign-in decision based on risk and context.
- Privileged Identity Management removes standing access to high-impact roles.
- Governance drives access reviews, entitlement management, and lifecycle processes.
- Non-human identity management extends those same controls to workloads, service accounts, and APIs.
- Detection and response closes the loop on whether the controls are actually working.

The goal is not to make each thread perfect in isolation. It is to make the weave strong enough that one weak pattern does not unravel the rest.

## The Core Threads

### Directory and Application Registration

In Microsoft Entra, the directory is the anchor point for all identity objects. Users, groups, devices, service principals, and application registrations share a single control plane.

That matters because modern identity is not only about people. Applications authenticate to other applications. Workloads need identities. External collaborators need scoped access. Devices become part of the trust decision. If those objects are managed separately, the enterprise loses the ability to reason about access end to end.

App registrations define what an application is. Service principals define how it behaves in a tenant. Together, they give you a manageable boundary for delegated permissions, application permissions, and token issuance. Without that structure, every integration becomes a special case.

Entra works best in this model because of it's flexibility and integration with traditional directory methods. Active Directory is 25+ years old, entrenched in the enterprise, and very difficult to remove from that space. Entra allows this with the Entra AD DS service, creating a connection point for legacy services. It's power is that it synchronizes from Entra, not to Entra. Entra is the authoritive source, AD DS is simply its extension.

### Authentication

Authentication is the first visible thread in the weave. Entra ID handles it through OAuth 2.0 and OpenID Connect, backed by policies that define how users and workloads prove their identity.

The practical value is not just that users can sign in. It is that sign-in becomes policy-driven. Passwordless methods reduce dependence on secrets that people reuse or store carelessly. Multi-factor authentication raises the bar for compromise significantly, so much so that modern MFA is assessed to prevent more than 99% of identity-based attacks. Device state, location, and risk all influence the sign-in decision. Continuous Access Evaluation can revoke trust faster than token lifetimes would otherwise allow.

Strong authentication is the floor, not the ceiling. A rigorous sign-in ceremony does not help if the application hands out excessive permissions after the fact.

### Authorization

Authorization is where many identity programs lose discipline. Teams often think access decisions happen at login, but the real work happens after the token is issued.

The cleaner model is layered: the identity provider controls coarse access through app roles, scopes, and group membership; resource owners control fine-grained access inside the application; privileged access workflows control who can elevate into administrative roles.

This division keeps the platform from becoming either too rigid or too permissive. Identity defines the boundary. Applications still enforce their own business logic.

### Privileged Access

Privileged access is one of the most important threads because it is the one attackers target first. Compromising an administrator account is worth more to an attacker than a dozen user accounts.

Microsoft Entra Privileged Identity Management changes the default posture from permanent privilege to just-in-time access. Admin roles that were always active become eligible. Eligibility requires an activation step that is time-bound, optionally approval-gated, and fully auditable. That single shift reduces the blast radius of a compromised account and gives operations teams a defensible exception process that does not rely on leaving permanent doors open.

PIM holds only when the operating model supports it. Day-to-day user accounts need to be separated from administrative accounts. Activation requires pairing with role review and approval rules for roles that carry meaningful risk. The control does not maintain itself.

### Governance and Lifecycle

Governance is the thread organizations underestimate most consistently. They configure sign-in and privilege controls, then treat access lifecycle as a cleanup task rather than a continuous process.

Access drifts because the organization moves faster than manual processes can keep up. Projects close, people change roles, contractors wrap up engagements, and temporary access becomes permanent because no one owns the remediation. Over time, the directory becomes a record of where people were, not where they are.

Entra ID Governance addresses this through entitlement management, access packages, access reviews, and lifecycle workflows. Those capabilities answer three questions the rest of the identity stack cannot: who should have access, how long should they keep it, and who verifies the decision still makes sense. If no one is answering those questions on a defined schedule, the rest of the identity program is operating on an increasingly inaccurate foundation.

### Non-Human Identity

This is the thread most identity programs are missing, and it is where some of the most consequential exposure lives.

Non-human identities (service accounts, workload identities, API keys, OAuth client credentials, managed identities) now outnumber human users by roughly 10 to 1 in cloud-native organizations. Most operate without owners, without lifecycle processes, and without any of the governance that human identities receive.

OWASP's 2025 Top 10 Non-Human Identity Risks ranked improper offboarding as the primary vulnerability. The pattern is predictable: a service account gets provisioned for a project, the project ends, and the account persists with broad permissions and a long-lived credential because no one owns the decommissioning. An attacker who reaches that credential can move laterally through the environment without triggering a single MFA alert, because the controls were designed for human sign-ins. Machine identities are already the primary source of privilege misuse in cloud environments.

The fix requires treating non-human identities with the same rigor as human ones: managed identities where the platform supports it, short-lived credentials over long-lived tokens, explicit ownership assigned to every service account, and lifecycle processes that deprovision when the workload retires. Microsoft Entra workload identity federation provides a path to eliminate long-lived secrets for many cloud-to-cloud authentication patterns entirely.

This is a problem solved with foundation and discipline now, rather than later. As AI use cases grow, the proliferation of agents, LLM use cases, and assistant-like tooling will grow non-human identity usage exponentially.

### External Identity

Most enterprises are not purely internal organizations anymore. Partners, contractors, suppliers, and customers all need access. Identity has to handle external users without turning them into second-class citizens with informal access or overprivileged internal accounts with no cleanup path.

Microsoft Entra External ID handles that boundary. The design question is not whether external users exist but whether they are managed with the same rigor as employees. Shared accounts, email-based exceptions, and guest invitations with no review cycle are not a partner access strategy. A proper external identity model provides separation, traceability, and a clear path to deprovision when the relationship ends.

### Device Trust and Context

Identity does not stop at the user object. Device posture and sign-in context are part of the access decision.

Conditional Access uses signals like compliant device state, location, and risk level to shape what access is granted and under what conditions. This is where identity becomes contextual rather than binary. A finance user on a managed laptop inside a corporate network carries a different risk profile than the same user on an unmanaged device from an unfamiliar location. The policy should reflect that difference. If it does not, strong authentication is doing half the work it could.

### Detection and Response

Detection closes the loop. Controls that are never verified are controls that may not be working.

Traditional monitoring takes the form of sign-in logs, audit logs, activity reports and do a great job of telling you what happened. Identity Threat Detection and Response (ITDR) goes further by analyzing identity-layer behavior for signals that bypass other defenses: impossible travel, token theft, pass-the-hash, abnormal role activation patterns, service account access at unusual hours. In 90% of incident investigations, identity weaknesses play a role. Detection limited to endpoint telemetry will miss the identity-layer activity that preceded the incident.

ITDR, paired with Entra ID Protection and Sentinel integration, gives security teams visibility into the identity plane to react to threats immediately, instead of doing a post-mortem on a major incident.

## How the Pieces Fit Together

The best identity programs assign clear roles to each capability and let the strengths compound.

Entra ID defines identity objects and serves as the source of truth. Conditional Access establishes the conditions under which trust is granted. PIM controls privileged elevation. Governance determines whether access should exist at all and whether it should continue. Non-human identity management applies lifecycle and least privilege to workloads. Detection surfaces threats that bypass preventive controls.

None of these capabilities is sufficient on its own. Conditional Access without governance creates better login friction but does not address access that was improperly granted in the first place. Governance without PIM leaves permanent admin roles running. Authentication without application-level authorization still overexposes data. Detection without prevention is forensics. Prevention without detection is blind trust.

| Capability | Primary Job | Typical Entra Component |
|---|---|---|
| Identity source | Store users, groups, devices, apps, workloads | Microsoft Entra ID |
| Authentication | Prove identity at sign-in | MFA, passwordless, OIDC, OAuth 2.0 |
| Context-based access | Shape the access decision based on risk | Conditional Access, Identity Protection |
| Privileged access | Remove standing admin privilege | Privileged Identity Management |
| Access lifecycle | Grant, review, and remove access | Entra ID Governance |
| Non-human identity | Extend controls to workloads and service accounts | Workload identity federation, managed identities |
| External users | Extend access to partners and customers | External ID |
| Detection and response | Detect and investigate identity-layer threats | ITDR, Identity Protection, sign-in logs |

## Common Failure Modes

Most identity programs fail in predictable ways.

They invest in sign-in controls and ignore access lifecycle. They implement MFA and leave shared admin accounts intact. They enable SSO and let every application invent its own authorization model. They stand up governance tooling and never assign owners to the access reviews. They build strong employee policies and run partner access through informal channels.

They provision hundreds of service accounts and API keys with no inventory, no ownership, and no deprovision process — then treat the resulting credential sprawl as a workload management problem rather than an identity risk.

The pattern is the same in every case. One thread gets attention, and the rest are assumed to take care of themselves. Spoiler: They do not.

## The Operating Model

Identity architecture is only half the job. The operating model determines whether it holds when the organization is moving fast or under pressure.

Clear ownership is required for directory hygiene, application onboarding, privileged role assignment, access review completion, exception handling, and incident response for account compromise. If those responsibilities are ambiguous, the architecture drifts.

Policy has to define when exceptions are allowed and who approves them. When the answer is always "just make it work," the tapestry unravels. Good identity practice is disciplined rather than heroic. Requests route through defined channels, access is time-bound by default, reviews run on schedule, privilege is temporary, and logs are searchable. Nothing depends on memory or individual knowledge.

## A Practical Starting Point

Sequence usually matters more than tool selection. The dependency chain is real. Governance without a clean directory produces noise. Conditional Access without solid authentication has nothing meaningful to build on.

Start with a directory and application inventory. You cannot govern what you have not catalogued. Establish authentication standards including MFA and passwordless where practical. Put Conditional Access in place early so trust decisions are contextual from the beginning. Remove standing privilege with PIM and separate administrative workflows from daily use. Build governance into the lifecycle with access reviews and entitlement management. Extend the same model to non-human identities, external users, and any applications still bypassing the platform.

That sequence is not universal. It creates coherent progress rather than a collection of disconnected controls, overall confusion, and a clear direction of incremental progress.

## Wrapping Up

Identity management holds when the pieces reinforce each other. Directory, authentication, authorization, privileged access, governance, non-human identity, external access, device trust, and detection are all part of the same fabric. A gap in one thread becomes an incident in another.

The organizations that build durable identity programs treat identity as an operating discipline with clear ownership, continuous review, and a model for how the pieces connect. Identity is not a product purchase with a configuration checklist at the end. It's a practice of discipline, enforcement, and utilization of the capabilities to create a strong, dependable tapestry.
