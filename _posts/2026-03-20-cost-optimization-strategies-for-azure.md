---
layout: post
title: "Cost Optimization Strategies for Azure"
date: 2026-03-20
tags: [azure, finops, cloud]
---

I've spent the last three years helping companies wrestle with Azure bills that somehow kept growing despite claims that cloud was supposed to be cheaper. The pattern I kept seeing? Teams built systems that worked, deployed them to Azure, and then... nobody looked at the cost side again. The CEO sees a $2.4M quarterly bill and panics. The engineering director gets pressure to "cut cloud spending." And then you have engineers optimizing code efficiency when the real problem is a $6K/month D14 VM that's running at 3% CPU.

Here's the thing: cloud costs aren't destiny. I've seen companies cut their Azure spend by 30-40% without reducing capability, without moving slower, without compromising on reliability. It's not magic—it's just the difference between passive consumption and intentional cost management. And it's something every engineer can participate in, not just FinOps people.

This post walks through the strategies that actually work, grounded in real scenarios I've encountered. Some are technical. Some are organizational. Most require both.

## Understanding Reserved Instances and Commitment Pricing

The single biggest opportunity for most companies is making better decisions about when to pay upfront and when to pay as you go.

Reserved Instances are straightforward in concept: you commit to paying for a certain amount of compute for either one year or three years, and Azure discounts the hourly rate. The discount is substantial—around 30% for a 1-year commitment, around 50% for 3-year. That sounds great. But here's where it gets tricky.

The catch is that you're making a bet. A bet that you'll actually need that capacity. A bet that the workload won't change. A bet that you won't need to upgrade to a different instance type. Get that bet wrong, and you're locked into paying for something you're not using.

I once watched a team buy 100 reserved A2 instances for three years because that's what their models showed they'd need. Smart move, seemed reasonable. Then six months later, the product pivoted, traffic patterns changed, and they realized they actually needed D4 instances instead. They were stuck with those A2 reservations. They could've sold them on the Azure marketplace, but the market wasn't kind to their particular reservation, and they took a 30% loss. Now they're paying for both the A2s (which they don't need) and the D4s (which they do). That one mistake cost them somewhere around $400K over the remaining two and a half years.

So how do you actually use Reserved Instances correctly?

**Start with data.** Don't predict your needs—measure them. Spend two to three months collecting actual usage metrics. What instance types are you running? Are they consistently running all day every day? Do they scale seasonally? What's the trend?

**Use flexibility.** Azure offers different levels of flexibility with reservations. You can buy a reservation for a specific instance type in a specific region, or you can buy them with more flexibility—same family of instances across regions. More flexibility means you can weather changes better, but you pay a slightly higher price for that flexibility.

**Mix your commitments.** Most teams don't use a pure strategy. Instead, they might buy 1-year reservations for core workloads that are definitely stable, and they handle spiky demand with on-demand or spot instances. That gives them the bulk discount on the predictable stuff without overcommitting to something that might change.

**Consider the upgrade path.** If you buy reserved instances and then realize you need different ones, Azure has an exchange process. It's not free, but it's better than eating a full loss. You can also resize reservations within certain constraints, or apply them to different instance types in the same family.

**Watch the market.** Azure's pricing and discounts change. New instance types get released. Sometimes the discount for a 1-year reservation actually makes more sense than the 3-year. It's not a set-it-and-forget-it decision—check in quarterly at minimum.

The financial impact is real. A team I worked with had about 200 VMs running various workloads. Their on-demand spend was around $800K per month. After analyzing patterns, they committed to 140 VMs via 1-year reservations, kept 60 as on-demand for flexibility. Their monthly bill dropped to around $580K. That's $220K per month in savings, or $2.6M per year. Not by cutting workloads. Not by shutting services down. Just by making smarter purchasing decisions.

## Right-Sizing VMs: Your Most Expensive Source of Waste

VM over-provisioning is the silent cost killer of most Azure environments. I've reviewed probably 200+ Azure environments by now, and I can count on one hand the number where teams right-sized their VMs. Most of them ran what looked like "safe" instance types that they picked months or years ago and never touched again.

The mentality is pretty understandable: "We're not sure exactly what we'll need, so let's pick something beefy. We can always downsize later if it's too much." And then later never comes. The VM runs fine, so why mess with it? Six months in, it's been running at 3% CPU and 12% memory for the entire time, and nobody's thinking about it. By then it's just a line item on a bill.

Here's the real problem: you can't optimize what you can't see. You need actual data about what your workloads are actually using, not what you thought they'd use.

Azure Advisor can help here, but it's a starting point, not a solution. Azure Advisor looks at your actual utilization metrics and makes recommendations. But it's conservative by design—it won't recommend downsizing something where there's any risk. It also tends to flag obvious situations where utilization is near zero.

To really do this well, you need to get into the data yourself. Azure Monitor and Log Analytics let you query actual performance metrics. Here's a basic query to see CPU utilization by VM over time:

```kusto
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| where Computer startswith "prod"
| summarize avg(CounterValue) as AvgCPU, max(CounterValue) as MaxCPU 
  by Computer, bin(TimeGenerated, 1d)
| where TimeGenerated > ago(30d)
| summarize AvgCPU30d = avg(AvgCPU), MaxCPU30d = max(MaxCPU) 
  by Computer
| sort by AvgCPU30d asc
```

Run this and you'll almost always find VMs that are sitting at single-digit CPU utilization. Memory is usually a better indicator—if you're sitting at 20% memory utilization, that instance is way too big. But CPU rarely lies. If you're running at 5% average CPU, you don't need that D4. You probably need a B2 or B4.

The financial impact is significant. A D4s v3 costs roughly $350/month on demand. A B2s costs about $60/month. That's a $290/month difference per VM. If you have 50 over-provisioned D4s that should be B2s, that's $14,500/month. Multiply by 12 and you're talking about $174K/year in pure waste.

But here's where reality gets more complex. You can't just downsize willy-nilly. Application performance tuning, caching layers, and unexpected traffic spikes matter. A VM running at 3% average CPU might spike to 80% during batch jobs or traffic bursts. You need to understand the workload before you resize.

The right process looks like this:

1. **Collect two weeks of data** to understand normal patterns
2. **Identify candidates** where max CPU doesn't exceed 60% and average is under 30%
3. **Test the resize** on non-critical systems first, or during maintenance windows
4. **Monitor for two weeks** after resizing to make sure performance is still acceptable
5. **Size down gradually** if you're uncertain—go from D4 to D2 to B4, don't jump multiple sizes

I watched one team resize a cluster of 12 B4-sized VMs that they were running their legacy .NET applications on. Average CPU was running around 25%, max CPU hit 45%. They thought they could drop to B2s. They did, and within a week during a traffic spike, those B2s completely lost the plot. The application response times went through the floor. They had to resize them back up. The lesson: just because you *can* downsize doesn't mean you should. Sometimes paying $150/month per VM for reliability is worth more than saving $200/month and living in fear.

The wins are real, though. In one financial services environment, we right-sized about 80 VMs across their infrastructure. Average savings was about $140/month per VM. That's $11,200/month in savings, or $134K/year, just by matching instance size to actual workload demands.

## Beyond VMs: Compute Options You Might Be Missing

Not everything needs to run on a VM. But most people default to VMs because it's what they know.

App Service plans are an underrated option for a lot of workloads. If you're running web applications, APIs, or background jobs that fit within App Service constraints, it's often cheaper and way less operational overhead than VMs. App Service handles scaling, patching, deployment for you. You pay by compute tier, not by the minute. B1 through B3 plans are pretty cheap—we're talking $15-50/month depending on the tier. Compared to running that same workload on a B4 VM ($130/month), you're saving money and getting more reliability.

Azure Functions are even more extreme in that direction—serverless, pay per execution, huge cost savings if your workload is actually bursty or batch-like. The problem is they're easy to misuse. A function that runs 1000 times per day at 100ms each is brilliant on Functions. A function that runs continuously is better on App Service or a VM because Functions has latency overhead and you'll end up paying more.

Azure Kubernetes Service (AKS) is complex, but if you have container workloads, it's usually cheaper than running them on individual VMs. You pay for the compute nodes (which you can right-size and scale just like VMs) plus a modest per-cluster management fee. The scaling capabilities let you shed compute quickly when demand drops, which you can't really do with static VMs.

Azure Batch is perfect if you have heavy compute workloads that can tolerate delays. Use low-priority nodes (which are even cheaper than spot instances in some cases) to run batch jobs when spare capacity exists. I've seen organizations run their entire ML training pipeline on Batch nodes, paying a fraction of what they would for always-on dedicated compute.

The trick is matching the tool to the workload. A stable web application? App Service or VMs with reserved instances. Bursty API endpoints? Functions. Batch machine learning jobs? Batch with low-priority nodes. Kubernetes cluster with variable load? AKS with a mix of reserved instances and spot nodes. Get the wrong tool and you'll pay more, not less.

## Hybrid Benefits and License Mobility: Uncovering Hidden Discounts

This one costs companies millions because it's easy to miss if you don't know to look for it.

Azure Hybrid Benefit is essentially Microsoft saying "We know you already own expensive software licenses. Bring them to Azure and we'll give you a discount because we don't have to license you separately." It works for Windows Server licenses, SQL Server licenses, and licenses from some other vendors.

The math on this can be stunning. If you have Software Assurance on Windows Server and SQL Server licenses (which you probably do if you're an enterprise with a Microsoft agreement), you can apply those to your Azure VMs and cut your licensing costs significantly.

Let's say you're running SQL Server Standard on a D4s v3 VM. If you pay the standard Azure rate, you're looking at about $400/month for the compute plus $200/month for the SQL Server license (roughly—depends on region). That's $600/month. If you apply your existing SQL Server license via Hybrid Benefit, suddenly you're just paying the compute cost—$400/month. That's 33% savings on that one VM, and if you have 50 SQL Server VMs, that's $10K/month in savings. Multiply by 12 and you're talking about $120K/year.

The catch is you need to verify that you actually own the licenses and they're currently licensed. An audit discovery that you're using Hybrid Benefit on licenses you don't actually own is not a fun conversation with Microsoft's licensing team. But if you have proper Microsoft agreements with Software Assurance (SA), you're almost certainly eligible.

One more thing: Hybrid Benefit also extends to other open-source software. If you have SUSE or RHEL subscriptions through Microsoft agreements, you can apply those to your Azure VMs. It's less dramatic than the Windows/SQL Server savings, but it adds up if you're running a lot of Linux workloads.

We helped an organization audit their licensing situation and discovered they had $2.1M in unused SQL Server licensing that they could apply to Azure via Hybrid Benefit. They weren't missing the licenses—they just hadn't made the connection. After the audit and policy change, their Azure SQL licensing costs dropped by about 40%. That's the kind of win that looks magical but is really just paying attention.

## Spot Instances and Low-Priority VMs: Extreme Discounts for the Right Workloads

Spot instances are Azure's way of letting you run VMs at a massive discount—typically 50-70% off normal pricing, sometimes even deeper. The catch? Azure can evict you whenever they need the capacity back. You might get a 30-second warning, or you might just get shut down.

This sounds terrible until you realize there are workloads where it doesn't matter. Your CI/CD agents? Perfect for spot instances. You lose one mid-build, you just spawn another one. Development environments? Spot works great. Batch processing? Ideal. Your production database serving customer requests? Do not use spot for this.

The risk calculation is pretty straightforward. If you can handle interruption and restarting a VM in a few minutes, spot instances make financial sense. If you can't, they don't.

I've seen teams drop their CI/CD infrastructure costs by 70% just by switching their build agents to spot instances. They were running 10 D2s constantly for builds, costing about $300/month. Switched to spot instances, kept the same build throughput, and the cost dropped to about $90/month. The build pipeline was occasionally interrupted when Azure evicted instances, but the recovery was automatic—a new instance would spin up and the build would retry. Net result: more reliable (fewer resources, so more focus), cheaper, and barely any operational complexity.

Spot instances make even more sense if you pair them with Azure Batch or with Kubernetes spot node pools. AKS let's you define node pools that use spot instances, and Kubernetes will schedule non-critical workloads on spot and migrate them off if eviction happens. It's remarkably elegant.

For batch workloads, Microsoft's low-priority compute nodes (which are even cheaper than spot VMs in some cases) are purpose-built. You define a batch job that can run on low-priority nodes, and you get access to spare Azure capacity at a steep discount. It's particularly useful if you have machine learning training jobs or other compute-heavy work that can tolerate delays.

One organization I worked with had a nightly ETL pipeline that was processing terabytes of data and costing them about $8K/month to run on always-on compute. They moved the workload to Azure Batch with low-priority nodes. Same workload, same amount of data processed, but now it runs for about $1.5K/month. The pipeline takes an extra hour sometimes due to evictions and rescheduling, but they're running it at 2 AM anyway, so nobody notices.

The key is being honest about which workloads can tolerate interruption and which can't. Don't try to sneak a critical service onto spot and hope it works out. But do look for places where interruption is actually not a big deal—there are usually more of them than you think.

## Storage: The Category Nobody Thinks About Until the Bill Arrives

Cloud storage seems cheap until you realize you have petabytes of data sitting in hot storage tiers that nobody's touched in a year.

Azure storage tiers exist for a reason. Hot storage is pricey but fast—good for data you access frequently. Cool storage is cheaper but slower—good for data you'll access occasionally. Archive storage is extremely cheap but very slow—good for compliance backups and historical data you'll probably never need. The price difference is dramatic. A gigabyte of hot storage costs about $0.021/month. Cool storage is about $0.011/month. Archive storage is about $0.004/month. For a terabyte of data, that's the difference between $21, $11, and $4 per month. Multiply that by a petabyte, and suddenly you're talking about real money.

Most people just throw data into hot storage and call it done. Then three years later they realize half of it hasn't been touched since upload.

The way to solve this is lifecycle policies. You define rules: if this blob hasn't been accessed in 30 days, move it to cool storage. If it hasn't been accessed in 90 days, move it to archive. Azure handles the movement automatically on a schedule. You don't have to think about it.

One organization I worked with had about 40 terabytes of blob storage in hot tier. They weren't sure what they needed to keep, so they just kept it all hot. We implemented lifecycle policies that automatically moved data to cool after 30 days and archive after 90 days. About 60% of their storage moved to archive tiers. Their monthly storage cost dropped from about $840 to about $420. That's $420/month in savings, or about $5K/year, just by moving data that nobody was touching anyway.

There are other storage optimization opportunities too. Snapshots of managed disks and backups can accumulate. You create a snapshot "just in case," and then six months later you have 47 snapshots of the same disk. They're cheap individually but they add up. Implement retention policies and clean them up.

Data redundancy also matters. Locally redundant storage (LRS) is the cheapest. Geo-redundant storage (GRS) costs more because data is replicated across regions. Zone-redundant (ZRS) is in between. Most people default to GRS "just in case" without thinking about actual recovery requirements. If you have another way to recover data (backups, database replication elsewhere), LRS is often sufficient and costs notably less.

For managed disks, you're choosing between Standard HDD, Standard SSD, and Premium/Ultra SSD. Standard HDDs are old and slow but cheap. Standard SSDs give you decent performance without the premium price. Premium is for databases and high-I/O workloads where performance matters. I've seen people run application servers on Premium disks "just to be safe" when they'd benefit the same from Standard SSDs at a fraction of the cost.

## Network Costs: The Hidden Killer in Your Cloud Bill

Here's a cost that surprises people because they don't think to look for it: data egress. When you move data out of Azure, you pay. When you move data between regions, you pay. When you move data across zones, you might pay depending on how you're doing it.

This matters more than you'd think. If you have a web application in Azure serving global traffic, that data has to go out to the internet. You pay for every GB. If you have multiple Azure regions and they're talking to each other, you pay for inter-region transfers. If you're syncing data with on-premises infrastructure, you pay.

A typical egress charge is around $0.02 per GB. Doesn't sound like much. But if you're serving a popular web application to millions of users, gigabytes add up fast. If you're serving 1 terabyte of data per day to customers, that's about $20K per month just in egress fees. That's $240K per year.

The solution is usually a content delivery network (CDN). Put your content on an Azure CDN, and end users download from a nearby edge location instead of from your Azure datacenter. You pay for CDN throughput (which is cheaper than direct egress) and CDN requests, but you typically save on egress. For one organization, implementing a CDN reduced their egress costs by 40% and the CDN fees paid for themselves in about 3 months. After that, it was all profit.

Inter-region data transfer is another one. If you're replicating data between regions for redundancy, you're paying for that traffic. The cost varies depending on how you're doing it. Database replication, storage replication, and explicit data copies all have different costs. Sometimes ExpressRoute—a dedicated network connection to Azure—makes sense. If you're consistently moving multi-terabytes of data between on-premises and Azure, the monthly fee for ExpressRoute can pay for itself compared to internet egress.

Virtual network peering is usually free (or very cheap) for communication within the same region, but across regions you pay per GB transferred. Most teams implement inter-VNet communication thoughtfully to avoid unnecessarily expensive cross-region traffic.

One manufacturing organization was syncing large files between their on-premises data center and Azure. They were paying about $4K/month in egress fees. They implemented ExpressRoute, which cost $500/month, and dropped their egress fees to near zero because the data was now flowing over the private connection. They saved $3.5K/month, or $42K/year, by investing in the infrastructure.

## Auto-Shutdown and Scheduling: Easy Wins for Non-Production Workloads

This is the kind of optimization that feels almost too simple, but it works.

Development and test environments don't need to run 24/7. You build it during working hours, you test it, you shut it down. You could do this manually, but you're going to forget half the time. Better to automate it.

Azure's auto-shutdown feature lets you define a schedule for VMs: shut down at 10 PM every weeknight, for example. You can configure it per-VM, or you can use Azure Policy to enforce it across your entire subscription. Just that alone—dev environments shut down when people leave for the day—can reduce non-production costs by 60-65%.

I've seen organizations apply auto-shutdown to entire resource groups of dev/test infrastructure and watch their non-production costs drop by two-thirds without affecting any actual development work. Teams still had the resources available during business hours, but they weren't burning money for 8 hours a day when nobody was using them.

The catch is that auto-shutdown breaks some workflows. If your developers expect to deploy something at 11 PM and have it ready for testing, auto-shutdown means they can't. If you have long-running batch jobs scheduled for evenings, auto-shutdown interferes. So think through the actual usage patterns before you implement it.

One team we worked with had developer VMs auto-shutting down at 6 PM every day, but developers in India who were in different time zones needed those VMs running during their working hours. We refined the policy to shut down during their off-hours but keep them running during actual business hours across all regions. It reduced costs and kept everyone happy.

You can use Azure Logic Apps or runbooks for more sophisticated scheduling too. "Run this workload from 8 AM to 6 PM Monday through Friday, and completely shut it down on weekends." That's more complex but worth it if you have large non-production environments.

The financial impact is straightforward math. If you have 15 dev VMs running at $100/month each, that's $1500/month. If you shut them down outside of business hours (16 hours per day), you're paying for only 33% of the time, so $500/month. That's $1000/month in savings, or $12K/year, without any feature loss.

## Tags, Chargeback, and Making Costs Visible

You cannot optimize what you cannot see. The teams that cut their cloud costs the most aren't the teams with the cleverest technical tricks—they're the teams where everyone can see what things cost.

A tagging strategy sounds bureaucratic and annoying, but it's actually about enabling visibility. If you tag every resource with the cost center that owns it, you can generate a report at the end of the month showing each cost center exactly what they spent. That visibility changes behavior. When a team sees they spent $50K on Azure last month, they suddenly care more about whether that D4 VM is actually being used.

The tags that matter most are usually:

- **Cost center or business unit**: Who owns this cost?
- **Environment**: Is this production, staging, or development?
- **Project or product**: What product does this support?
- **Owner**: Who's responsible if something's wrong?
- **Application**: What specific application is this running?

If you're trying to do real chargeback (actually billing departments for the cloud costs they use), you might add more detail, but honestly, those five tags get you 80% of the way there.

The hard part isn't defining the tags—it's enforcing them. If tagging is optional, people will have a reason why their resource doesn't need tags. If it's required, you'll make some people annoyed initially, but you'll get clean data.

Azure Policy can enforce tagging. You create a policy that says "No resource can be created without these specific tags," and Azure will block the creation if tags are missing. That might sound draconian, but it works. After a week of complaints, most teams learn to add tags.

One organization we worked with had fairly clean cost tracking but couldn't figure out who was spending what. They implemented required tagging policies, and suddenly they could see that one particular project had 89 abandoned resources sitting around costing about $15K/month. The project had shipped months ago, but the test infrastructure was left running. Once it was visible, they cleaned it up in a day and saved $15K/month. That visibility paid for the tagging effort a thousand times over.

The organizational aspect of this is as important as the technical side. When teams see costs attached to their names, behavior changes. Not in a punitive way—in a "we should probably clean this up" way. I've seen teams spend an afternoon going through their resources and deleting things they'd forgotten about, saving thousands per month.

Some organizations implement full chargeback models: you allocate costs back to departments or projects at the end of each month, and they see it on their bill. More advanced organizations use real-time cost visibility dashboards—teams can see, day-by-day, what they're spending. That's even more effective because the feedback loop is tighter.

The risk is over-doing it and creating so much process that nobody has time to actually build things. One team I worked with went overboard with their chargeback system and wound up with so many approval steps that engineers basically stopped deploying because it was faster to ask for approval than to just do it and apologize later. Balance visibility with enablement.

## Monitoring, Alerts, and Governance: Actually Preventing Surprises

Once you have visibility into costs, the next step is making sure expensive mistakes don't happen in the first place.

Azure Cost Management + Billing is the official tool for this. It's not glamorous, but it works. You can see your current month's spending by resource, service, resource group—whatever level of detail you want. You can see trends. Most importantly, you can set budget alerts.

Budget alerts are simple and effective. You say "I expect to spend $50K this month," and Azure will send you an alert when you hit 50%, 75%, 90%, and 100% of that budget. Sounds simple, but it works. Alert at 75% gives you time to investigate and fix things before you hit your limit.

Spending anomalies are worth looking for. Azure has an anomaly detection feature that analyzes your spending history and lets you know if today's spending is unusually high. Usually it's noise, but occasionally you spot something real. I saw one team get an anomaly alert and trace it back to a configuration error that was spinning up 100 test VMs instead of 1. They would have run for a week without noticing if not for the alert. That alert saved them probably $2K.

Policy enforcement is the other dimension. You can use Azure Policy to prevent expensive decisions. "Never allow Premium_v3 App Service plans except with explicit approval." "Never allow VMs larger than D4 without a business justification." "Every VM must have auto-shutdown enabled." These policies won't make you popular, but they prevent folks from accidentally (or intentionally) provisioning infrastructure that shouldn't exist.

Role-based access for cost visibility is important too. You don't need a finance degree to understand your department's cloud spending, but that doesn't mean everyone needs to see everyone else's costs. Granular RBAC on cost data matters.

One organization implemented policies that said "No P-series (Premium) managed disks without approval from the infrastructure team." Sounds restrictive, but it prevented the pattern of developers thinking "I'll just make this P1 disk, performance is more important than cost." The default became Standard SSD, which is fine for most workloads, and only genuinely high-performance workloads got Premium. It reduced their managed disk costs without hurting performance.

## FinOps: The Human Side of Cost Optimization

Here's the thing nobody talks about: cost optimization is as much culture as it is technology.

If your organization treats costs as something that Finance cares about, not something engineers care about, you'll never fully optimize. If engineers build systems without thinking about cost and then operations and finance have to manage the bill, you've already lost.

Building cost awareness into your team requires a few things. First, make sure engineers actually know what things cost. A lot of engineers have no idea that a D14 VM costs $450/month. Show them. "We spend $450 a month on that VM. It's running at 3% CPU. We could drop it to a B2 for $60/month and save $390." Suddenly it becomes real.

Second, make cost part of architecture decisions. When you're designing a system, ask: "What's this going to cost?" Not as a veto, but as a constraint like availability or latency. If you have two architectural approaches, and one costs 3x more than the other for the same outcome, maybe pick the cheaper one. Or at least make a conscious decision not to.

Third, celebrate wins. When someone optimizes something and saves the company money, acknowledge it. Make it part of your values. "We shipped this feature and kept costs down while scaling it" is worth celebrating.

Avoid blame. Never corner an engineer in front of their peers and point out they provisioned expensive infrastructure. That just breeds resentment and makes people defensive. Cost discussions should be data-driven and blameless. "Hey, we notice this resource is sitting at low utilization. Want to take a look at it?" is different from "Why are you wasting money on this?"

The worst approach is going to an engineer and saying "Your feature costs too much to run, shut it down." Without building cost awareness and treating it as a shared problem, you just look like Finance being annoying. Build cost awareness first, then the team helps you solve the problem.

One team I worked with had a tradition of doing a "cost deep dive" once a month. They'd pull up the cost dashboard, look at the month's spending, and just discuss it. Not to assign blame, but to understand what drove the costs. "Why did networking costs spike?" "Oh, we had an integration test that was replicating data between regions, that's expected." "Okay, cool." It's a small thing, but that team had the lowest cost per transaction of any team in the company because costs were actually top-of-mind.

## Practical Steps: The 90-Day Cost Optimization Plan

If you're starting from scratch, you don't need to boil the ocean. Here's a practical 90-day plan that builds momentum:

**Week 1-2: Quick Wins**
- Turn on auto-shutdown for all dev/test environments. Use Azure Policy to make it mandatory. Budget: 10 hours of work, savings: $10-20K per month for most organizations.
- Find and delete unattached disks, orphaned NICs, and unused storage accounts. These are pure waste. Budget: 5 hours, savings: $500-2K depending on how messy your environment is.
- Implement required tagging policy for new resources. Start with just the cost center tag. Budget: 3 hours, savings: enables all future analysis.

**Week 3-4: Visibility**
- Set up Azure Cost Management dashboards for executives and team leads. Budget: 8 hours, savings: enables right decisions in the future.
- Implement budget alerts. Start with the current month's spending as the baseline. Budget: 2 hours.
- Set up basic chargeback or showback reports if you haven't already. Budget: 6 hours.

**Week 5-8: Technical Optimization**
- Right-size VMs. Start with production because the savings are bigger. Use Azure Monitor queries to identify candidates. Budget: 40 hours for a medium-sized organization, savings: $5-20K per month.
- Analyze Reserved Instance opportunities. Look at 1-year commitments for workloads with stable usage patterns. Budget: 10 hours, savings: $2-10K per month depending on your scale.
- Implement storage lifecycle policies for old data. Budget: 5 hours, savings: $500-5K per month depending on data volumes.

**Week 9-12: Strategic**
- Document your tagging strategy and implement retroactive tagging on existing resources. Budget: 16 hours.
- Identify workloads suitable for Spot instances or low-priority compute. Start with non-critical stuff like build agents. Budget: 12 hours, savings: $2-15K per month.
- Build a cost-conscious architecture review process. Make cost a standard part of design reviews. Budget: 6 hours of process definition.
- Consider Hybrid Benefits audit. If you have Microsoft licensing, you might be leaving money on the table. Budget: 4 hours of analysis, potential savings: $5-50K per month depending on your licensing situation.

The total effort is roughly 130 hours spread across a quarter. For most organizations, that yields $15-60K per month in savings. That's a 50:1 return on your investment in time. Not bad for a quarter's work.

## Conclusion: Cost Optimization is an Ongoing Practice

Here's the truth about cloud costs: there's no finish line. You don't optimize costs once and then it's done. Workloads change. New services get released. Your organization grows. The Azure catalog expands. Costs that were optimal last year might be suboptimal now.

The winners in cloud cost management aren't the people who run one big optimization project. They're the people who build it into their practices. Review costs monthly. Try one optimization per quarter. Celebrate wins and learn from mistakes. Make cost awareness part of your engineering culture.

And here's the practical reality: you don't need to get it perfect. If you're currently paying $1M per month for Azure, cutting that by 20% (to $800K) is worth doing even though you might not be able to optimize every single dollar. A 20% reduction is real money—$2.4M per year—and it's achievable through the strategies here without heroic effort.

Start with the quick wins. Build visibility. Make cost a shared responsibility. Then watch your bill start doing something that almost never happens in cloud environments: going down.
