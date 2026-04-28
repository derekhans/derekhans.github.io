import fs from "fs";
import path from "path";

const postsDir = "_posts";

// Ensure posts directory exists
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

interface PostTemplate {
  title: string;
  tags: string[];
  content: string;
}

// Topics by category
const posts: Record<string, PostTemplate[]> = {
  azure: [
    {
      title: "Getting Started with Azure Resource Manager",
      tags: ["azure", "cloud", "infrastructure"],
      content: `Azure Resource Manager (ARM) represents a fundamental shift in how we deploy and manage cloud infrastructure. Unlike the classic deployment model, ARM provides a consistent management layer for all Azure resources.

## Why ARM Matters

The declarative approach of ARM templates enables infrastructure as code from day one. You describe what you want, not how to get there.

\`\`\`json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": []
}
\`\`\`

## Key Benefits

- **Declarative syntax** - Define the desired state
- **Idempotent deployments** - Run the same template multiple times safely
- **Dependency management** - ARM handles resource ordering
- **Role-based access control** - Fine-grained permissions

The move to ARM is essential for any organization serious about cloud governance.`
    },
    {
      title: "Azure Landing Zones: Foundation for Enterprise Cloud",
      tags: ["azure", "architecture", "governance"],
      content: `Azure Landing Zones provide a prescriptive architecture for enterprise-scale cloud adoption. After years of helping organizations migrate to Azure, I've seen the difference a solid foundation makes.

## The Landing Zone Concept

A landing zone is a pre-configured environment with:

- Identity and access management
- Network topology and connectivity
- Security and compliance policies
- Management and monitoring
- Platform automation

## Architecture Decisions

The enterprise-scale architecture addresses critical concerns:

\`\`\`
Management Group Hierarchy
├── Root
│   ├── Platform
│   │   ├── Identity
│   │   ├── Management
│   │   └── Connectivity
│   └── Landing Zones
│       ├── Corp
│       └── Online
\`\`\`

Start with the end in mind. Retrofitting governance is always harder than building it in from the start.`
    },
    {
      title: "Azure Arc: Extending Cloud Management Everywhere",
      tags: ["azure", "hybrid-cloud", "kubernetes"],
      content: `Azure Arc represents Microsoft's vision for hybrid and multi-cloud management. It extends Azure's control plane to resources running anywhere—on-premises, edge, or other clouds.

## What Arc Enables

With Arc, you can:

- Manage servers across environments from Azure
- Deploy Azure data services anywhere
- Run Azure application services on Kubernetes
- Apply Azure Policy to non-Azure resources

## Arc-enabled Kubernetes

\`\`\`bash
az connectedk8s connect --name my-cluster --resource-group my-rg
\`\`\`

Once connected, you can deploy applications using GitOps, apply policies, and monitor from Azure.

## The Hybrid Reality

Most enterprises won't be 100% cloud for years. Arc acknowledges this reality and provides a path forward without forcing a complete migration.`
    },
    {
      title: "Cost Optimization Strategies for Azure",
      tags: ["azure", "finops", "cloud"],
      content: `Cloud costs can spiral quickly without proper governance. After reviewing dozens of Azure environments, I've identified patterns that consistently reduce spend by 30-40%.

## Reserved Instances

For predictable workloads, reserved instances offer significant savings:

| Commitment | Savings |
|------------|---------|
| 1 Year     | ~30%    |
| 3 Year     | ~50%    |

## Right-sizing

Most VMs are over-provisioned. Use Azure Advisor recommendations and actual metrics:

\`\`\`kusto
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| summarize avg(CounterValue) by Computer, bin(TimeGenerated, 1h)
\`\`\`

## Auto-shutdown

Development environments don't need to run 24/7. Implement auto-shutdown policies and save 65% on non-production costs.

## Tags and Accountability

You can't optimize what you can't measure. Implement a tagging strategy that assigns costs to business owners.`
    },
    {
      title: "Azure Policy: Governance at Scale",
      tags: ["azure", "governance", "compliance"],
      content: `Azure Policy is the backbone of cloud governance. It enables you to enforce organizational standards and assess compliance at scale.

## Policy vs. RBAC

Policy controls what resources can do. RBAC controls who can do what to resources. Both are essential.

## Built-in Initiatives

Azure provides policy initiatives for common compliance frameworks:

- CIS Benchmarks
- NIST 800-53
- ISO 27001
- PCI DSS

## Custom Policies

When built-in policies aren't enough:

\`\`\`json
{
  "if": {
    "allOf": [
      { "field": "type", "equals": "Microsoft.Storage/storageAccounts" },
      { "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly", "notEquals": true }
    ]
  },
  "then": { "effect": "deny" }
}
\`\`\`

## Remediation

Policy isn't just about prevention. Remediation tasks can automatically fix non-compliant resources, bringing your environment into compliance without manual intervention.`
    },
    {
      title: "Migrating to Azure: Lessons from the Trenches",
      tags: ["azure", "migration", "architecture"],
      content: `Cloud migration is rarely as simple as "lift and shift." After leading multiple enterprise migrations, here are the lessons that matter.

## Assessment First

Before moving anything, understand what you have:

- Application dependencies
- Data gravity
- Compliance requirements
- Performance baselines

## The 6 Rs of Migration

1. **Rehost** - Lift and shift
2. **Replatform** - Lift and optimize
3. **Refactor** - Re-architect
4. **Repurchase** - Move to SaaS
5. **Retire** - Decommission
6. **Retain** - Keep on-premises

## Migration Waves

Don't try to migrate everything at once. Group applications into waves based on complexity and dependencies.

## The Human Factor

Technical migration is the easy part. Change management, training, and organizational alignment determine success or failure.`
    },
  ],
  platformEngineering: [
    {
      title: "Platform Engineering: Beyond DevOps",
      tags: ["platform-engineering", "devops", "developer-experience"],
      content: `Platform engineering has emerged as the natural evolution of DevOps. Instead of expecting every team to build their own toolchains, we create internal developer platforms (IDPs).

## The Problem with DIY DevOps

When every team builds their own CI/CD pipelines, deployment scripts, and monitoring, you get:

- Inconsistent practices
- Duplicated effort
- Security gaps
- Cognitive overload

## Internal Developer Platforms

An IDP provides golden paths—pre-built, supported ways to accomplish common tasks:

\`\`\`yaml
apiVersion: platform.company.io/v1
kind: Application
metadata:
  name: my-service
spec:
  language: node
  environment: production
  scaling:
    min: 2
    max: 10
\`\`\`

## The Platform Team

Platform engineering requires dedicated investment. Treat the platform as a product, with product management, user research, and continuous improvement.`
    },
    {
      title: "Building Developer Portals with Backstage",
      tags: ["platform-engineering", "backstage", "developer-experience"],
      content: `Backstage, originally developed at Spotify, has become the de facto standard for building developer portals. It solves the discovery problem—how do developers find and understand services?

## The Service Catalog

At its core, Backstage provides a service catalog:

\`\`\`yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payment-service
  description: Handles payment processing
spec:
  type: service
  owner: payments-team
  lifecycle: production
\`\`\`

## Software Templates

Scaffolding new projects consistently:

- Choose a template
- Fill in parameters
- Get a working project with CI/CD, monitoring, and documentation

## TechDocs

Documentation lives with code and renders in Backstage. No more hunting for outdated wikis.

## Plugin Ecosystem

Backstage's plugin architecture lets you integrate anything—cloud providers, monitoring tools, security scanners.`
    },
    {
      title: "Golden Paths: Reducing Cognitive Load",
      tags: ["platform-engineering", "developer-experience", "architecture"],
      content: `The concept of golden paths is central to platform engineering. A golden path is the supported, recommended way to accomplish a task—not the only way, but the easiest way.

## Why Golden Paths Work

Developers face decision fatigue. Every project involves dozens of choices:

- Which CI system?
- What deployment target?
- How to handle secrets?
- What monitoring stack?

Golden paths eliminate these decisions for common cases.

## Principles of Good Golden Paths

1. **Opinionated but not rigid** - Provide escape hatches
2. **Documented thoroughly** - Make the path discoverable
3. **Maintained actively** - Update dependencies, fix bugs
4. **Measured continuously** - Track adoption and satisfaction

## Example: New Service Path

\`\`\`
1. Run: platform create service
2. Answer prompts
3. Get: repo, pipeline, deployment, monitoring
4. Time: 15 minutes
\`\`\`

Compare this to the hours or days of setup without a golden path.`
    },
    {
      title: "Infrastructure as Code Maturity Model",
      tags: ["platform-engineering", "infrastructure", "devops"],
      content: `Infrastructure as code (IaC) adoption happens in stages. Understanding where you are helps plan where to go next.

## Level 1: Scripts

Bash scripts and manual runbooks. Better than clicking in consoles, but fragile and hard to maintain.

## Level 2: Configuration Management

Tools like Ansible or Chef. Idempotent, but still focused on configuration rather than infrastructure.

## Level 3: Declarative IaC

Terraform, ARM templates, CloudFormation. Declare desired state, let the tool figure out how to get there.

\`\`\`hcl
resource "azurerm_resource_group" "example" {
  name     = "example-resources"
  location = "eastus"
}
\`\`\`

## Level 4: Platform Abstraction

Higher-level constructs that hide cloud complexity:

\`\`\`typescript
new ApplicationStack(this, 'MyApp', {
  runtime: Runtime.NODE_18,
  scaling: { min: 2, max: 10 }
});
\`\`\`

## Level 5: Self-Service

Developers request infrastructure through APIs or portals. Platforms provision automatically within guardrails.`
    },
    {
      title: "Platform as a Product: Lessons Learned",
      tags: ["platform-engineering", "product-management", "leadership"],
      content: `Treating your internal platform as a product changes everything. It means thinking about adoption, not mandates. User experience, not just functionality.

## Product Thinking for Platforms

- **Users** - Your developers are customers
- **Roadmap** - Prioritize based on user value
- **Feedback** - Regular surveys, interviews, metrics
- **Marketing** - Yes, internal marketing matters

## Measuring Success

Track metrics that matter:

| Metric | Target |
|--------|--------|
| Time to first deployment | < 1 day |
| Developer satisfaction (NPS) | > 40 |
| Platform adoption rate | > 80% |
| Incident rate on platform | Decreasing |

## The Adoption Curve

Early adopters will use anything new. The early majority needs proof. Laggards need mandates—but mandates without value breed resentment.

## Investment Levels

Plan for ongoing investment. A platform isn't a project—it's a product that needs continuous development.`
    },
  ],
  identity: [
    {
      title: "Zero Trust: Identity as the New Perimeter",
      tags: ["identity", "security", "zero-trust"],
      content: `The traditional network perimeter is dead. With cloud services, remote work, and mobile devices, there's no inside or outside to protect. Zero Trust starts from a simple principle: never trust, always verify.

## Core Tenets

1. **Verify explicitly** - Authenticate and authorize every request
2. **Least privilege access** - Just enough permissions, just in time
3. **Assume breach** - Design systems assuming attackers are inside

## Identity as the Control Plane

In Zero Trust, identity becomes the primary control plane:

\`\`\`
Request → Identity Verification → Device Health → Location Risk → Access Decision
\`\`\`

## Implementation Steps

Start with the crown jewels:

1. Inventory critical assets
2. Map access patterns
3. Implement strong authentication
4. Add conditional access policies
5. Monitor and adapt

Zero Trust is a journey, not a destination.`
    },
    {
      title: "Azure AD Conditional Access Patterns",
      tags: ["identity", "azure", "security"],
      content: `Conditional Access is the policy engine at the heart of Azure AD security. It evaluates signals and enforces access decisions in real-time.

## Signal Types

Conditional Access considers:

- User and group membership
- Device state and compliance
- Application sensitivity
- Location and IP reputation
- Real-time risk detection

## Common Patterns

**Require MFA for admins:**

\`\`\`
IF: User is in Admin role
THEN: Require MFA
\`\`\`

**Block legacy authentication:**

\`\`\`
IF: Client app is legacy
THEN: Block
\`\`\`

**Require compliant device for sensitive apps:**

\`\`\`
IF: App is in "Sensitive Apps" group
THEN: Require compliant device
\`\`\`

## Named Locations

Define trusted networks:

\`\`\`json
{
  "displayName": "Corporate Network",
  "ipRanges": [
    { "cidrAddress": "203.0.113.0/24" }
  ],
  "isTrusted": true
}
\`\`\`

## Testing Policies

Always use report-only mode before enforcing. Review sign-in logs to understand impact.`
    },
    {
      title: "Passwordless Authentication: The Path Forward",
      tags: ["identity", "security", "authentication"],
      content: `Passwords are the weakest link in security. They're phishable, reusable, and hard to manage. Passwordless authentication eliminates these problems.

## Methods

**Windows Hello for Business:**
- Biometric or PIN tied to device
- Private key never leaves the device
- Resistant to phishing

**FIDO2 Security Keys:**
- Hardware-based authentication
- Works across platforms
- Portable between devices

**Microsoft Authenticator:**
- Phone-based authentication
- Number matching for phishing resistance
- Convenient for users

## Deployment Strategy

Don't go cold turkey. Phase the rollout:

1. Enable passwordless methods alongside passwords
2. Encourage adoption with education
3. Measure usage and satisfaction
4. Set dates for password deprecation
5. Enforce passwordless for new accounts

## The User Experience

Passwordless is actually easier. No passwords to remember, no password resets, no credential stuffing.`
    },
    {
      title: "Privileged Identity Management in Practice",
      tags: ["identity", "azure", "governance"],
      content: `Standing admin access is dangerous. Privileged Identity Management (PIM) enforces just-in-time access for administrative roles.

## The Problem with Standing Access

Permanent admin rights mean:

- Larger attack surface
- No audit trail for why access was needed
- Difficult compliance reporting
- Risk of accidental damage

## PIM Concepts

**Eligible Assignments:**
User can activate the role when needed

**Active Assignments:**
User has the role right now

**Time-Bound Access:**
Access expires automatically

## Activation Workflow

\`\`\`
1. User requests role activation
2. Justification required
3. Approval (optional)
4. MFA verification
5. Role activated for limited time
6. Actions logged with justification
7. Role automatically expires
\`\`\`

## Access Reviews

Regular reviews ensure access remains appropriate. PIM automates the review process and tracks remediation.`
    },
    {
      title: "External Identity Strategies with Azure AD B2C",
      tags: ["identity", "azure", "architecture"],
      content: `Azure AD B2C handles customer-facing identity scenarios. It's a separate service from Azure AD, designed for high-scale consumer authentication.

## Use Cases

- Customer portals
- E-commerce sites
- Mobile applications
- Partner access

## User Flows vs. Custom Policies

**User Flows:**
Pre-built, configurable experiences for common scenarios

**Custom Policies:**
XML-based policies for complex requirements

\`\`\`xml
<TechnicalProfile Id="SelfAsserted-ProfileUpdate">
  <DisplayName>Profile Update</DisplayName>
  <Protocol Name="Proprietary" />
  <Metadata>
    <Item Key="ContentDefinitionReferenceId">api.selfasserted.profileupdate</Item>
  </Metadata>
</TechnicalProfile>
\`\`\`

## Social Identity Providers

B2C supports federation with:

- Google
- Facebook
- Apple
- Any OIDC provider

## Customization

Full control over the user interface. Inject your own HTML, CSS, and JavaScript for a branded experience.`
    },
  ],
  ai: [
    {
      title: "Machine Learning in Production: Lessons Learned",
      tags: ["ai", "machine-learning", "architecture"],
      content: `Training a model is the easy part. Putting it into production and keeping it there is where the real work begins.

## The MLOps Challenge

Production ML requires:

- Reproducible training pipelines
- Model versioning and lineage
- Automated retraining
- Monitoring for drift
- A/B testing capabilities

## Serving Patterns

**Batch Inference:**
Process large datasets periodically

**Real-time Inference:**
Low-latency predictions for user requests

**Edge Inference:**
Run models on devices

## Monitoring Model Health

\`\`\`python
# Track prediction distribution
def monitor_predictions(predictions):
    wandb.log({
        "prediction_mean": predictions.mean(),
        "prediction_std": predictions.std(),
        "drift_score": calculate_drift(predictions)
    })
\`\`\`

## Model Governance

Who approved this model? What data was it trained on? When was it last validated? These questions need answers before production deployment.`
    },
    {
      title: "Azure OpenAI: Enterprise AI Integration",
      tags: ["ai", "azure", "architecture"],
      content: `Azure OpenAI Service brings GPT models into the enterprise with Azure's security, compliance, and reliability guarantees.

## Why Azure OpenAI

- Data stays in your Azure tenant
- Enterprise SLAs and support
- Integration with Azure services
- Compliance certifications

## Getting Started

\`\`\`python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_KEY"],
    api_version="2024-02-15-preview",
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"]
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
\`\`\`

## Responsible AI

Azure OpenAI includes content filtering:

- Hate speech detection
- Self-harm prevention
- Violence filtering
- Sexual content blocking

## Cost Management

Token usage adds up. Implement caching, prompt optimization, and usage quotas to control costs.`
    },
    {
      title: "Retrieval Augmented Generation Patterns",
      tags: ["ai", "architecture", "search"],
      content: `RAG combines the power of large language models with your organization's knowledge. Instead of relying solely on what the model learned during training, RAG retrieves relevant context at query time.

## The RAG Pipeline

\`\`\`
Query → Embed → Search → Retrieve → Augment Prompt → Generate
\`\`\`

## Chunking Strategies

How you split documents matters:

- **Fixed size** - Simple but may break context
- **Semantic** - Split on meaning boundaries
- **Hierarchical** - Parent-child chunks for context

## Vector Databases

Store embeddings for fast similarity search:

- Azure AI Search
- Pinecone
- Weaviate
- Chroma

## Prompt Engineering for RAG

\`\`\`
Given the following context, answer the question.
If the answer isn't in the context, say "I don't know."

Context:
{retrieved_documents}

Question: {user_query}
\`\`\`

## Evaluation

Measure retrieval quality and generation accuracy separately. Poor retrieval means irrelevant context. Poor generation means misusing good context.`
    },
    {
      title: "AI Agents: Beyond Simple Chatbots",
      tags: ["ai", "architecture", "agents"],
      content: `AI agents take action on behalf of users. Unlike simple chatbots that only generate text, agents can call functions, access APIs, and orchestrate complex workflows.

## Agent Architecture

\`\`\`
User Request → LLM Planning → Tool Selection → Execution → Observation → Next Step
\`\`\`

## Tool Calling

Define tools the agent can use:

\`\`\`python
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_database",
            "description": "Search the customer database",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                }
            }
        }
    }
]
\`\`\`

## ReAct Pattern

Reasoning and Acting in a loop:

1. **Thought** - What should I do?
2. **Action** - Call a tool
3. **Observation** - See the result
4. **Repeat** - Until task complete

## Guardrails

Agents need boundaries:

- Maximum iterations
- Allowed actions whitelist
- Human-in-the-loop for sensitive operations
- Output validation`
    },
    {
      title: "Building AI-Powered Applications Responsibly",
      tags: ["ai", "ethics", "architecture"],
      content: `AI capabilities come with responsibilities. Deploying AI in production requires thinking beyond accuracy to consider fairness, transparency, and safety.

## Responsible AI Principles

1. **Fairness** - Don't discriminate
2. **Reliability** - Work consistently
3. **Privacy** - Protect data
4. **Inclusiveness** - Work for everyone
5. **Transparency** - Explain decisions
6. **Accountability** - Have human oversight

## Bias Detection

\`\`\`python
from fairlearn.metrics import MetricFrame

mf = MetricFrame(
    metrics=accuracy_score,
    y_true=y_test,
    y_pred=predictions,
    sensitive_features=demographics
)
print(mf.by_group)
\`\`\`

## Explainability

Users deserve explanations:

- Why was this content recommended?
- Why was this application denied?
- What factors influenced this score?

## Red Teaming

Before deployment, actively try to break your AI:

- Prompt injection attacks
- Jailbreaking attempts
- Edge cases and adversarial inputs

Find the problems before your users do.`
    },
    {
      title: "The Enterprise AI Strategy Playbook",
      tags: ["ai", "strategy", "leadership"],
      content: `Every organization wants AI, but few have a coherent strategy. Here's a framework for moving from experiments to enterprise-scale AI.

## Assess Readiness

Before AI, you need:

- Clean, accessible data
- Cloud infrastructure
- Technical talent
- Executive sponsorship

## Identify Use Cases

Prioritize by:

| Factor | Weight |
|--------|--------|
| Business value | High |
| Technical feasibility | Medium |
| Data availability | High |
| Risk level | Medium |

## Build vs. Buy

Not everything needs custom AI:

- **Buy** - Commodity capabilities (transcription, translation)
- **Build** - Competitive differentiators
- **Partner** - Complex solutions requiring expertise

## Governance Framework

AI governance isn't optional:

- Model inventory
- Risk assessment
- Approval workflows
- Monitoring requirements
- Incident response

## Change Management

Technology is the easy part. Helping people adapt to working with AI is the real challenge.`
    },
  ],
  security: [
    {
      title: "Cloud Security Posture Management",
      tags: ["security", "cloud", "governance"],
      content: `CSPM tools continuously monitor cloud environments for misconfigurations and compliance violations. In a world where a single misconfigured storage account can expose millions of records, CSPM is essential.

## What CSPM Monitors

- Storage accounts with public access
- Databases without encryption
- VMs with public IPs
- Missing network security groups
- Unencrypted traffic

## Microsoft Defender for Cloud

Azure's built-in CSPM:

\`\`\`
Secure Score: 76%

High Severity Findings:
- 3 storage accounts allow public access
- 5 VMs missing endpoint protection
- 2 SQL servers without auditing
\`\`\`

## Remediation Automation

Don't just alert—fix:

\`\`\`powershell
# Auto-remediate public storage
$account | Set-AzStorageAccount -AllowBlobPublicAccess $false
\`\`\`

## Continuous Compliance

CSPM maps findings to compliance frameworks, showing exactly where you stand against CIS, NIST, or PCI requirements.`
    },
    {
      title: "Securing the Software Supply Chain",
      tags: ["security", "devops", "architecture"],
      content: `The software supply chain is under attack. SolarWinds, Log4j, and countless npm package compromises have shown that your security is only as strong as your dependencies.

## The Attack Surface

- Source code repositories
- Build systems
- Package registries
- Container registries
- Deployment pipelines

## SBOM: Software Bill of Materials

Know what's in your software:

\`\`\`json
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
\`\`\`

## Dependency Scanning

Automate vulnerability detection:

\`\`\`yaml
- task: dependency-check
  inputs:
    scanPath: '$(Build.SourcesDirectory)'
    failOnCVSS: 7
\`\`\`

## Signed Commits and Builds

Verify provenance at every step:

- GPG-signed commits
- Signed container images
- Attestations for builds

## Supply Chain Levels for Software Artifacts (SLSA)

A framework for supply chain integrity. Aim for SLSA Level 3 for critical software.`
    },
    {
      title: "Threat Modeling for Cloud Architectures",
      tags: ["security", "architecture", "cloud"],
      content: `Threat modeling identifies security issues before they become vulnerabilities. For cloud architectures, the attack surface is different but the methodology remains valuable.

## STRIDE Framework

- **Spoofing** - Pretending to be someone else
- **Tampering** - Modifying data or code
- **Repudiation** - Denying actions
- **Information Disclosure** - Exposing data
- **Denial of Service** - Preventing access
- **Elevation of Privilege** - Gaining unauthorized access

## Cloud-Specific Threats

Consider:

- Cross-tenant attacks
- Metadata service exploitation
- Storage misconfigurations
- Network segmentation failures
- Identity federation weaknesses

## Data Flow Diagrams

Map your architecture:

\`\`\`
[User] → [CDN] → [App Gateway] → [App Service] → [Database]
                        ↓
                 [Key Vault]
\`\`\`

## Trust Boundaries

Every boundary crossing needs security controls. Don't assume cloud provider boundaries are sufficient.

## Prioritization

Not all threats are equal. Use risk scoring:

Risk = Likelihood × Impact

Focus on high-risk items first.`
    },
    {
      title: "Security Operations in the Cloud Era",
      tags: ["security", "operations", "azure"],
      content: `Traditional security operations don't translate directly to cloud. The speed of change, the API-driven nature, and the shared responsibility model require new approaches.

## Cloud-Native SIEM

Azure Sentinel (now Microsoft Sentinel) collects logs from everywhere:

\`\`\`kusto
SecurityEvent
| where EventID == 4625
| summarize FailedLogins = count() by TargetAccount
| where FailedLogins > 10
\`\`\`

## Detection as Code

Version control your detection rules:

\`\`\`yaml
name: Suspicious Azure AD Sign-in
query: |
  SigninLogs
  | where ResultType == 50074
  | where Location != "US"
severity: Medium
tactics:
  - InitialAccess
\`\`\`

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
- Coordinate with cloud provider if needed`
    },
    {
      title: "API Security Best Practices",
      tags: ["security", "api", "architecture"],
      content: `APIs are the backbone of modern applications—and a prime target for attackers. The OWASP API Security Top 10 provides a framework for thinking about API risks.

## Authentication and Authorization

Always verify:

\`\`\`
Authorization: Bearer <token>
\`\`\`

Validate tokens properly:

- Check signature
- Verify expiration
- Confirm audience
- Check scopes

## Rate Limiting

Prevent abuse:

\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
\`\`\`

## Input Validation

Never trust input:

\`\`\`python
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    email: str
    age: int

    @validator('age')
    def age_must_be_positive(cls, v):
        if v < 0 or v > 150:
            raise ValueError('Invalid age')
        return v
\`\`\`

## API Gateway Security

Centralize security controls:

- Authentication
- Rate limiting
- Request validation
- Logging
- WAF integration

## Monitoring

Track anomalies:

- Unusual request volumes
- New client IPs
- Error rate spikes
- Slow response times`
    },
  ],
  architect: [
    {
      title: "The Enterprise Architect's Role in Cloud Transformation",
      tags: ["architecture", "leadership", "cloud"],
      content: `Enterprise architects are uniquely positioned to guide cloud transformation. We see across silos, understand business context, and can connect technology decisions to business outcomes.

## From Gatekeeper to Enabler

The old model: Review every design, approve or reject.

The new model: Define guardrails, provide guidance, enable teams.

## Architecture Principles for Cloud

1. Design for failure
2. Prefer managed services
3. Automate everything
4. Measure and iterate
5. Security by design

## Reference Architectures

Create reusable patterns:

- Web application tier
- Data platform
- Integration patterns
- Security baselines

## Governance Without Bureaucracy

Balance control with agility:

- Automated policy enforcement
- Self-service within guardrails
- Exception processes that don't block innovation

## Measuring Success

Architecture success metrics:

| Metric | Meaning |
|--------|---------|
| Time to production | Agility |
| Security incidents | Risk |
| Cloud spend efficiency | Value |
| Developer satisfaction | Adoption |`
    },
    {
      title: "Architecture Decision Records",
      tags: ["architecture", "documentation", "practices"],
      content: `Architecture Decision Records (ADRs) capture the why behind technical decisions. When future teams ask "why did we choose X?", ADRs provide the answer.

## ADR Structure

\`\`\`markdown
# ADR 001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need a relational database for our customer data.
Options considered: PostgreSQL, MySQL, SQL Server.

## Decision
We will use PostgreSQL.

## Consequences
- Need PostgreSQL expertise
- Can use advanced features like JSONB
- Open source, no licensing costs
\`\`\`

## When to Write ADRs

Write an ADR when:

- Choosing between alternatives
- Making irreversible decisions
- Setting precedents for future work
- Deviating from standards

## ADR Lifecycle

1. **Proposed** - Under discussion
2. **Accepted** - Decision made
3. **Deprecated** - No longer applies
4. **Superseded** - Replaced by another ADR

## Discovery

Store ADRs with code. Make them searchable. Link to them from design documents.`
    },
    {
      title: "Designing for Resilience",
      tags: ["architecture", "reliability", "cloud"],
      content: `Systems will fail. The question is whether failures cascade into outages or are contained and recovered automatically.

## Failure Modes

Design for:

- Network partitions
- Service unavailability
- Data corruption
- Capacity exhaustion
- Configuration errors

## Patterns for Resilience

**Circuit Breaker:**
Stop calling failing services

\`\`\`python
@circuit_breaker(failure_threshold=5, recovery_timeout=30)
def call_service():
    return requests.get(url)
\`\`\`

**Bulkhead:**
Isolate failures to prevent cascade

**Retry with Backoff:**
Handle transient failures

\`\`\`python
@retry(wait=wait_exponential(multiplier=1, max=60))
def flaky_operation():
    return do_something()
\`\`\`

## Chaos Engineering

Intentionally inject failures:

- Kill random instances
- Add network latency
- Fill disks
- Exhaust memory

Find weaknesses before they find you.

## Game Days

Practice incident response. Run through scenarios. Build muscle memory for high-stress situations.`
    },
    {
      title: "Technical Debt: A Strategic Perspective",
      tags: ["architecture", "leadership", "strategy"],
      content: `Technical debt is inevitable. The question isn't whether to incur it, but how to manage it strategically.

## Types of Technical Debt

**Deliberate:**
We know this is suboptimal, but we're shipping anyway.

**Accidental:**
We didn't know there was a better way.

**Bit Rot:**
The world changed, our code didn't.

## Quantifying Debt

Make debt visible:

\`\`\`
Component: Payment Service
Debt Items:
- Hardcoded config (2 hours to fix, Medium risk)
- No retry logic (4 hours to fix, High risk)
- Legacy ORM (40 hours to fix, Low risk)

Total: 46 hours estimated effort
\`\`\`

## Paying Down Debt

Strategies that work:

- Dedicate capacity (e.g., 20% of sprints)
- Boy Scout rule (leave code better than you found it)
- Refactor during feature work
- Targeted debt sprints

## When to Accept Debt

Debt isn't always bad:

- Time-to-market pressure
- Uncertain requirements
- Learning opportunities
- Temporary solutions

The key is conscious choice with planned repayment.`
    },
    {
      title: "Building a Technology Radar",
      tags: ["architecture", "strategy", "practices"],
      content: `A technology radar provides a structured way to evaluate and communicate technology choices. Inspired by ThoughtWorks, it helps organizations make consistent decisions.

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

The radar enables informed choices without mandates. Teams can deviate with justification.`
    },
    {
      title: "Stakeholder Communication for Architects",
      tags: ["architecture", "leadership", "communication"],
      content: `Technical brilliance means nothing if you can't communicate it. Architects must translate between technical and business domains.

## Know Your Audience

**Executives:**
- Business outcomes
- Risk and investment
- Strategic alignment
- 5-minute summary

**Product Managers:**
- Capabilities and timelines
- Trade-offs
- Dependencies
- User impact

**Engineers:**
- Technical details
- Rationale
- Implementation guidance
- Constraints

## Visualization Techniques

A picture is worth a thousand words:

\`\`\`
C4 Model Levels:
1. Context - System and users
2. Containers - Applications and data stores
3. Components - Internal structure
4. Code - Implementation details
\`\`\`

## Influencing Without Authority

Architects rarely have direct authority. Influence through:

- Building relationships
- Demonstrating competence
- Providing value
- Finding common ground
- Respecting expertise

## Writing That Works

- Lead with the conclusion
- Use active voice
- Keep sentences short
- Include visuals
- Edit ruthlessly`
    },
  ],
};

// Generate dates from 2018 to 2026
function generateDates(): Date[] {
  const dates: Date[] = [];
  const startYear = 2018;
  const endYear = 2026;
  const endMonth = 3; // April (0-indexed)

  for (let year = startYear; year <= endYear; year++) {
    const maxMonth = year === endYear ? endMonth : 11;
    for (let month = 0; month <= maxMonth; month++) {
      // Random day between 5 and 25
      const day = Math.floor(Math.random() * 20) + 5;
      dates.push(new Date(year, month, day));
    }
  }

  return dates;
}

// Create a pool of all posts
function createPostPool(): PostTemplate[] {
  const pool: PostTemplate[] = [];

  for (const category of Object.values(posts)) {
    pool.push(...category);
  }

  return pool;
}

// Generate additional posts to fill the months
function generateAdditionalPosts(): PostTemplate[] {
  const additional: PostTemplate[] = [
    // Azure posts
    {
      title: "Azure Functions: Serverless Done Right",
      tags: ["azure", "serverless", "architecture"],
      content: `Serverless computing eliminates infrastructure management. Azure Functions takes this further with deep Azure integration and flexible hosting options.

## Trigger Types

Functions respond to events:

- HTTP requests
- Queue messages
- Timer schedules
- Blob storage changes
- Event Grid events

## Durable Functions

Orchestrate complex workflows:

\`\`\`csharp
[FunctionName("OrderWorkflow")]
public static async Task RunOrchestrator(
    [OrchestrationTrigger] IDurableOrchestrationContext context)
{
    await context.CallActivityAsync("ValidateOrder", order);
    await context.CallActivityAsync("ProcessPayment", order);
    await context.CallActivityAsync("ShipOrder", order);
}
\`\`\`

## Cold Start Mitigation

Premium plan keeps instances warm. For critical workloads, the trade-off is worth it.`
    },
    {
      title: "Kubernetes on Azure: AKS Deep Dive",
      tags: ["azure", "kubernetes", "containers"],
      content: `Azure Kubernetes Service handles the control plane so you can focus on workloads. But running production Kubernetes still requires understanding the platform deeply.

## Cluster Design

Consider:

- Node pool sizing
- Availability zones
- Network plugin (Azure CNI vs. kubenet)
- Private clusters

## Workload Identity

Replace pod identity with workload identity:

\`\`\`yaml
serviceAccount:
  annotations:
    azure.workload.identity/client-id: <client-id>
\`\`\`

## GitOps with Flux

Declarative deployments from Git:

\`\`\`bash
az k8s-configuration flux create \\
  --name my-config \\
  --cluster-name my-cluster \\
  --resource-group my-rg \\
  --url https://github.com/org/repo
\`\`\`

## Monitoring

Enable Container Insights for visibility into cluster and workload health.`
    },
    {
      title: "Building Event-Driven Architectures on Azure",
      tags: ["azure", "architecture", "messaging"],
      content: `Event-driven architecture decouples services and enables reactive systems. Azure provides multiple options for event routing and processing.

## Event Grid vs. Service Bus vs. Event Hubs

| Service | Use Case |
|---------|----------|
| Event Grid | Reactive events, serverless |
| Service Bus | Enterprise messaging, transactions |
| Event Hubs | High-volume streaming |

## Event Grid Topics

\`\`\`bash
az eventgrid topic create --name my-topic --resource-group my-rg
\`\`\`

## Dead Letter Handling

Always configure dead letter destinations for failed events. Don't lose data silently.

## Event Sourcing

Store events as the source of truth:

\`\`\`
OrderCreated → ItemAdded → ItemAdded → OrderSubmitted → OrderShipped
\`\`\`

Replay events to rebuild state at any point in time.`
    },
    {
      title: "Data Platforms on Azure: A Reference Architecture",
      tags: ["azure", "data", "architecture"],
      content: `Modern data platforms combine multiple services for ingestion, storage, processing, and serving. Here's a reference architecture that scales.

## The Medallion Architecture

**Bronze:** Raw data, as ingested
**Silver:** Cleaned and conformed
**Gold:** Business-ready aggregates

## Key Services

- **ADLS Gen2** - Scalable storage
- **Synapse Analytics** - Unified analytics
- **Databricks** - Spark processing
- **Purview** - Data governance

## Data Lakehouse

Combine data lake flexibility with warehouse reliability:

\`\`\`sql
CREATE TABLE orders
USING DELTA
LOCATION 'abfss://container@account.dfs.core.windows.net/orders'
\`\`\`

## Real-time and Batch

The same architecture handles both:

- Stream ingestion with Event Hubs
- Batch processing with Spark
- Unified serving layer`
    },
    {
      title: "Monitoring Azure Workloads Effectively",
      tags: ["azure", "monitoring", "operations"],
      content: `You can't fix what you can't see. Azure Monitor provides comprehensive observability, but effective monitoring requires intentional design.

## The Three Pillars

**Metrics:** Numeric measurements over time
**Logs:** Discrete events with context
**Traces:** Request flow across services

## Application Insights

Instrument applications for deep visibility:

\`\`\`python
from applicationinsights import TelemetryClient

tc = TelemetryClient('instrumentation-key')
tc.track_event('OrderPlaced', {'order_id': '123'})
\`\`\`

## Alerts That Matter

Avoid alert fatigue:

- Alert on symptoms, not causes
- Set meaningful thresholds
- Include runbooks
- Suppress duplicates

## Dashboards

Build dashboards for different audiences:

- Executive: SLO status, trends
- Operations: Real-time health
- Development: Performance metrics`
    },
    // Security posts
    {
      title: "Container Security: From Build to Runtime",
      tags: ["security", "containers", "devops"],
      content: `Container security spans the entire lifecycle. Each phase presents unique risks and requires specific controls.

## Build Time

- Scan base images for vulnerabilities
- Use minimal base images
- Don't run as root
- Sign images

\`\`\`dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine
USER nonroot
\`\`\`

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

\`\`\`bash
syft packages my-image:latest -o spdx-json
\`\`\`

Verify everything, trust nothing.`
    },
    {
      title: "Implementing Security Guardrails at Scale",
      tags: ["security", "governance", "cloud"],
      content: `Security guardrails prevent mistakes before they happen. Instead of reviewing after the fact, encode security requirements into the platform.

## Policy as Code

Define what's allowed:

\`\`\`rego
deny[msg] {
    input.kind == "Deployment"
    not input.spec.template.spec.securityContext.runAsNonRoot
    msg = "Containers must run as non-root"
}
\`\`\`

## Admission Controllers

Kubernetes admission controllers enforce policy at deploy time:

- OPA Gatekeeper
- Kyverno
- Built-in PSPs/PSS

## Infrastructure Guardrails

Terraform Sentinel policies:

\`\`\`python
import "tfplan/v2" as tfplan

main = rule {
    all tfplan.resources as _, resources {
        all resources as _, r {
            r.values.public_network_access_enabled is false
        }
    }
}
\`\`\`

## Shift Left

Catch issues in pull requests, not production. Integrate policy checks into CI/CD pipelines.`
    },
    {
      title: "Incident Response in Cloud Environments",
      tags: ["security", "operations", "cloud"],
      content: `Cloud incidents require adapted response procedures. The shared responsibility model means coordinating with providers. The API-driven nature enables automated response.

## Preparation

Before incidents happen:

- Document cloud architectures
- Establish provider contacts
- Create response playbooks
- Test backup and recovery

## Detection

Cloud-native detection sources:

- Cloud audit logs
- Flow logs
- Security service alerts
- Application telemetry

## Containment

Automated containment actions:

\`\`\`python
# Isolate compromised instance
ec2.modify_instance_attribute(
    InstanceId=instance_id,
    Groups=['sg-isolated']
)
\`\`\`

## Evidence Collection

Preserve volatile data:

- Instance metadata
- Memory dumps
- Network connections
- Running processes

## Lessons Learned

Every incident is a learning opportunity. Conduct blameless postmortems and update procedures.`
    },
    // Platform Engineering posts
    {
      title: "Service Meshes: When and Why",
      tags: ["platform-engineering", "kubernetes", "architecture"],
      content: `Service meshes add observability, security, and traffic management to microservices. But they also add complexity. When are they worth it?

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

eBPF-based meshes like Cilium offer mesh features without sidecars.`
    },
    {
      title: "Developer Experience as Competitive Advantage",
      tags: ["platform-engineering", "developer-experience", "strategy"],
      content: `Developer experience (DevEx) directly impacts productivity, retention, and quality. Organizations that invest in DevEx ship faster and attract better talent.

## Measuring DevEx

Track what matters:

- Time to first commit
- Build times
- Deployment frequency
- Time to resolve blockers

## Common Pain Points

Developers waste time on:

- Environment setup
- Waiting for builds
- Debugging pipelines
- Finding documentation
- Getting approvals

## Quick Wins

Improve DevEx immediately:

1. Faster builds (caching, parallelization)
2. Local development parity
3. Self-service environments
4. Searchable documentation

## Cultural Elements

DevEx isn't just tools:

- Psychological safety
- Autonomy
- Clear ownership
- Reduced meetings

## Investment Framework

Quantify DevEx investment:

Developer time saved × hourly cost × number of developers = ROI`
    },
    // Identity posts
    {
      title: "Multi-Tenant Identity Architecture",
      tags: ["identity", "architecture", "saas"],
      content: `SaaS applications serve multiple customers from shared infrastructure. Identity architecture must isolate tenants while enabling efficient operations.

## Isolation Models

**Siloed:** Separate identity providers per tenant
**Pooled:** Shared identity provider with tenant claims
**Hybrid:** High-value tenants isolated, others pooled

## Tenant Resolution

Identify tenant from:

- Subdomain (acme.app.com)
- Path (/acme/dashboard)
- Header (X-Tenant-ID)
- Token claim

## Authorization Patterns

\`\`\`python
def check_access(user, resource):
    if user.tenant_id != resource.tenant_id:
        raise Forbidden()
    return has_permission(user, resource)
\`\`\`

## Cross-Tenant Scenarios

Some scenarios require cross-tenant access:

- Support staff access
- Parent-child tenants
- Partner integrations

Model these explicitly with scoped permissions.`
    },
    {
      title: "Securing Service-to-Service Communication",
      tags: ["identity", "security", "architecture"],
      content: `Services talking to services need identity too. Managed identities and workload identity federation eliminate secrets for cloud-native authentication.

## The Problem with Secrets

Service accounts with passwords:

- Rotate frequently
- Store securely
- Risk exposure
- Audit usage

## Managed Identities

Azure assigns identity to resources:

\`\`\`python
from azure.identity import DefaultAzureCredential
credential = DefaultAzureCredential()
# No secrets needed!
\`\`\`

## Workload Identity Federation

Trust external identity providers:

\`\`\`
GitHub Actions → Azure AD App → Azure Resources
\`\`\`

No secrets in GitHub—JWT assertion establishes identity.

## Service Mesh mTLS

Mutual TLS between services:

- Automatic certificate rotation
- Service-level authentication
- Encrypted traffic

## Zero Trust for Services

Apply the same principles:

- Verify identity
- Check authorization
- Assume compromise
- Log everything`
    },
    // AI posts
    {
      title: "Prompt Engineering: The New Programming",
      tags: ["ai", "practices", "development"],
      content: `Prompt engineering is how we program language models. The right prompt can mean the difference between useful output and garbage.

## Prompt Structure

Effective prompts include:

1. **System context** - Role and constraints
2. **Examples** - Show, don't tell
3. **Task description** - What you want
4. **Output format** - How to respond

## Few-Shot Learning

\`\`\`
Classify the sentiment:

Text: "I love this product!"
Sentiment: Positive

Text: "Worst purchase ever."
Sentiment: Negative

Text: "It's okay, nothing special."
Sentiment:
\`\`\`

## Chain of Thought

Ask for reasoning:

\`\`\`
Think step by step before answering.
Q: If I have 3 apples and buy 2 more...
\`\`\`

## Temperature and Tokens

- **Temperature 0** - Deterministic, factual
- **Temperature 1** - Creative, varied

## Iteration

Prompt engineering is empirical. Try variations, measure results, refine.`
    },
    {
      title: "LLMOps: Operationalizing Language Models",
      tags: ["ai", "operations", "mlops"],
      content: `LLMOps extends MLOps for the unique challenges of large language models. Evaluation, monitoring, and cost management require specialized approaches.

## Evaluation Challenges

Traditional metrics don't work:

- No ground truth labels
- Subjective quality
- Multiple valid outputs

## Evaluation Approaches

- Human evaluation at scale
- LLM-as-judge patterns
- Task-specific metrics
- A/B testing

## Prompt Management

Version control prompts:

\`\`\`yaml
name: summarization-v2
model: gpt-4
temperature: 0.3
prompt: |
  Summarize the following text in 3 bullet points:
  {text}
\`\`\`

## Cost Optimization

LLM costs add up:

- Cache common queries
- Use smaller models when possible
- Optimize prompt length
- Batch requests

## Monitoring

Track:

- Latency percentiles
- Token usage
- Error rates
- User feedback
- Content filter triggers`
    },
    // Architecture posts
    {
      title: "Domain-Driven Design in Practice",
      tags: ["architecture", "ddd", "design"],
      content: `Domain-Driven Design (DDD) aligns software with business domains. After years of applying DDD, here's what actually works.

## Strategic Patterns

**Bounded Contexts:**
Define clear boundaries around models. The same word means different things in different contexts.

**Context Mapping:**
Document how contexts interact:

- Partnership
- Customer-Supplier
- Conformist
- Anticorruption Layer

## Tactical Patterns

**Aggregates:**
Consistency boundaries. One aggregate, one transaction.

**Domain Events:**
Capture business occurrences:

\`\`\`python
class OrderPlaced(DomainEvent):
    order_id: str
    customer_id: str
    timestamp: datetime
\`\`\`

## Ubiquitous Language

Use business terms in code:

\`\`\`python
# Bad
def process_item(user_id, item_id):

# Good
def place_order(customer: Customer, product: Product):
\`\`\`

## When to Apply DDD

DDD adds complexity. Use it for:

- Complex business logic
- Long-lived systems
- Collaborative domains

Skip it for CRUD apps.`
    },
    {
      title: "Evolutionary Architecture Principles",
      tags: ["architecture", "practices", "design"],
      content: `Systems must evolve. Evolutionary architecture embraces change through fitness functions, incremental change, and appropriate coupling.

## Fitness Functions

Automated checks for architectural characteristics:

\`\`\`python
def check_modularity():
    dependencies = analyze_dependencies()
    cycles = find_cycles(dependencies)
    assert len(cycles) == 0, f"Cyclic dependencies: {cycles}"
\`\`\`

## Incremental Change

Avoid big bang rewrites:

1. Strangle old functionality
2. Migrate incrementally
3. Verify with fitness functions
4. Remove old code

## Appropriate Coupling

Not all coupling is bad. Appropriate coupling:

- Within bounded contexts: tight
- Between contexts: loose
- To external systems: anti-corruption layer

## Last Responsible Moment

Defer decisions until you have enough information. But not longer—delayed decisions have costs too.

## Reversibility

Prefer reversible decisions. When irreversible decisions are necessary, invest more in getting them right.`
    },
    {
      title: "Microservices Anti-Patterns",
      tags: ["architecture", "microservices", "practices"],
      content: `Microservices promise agility but often deliver distributed complexity. Here are the anti-patterns I've seen sink microservices initiatives.

## Distributed Monolith

Services that must deploy together aren't microservices:

\`\`\`
Service A ←→ Service B ←→ Service C
    ↑____________↑____________↑
         Lockstep deployment
\`\`\`

## Shared Database

Multiple services writing to the same database destroys independence.

## Synchronous Everywhere

Chains of synchronous calls multiply latency and failure risk.

## Service Per Entity

Not every database table needs a service. Start coarser, split when needed.

## Golden Hammer

Microservices aren't always the answer. Sometimes a modular monolith is better.

## No Observability

Without distributed tracing, debugging distributed systems is impossible.

## Premature Decomposition

You need to understand the domain before splitting it. Build the monolith first, then decompose.`
    },
    {
      title: "API Design That Lasts",
      tags: ["architecture", "api", "design"],
      content: `APIs are contracts. Once published, they're hard to change. Thoughtful design upfront prevents painful migrations later.

## Versioning Strategy

Plan for change:

- URL versioning: /v1/users
- Header versioning: Accept: application/vnd.api+json;version=1
- Query parameter: ?version=1

## Resource Design

Think in resources, not operations:

\`\`\`
GET /orders/123        # Good
POST /getOrder         # Bad
\`\`\`

## Error Handling

Consistent error responses:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [...]
  }
}
\`\`\`

## Pagination

Design pagination from day one:

\`\`\`
GET /orders?page=2&size=20
GET /orders?cursor=abc123
\`\`\`

## Deprecation

Communicate changes:

\`\`\`
Deprecation: true
Sunset: Sat, 1 Jan 2025 00:00:00 GMT
\`\`\`

## Documentation

OpenAPI specs as source of truth. Generate from code or validate code against spec.`
    },
    // More diverse posts
    {
      title: "The Architect's Guide to Technical Interviews",
      tags: ["career", "leadership", "practices"],
      content: `Hiring architects is hard. Technical skills matter, but communication, judgment, and influence matter more.

## What to Assess

- System design thinking
- Trade-off analysis
- Communication clarity
- Collaboration approach
- Learning orientation

## System Design Questions

Ask open-ended design questions:

"Design a notification system for a social network."

Look for:
- Clarifying questions
- Requirements gathering
- Component identification
- Trade-off discussion

## Red Flags

- Can't explain simply
- Won't acknowledge uncertainty
- Dismisses existing systems
- Over-engineers everything
- Under-engineers everything

## Green Flags

- Asks good questions
- Considers operations
- Thinks about failure
- Respects constraints
- Communicates clearly

## Practical Exercises

Review real architecture:

"Here's our current system. What would you change and why?"`
    },
    {
      title: "From Developer to Architect: The Transition",
      tags: ["career", "architecture", "leadership"],
      content: `The move from developer to architect isn't a promotion—it's a career change. The skills that made you a great developer won't make you a great architect.

## What Changes

**Scope:** From implementation to design
**Timeframe:** From sprints to years
**Success:** From code quality to system outcomes
**Influence:** From direct to indirect

## New Skills Required

- Business acumen
- Communication
- Facilitation
- Strategic thinking
- Organizational awareness

## Common Pitfalls

**The Ivory Tower:**
Designing without implementation context

**The Hands-On Trap:**
Spending all time coding

**The Technology Obsession:**
Forgetting business outcomes

## Staying Relevant

Keep technical skills fresh:

- Prototype new technologies
- Review code
- Participate in incidents
- Build internal tools

## Measuring Success

Architects succeed when:

- Teams are productive
- Systems are reliable
- Decisions are informed
- Technical debt is managed`
    },
    {
      title: "Writing Technical Strategy Documents",
      tags: ["architecture", "communication", "leadership"],
      content: `Technical strategy documents align organizations around technology direction. They're not architecture diagrams—they're persuasive documents.

## Document Structure

1. **Context** - Why now?
2. **Current State** - Where are we?
3. **Challenges** - What's wrong?
4. **Vision** - Where do we want to be?
5. **Strategy** - How do we get there?
6. **Roadmap** - When do we do what?

## Writing Tips

**Be specific:**
Not "improve performance" but "reduce p99 latency from 500ms to 100ms"

**Acknowledge trade-offs:**
Every strategy has downsides. Address them.

**Show your work:**
Explain how you evaluated alternatives.

## Getting Buy-In

- Socialize early
- Incorporate feedback
- Address concerns
- Build coalitions

## Living Documents

Strategy isn't static. Update as you learn:

- Quarterly reviews
- Assumption validation
- Course corrections`
    },
    {
      title: "Managing Technical Risk",
      tags: ["architecture", "risk", "leadership"],
      content: `Technical risk threatens project success. Architects must identify, assess, and mitigate risks before they become problems.

## Risk Categories

**Technical:**
- Unproven technology
- Integration complexity
- Performance uncertainty

**Organizational:**
- Skill gaps
- Team availability
- Vendor dependency

**External:**
- Regulatory changes
- Market shifts
- Supply chain

## Risk Assessment

Rate each risk:

| Risk | Likelihood | Impact | Priority |
|------|------------|--------|----------|
| DB scaling issues | Medium | High | High |
| API breaking changes | Low | High | Medium |

## Mitigation Strategies

**Avoid:** Don't take the risk
**Transfer:** Insurance, contracts
**Mitigate:** Reduce likelihood or impact
**Accept:** Live with it

## Spikes and Proofs of Concept

Reduce uncertainty through experimentation:

\`\`\`
Spike: Can we achieve 10k requests/second?
Timebox: 2 days
Success criteria: Documented approach
\`\`\`

## Risk Monitoring

Track risks throughout the project. New information changes risk profiles.`
    },
    {
      title: "Building Platform Teams That Succeed",
      tags: ["platform-engineering", "leadership", "organization"],
      content: `Platform teams fail for organizational reasons, not technical ones. Here's how to set up platform teams for success.

## Team Structure

A platform team needs:

- Product manager
- Engineers
- SRE/DevOps
- Technical writer

## Funding Model

Platforms need sustained investment:

- Central funding preferred
- Chargeback models create friction
- Project funding creates instability

## Relationship with App Teams

Platform team is a service provider:

- Understand user needs
- Provide support
- Accept feedback
- Measure satisfaction

## Avoiding Common Failures

**The Mandate Problem:**
Forcing adoption breeds resentment

**The Premature Platform:**
Building before understanding needs

**The Forever Platform:**
Building instead of using existing solutions

## Success Metrics

Track outcomes, not outputs:

- Developer satisfaction
- Time to production
- Platform adoption
- Incident reduction`
    },
    {
      title: "Capacity Planning for Cloud Systems",
      tags: ["architecture", "operations", "cloud"],
      content: `Cloud elasticity doesn't eliminate capacity planning—it changes it. You still need to understand demand patterns and cost implications.

## Demand Modeling

Understand your traffic:

- Daily patterns
- Weekly patterns
- Seasonal variations
- Growth trends

## Resource Mapping

Map demand to resources:

\`\`\`
1000 requests/second
→ 10 app instances
→ 2 database read replicas
→ 100 GB cache
\`\`\`

## Cost Modeling

Translate resources to cost:

| Load | Instances | Monthly Cost |
|------|-----------|--------------|
| Base | 5 | $2,000 |
| Peak | 20 | $8,000 |
| Average | 10 | $4,000 |

## Scaling Policies

Configure auto-scaling:

\`\`\`yaml
scaling:
  min: 5
  max: 50
  target_cpu: 70%
  scale_up_cooldown: 60s
  scale_down_cooldown: 300s
\`\`\`

## Load Testing

Validate capacity assumptions:

- Identify bottlenecks
- Verify scaling behavior
- Measure actual costs`
    },
  ];

  return additional;
}

// Main generation
const allPosts = [...createPostPool(), ...generateAdditionalPosts()];
const dates = generateDates();

// Shuffle posts for variety
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const shuffledPosts = shuffle(allPosts);

// Generate posts
let postIndex = 0;
for (const date of dates) {
  if (postIndex >= shuffledPosts.length) {
    postIndex = 0; // Cycle through posts if we run out
  }

  const post = shuffledPosts[postIndex];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const filename = `${year}-${month}-${day}-${slug}.md`;
  const filepath = path.join(postsDir, filename);

  const content = `---
layout: post
title: "${post.title}"
date: ${year}-${month}-${day}
tags: [${post.tags.join(', ')}]
---

${post.content}
`;

  fs.writeFileSync(filepath, content);
  postIndex++;
}

console.log(`✓ Generated ${dates.length} blog posts from 2018 to 2026`);
