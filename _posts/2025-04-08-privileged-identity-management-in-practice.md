---
layout: post
title: "Privileged Identity Management in Practice"
date: 2025-04-08
tags: [identity, security, governance]
---

Privileged access is the crown jewel for attackers. If someone compromises admin credentials, whether through phishing, malware, or insider threat, the entire system is compromised.

Yet privileged identity management (PIM) remains one of the least mature and most resisted capabilities in most organizations. Teams delay it, work around it, or deploy it in ways that create friction without real security benefit.

This deep dive covers what PIM actually is, how it relates to broader Privileged Access Management (PAM) and secrets management, why the space has stagnated, and how to implement it in an organization that is starting from zero.

## The Privileged Access Landscape

To understand PIM, you need to understand the broader context of privileged access.

### Privileged Identity Management (PIM)

PIM is about **who has access** and **when**. It answers:

- Which identities (users, service accounts) have elevated roles?
- When are those roles active?
- How is activation requested and approved?
- What actions did they take while privileged?

PIM is typically a cloud identity platform feature (like Azure AD Privileged Identity Management) and operates at the identity layer.

### Privileged Access Management (PAM)

PAM is the broader discipline of managing all forms of privileged access: human admins, service accounts, API keys, SSH keys, database credentials, and application secrets.

PAM includes:

- **Identity vaulting**: credential storage and rotation
- **Session recording**: recording what privileged users did
- **Approval workflows**: enforcing review of access requests
- **Secret rotation**: automatically cycling credentials
- **Audit and compliance**: tracking access for regulatory reporting

PAM is an organizational capability, not just a software product.

### Secrets Management

Secrets management is the operational practice of handling non-human credentials: API keys, database passwords, SSH keys, certificates. It overlaps with PAM but is often operated separately.

Good secrets management means:

- secrets are never committed to code
- secrets are stored encrypted at rest
- rotation is automated
- access to secrets is audited
- only authorized applications can retrieve secrets

### Why these three are related

In a mature organization, PIM, PAM, and secrets management work together:

- PIM governs when humans can access systems and with what role.
- PAM ensures that service accounts and shared credentials are managed, rotated, and audited.
- Secrets management keeps non-human credentials secure and out of code repositories.

In most organizations, these are implemented as separate initiatives by different teams, and gaps emerge.

## Why PAM Has Fallen Behind

The PAM space is mature but stagnant. Most organizations are still using tooling and practices from 2010-2015, and innovation has slowed.

### The reasons PAM is stuck:

**1. It's not glamorous**

New security teams want to solve shiny problems: zero trust, SIEM, threat hunting. PAM feels like plumbing. It works, but no one gets excited about it.

**2. PAM was built for different era**

Traditional PAM solutions were designed for physical data centers with a stable set of admin accounts. They assumed sessions, persistence, and human users sitting at terminals.

Cloud, ephemeral infrastructure, and CI/CD pipelines broke these assumptions. Modern PAM needs to handle:

- dynamic service accounts
- short-lived credentials
- just-in-time privilege elevation
- API-based access
- automated provisioning and deprovisioning

Most traditional PAM vendors have struggled to adapt.

**3. There's a false choice between security and developer velocity**

Teams see PIM and PAM as obstacles to agility. They perceive it as:

- "Now I have to wait for approval to deploy to production"
- "We can't use shared credentials anymore"
- "Every secret needs to be rotated"

This perception is partly valid. Bad PAM implementation can slow delivery. But good PAM is invisible, it provides security without friction.

**4. Compliance-driven adoption is inertia**

Most PAM projects are driven by compliance requirements (SOC 2, ISO 27001, PCI-DSS). When compliance is the driver, you get the minimum viable implementation that passes an audit, not the best operational practice.

Once the audit is passed, there's no internal momentum to improve the system.

**5. The industry has fragmented**

Twenty years ago, a company could buy one PAM solution and get everything. Today, you need identity (Azure AD, Okta), secrets management (Vault, Conjur), cloud access governance (Cloudentity, Decipher), service account management (tools that do not exist yet), and session recording.

The fragmentation has left most organizations confused about what to buy and how it fits together.

## Why PIM and PAM Matter Now

Three changes make PIM and PAM urgent:

### 1. Cloud services are identity-first

In a data center, an attacker had to get to a physical machine. In Azure, AWS, or GCP, an attacker just needs credentials. The blast radius of compromised admin credentials is immediate and global.

### 2. Insider threat is real

Cloud systems are accessed remotely by distributed teams. A compromised or disgruntled team member can do serious damage without physical access to a data center. PIM provides an audit trail.

### 3. Compliance is tightening

SOC 2, FedRAMP, PCI-DSS, and industry-specific regulations all demand proof of privileged access governance. "We trust our team" is no longer a defensible answer.

## PIM Architecture and Concepts

### Standing access vs. eligible access

Most organizations start with **standing access**: admins have permanent elevated roles.

This is the enemy. An attacker who steals an admin credential gets permanent access.

PIM flips this model to **eligible access**: admins are marked as eligible for a role but do not have it by default. To access a privileged operation, they must activate the role for a limited time.

### Activation workflow

The typical PIM flow looks like this:

1. Admin needs to perform a privileged operation
2. Admin requests role activation in PIM portal
3. Admin provides justification (business reason)
4. Approval rule is checked:
   - Some roles approve automatically
   - Others require manager approval
   - Critical roles may require multi-person approval
5. If approved, admin must complete MFA
6. Role is activated for a limited duration (usually 1-8 hours)
7. All actions taken while privileged are logged with audit context
8. Role automatically expires

### Approval strategies

Different roles need different approval strategies:

- **Self-approve**: temporary roles for troubleshooting (approve without review, but log heavily)
- **Manager-approve**: standard roles (requires manager sign-off)
- **Multi-approve**: critical roles like subscription owner (requires multiple approvers)
- **Time-restricted**: some roles only activatable during business hours

### Scope and granularity

PIM can be applied at different scopes:

- **Directory roles** (Azure AD Global Admin, User Administrator)
- **Resource roles** (Subscription Contributor, Resource Group Owner)
- **Application roles** (custom RBAC in applications)

The more granular, the better. If you can make someone an Owner of one resource group instead of an Owner of the entire subscription, privilege is reduced.

### Permanent eligible vs. time-bound

In a mature PIM implementation:

- admins do not have standing access
- admins are marked as eligible for roles
- eligibility itself can be time-bound (expires after X months, requiring re-justification)

This reduces the blast radius of forgotten, stale access.

## Implementing PIM as a New Function

Organizations that are starting from zero with PIM often make mistakes. Here's how to do it right.

### 1. Start by understanding current state

Before building PIM, audit:

- Which identities have standing admin access today?
- How long has that access been there?
- When was it last used?
- What was the business justification for standing access?

Use Azure AD Privileged Identity Management's access reviews to generate this data.

### 2. Define a role model

Decide what roles you need and what they do.

Common roles include:

- **Subscription Owner**: rare, high-risk, requires multi-factor approval
- **Resource Group Contributor**: common, for DevOps teams managing their workloads
- **Key Vault Administrator**: sensitive, manage encryption keys and secrets
- **Identity Administrator**: high-risk, can create users and bypass MFA
- **Security Reader**: read-only audit and compliance role

Too many roles create compliance chaos. Too few roles force excessive privileged access.

### 3. Establish approval governance

Define who can approve what. This should be:

- clear in writing
- different for different risk levels
- technically enforced in PIM settings

Example governance:

- Subscription Owner activation requires finance director + security lead approval
- Resource Group Contributor activation auto-approves after 10 minutes
- Key Vault Administrator requires security team approval

### 4. Implement in phases

Phase one: **awareness**

Make high-privilege roles PIM-eligible but still allow standing access. Users activate roles through PIM but can also fall back to standing assignments. This is a training phase.

Phase two: **enforcement**

Remove standing assignments. All access must go through activation. Monitor activation volume and approval times to ensure the process is not bottlenecking delivery.

Phase three: **optimization**

Fine-tune approval rules, reduce activation duration, and consolidate role definitions based on real usage patterns.

### 5. Use access reviews as a governance engine

PIM's access review feature is powerful. Set it to run quarterly:

- Ask managers to review who has eligibility for each role
- Track who was removed due to role changes or departure
- Use review data to inform compliance audits

Access reviews are how you prevent role creep.

### 6. Provide self-service workflows

The best way to ensure PIM is used correctly is to make it frictionless.

Provide:

- **CLI support** so activation can be scripted in CI/CD when needed
- **Slack/Teams integration** so approval notifications go where admins already work
- **Approval history** so people understand why access was denied
- **Quick documentation** for common activation scenarios

If PIM is clunky, people will find workarounds.

## Secrets Management as Part of PIM Strategy

PIM manages human privileged access. But modern systems also need to manage service account credentials and API keys.

### The credential lifecycle

Credentials follow a lifecycle:

1. **Generate**: create a new secret
2. **Store**: keep it encrypted, out of code
3. **Distribute**: give it to the application that needs it
4. **Audit**: log who accessed it
5. **Rotate**: periodically create a new secret
6. **Retire**: decommission old credentials

Bad practice: hardcode credentials in code or pass them as environment variables.

Good practice: use a secrets vault and rotate on a schedule.

### Azure Key Vault for secrets management

In Azure, Key Vault is the primary secrets vault. Applications retrieve secrets at runtime through Azure authentication.

Example flow:

```yaml
Application needs API key to call external service

1. Application uses Managed Identity to authenticate to Key Vault
2. Application requests secret from Key Vault by name
3. Key Vault checks identity has permission
4. Key Vault returns the secret
5. Application uses secret for one API call
6. Application does not cache the secret
```

This beats hardcoding because:

- the secret never appears in code or logs
- the secret can be rotated without redeploying
- access is audited

### Handling service account credentials

Service accounts (non-human identities) should also follow PIM principles:

- they should have the minimum required access
- access should be reviewed periodically
- credentials should be rotated
- credentials should never be shared across services

In Azure, use managed identities instead of shared credentials. In other platforms, use time-bound tokens or SSH keys instead of long-lived passwords.

## Best Practices for PIM Implementation

### 1. Separate human and machine identities

Humans use PIM activation. Machines use service accounts or managed identities with time-bound tokens.

Do not try to apply PIM directly to service accounts; it creates the wrong incentives.

### 2. Make justification meaningful

When someone activates a privileged role, require them to state why. Do not make it a form field they ignore.

Example good justification: "Investigating customer support ticket #12345 - resource group scaling issue"

Example bad justification: "Work"

### 3. Audit is more important than approval

Some organizations get stuck trying to define perfect approval rules. In reality, most PIM value comes from having an audit trail of who accessed what and when.

Start with broad approval rules (or even auto-approve for some roles). Tighten based on observed usage patterns.

### 4. Implement time-bound eligibility

An admin eligible for a role forever is almost as risky as standing access. Set expiration on eligibility.

Every 12 months, users must re-request role eligibility with current justification. This forces a periodic review.

### 5. Use PIM for everything, not just Azure

PIM in Azure AD is powerful, but do not stop there. Extend the principle to:

- SSH key management
- Database credentials
- API keys
- Custom application roles

Use Azure Key Vault, HashiCorp Vault, or cloud-native secrets management to extend the practice.

### 6. Automate the boring parts

Use Azure Logic Apps or similar tools to auto-approve low-risk activations and send notifications. Use Azure Functions to auto-rotate credentials.

### 7. Educate around the why

The biggest risk to PIM is that people see it as a compliance checkbox, not a security improvement. Take time to explain:

- why standing access is risky
- how PIM reduces the blast radius
- what the approval rules actually prevent

## Common Pitfalls and How to Avoid Them

### Pitfall: Requiring approval for everything

If every activation requires manager approval, PIM becomes a denial-of-service against your own team. Approvers get overwhelmed and either approve everything without thinking or become a bottleneck to production.

Instead, use a risk-based approach. Auto-approve routine activations. Require approval only for high-risk roles or off-hours access.

### Pitfall: Using PIM only for compliance

If your only goal is "pass the audit," you will implement PIM in a way that is useless operationally. Compliance and security happen as byproducts of good operational practices.

Instead, implement PIM to actually reduce risk. Make it part of your incident response playbook. Use activation data to understand who really needs access.

### Pitfall: Long activation durations

If you activate a role for 8 hours, attackers only need to compromise you for 8 hours. Longer activation durations feel more convenient but are actually more risky.

Keep activation durations short: 1 hour for routine work, up to 4 hours for large operations. Admins can request extension if needed.

### Pitfall: No audit or enforcement

If PIM is just a permission check with no audit trail, it is useless. Ensure:

- all activation attempts are logged (approved and denied)
- all actions taken while privileged are tracked
- denied activations have a reason
- audit logs are immutable

## Remediating When Starting from Scratch

If your organization has no PIM today, here's how to start without chaos.

### Week 1-2: Discovery and governance

1. Audit current privileged access using Azure AD reports
2. Identify which accounts have high-privilege roles
3. Document the business justification for each
4. Define your initial role model and approval rules
5. Get leadership buy-in on the approach

### Week 3-4: Pilot rollout

1. Pick one small team (5-10 people) as early adopters
2. Make their roles PIM-eligible
3. Keep standing access as a fallback
4. Train them on activation workflow
5. Gather feedback for 2 weeks

### Week 5-8: Broader rollout

1. Expand to more teams based on pilot feedback
2. Gradually tighten approval rules based on observed patterns
3. Start regular access reviews
4. Create runbooks for common activation scenarios

### Month 3+: Hardening

1. Remove standing access for most roles (keep fallback for emergencies)
2. Implement time-bound eligibility
3. Integrate PIM into incident response procedures
4. Extend to service accounts and secrets management

### Risk mitigation during transition

During rollout, you will have a period where some access is PIM-managed and some is not. Risk increases temporarily because attackers may target the non-PIM access.

Mitigate by:

- monitoring non-PIM accounts heavily
- documenting why specific roles are not yet PIM-managed
- setting hard deadlines for full migration
- using conditional access policies to require MFA for high-risk operations

## Wrap It Up

Privileged identity management is not flashy, but it is foundational. An attacker who compromises admin credentials can bypass every other security control you have built.

PIM reduces the blast radius by ensuring admin access is temporary, audited, and justified. Combined with secrets management and service account governance, it forms the core of privileged access management.

The space is mature but stagnant because it is not exciting. But that is exactly why you should tackle it now. When your organization has PIM dialed in, you are not fighting fires during incidents. You have an audit trail. You know who did what and when. Compliance is straightforward.

Start by understanding your current privileged access landscape. Define a clear role model and approval strategy. Implement in phases, starting small. Extend beyond human identities to service accounts and credentials.

When PIM is working well, you forget it is there. Access happens when it needs to. It is audited. It expires. The system is harder to break into. And your security team spends less time explaining privilege to auditors and more time on things that actually matter.
