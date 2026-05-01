---
layout: post
title: "Building Developer Portals with Backstage"
date: 2025-12-22
tags: [platform-engineering, backstage, developer-experience]
---

I've spent the last couple of years helping teams build and adopt developer portals, and Backstage keeps coming up as the tool that actually delivers on the promise. Before Backstage, developer portals were either custom-built nightmares that nobody maintained or glorified wikis that developers ignored. Backstage changes that by giving you a framework that's extensible, community-driven, and actually useful for day-to-day development.

But building a Backstage portal isn't just about installing software, it's about creating a development practice that revolves around it. That means dealing with organizational challenges like getting buy-in from skeptical teams, maintaining the portal once it's built, and measuring whether it's actually improving productivity. This post walks through how to build one, the hurdles you'll face, and why it's worth the effort.

## What is Backstage and Why It Matters

Backstage started at Spotify as a way to tame their microservices chaos. They had hundreds of services, each with its own repo, CI/CD pipeline, monitoring setup, and documentation scattered across different tools. Developers wasted time hunting for information instead of building features.

Backstage solves this with a single pane of glass: a catalog of all your services, templates for new projects, integrated documentation, and plugins for everything from cloud providers to security scanners. It's open source, built on React and Kubernetes, and has a huge community contributing plugins.

The key insight is that Backstage isn't just a portal, it's a platform for developer self-service. Instead of emailing ops for a new service setup, developers can click a button and get a fully configured project with all the scaffolding they need.

## Setting Up Backstage: Getting Started

Starting with Backstage feels straightforward, but there are gotchas.

First, you need a Kubernetes cluster. Backstage runs as a set of pods, frontend, backend, and database (usually PostgreSQL). If you're new to K8s, this can be a hurdle. Use a managed service like AKS or EKS to avoid the complexity.

Install via the CLI:

```bash
npx @backstage/create-app@latest
```

This creates a basic app with the catalog, templates, and TechDocs. It includes sample data so you can see how it works.

For production, you'll want to configure authentication. Backstage supports OAuth with GitHub, Google, or Azure AD. Set it up early, without auth, it's just a demo.

```yaml
# app-config.yaml
auth:
  providers:
    github:
      development:
        clientId: ${GITHUB_CLIENT_ID}
        clientSecret: ${GITHUB_CLIENT_SECRET}
```

Deploy to K8s with Helm or kubectl. The Backstage Helm chart handles most of it, but you'll need to set up ingress for external access.

One team I worked with deployed Backstage to their dev cluster first. It took a day to get running, but they learned about networking policies and RBAC that they needed for production.

## Building the Service Catalog: The Heart of Backstage

The service catalog is where everything starts. It's a registry of all your components, services, libraries, websites, whatever you build.

Each component is defined by a YAML file in the repo:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payment-service
  description: Handles payment processing for orders
  annotations:
    github.com/project-slug: myorg/payment-service
    backstage.io/techdocs-ref: dir:.
spec:
  type: service
  owner: payments-team
  lifecycle: production
  system: order-management
  dependsOn:
    - component:order-db
```

This YAML lives in the service's repo, usually in a `.backstage` directory. When you push changes, Backstage ingests it via a GitHub integration or manual import.

The catalog shows ownership, dependencies, and links to code, docs, and monitoring. Developers can search by name, owner, or tags.

The challenge is getting teams to maintain these YAMLs. At first, it's extra work, and people forget. We solved this by adding a CI check that fails if the YAML is missing or outdated. Also, use the Backstage CLI to validate:

```bash
backstage-cli lint
```

For large orgs, automate ingestion with webhooks. When a PR merges, update the catalog automatically.

## Software Templates: Scaffolding New Projects

Software templates are Backstage's killer feature for consistency. Instead of starting from scratch, developers choose a template and get a fully set up project.

Templates are defined in YAML with parameters:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Template
metadata:
  name: node-service-template
  title: Node.js Service
  description: Creates a new Node.js microservice
spec:
  owner: platform-team
  type: service
  parameters:
    - title: Service Name
      properties:
        name:
          type: string
          description: Unique name for the service
    - title: Database
      properties:
        dbType:
          type: string
          enum: ['postgres', 'mysql']
  steps:
    - id: fetch
      name: Fetch Base
      action: fetch:template
      input:
        url: ./skeleton
        targetPath: .
    - id: publish
      name: Publish
      action: publish:github
      input:
        repoUrl: '{{ parameters.name }}'
    - id: register
      name: Register
      action: catalog:register
      input:
        repoContentsUrl: '{{ repoUrl }}'
        catalogInfoPath: catalog-info.yaml
```

This creates a GitHub repo, sets up CI/CD with GitHub Actions, adds monitoring with Prometheus, and registers the service in the catalog, all from a form in Backstage.

We started with basic templates and added complexity as we learned what teams needed. One template includes security scanning, another has multi-region deployment.

## TechDocs: Documentation That Lives with Code

Documentation is always the weakest link. Wikis get outdated, Confluence pages are hard to find. TechDocs solves this by rendering Markdown from your repo in Backstage.

Add a `docs/` folder with Markdown files. Backstage renders them with a nice UI, search, and versioning.

```yaml
# mkdocs.yml
site_name: Payment Service
nav:
  - Home: index.md
  - API: api.md
  - Deployment: deployment.md
plugins:
  - techdocs-core
```

Commit this, and it's available in the service's Backstage page. No more "where's the docs?" questions.

The trick is making it easy. We added a template that includes a docs skeleton. Teams just fill in the blanks.

## Plugins and Integrations: Extending Backstage

Backstage's power comes from plugins. The community has hundreds, GitHub, Jira, PagerDuty, AWS, Azure.

Install via npm:

```bash
yarn add @backstage/plugin-catalog
```

For custom integrations, build your own plugin. It's React components with a backend API.

We built a plugin that shows cost data from our cloud provider. Developers can see how much their service costs per month.

Another integrated security scanning, shows vulnerabilities right in the service page.

## Organizational Challenges: Adoption and Culture Change

Building the portal is the easy part. Getting people to use it is hard.

**Resistance from teams**: Developers are busy. Adding YAML files feels like bureaucracy. "Why can't I just code?" We addressed this by showing quick wins, templates that save hours of setup time.

**Maintenance burden**: Who owns the portal? We created a platform team responsible for core Backstage, but service owners maintain their catalog entries. This requires training.

**Skill gaps**: Not everyone knows Kubernetes or React. We ran workshops and paired with experienced devs.

**Governance**: How do you ensure quality? We added policies, templates must include security scans, docs must be complete.

One company I worked with launched Backstage with fanfare. Usage was low for months. They fixed it by making it mandatory, new services must be registered, or CI fails. Also, leadership communicated that it's for developer productivity, not control.

## Benefits: Why Developer Portals Matter

The benefits compound over time.

**Faster onboarding**: New hires can discover services and get started without hunting for info.

**Consistency**: Templates ensure all services follow the same patterns for security, monitoring, deployment.

**Productivity**: Developers spend less time on boilerplate and more on features. One team measured 20% faster feature delivery after adopting templates.

**Visibility**: Leadership can see all services, owners, and health. This helps with planning and resource allocation.

**Culture shift**: It encourages self-service and ownership. Teams feel empowered.

ROI: One org calculated they saved 50 developer-weeks per quarter on setup tasks. Plus, fewer incidents from inconsistent deployments.

## Best Practices for Building and Maintaining

**Start small**: Pilot with one team. Get feedback before scaling.

**Automate everything**: CI for catalog validation, automated template updates.

**Measure usage**: Track portal visits, template usage, time to onboard.

**Evolve incrementally**: Add plugins as needs arise. Don't try to build everything at once.

**Community**: Join the Backstage community for help and plugins.

**Security**: Treat Backstage like any other app, RBAC, audits, updates.

## Conclusion

Building a developer portal with Backstage is about more than the tech, it's about creating a practice where developers can focus on building value instead of navigating chaos. The challenges are real, but the benefits are worth it. Start with the catalog and templates, address adoption early, and build from there. Your future self will thank you when onboarding is smooth and deployments are consistent.
