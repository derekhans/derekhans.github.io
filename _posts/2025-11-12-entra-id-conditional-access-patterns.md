---
layout: post
title: "Entra ID Conditional Access Patterns"
date: 2025-11-12
tags: [identity, azure, security]
---

Conditional Access is the policy engine in Microsoft Entra ID that decides whether a sign-in attempt or resource access request is allowed, blocked, or subject to additional controls. It is not a firewall, not a VPN, and not a catch-all solution for every security control, but when used correctly it is one of the most effective ways to enforce risk-aware access across cloud apps and identities.

## What Conditional Access Is

Conditional Access is a policy-based decision layer that evaluates signals during authentication and authorization, then applies enforcement actions.

At a high level, it is:
- An identity-centric access control system.
- A way to enforce adaptive, contextual controls based on sign-in risk, device state, location, user/group membership, and app sensitivity.
- A mechanism to require additional controls like multifactor authentication (MFA), device compliance, or session restrictions.

It operates after the initial credential check, using the data from the sign-in and the request context to decide whether to:
- allow access,
- require an additional step,
- block access,
- or apply a restricted session.

## What Conditional Access Does

Conditional Access gives you the ability to enforce access decisions in real time, based on the access context.

Key capabilities include:

- **Require MFA** when a user signs in from an unfamiliar location, high-risk device, or accessing a sensitive workload.
- **Block access** for sign-ins from unmanaged or non-compliant devices.
- **Require device compliance** or Hybrid Azure AD joined devices for specific applications.
- **Apply app protection** policies for cloud apps when the device is not fully managed.
- **Enforce session controls** such as limited browser sessions, blocking download/print, or requiring reauthentication.
- **Throttle access** by requiring a stronger signal only when risk or app sensitivity justifies it.

Conditional Access is effective because it can combine multiple signals into a single decision:
- User and group membership
- Device compliance state
- Location and named locations
- Application being accessed
- Client platform and browser
- Sign-in risk and user risk
- Authentication strength and MFA state

## What Conditional Access Doesn't Do

Conditional Access is powerful, but it has boundaries. It is not a substitute for other security controls.

What it does not do:

- It is not a network firewall. It does not control network traffic or packet-level routing.
- It is not a full endpoint management solution. It can require a device be compliant or hybrid joined, but it does not itself deploy antivirus or patch systems.
- It is not a full application authorization engine. It controls access at the identity and session boundary, not inside application business logic.
- It does not replace Azure AD entitlement management, PIM, or least-privilege role assignments. It supplements access decisions rather than defining who has what permanent permission.
- It is not a replacement for zero-trust segmentation or micro-segmentation on the network.
- It does not decrypt encrypted traffic or inspect payloads; it only evaluates the authentication/authz context available to Entra ID.
- It is not retroactive. It applies only to new authentication/access events once the policy is in scope.

## How Conditional Access Works

A Conditional Access policy is made of three parts:

1. **Assignments**
   - Users and groups: who the policy targets
   - Cloud apps or actions: what application or identity action is covered
   - Conditions: signals used to evaluate the request

2. **Conditions**
   - Location: trusted IPs, country/region, named locations
   - Device platform: Windows, iOS, Android, macOS
   - Client apps: browser, mobile apps, desktop clients
   - Device state: compliant, hybrid Azure AD joined
   - Sign-in risk / user risk
   - Authentication strength

3. **Access controls**
   - Grant controls: require MFA, compliant device, hybrid Azure AD joined, approved client app, password change
   - Session controls: sign-in frequency, persistent browser session, application enforced restrictions, limited access sessions

When a user signs in, Entra ID evaluates all applicable policies and chooses the strictest applicable controls. If one policy blocks access and another requires MFA, the block wins. This is why policy design must be deliberate.

## Common Conditional Access Patterns

### 1. Baseline MFA protection

- Target: all users
- Conditions: all cloud apps
- Controls: require multifactor authentication
- Purpose: ensure every interactive sign-in is protected by MFA unless a stronger exception exists

### 2. Trusted device path

- Target: privileged admins or sensitive workloads
- Conditions: all cloud apps or high-value apps
- Controls: require hybrid Azure AD joined or compliant device
- Purpose: ensure access to critical resources only occurs from managed devices

### 3. Block legacy auth

- Target: all users
- Conditions: legacy authentication clients
- Controls: block access
- Purpose: eliminate protocols that can't support modern MFA or risk signals

### 4. Access from risky sign-ins

- Target: all users
- Conditions: sign-in risk high or medium
- Controls: require MFA or block access
- Purpose: respond to potentially compromised credentials with stronger verification or deny access outright

### 5. Sensitive app segmentation

- Target: subsets of users/groups
- Conditions: sensitive SaaS app or custom enterprise app
- Controls: require compliant device, approved client app, or limited browser session
- Purpose: treat business-critical applications with stricter access controls than general productivity apps

### 6. External contractor access

- Target: guest users or external identities
- Conditions: all cloud apps
- Controls: require MFA, block if not coming from a managed browser, restrict session length
- Purpose: reduce risk for third-party access while still enabling collaboration

### 7. Location-based exceptions

- Target: all users or specific groups
- Conditions: trusted IP ranges
- Controls: allow access without MFA or require device compliance
- Purpose: give a safer path from corporate network while preserving security for remote access

## Best Practices for Conditional Access

### Start with a small scope and test

- Build policies in report-only mode or target a limited pilot group first.
- Validate impacts before broad rollout.
- Avoid "all users, all apps" policies until behavior is understood.

### Use the least-permissive effective control

- Prefer targeted controls to broad blocks.
- Example: require compliant devices for finance apps, rather than blocking access entirely.

### Combine signals, but keep complexity manageable

- High-risk + unmanaged device = block or require MFA.
- Too many overlapping conditions can create unexpected behavior and troubleshooting headaches.

### Protect administrator workloads separately

- Treat global admins, Exchange admins, SharePoint admins, and security admins as distinct policy targets.
- Require both MFA and compliant/hybrid joined devices for privileged accounts.

### Enforce modern authentication and block legacy auth

- Legacy auth is a top vector for password replay and MFA bypass.
- Block legacy clients globally rather than relying on app exceptions.

### Use named locations carefully

- Trusted networks should be explicit and narrow.
- Don't overuse "trusted locations" as a blanket allowlist; they should reflect controlled corporate infrastructure only.

### Tie device posture to access

- Conditional Access is more effective when integrated with Intune or another MDM/endpoint compliance source.
- Require `device compliant` or `hybrid Azure AD joined` where appropriate, especially for high-risk applications.

### Respect policy precedence and conflict handling

- Remember that block controls override grant controls.
- Keep a documented policy matrix so you can reason about which policy applies in any scenario.

### Monitor and iterate

- Use sign-in logs and Conditional Access insights to discover blocked or challenged sign-ins.
- Update policies when app usage changes, new cloud apps are onboarded, or new threat techniques emerge.

### Use session controls for sensitive data workflows

- For browser-based sensitive apps, enforce `application enforced restrictions` or `tenant restrictions` where available.
- Use `sign-in frequency` and `persistent browser session` to reduce session lifetime for high-risk scenarios.

## Practical Advice

- For most organizations, the first useful policy is "everyone, all cloud apps, require MFA." Then layer the next policy around privileged roles and sensitive apps.
- Layer the next policy based on risk of the application being accessed. "High" risk applications have a more restrictive base policy, "Low" have less. Then add specific requirements to each application beyond the base risk policy.
- Avoid policies that rely solely on location; IP addresses can be spoofed or bypassed using VPNs.
- Use `report-only` mode to detect unintended consequences before activating a policy.
- Tag policies and keep naming consistent: e.g. `CA - Block Legacy Auth`, `CA - Require MFA for All`, `CA - Sensitive Apps - Compliant Devices`.

## Conclusion

Entra ID Conditional Access is not a silver bullet, but it is a core control for enforcing modern, context-aware access decisions. It does a good job at evaluating who is signing in, from where, on what device, and to what app. It does not replace endpoint management, network segmentation, or application authorization, but when combined with those controls it closes a large gap in cloud identity security.

A practical deployment pattern is:
1. protect all interactive sign-ins with MFA,
2. block legacy auth,
3. enforce device posture for sensitive apps,
4. isolate administrative access,
5. iterate with logs and report-only mode.

That approach gives you a secure, sustainable Conditional Access posture without creating brittle access failures for users.
