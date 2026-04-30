---
layout: post
title: "Kubernetes on Azure: AKS Deep Dive"
date: 2025-05-09
tags: [azure, kubernetes, containers]
---

Azure Kubernetes Service is often the first place teams land when they want a managed container orchestration platform in Azure. It removes the burden of running the control plane, but it does not eliminate the architectural work required to run containers reliably at scale.

This deep dive covers the fundamentals of Kubernetes and containers, explains how AKS fits into the Azure ecosystem, and describes practical patterns for introducing containers as a new function in an organization.

## Why Kubernetes and Containers Still Matter

Containers are the runtime abstraction that makes application packaging portable, isolated, and consistent across environments. Kubernetes is the orchestration layer that takes container workloads and makes them resilient, scalable, and observable.

A container image packages an application with its runtime dependencies. Kubernetes then schedules those container images across a pool of nodes, heals failed workloads, and exposes services through APIs.

In Azure, Kubernetes is not the only container platform, but it remains the most flexible choice for complex, polyglot applications, custom networking, and teams that need fine-grained control over infrastructure.

## AKS Architecture Essentials

AKS is a managed Kubernetes offering. The main architectural boundaries are:

- **Control plane**: managed by Azure, including API server, controller manager, and etcd.
- **Node pools**: customer-managed compute nodes that run pods.
- **Networking**: usually Azure CNI or Kubenet, with support for private clusters and custom VNET design.
- **Identity**: managed identities, Azure AD integration, and workload identity.
- **Storage**: Azure Disk, Azure Files, and CSI drivers for stateful workloads.

This separation means you can focus on application design, pod security, and observability rather than core Kubernetes availability.

## Container Fundamentals for Azure

### Container image lifecycle

The developer workflow typically looks like:

1. build a container image from `Dockerfile` or Buildpacks
2. push to Azure Container Registry (ACR) or another registry
3. deploy the image to AKS or another container service
4. monitor runtime health and performance

Using Azure Container Registry as the hub keeps supply chains simple and enables features like image signing and vulnerability scanning.

### Pod and workload concepts

A Kubernetes pod is the smallest deployable unit. Most of your application services will be represented as Deployments, StatefulSets, or Jobs.

Common patterns include:

- **Deployment** for stateless web services
- **StatefulSet** for databases or storage-backed workloads
- **CronJob** for scheduled jobs
- **DaemonSet** for node-local agents such as logging or monitoring

### Resource requests and limits

A container must declare CPU and memory requests and limits. This is the single most important configuration for stable clusters.

```yaml
resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1
    memory: 1Gi
```

Without sensible requests, the scheduler cannot pack pods effectively, and noisy neighbors can destabilize nodes.

## AKS Cluster Design Patterns

### Node pool design

Use multiple node pools to separate workloads:

- a Linux pool for general workloads
- a Windows pool if you have Windows containers
- an isolated pool for privileged system components
- a burstable pool for occasional jobs or CI

This gives you control over node sizing, scaling behavior, and taints/tolerations.

### Availability and resilience

Enable zone-aware clusters in Azure regions that support Availability Zones. This protects against zone failure and gives you a stronger SLA.

Use multiple node pools across zones and consider separate pools for critical workloads that require higher reliability.

### Networking choices

Azure supports two primary networking models for AKS:

- **Azure CNI**: pods receive IP addresses from the VNET and can communicate with Azure services directly. This is best for enterprise networking and advanced policies.
- **Kubenet**: pod IPs are NATed through node IPs. It is simpler, but less flexible for large networks and advanced integration.

For production workloads, Azure CNI is generally the safer choice because it aligns with enterprise network topology and enables network policies with Azure Firewall, NSGs, and private endpoints.

### Security-first defaults

Apply security at multiple layers:

- enable **Azure AD integration** for Kubernetes API access
- use **Azure Policy for AKS** and the **Gatekeeper** framework to enforce guardrails
- adopt **pod security admission** or OPA/Gatekeeper constraints
- use **Azure Key Vault or Managed Identity** for secret and credential management

### Workload identity

Replace legacy pod identity patterns with workload identity.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: production
  annotations:
    azure.workload.identity/client-id: "<managed-identity-client-id>"
```

Workload identity maps Kubernetes service accounts to Azure AD identities without injecting credentials into pods.

### GitOps and declarative delivery

GitOps is the operational model most teams use on AKS.

Flux or Argo CD can reconcile cluster state from Git and give you an auditable deployment pipeline.

A simple Flux bootstrap flow looks like:

```bash
az k8s-configuration flux create \
  --name gitops-config \
  --cluster-name my-aks-cluster \
  --resource-group my-rg \
  --scope cluster \
  --url https://github.com/org/repo \
  --branch main
```

This makes your AKS cluster self-healing and keeps your deployment process tightly controlled.

## Implementing Containers as a New Function

Containers are not just a runtime; they are an organizational capability. Treat container adoption as a function, not a one-off project.

### 1. Build a container enablement team

Start with a small, multidisciplinary team responsible for:

- platform design and governance
- developer enablement
- security and compliance
- monitoring and operations

This team should be a facilitator, not a gatekeeper.

### 2. Define golden paths and reusable templates

Create opinionated templates for common workloads:

- API services
- background workers
- event consumers
- batch jobs

Give developers a standard `application.yaml` pattern and a starter repo that already includes ACR integration, image scanning, and observability hooks.

### 3. Establish container platform metrics

Track meaningful outcomes like:

- time to onboard a new containerized service
- mean time to recovery for container workloads
- number of deployments per day
- percentage of workloads using approved container images

These metrics show the function’s value and help tune the platform.

### 4. Provide self-service delivery workflows

Offer a developer experience that is easy to consume:

- `az acr build` or GitHub Actions for image build and push
- templates for Kubernetes manifests or Helm charts
- platform-managed secrets and config maps
- automated security and compliance checks

Self-service is the core of container adoption.

### 5. Integrate observability and debugging

Ensure the function provides built-in observability by default:

- Container Insights and Prometheus for metrics
- Fluent Bit/Fluentd for logs
- Distributed tracing for request flows

When debugging container workloads, developers should not need to assemble observability stack pieces themselves.

### 6. Use a phased migration approach

Start with a pilot team and one workload category. Validate the platform before expanding.

A practical migration path is:

1. onboard one team to AKS with a supported template
2. add GitOps and policy checks
3. expand to additional teams based on platform maturity
4. retire legacy container workflows gradually

## Azure Container Solutions and How They Differ

AKS is one container solution in Azure, but it is not the only one. Understanding the options helps you choose the right platform for each workload.

### Azure Container Instances (ACI)

ACI is a serverless container runtime for single-container workloads.

Pros:

- very fast startup
- no cluster management
- good for bursty jobs or simple APIs

Cons:

- not suitable for multi-container applications with complex networking
- limited lifecycle features compared to Kubernetes
- no built-in service mesh or extensive networking controls

Use ACI for short-lived tasks, CI jobs, or isolated container execution.

### Azure Container Apps (ACA)

Container Apps is a managed environment for microservices built on Kubernetes but abstracted away.

Pros:

- built-in Dapr support for app-level building blocks
- automatic scale to zero and scale to many
- simple service routing and ingress

Cons:

- less control over low-level cluster behavior
- not ideal for custom network or legacy Kubernetes workloads
- some limitations around node-level configuration and advanced policies

Choose ACA when you want containerized microservices without managing a Kubernetes cluster.

### Azure App Service for Containers

App Service can run containerized web apps with a platform-as-a-service experience.

Pros:

- simple deployment and managed runtime
- built-in HTTPS, autoscale, and staging slots
- easy path for web applications

Cons:

- not designed for complex microservices or stateful workloads
- limited support for custom orchestration
- less transparent runtime environment than AKS

Best for web front ends, APIs, and small services that do not require Kubernetes features.

### Azure Red Hat OpenShift (ARO)

ARO is a fully managed OpenShift service on Azure.

Pros:

- enterprise-grade Kubernetes distribution
- OpenShift developer tools and operator ecosystem
- strong multi-tenancy and strict security defaults

Cons:

- more expensive than AKS
- deeper learning curve
- more opinionated platform

ARO is a good choice when your organization already commits to OpenShift or requires a supported enterprise Kubernetes distribution.

### When AKS is the right choice

Choose AKS when you need:

- flexible cluster topology and custom networking
- multi-tenant or mixed workload environments
- complex stateful services and CI/CD pipelines
- fine-grained control over node pools and cluster policies

AKS is the natural choice for teams that want Kubernetes without managing the control plane.

## Best Practices for AKS and Azure Containers

### Secure the full supply chain

Scan images in ACR, promote only approved images, and enforce image provenance. Use Azure Defender for Containers to detect runtime threats.

### Automate operations

Use Azure Update Manager or cluster auto-upgrade for AKS. Automate node pool scaling, and use cluster autoscaler with appropriate thresholds.

### Keep secrets out of code

Manage secrets with Azure Key Vault and mount them through CSI drivers or use managed identity for runtime access.

### Separate infrastructure and application concerns

Keep Kubernetes manifests and platform configuration in separate Git repositories when appropriate. Use one repo for platform definitions and another for application deployments.

### Use labels and annotations consistently

Consistent metadata makes it easier to query, manage, and secure workloads across multiple clusters and namespaces.

### Monitor both cluster and application health

Cluster health is not enough. Track application-level success criteria, request latency, error rates, and business metrics.

### Keep an escape hatch

Design your platform so teams can bypass if necessary for emergencies, but monitor exceptions closely. The goal is enablement, not inhibition.

## Conclusion

AKS gives you a managed Kubernetes control plane, but the real work is in designing the cluster, the developer workflow, and the platform around it.

For organizations adopting containers as a new capability, success comes from combining technical best practices with clear enablement patterns: reusable templates, self-service workflows, security guardrails, and observability by default.

Azure offers a spectrum of container services. AKS is the strongest choice for complex applications and advanced workloads, while ACI, Container Apps, App Service, and ARO each have valid use cases when the business needs simplicity, rapid scale, or a managed developer experience.

The key is to choose the right Azure container solution for the workload, and to build container capability in the organization as a repeatable function rather than a one-off project.
