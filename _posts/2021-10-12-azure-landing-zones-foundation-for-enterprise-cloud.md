---
layout: post
title: "Azure Landing Zones: Foundation for Enterprise Cloud"
date: 2021-10-12
tags: [azure, architecture, governance]
---

# Azure Landing Zones: The Foundation That Decides Everything

There's a pattern that plays out in enterprise Azure adoptions more often than anyone wants to admit. A team gets budget approval, spins up a few subscriptions, deploys some workloads, and six months later they're staring at a flat, unmanaged environment where nobody is sure who owns what, security findings are piling up, and onboarding a new workload takes two weeks of back-and-forth email threads.

The technical term for what went wrong is *lack of a landing zone*. The practical term is *a foundation built on sand*.

Azure landing zones exist specifically to prevent this. They are the architectural and operational foundation on which everything else in your cloud environment sits, identity, networking, governance, security, and the delivery pipelines that let your teams actually ship things. Getting them right up front changes the trajectory of a cloud program. Getting them wrong means you'll spend the next two years doing remediation work instead of building products.

This post is a technical but accessible walkthrough of what landing zones are, how Azure's management hierarchy makes them work, how to deploy and maintain them as code, and why they produce real, measurable business outcomes.

---

## First, the Azure Management Hierarchy

Before landing zones make sense, the Azure management object model needs to make sense. It is the skeleton on which everything hangs.

### Management Groups

Management groups sit at the top of the hierarchy. They are logical containers that group subscriptions together and allow you to apply policy, role assignments, and access controls at scale. You can nest management groups up to six levels deep beneath your root tenant management group.

The key thing to understand about management groups is that they are *inherited*. Any Azure Policy or role assignment applied at a management group level flows down automatically to every subscription and resource beneath it. This inheritance model is what makes large-scale governance feasible, instead of manually configuring hundreds of subscriptions, you configure the hierarchy once and let the platform do the enforcement.

A typical enterprise management group structure looks roughly like this:

```
Tenant Root Group
├── Platform
│   ├── Identity
│   ├── Management
│   └── Connectivity
└── Landing Zones
    ├── Corp (connected workloads)
    ├── Online (internet-facing workloads)
    └── Sandbox (developer experimentation)
```

This structure is not arbitrary. It maps to how governance needs actually differ across workloads, a connected corporate app has very different network and compliance requirements than a developer sandbox, and the hierarchy makes that distinction enforceable.

### Azure Policy

Azure Policy is the mechanism through which you enforce standards. Policies can audit resources for compliance, deny non-conformant deployments, or automatically remediate drift. When assigned at the management group level, they apply to every subscription beneath that group, without requiring any action from workload teams.

Policies come in a few flavors:

- **Audit**: Flags non-compliant resources but does not block deployment. Useful during initial rollout when you want visibility before enforcement.
- **Deny**: Blocks the deployment of non-compliant resources outright. Once your baseline is established, most controls should land here.
- **DeployIfNotExists / Modify**: Automatically remediates or configures resources to match the desired state. This is how you get things like automatic diagnostic setting deployment or tag enforcement without relying on teams to remember.

Policy initiatives (also called policy sets) group related policies together. The built-in regulatory compliance initiatives for standards like ISO 27001, PCI DSS, NIST 800-53, and SOC 2 are designed to be assigned at the management group level, giving you a baseline compliance posture across your entire environment from day one.

### Subscriptions

The subscription is the fundamental unit of scale and isolation in Azure. It is the billing boundary, the service limit boundary, and, when used correctly, the workload boundary.

Subscriptions should be used to separate application environments and to control and segregate environments across the software development lifecycle, such as development, testing, and production. This separation improves governance, reduces blast radius on incidents, and makes cost attribution clean.

The older model of putting everything in one or two subscriptions and using resource groups for isolation is still common, but it creates real problems at scale. Subscription service limits become constraints, policy exceptions become more frequent, and cost allocation gets messy. The modern approach, subscription democratization, treats subscriptions as lightweight, disposable units that workload teams request and own, while governance flows in from above through the management group hierarchy.

In practice this looks like each product or application team having their own subscription per environment (dev, staging, prod), with the platform team responsible for provisioning those subscriptions in a governed, consistent way through an automated process called *subscription vending* (more on this shortly).

### Resource Groups

Resource groups are the containers within subscriptions that hold the actual Azure resources, VMs, databases, storage accounts, networking components, and so on. They are the unit of lifecycle management: resources that live and die together go in the same resource group.

Resource groups should be thought of as functional, not organizational. Group by workload component and lifecycle, not by team or environment (the subscription handles environment separation). A well-structured resource group layout makes operational tasks, like deleting a decommissioned environment or running targeted policy remediations, straightforward rather than surgical.

---

## What Is an Azure Landing Zone, Actually?

With the management hierarchy established, a landing zone is the combination of governance, tooling, and pre-provisioned infrastructure that makes a subscription *ready to receive a workload*. An Azure landing zone is the standardized and recommended approach for all organizations utilizing Azure. It ensures consistency across your organization by aligning with key requirements for security, compliance, and operational efficiency through platform and application landing zones.

There are two distinct layers:

### Platform Landing Zone

The platform landing zone hosts the shared services that all other workloads depend on. This includes:

- **Identity**: Microsoft Entra ID (formerly Azure AD) tenants, managed identities, Privileged Identity Management (PIM), and RBAC foundations
- **Connectivity**: Hub virtual networks, Azure Firewall or Network Virtual Appliances (NVAs), ExpressRoute or VPN gateways for on-premises connectivity, DNS private resolvers, DDoS protection plans
- **Management**: Log Analytics workspaces, Azure Monitor configurations, Microsoft Defender for Cloud plans, update management, backup policies
- **Security**: Microsoft Sentinel deployment (recently moved to a dedicated security subscription), security baselines, vulnerability management

The platform landing zone is typically owned and operated by a central platform engineering or cloud operations team. Workloads do not deploy directly into it, they consume its services through peering, private DNS zones, and shared diagnostic pipelines.

### Application Landing Zones

Application landing zones are where workload teams actually build and deploy. The platform team generally deploys an empty subscription that's enrolled with all required governance. Then a workload architect designs a solution that works within the constraints of that application landing zone and takes advantage of shared platform features, like firewalls and cross-premises routing, when practical.

Each application landing zone inherits its governance posture from its parent management group, gets connected to the hub network automatically, and comes pre-configured with the RBAC assignments the workload team needs to operate within their own boundaries without needing platform team involvement for day-to-day work.

The result is a clean separation: the platform team owns the guard rails, the workload team owns everything inside them.

---

## The Eight Design Areas

Microsoft's Cloud Adoption Framework structures landing zone design across eight areas. These are not independent, decisions in one area constrain and influence decisions in others, which is why they should be worked through in sequence, not in parallel.

1. **Azure billing and Microsoft Entra tenant**: How your enterprise agreement and tenant structure map to your landing zone hierarchy
2. **Identity and access management**: Entra ID design, RBAC model, PIM policies, break-glass accounts
3. **Management group and subscription organization**: The hierarchy structure and subscription placement logic
4. **Network topology and connectivity**: Hub-and-spoke vs Virtual WAN, peering strategies, DNS design, hybrid connectivity
5. **Security**: Defender for Cloud plans, Sentinel placement, network segmentation, vulnerability management
6. **Management**: Logging, monitoring, alerting, backup, update management
7. **Governance**: Policy assignments, compliance frameworks, tagging strategy, cost management
8. **Platform automation and DevOps**: IaC tooling selection, pipeline design, subscription vending, change management

The sequencing matters. You should not design your network topology before you've settled your management group hierarchy, and you should not pick your IaC tooling before you understand the operational model your team can sustain.

---

## Infrastructure-as-Code: Why It's Non-Negotiable

Deploying a landing zone through the Azure portal is possible. Microsoft provides a portal-based accelerator that walks you through the configuration steps visually. But every serious implementation eventually runs into the same walls: drift, repeatability, scale, and auditability.

The IaC approach is recommended. Define the platform landing zone architecture as code to version control, automate deployments, and replicate environments. This approach standardizes platform landing zones with recommended best practices.

The two supported IaC paths are **Bicep** and **Terraform**, both delivered via Azure Verified Modules (AVM).

### Azure Verified Modules (AVM)

Azure Verified Modules provide reusable, customizable, and extensible building blocks to build a platform landing zone with Bicep or Terraform. These modules help deploy a platform landing zone that aligns with best practices. Using verified modules ensures architectural consistency and reduces the maintenance burden of custom code.

This is significant. Before AVM, teams writing landing zone IaC from scratch were either building modules they had to maintain indefinitely or adapting the Enterprise Scale reference implementation, which was comprehensive but opinionated in ways that required careful customization. AVM shifts the maintenance burden to Microsoft for the foundational modules, so your team writes the configuration and composition logic, not the primitive resource wrappers.

### The ALZ IaC Accelerator

The Azure Landing Zones IaC Accelerator provides an automated approach to deploy and manage the platform landing zone. It uses Bicep or Terraform based on Azure Verified Modules. This tool streamlines the setup of a continuous delivery environment and supports Azure DevOps and GitHub for version control systems, deployment pipelines, and runners.

The accelerator works through four phases:

1. **Phase 0: Planning**: Select your IaC language (Bicep or Terraform) and version control system
2. **Phase 1: Prerequisites**: Configure credentials and subscription prerequisites
3. **Phase 2: Bootstrap**: Run the PowerShell module to bootstrap both Azure and the VCS
4. **Phase 3: Run**: Customize the IaC code and trigger the CI/CD pipelines to deploy

The output is a working platform landing zone with a CI/CD pipeline already wired up, meaning day-two changes go through the same pipeline as day-one deployment. This is the right default.

### A Minimal Terraform Example

Here is the structure of a Terraform-based platform landing zone deployment using AVM modules:

```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }
}

provider "azurerm" {
  features {}
}

# Management Group hierarchy
module "management_groups" {
  source  = "Azure/avm-ptn-alz/azurerm"
  version = "~> 0.9"

  root_id   = "alz"
  root_name = "ALZ Root"
}

# Connectivity hub (hub-and-spoke)
module "connectivity" {
  source  = "Azure/avm-ptn-alz-connectivity-hub-and-spoke-vnet/azurerm"
  version = "~> 0.1"

  hub_virtual_networks = {
    primary = {
      name                            = "vnet-hub-prod-eastus"
      address_space                   = ["10.0.0.0/16"]
      location                        = "eastus"
      resource_group_name             = "rg-connectivity-hub"
      resource_group_creation_enabled = true
      resource_group_lock_enabled     = false

      mesh_peering_enabled = true
    }
  }
}
```

This is the composition layer. The modules themselves handle the resource-level details; your code handles how they fit together.

---

## Subscription Vending: Automation at the Workload Boundary

One of the most impactful, and frequently underbuilt, components of a landing zone is the subscription vending process. This is the automated pipeline through which workload teams request new application landing zone subscriptions and receive them pre-configured and governance-enrolled.

A common strategy for subscription vending is to create and configure the subscription programmatically by using IaC. You should use GitHub Actions or Azure DevOps Pipelines to orchestrate the automation.

In a mature implementation, the workflow looks like this:

1. A workload team submits a subscription request through a simple form or a pull request with a YAML/JSON parameter file
2. The platform automation creates a branch, populates the subscription parameter file, and opens a PR for platform team review
3. On merge, a deployment pipeline runs the IaC modules to create and configure the subscription: management group placement, RBAC assignments, tag enforcement, budget alerts, network attachment to the hub, Defender for Cloud enablement
4. The workload team receives a ready-to-use subscription, typically within minutes

Use one file per subscription request. The subscription is the unit of deployment in the subscription vending process, so each subscription request requires a dedicated subscription parameter file.

This matters beyond just convenience. Without subscription vending, the platform team becomes a bottleneck every time a workload team needs a new environment. With it, governance is enforced automatically, and the platform team's involvement is a PR review rather than a multi-day provisioning exercise.

---

## Developer Experience and Delivery Velocity

The business case for landing zones often gets framed around compliance and security, which are real benefits. But the operational velocity improvements are equally important and often more immediately visible.

### From Weeks to Hours

Before landing zones, standing up a new environment in Azure typically involves someone with elevated permissions manually configuring networking, policy exceptions, RBAC, monitoring agents, and alerting. That process takes days to weeks, especially in organizations with formal change management processes.

With a well-built landing zone and subscription vending, the same outcome is fully automated. A workload team can go from "we need a production subscription" to a fully enrolled, governance-compliant, hub-connected subscription in under an hour, without a single manual approval beyond the initial PR review.

Forrester's research on Azure PaaS modernization found organizations achieved 50% faster application delivery and avoided significant infrastructure costs over three years by retiring legacy platforms. IDC's Azure study highlighted a 46% boost in developer productivity and an 86% reduction in unplanned downtime.

### Consistent, Opinionated Defaults

One of the quieter benefits of landing zones is what they eliminate: decision fatigue. When every workload team has to make the same 30 infrastructure decisions from scratch, you get 30 different answers, 30 different networking patterns, and 30 different security configurations to audit. Landing zones encode those decisions once, at the platform level, and make them the default.

Workload teams still have meaningful choices, what compute services to use, how to structure their application, how to manage their data. They just do not have to re-derive the right answer to "how should we configure diagnostic settings" or "which subnets need NSGs" on every new project.

### Policy-Driven Guardrails vs. Manual Processes

Governance must be automated, not manual. Azure Policies enforce tagging rules such as CostCenter and Environment. Developers can deploy at speed, but compliance and cost tracking are guaranteed.

When compliance is enforced by policy rather than by checklist, developers do not have to think about it. A DeployIfNotExists policy for diagnostic settings means every new resource automatically gets logging configured. A Deny policy for public storage account access means that misconfiguration is impossible, not just discouraged. The compliance state becomes a property of the platform, not a function of how carefully each team follows documentation.

---

## Core Components in Practice

Here is a summary of the components that typically comprise a complete landing zone deployment, organized by concern:

### Identity and Access

- **Entra ID tenant configuration**: Conditional access policies, MFA enforcement, guest access restrictions
- **RBAC model**: Least-privilege role assignments at subscription and resource group scope, using built-in roles where possible
- **Privileged Identity Management**: Just-in-time access for privileged roles, with approval workflows and access reviews
- **Break-glass accounts**: Emergency access accounts that bypass MFA, with alerting on any use

### Networking

- **Hub virtual network**: Central network hosting shared services, firewall, DNS resolver, VPN/ExpressRoute gateways
- **Azure Firewall or NVA**: Centralized east-west and north-south traffic inspection
- **Private DNS zones**: Centrally managed private DNS for Azure PaaS services, ensuring name resolution works consistently across spoke networks
- **Spoke peering**: Automated VNet peering from application landing zone subscriptions to the hub, configured through the subscription vending process
- **DDoS protection**: Standard plan assigned at the hub VNet level

### Management and Monitoring

- **Log Analytics workspace**: Centralized log collection for the platform. Application teams may have their own workspaces, but platform-level telemetry should flow to a dedicated workspace
- **Azure Monitor baselines**: Alert rules for subscription-level activity, resource health events, and security signals
- **Defender for Cloud**: Standard/P2 plans enabled for all subscriptions, connected to a central security workspace
- **Microsoft Sentinel**: SIEM and SOAR, now typically deployed in a dedicated security subscription with data connectors for the entire tenant

### Governance

- **Management group policies**: Mandatory tagging, diagnostic settings, region restrictions, allowed resource types, network isolation requirements
- **Compliance initiatives**: Assigned at the landing zones management group, covering applicable regulatory frameworks
- **Cost management**: Budget alerts configured at subscription scope, cost allocation tags enforced by policy, anomaly detection enabled
- **Azure Advisor integration**: Governance recommendations surfaced to platform and workload teams

---

## Planning a Landing Zone: A Practical Sequence

The temptation in landing zone projects is to start with the tooling, pick Terraform or Bicep, pull the reference implementation, and start deploying. That approach tends to produce a platform that is technically complete but misaligned with how the organization actually needs to operate.

The decisions that should happen *before* any code is written:

**1. Define the management group hierarchy.** Draw it out explicitly. Map your business units, compliance requirements, and workload classification logic to the hierarchy. Decisions made here are hard to change after subscriptions are enrolled.

**2. Establish your network topology.** Hub-and-spoke works well for most organizations. Virtual WAN is the better choice when you have multiple regions and complex routing requirements, but it comes with higher cost and operational complexity. Make this call deliberately.

**3. Decide on DNS architecture.** Centralized private DNS zones managed by the platform team versus delegated zones managed by workload teams. The former is operationally simpler; the latter gives teams more autonomy. Most enterprises land on centralized.

**4. Define your RBAC model.** Who gets what level of access in the platform subscriptions? What role assignments flow through subscription vending? Build the access model before you start assigning permissions.

**5. Identify applicable compliance frameworks.** Which regulatory initiatives need to be assigned? Understanding this upfront determines which Deny policies you can deploy from day one versus which need an Audit phase first.

**6. Define your IaC operating model.** Who owns the landing zone code? How do changes get reviewed and deployed? What is the drift remediation process? A landing zone without a clear operating model will drift.

---

## Migration and Adoption: What Actually Goes Wrong

Landing zone adoption is almost never a greenfield deployment. Most organizations have existing Azure subscriptions with workloads that need to be transitioned into the new structure. That migration process has predictable failure modes.

### Policy Collision

When an existing workload subscription is moved under a management group with new Deny policies, deployments that previously worked will start failing. This is not a bug, it is the platform doing its job. But teams that are not prepared for it experience it as an outage.

The mitigation is a structured policy rollout: assign all new policies in Audit mode first, give teams visibility into their compliance state, and provide a remediation window before switching to Deny.

### State File Conflicts in Terraform

If you are importing existing resources into Terraform management as part of landing zone adoption, state file management becomes critical. Resources that were created manually in Azure have no state, and attempting to deploy Terraform configurations that cover them will result in conflicts or accidental destructive changes.

For Terraform implementations, use a dedicated state file for each application landing zone subscription. This approach improves the performance of plan and apply operations and reduces the blast radius of potential misconfigurations.

Import existing resources explicitly using `terraform import` before running `terraform apply` against any existing environments.

### Subscription Limit Friction

Creating subscriptions programmatically requires a commercial agreement (Enterprise Agreement, Microsoft Customer Agreement, or similar). Organizations on PAYG or developer agreements cannot automate subscription creation and need a manual workaround in their vending process. This is a common surprise that blocks the automation story until the commercial agreement is in place.

### Landing Zone "Thickness" Creep

Application landing zones have a habit of becoming a one-size-fits-all solution, a continually evolving software project that keeps adding new features. Ideally the landing zone implementation would be kept as thin as possible, provision the subscription, configure access to it, provide identities for deployments and other common scenarios, and provide network with basic configuration.

The practical risk here is that the platform team starts adding workload-specific configuration into the vending process to satisfy individual team requests. Over time, the landing zone template becomes bloated with edge cases, and the maintenance burden grows substantially. Keep the platform layer thin and opinionated; workload teams own everything inside their subscription boundary.

### Cultural Resistance

Platform constraints are sometimes experienced as bureaucracy, especially by engineering teams that were previously operating without governance. The response to "you cannot deploy a public storage account" is not always enthusiastic. The way to manage this is to make the landing zone's design rationale visible, explain why each constraint exists, what risk it mitigates, and what the process is for legitimate exceptions.

---

## Real Business Outcomes

The business case for landing zones is not primarily about the landing zone itself. It is about what becomes possible once a clean, governed, consistent foundation exists.

### Deployment Consistency and Audit Readiness

Organizations that go through SOC 2, ISO 27001, or PCI DSS audits with a well-configured landing zone find that audit preparation time drops significantly. Evidence collection for controls like access management, logging, and vulnerability remediation can be partially automated through Azure Policy compliance reports and Defender for Cloud findings. What used to be weeks of manual evidence gathering becomes a query.

### Cost Attribution and Waste Reduction

Without mandatory tagging enforced by policy, cost attribution in Azure devolves into a guessing game. With it, every resource carries the metadata that connects it to a team, workload, and cost center. Automated consistent assignment of tags to each subscription for cost management and reporting purposes provides greater functionality for cost analysis. Organizations that implement this consistently typically find 15–30% of cloud spend that was previously invisible to the business.

### Security Posture Improvement

A landing zone designed with these principles is your control plane for trust. It reduces attack surface, enforces least privilege, and provides the telemetry you need to detect and respond quickly. The combination of Defender for Cloud, centralized logging, Sentinel, and policy-enforced network segmentation creates a security posture that is qualitatively different from a manually managed environment, not because any individual component is novel, but because the enforcement is systematic rather than voluntary.

### Developer and Platform Team Productivity

The most measurable velocity improvement is in the new workload onboarding process. When the time to spin up a production-ready environment drops from two weeks to two hours, engineering teams change how they work. Proof-of-concept environments that would have been too costly to justify get built. Separate dev and staging environments become the default rather than the exception. Infrastructure experimentation becomes feasible.

Each application landing zone can be managed independently, allowing development teams to innovate and deploy changes without waiting for central approval or risking conflicts with other applications. This autonomy is crucial for teams that need to move fast and remain agile.

---

## Best Practices Worth Internalizing

**Treat the landing zone as a product, not a project.** It does not have a completion date. It evolves alongside Azure's capabilities, your organization's compliance requirements, and your workload portfolio. Build the operational model for continuous improvement from the start.

**Version everything.** Policy definitions, management group configurations, networking components, and subscription vending templates should all live in source control with proper branching and review workflows. Configuration drift is silent and expensive.

**Start with Audit, enforce with Deny.** Rolling out new policies in Deny mode in existing environments is a reliable way to break things and erode trust in the platform team. Give teams visibility and remediation time before enforcement kicks in.

**Use canary management groups.** Preferring AVM modules and the ALZ Accelerator for new work includes using canary environments to validate changes before rolling them to production management groups. A canary subscription in a canary management group lets you test policy and networking changes before they propagate to production workloads.

**Document Architecture Decision Records.** Landing zone design involves dozens of consequential choices. Write them down, what you decided, why, and what alternatives were rejected. Future platform engineers will inherit a system whose rationale is visible rather than tribal knowledge.

**Do not over-engineer the vending process early.** Get the basics working: subscription creation, management group placement, RBAC, network peering, policy enrollment. Add ITSM integrations and self-service portals after the core is stable and teams are using it.

**Keep the platform subscription count predictable.** The platform landing zone, identity, connectivity, management, security, should have a small, fixed number of subscriptions. The growth in subscription count happens in the application landing zone tier, not the platform tier.

---

## The Compounding Value

Landing zones are infrastructure that makes other infrastructure better. On their own, they are an operational investment with real but sometimes difficult-to-quantify value. Over time, the compounding effects become clear: onboarding new workloads gets faster, audit cycles get shorter, security findings get fewer, and the platform team spends less time firefighting and more time on capability development.

The repeatable infrastructure allows you to apply configurations and controls to every subscription consistently. Modules make it easy to deploy and modify specific Azure landing zone architecture components as your requirements evolve.

The organizations that invest in this foundation early tend to find that their cloud program scales cleanly. Those that skip it tend to find themselves doing expensive retroactive work, restructuring subscriptions, retrofitting policy, untangling networking, when it is much harder and much more disruptive than it would have been at the start.

Getting the foundation right is the work. Everything else is what you build on top of it.

---

*References: Microsoft Cloud Adoption Framework for Azure, Azure Architecture Center, Azure Landing Zones GitHub repository, and Azure Verified Modules project.*
