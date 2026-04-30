---
layout: post
title: "Migrating to Azure: Lessons from the Trenches"
date: 2026-01-23
tags: [azure, migration, architecture]
---

I've led or consulted on about a dozen Azure migrations now, from small startups to Fortune 500 enterprises. Each one starts with the same optimism: "Cloud will be cheaper, faster, and more scalable." And each one hits the same reality: migration is messy, unpredictable, and full of surprises that nobody mentions in the sales presentations. The first migration I led was for a manufacturing company with 200 VMs and a bunch of legacy applications. We thought it would take 6 months. It took 14, cost twice the budget, and we had a 3-day outage during the final cutover because we missed a dependency on an old file server nobody had documented.

The truth is, migrating datacenter workloads to Azure isn't just a technical exercise—it's a business transformation that touches every part of your organization. You have to deal with networking that doesn't work the way you expect, security models that are different, data that takes forever to move, applications that break in subtle ways, and people who resist the change. This post is about the real issues I've seen, the mistakes we've made, and what actually works based on those experiences.

## Assessment and Discovery: Know What You're Moving Before You Move It

The biggest mistake teams make is starting to migrate without really understanding what they have. You think you know your environment, but you don't—not the details that matter for cloud.

**Application inventory** is the foundation. You need to know every application, its dependencies, versions, and interconnections. Which apps talk to which databases? Which ones have hardcoded IPs or file paths? Which ones are critical and which ones can tolerate downtime? I worked with a team that discovered during migration week that their main ERP system had a dependency on a 15-year-old file server running Windows NT. Nobody had documented it because "it just worked." That discovery added 3 months to their timeline.

**Data gravity** is another killer. If you have large databases—think 50TB or more—moving that data is a project in itself. Bandwidth is limited, and Azure's data transfer tools have constraints. One financial services company I helped had a 100TB data warehouse. They thought they'd move it over a weekend. It took 6 weeks because their internet connection couldn't handle the throughput, and they had to ship Azure Data Boxes (physical appliances) back and forth.

**Compliance requirements** can make or break a migration. If you're in healthcare, you need HIPAA compliance. Finance needs SOX. Europe means GDPR. Azure has regions and services designed for compliance, but you have to choose them from the start. A retail company I worked with migrated to Azure without checking compliance first. They put customer data in a non-compliant region and had to move it again, costing $500K in extra work.

**Performance baselines** are crucial. What's your current latency? Throughput? SLAs? You need to measure these before migration so you can compare after. Too many teams migrate and then wonder why performance is worse. It's usually because they didn't account for network latency or different VM types.

The tools for this: Azure Migrate is good for automated discovery. It scans your environment and gives you reports on VMs, applications, and dependencies. But it's not perfect—it misses some custom apps or network dependencies. Supplement it with manual inventory and interviews with the people who actually run the systems.

## The 6 Rs of Migration: Choosing Your Strategy

Microsoft talks about the 6 Rs: Rehost, Replatform, Refactor, Repurchase, Retire, Retain. It's a good framework, but the real question is which one to use for which workload, and when to change strategies mid-migration.

**Rehost (lift and shift)** is the easiest and most common. You take your VM as-is and move it to Azure. It's fast, but you don't get cloud benefits. A banking application I migrated was rehosted first. It worked, but performance was terrible because the VMs were oversized and Azure's network was different. We had to replatform it later.

**Replatform** means optimizing as you move. Resize VMs, move to managed services like Azure SQL instead of SQL Server on a VM. This gives you some benefits without rewriting code. That same banking app—we resized the VMs from D8s to B4s (saving 60% on compute) and moved the database to Azure SQL Managed Instance. Performance improved, costs dropped.

**Refactor** is re-architecting for cloud native. Break monoliths into microservices, use serverless, add auto-scaling. This is powerful but expensive and risky. A logistics company refactored their tracking system during migration. It took 18 months and doubled the budget, but now they can scale to 10x traffic without issues.

**Repurchase** means switching to SaaS. Instead of migrating your email server, use Exchange Online. A manufacturing firm I worked with had a custom CRM. They switched to Dynamics 365 instead of migrating. Saved them 2 years of work and ongoing maintenance.

**Retire** is decommissioning stuff you don't need. Most companies have 20-30% of their infrastructure that's unused. One team found 50 VMs that hadn't been touched in 2 years. They retired them, saving $100K/month.

**Retain** is keeping things on-premises. Maybe you have specialized hardware, or compliance requirements that Azure can't meet yet. A defense contractor retained their classified systems on-premises while migrating everything else.

The key lesson: Start with rehost for speed, then replatform or refactor based on what you learn. Don't try to refactor everything upfront—that's how projects fail.

## Migration Waves: Don't Boil the Ocean

Trying to migrate everything at once is a recipe for disaster. Break it into waves based on complexity, risk, and dependencies.

**Wave planning**: Group applications by how hard they are to migrate and how critical they are. Low-risk, low-complexity first. High-risk, high-complexity last.

**Pilot wave**: Pick 2-3 simple apps for your first wave. Test your process, tools, and team. A retail company did a pilot with their dev environment. It went smoothly, but they learned their VPN wasn't stable enough for production.

**Production waves**: Business-critical systems go last, after you've ironed out the kinks. Have rollback plans for each wave—what if it fails? Can you switch back to on-premises quickly?

Real case: A healthcare provider did Wave 1 with non-critical apps. Success. Wave 2 included their patient portal. Disaster— they missed a dependency on an internal DNS server. The portal was down for 4 hours. They had to rollback and fix the dependency mapping.

## Networking Challenges: Connecting Your Worlds

Networking is where Azure migrations get complicated. Your on-premises network is a known quantity; Azure's is different.

**VPN vs ExpressRoute**: VPN is cheap and easy but limited in bandwidth and reliability. ExpressRoute gives you dedicated bandwidth but costs $500-2000/month per connection. A logistics company used VPN for their initial migration. It worked for small data, but when they tried to sync their warehouse database, the VPN kept dropping, causing sync failures. They switched to ExpressRoute mid-migration.

**Hybrid connectivity**: You need site-to-site VPNs or ExpressRoute to connect Azure to your datacenter. Point-to-site for remote users. The complexity is in routing—making sure traffic flows correctly between environments.

**DNS migration**: Internal DNS vs external. Split-brain DNS (where internal and external resolve differently) is common. One team migrated DNS but forgot to update internal references. Apps couldn't find each other for 2 days.

**Firewall rules**: Migrating security policies is tedious. Azure NSGs are different from on-premises firewalls. A financial firm had 500+ firewall rules. They migrated them manually and missed some, exposing services accidentally.

## Security and Compliance Pitfalls

Security in Azure is different from on-premises. You have to rethink access controls and encryption.

**Identity migration**: Moving from Active Directory to Azure AD is tricky. Hybrid identity (Azure AD Connect) is common but complex. One team migrated identity but didn't sync properly. Users couldn't log in for a day.

**Access controls**: RBAC in Azure is granular but easy to misconfigure. Least privilege is harder to enforce. A retail company gave everyone contributor access initially. Someone accidentally deleted a resource group, costing $50K in downtime.

**Encryption**: Data at rest and in transit. Azure encrypts storage by default, but you need to configure it for databases and VMs. A healthcare provider migrated patient data without proper encryption. They got audited and had to re-encrypt everything.

**Compliance**: Choose the right regions. Azure has sovereign clouds for government. Make sure certifications match your needs. A European company put data in US regions, violating GDPR. They had to move it.

## Data Migration Nightmares

Moving data is the part that takes the longest and costs the most.

**Bandwidth limitations**: Your internet connection is the bottleneck. A 100Mbps connection can move 900GB/day max. For 50TB, that's 55 days. One company tried to migrate over their corporate internet. It took 3 months and slowed down their business network to a crawl.

**Downtime windows**: Business impact is huge. You can't take systems offline forever. Plan for minimal downtime—use tools like Azure Database Migration Service for online migrations.

**Data consistency**: During migration, data is changing. How do you sync? One team migrated a database but forgot ongoing transactions. They lost 2 hours of data.

**Tools**: Azure Data Box for large transfers (ship disks). DMS for databases. Custom scripts for everything else. But tools have limits—DMS can't handle complex schemas sometimes.

Real disaster: A media company migrated 200TB of video content. They used Data Box but underestimated shipping time. Content was unavailable for a week during peak season.

## Application Compatibility Issues

Just because it runs on-premises doesn't mean it runs in Azure.

**OS dependencies**: Azure supports most Windows/Linux versions, but not all. Custom kernels or drivers might not work. A manufacturing app used a specific Linux kernel module that Azure didn't support. They had to refactor it.

**Software licensing**: BYOL (bring your own license) vs pay-as-you-go. SQL Server licenses are expensive if you BYOL wrong. One team brought licenses but didn't activate them properly. They got billed for Azure's SQL.

**Custom code**: Hardcoded IPs, file paths, assumptions about local storage. An app assumed /tmp was persistent. In Azure VMs, it's not. It crashed after restarts.

**Performance changes**: Azure VMs have different CPU/memory ratios. Storage is network-attached, not local. An app optimized for local SSDs ran slow on Azure premium storage.

## Performance and Scalability Surprises

Performance often degrades after migration, and scalability isn't automatic.

**Latency increases**: On-premises, everything is local. In Azure, cross-region traffic adds 50-200ms. A global app saw response times double.

**Throughput changes**: Network storage vs local. Database queries that were fast became slow due to network round trips.

**Auto-scaling**: It works, but not instantly. Lag in scaling can cause outages during spikes. One e-commerce site got a traffic spike during migration testing. Auto-scaling took 5 minutes; they had an outage.

## Cost Surprises: The Bill Shock

Cloud costs are different, and surprises are common.

**Egress charges**: Data leaving Azure costs money. A company with global users paid $20K/month in egress they didn't expect.

**Reserved instances**: Buy upfront for discounts, but timing matters. One team bought RIs after migration and saved 40%, but they bought too many and had unused capacity.

**Storage costs**: Hot storage is expensive. Cool/archive is cheap, but access is slow. A backup company migrated 1PB of data to hot storage. Monthly cost was $50K instead of $5K on cool.

Real example: On-premises $200K/month became $350K in Azure due to poor planning. They fixed it by rightsizing and using RIs, dropping to $250K.

## The Human Factor: Organizational Change

Technical migration is the visible part. The human side determines success.

**Resistance to change**: People are comfortable with what they know. "We've always done it this way." A team resisted Azure because they didn't trust cloud security. Education helped, but it took 6 months.

**Skill gaps**: On-premises skills don't transfer. Teams need Azure training. One company hired consultants because their team couldn't handle the migration.

**Training and enablement**: Upskill before, during, and after. Hands-on labs, not just presentations.

**Communication**: Set expectations. Migration will be disruptive. Involve stakeholders early.

Real story: A team sabotaged migration by not cooperating. They delayed by 6 months because they didn't want to learn new tools.

## Migration Execution and Tools

**Azure Migrate**: For assessment and migration. It discovers, assesses, and migrates VMs.

**Azure Resource Manager**: Infrastructure as code for repeatable deployments.

**Monitoring**: Application Insights for apps, Log Analytics for infrastructure.

**Testing**: Validate post-migration. Load test, functional test.

Workflow: Assess → Plan waves → Migrate pilot → Migrate production → Validate → Optimize.

## Lessons Learned and Best Practices

**Start small**: Pilot migrations prove your process.

**Measure everything**: Performance, cost, user impact.

**Have rollback plans**: Always.

**Involve stakeholders**: Early and often.

**Never migrate during peak season**: Plan around business cycles.

**Document everything**: Dependencies, configurations, decisions.

**Test thoroughly**: Don't assume it works.

**Have a migration team**: Dedicated people, not part-time.

## Conclusion

Azure migration is a marathon, not a sprint. It requires technical planning, organizational change, and patience. The teams that succeed are the ones that learn from failures, adapt their plans, and treat it as a transformation, not just a move.

Start by assessing your environment honestly. Choose the right strategy for each workload. Plan waves carefully. Expect surprises in networking, security, data, and costs. Invest in your people.

If you're considering migration, do a pilot first. Learn what you don't know. Then scale up. The cloud benefits are real, but you have to earn them through careful execution is powerful but expensive and risky. A logistics company refactored their tracking system during migration. It took 18 months and doubled the budget, but now they can scale to 10x traffic without issues.

**Repurchase** means switching to SaaS. Instead of migrating your email server, use Exchange Online. A manufacturing firm I worked with had a custom CRM. They switched to Dynamics 365 instead of migrating. Saved them 2 years of work and ongoing maintenance.

**Retire** is decommissioning stuff you don't need. Most companies have 20-30% of their infrastructure that's unused. One team found 50 VMs that hadn't been touched in 2 years. They retired them, saving $100K/month.

**Retain** is keeping things on-premises. Maybe you have specialized hardware, or compliance requirements that Azure can't meet yet. A defense contractor retained their classified systems on-premises while migrating everything else.

The key lesson: Start with rehost for speed, then replatform or refactor based on what you learn. Don't try to refactor everything upfront—that's how projects fail.

## Migration Waves: Don't Boil the Ocean

Trying to migrate everything at once is a recipe for disaster. Break it into waves based on complexity, risk, and dependencies.

**Wave planning**: Group applications by how hard they are to migrate and how critical they are. Low-risk, low-complexity first. High-risk, high-complexity last.

**Pilot wave**: Pick 2-3 simple apps for your first wave. Test your process, tools, and team. A retail company did a pilot with their dev environment. It went smoothly, but they learned their VPN wasn't stable enough for production.

**Production waves**: Business-critical systems go last, after you've ironed out the kinks. Have rollback plans for each wave—what if it fails? Can you switch back to on-premises quickly?

Real case: A healthcare provider did Wave 1 with non-critical apps. Success. Wave 2 included their patient portal. Disaster— they missed a dependency on an internal DNS server. The portal was down for 4 hours. They had to rollback and fix the dependency mapping.

## Networking Challenges: Connecting Your Worlds

Networking is where Azure migrations get complicated. Your on-premises network is a known quantity; Azure's is different.

**VPN vs ExpressRoute**: VPN is cheap and easy but limited in bandwidth and reliability. ExpressRoute gives you dedicated bandwidth but costs $500-2000/month per connection. A logistics company used VPN for their initial migration. It worked for small data, but when they tried to sync their warehouse database, the VPN kept dropping, causing sync failures. They switched to ExpressRoute mid-migration.

**Hybrid connectivity**: You need site-to-site VPNs or ExpressRoute to connect Azure to your datacenter. Point-to-site for remote users. The complexity is in routing—making sure traffic flows correctly between environments.

**DNS migration**: Internal DNS vs external. Split-brain DNS (where internal and external resolve differently) is common. One team migrated DNS but forgot to update internal references. Apps couldn't find each other for 2 days.

**Firewall rules**: Migrating security policies is tedious. Azure NSGs are different from on-premises firewalls. A financial firm had 500+ firewall rules. They migrated them manually and missed some, exposing services accidentally.

## Security and Compliance Pitfalls

Security in Azure is different from on-premises. You have to rethink access controls and encryption.

**Identity migration**: Moving from Active Directory to Azure AD is tricky. Hybrid identity (Azure AD Connect) is common but complex. One team migrated identity but didn't sync properly. Users couldn't log in for a day.

**Access controls**: RBAC in Azure is granular but easy to misconfigure. Least privilege is harder to enforce. A retail company gave everyone contributor access initially. Someone accidentally deleted a resource group, costing $50K in downtime.

**Encryption**: Data at rest and in transit. Azure encrypts storage by default, but you need to configure it for databases and VMs. A healthcare provider migrated patient data without proper encryption. They got audited and had to re-encrypt everything.

**Compliance**: Choose the right regions. Azure has sovereign clouds for government. Make sure certifications match your needs. A European company put data in US regions, violating GDPR. They had to move it.

## Data Migration Nightmares

Moving data is the part that takes the longest and costs the most.

**Bandwidth limitations**: Your internet connection is the bottleneck. A 100Mbps connection can move 900GB/day max. For 50TB, that's 55 days. One company tried to migrate over their corporate internet. It took 3 months and slowed down their business network to a crawl.

**Downtime windows**: Business impact is huge. You can't take systems offline forever. Plan for minimal downtime—use tools like Azure Database Migration Service for online migrations.

**Data consistency**: During migration, data is changing. How do you sync? One team migrated a database but forgot ongoing transactions. They lost 2 hours of data.

**Tools**: Azure Data Box for large transfers (ship disks). DMS for databases. Custom scripts for everything else. But tools have limits—DMS can't handle complex schemas sometimes.

Real disaster: A media company migrated 200TB of video content. They used Data Box but underestimated shipping time. Content was unavailable for a week during peak season.

## Application Compatibility Issues

Just because it runs on-premises doesn't mean it runs in Azure.

**OS dependencies**: Azure supports most Windows/Linux versions, but not all. Custom kernels or drivers might not work. A manufacturing app used a specific Linux kernel module that Azure didn't support. They had to refactor it.

**Software licensing**: BYOL (bring your own license) vs pay-as-you-go. SQL Server licenses are expensive if you BYOL wrong. One team brought licenses but didn't activate them properly. They got billed for Azure's SQL.

**Custom code**: Hardcoded IPs, file paths, assumptions about local storage. An app assumed /tmp was persistent. In Azure VMs, it's not. It crashed after restarts.

**Performance changes**: Azure VMs have different CPU/memory ratios. Storage is network-attached, not local. An app optimized for local SSDs ran slow on Azure premium storage.

## Performance and Scalability Surprises

Performance often degrades after migration, and scalability isn't automatic.

**Latency increases**: On-premises, everything is local. In Azure, cross-region traffic adds 50-200ms. A global app saw response times double.

**Throughput changes**: Network storage vs local. Database queries that were fast became slow due to network round trips.

**Auto-scaling**: It works, but not instantly. Lag in scaling can cause outages during spikes. One e-commerce site got a traffic spike during migration testing. Auto-scaling took 5 minutes; they had an outage.

## Cost Surprises: The Bill Shock

Cloud costs are different, and surprises are common.

**Egress charges**: Data leaving Azure costs money. A company with global users paid $20K/month in egress they didn't expect.

**Reserved instances**: Buy upfront for discounts, but timing matters. One team bought RIs after migration and saved 40%, but they bought too many and had unused capacity.

**Storage costs**: Hot storage is expensive. Cool/archive is cheap, but access is slow. A backup company migrated 1PB of data to hot storage. Monthly cost was $50K instead of $5K on cool.

Real example: On-premises $200K/month became $350K in Azure due to poor planning. They fixed it by rightsizing and using RIs, dropping to $250K.

## The Human Factor: Organizational Change

Technical migration is the visible part. The human side determines success.

**Resistance to change**: People are comfortable with what they know. "We've always done it this way." A team resisted Azure because they didn't trust cloud security. Education helped, but it took 6 months.

**Skill gaps**: On-premises skills don't transfer. Teams need Azure training. One company hired consultants because their team couldn't handle the migration.

**Training and enablement**: Upskill before, during, and after. Hands-on labs, not just presentations.

**Communication**: Set expectations. Migration will be disruptive. Involve stakeholders early.

Real story: A team sabotaged migration by not cooperating. They delayed by 6 months because they didn't want to learn new tools.

## Migration Execution and Tools

**Azure Migrate**: For assessment and migration. It discovers, assesses, and migrates VMs.

**Azure Resource Manager**: Infrastructure as code for repeatable deployments.

**Monitoring**: Application Insights for apps, Log Analytics for infrastructure.

**Testing**: Validate post-migration. Load test, functional test.

Workflow: Assess → Plan waves → Migrate pilot → Migrate production → Validate → Optimize.

## Lessons Learned and Best Practices

**Start small**: Pilot migrations prove your process.

**Measure everything**: Performance, cost, user impact.

**Have rollback plans**: Always.

**Involve stakeholders**: Early and often.

**Never migrate during peak season**: Plan around business cycles.

**Document everything**: Dependencies, configurations, decisions.

**Test thoroughly**: Don't assume it works.

**Have a migration team**: Dedicated people, not part-time.

## Conclusion

Azure migration is a marathon, not a sprint. It requires technical planning, organizational change, and patience. The teams that succeed are the ones that learn from failures, adapt their plans, and treat it as a transformation, not just a move.

Start by assessing your environment honestly. Choose the right strategy for each workload. Plan waves carefully. Expect surprises in networking, security, data, and costs. Invest in your people.

If you're considering migration, do a pilot first. Learn what you don't know. Then scale up. The cloud benefits are real, but you have to earn them through careful execution.
