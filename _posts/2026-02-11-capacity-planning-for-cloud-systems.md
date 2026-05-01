---
layout: post
title: "Capacity Planning for Cloud Systems"
date: 2026-02-11
tags: [architecture, operations, cloud]
---

Cloud elasticity is seductive because it promises infinite capacity. You can scale up whenever you need it, scale down when you don't, and pay only for what you use. The reality is messier. Your system will hit capacity ceilings you didn't anticipate. Database connections will exhaust faster than compute. Your cache will become a bottleneck. Regional limits will bite you when you expand geographically. And when capacity fails, it fails catastrophically, not gracefully, not with a warning, just suddenly your system can't handle the load.

Capacity planning in cloud is different from on-premises, but it's not optional. You still need to understand your demand patterns, map them to infrastructure, and validate that your system won't fall over under realistic load. The difference is that cloud lets you handle spiky demand with auto-scaling instead of building for peak, which is good. But it also masks the real constraints that still exist, which is bad if you don't know where they are.

This post walks through capacity planning as it actually works in cloud environments, the math, the tools, the things that typically go wrong, and the process for staying ahead of it.

## Understanding Your Demand Patterns

Before you size anything, you need to know what "normal" looks like. Most systems have patterns. Understanding those patterns is how you avoid over-provisioning for spikes that only happen once per quarter, and avoid under-provisioning for predictable peaks.

**Daily patterns** are usually the first thing you notice. Traffic is typically higher during business hours and lower at night. An e-commerce platform might see peak traffic around lunchtime when office workers are browsing during breaks. A B2B SaaS might see traffic when Europeans are working (morning US time) and when Americans are working (afternoon US time), with a lull in the middle of the night. These patterns matter because they tell you when you need capacity and when you can scale down.

**Weekly patterns** exist too. Retail traffic is often higher on weekdays and even higher on Fridays. Some businesses see Monday spikes (people catching up on email, starting projects). Social media platforms see different traffic on weekends, more casual browsing, less work-related usage. If you don't know your weekly pattern, you might assume Monday needs the same capacity as Friday when the opposite is true.

**Seasonal variations** can be huge. Tax software gets most of its traffic in March and April. Retail gets hammered during holiday shopping. Airlines see spikes around school vacations and holiday travel periods. Universities have dramatic capacity swings between semesters. If you're planning capacity without accounting for seasonal demand, you're either wasting money for months or you'll get caught under-provisioned during peak season.

**Growth trends** are important too. Are you growing 5% month-over-month? 20%? Are you flat? If you're growing, your capacity planning needs to account for that. If you grew 20% last month, do you expect to grow 20% again this month? Or is that unsustainable? Is there a natural ceiling? I've seen teams plan capacity for last month's growth rate and get surprised when it plateaus or accelerates.

**Multi-tenant complications** matter if you're a platform serving multiple customers. Your customers' traffic doesn't sync up nicely. One customer's peak might be 9 AM; another's might be 2 PM. You might think you have six medium customers with average load, but if they all do their monthly reporting on the 1st, you get a surprise spike. Or one customer might account for 30% of your traffic and not realize it, so their outage or heavy usage pattern affects your entire system.

Real example: A SaaS platform I worked with thought they understood their traffic patterns. They'd looked at average traffic and planned accordingly. Then a nationally televised commercial mentioned their product (unexpected fame, apparently), and traffic tripled in an hour. Their auto-scaling kicked in, but the database connection pool was exhausted before new app instances even spun up. They'd never looked at the 95th percentile of traffic, only the average. That one-hour spike forced them to re-architect their database connectivity.

**Getting the data**: CloudWatch, Application Insights, or whatever your platform provides will show you request rates, but drilling into patterns takes work. You need to look at hourly data, not just daily aggregates. Plot it for a month or more. Look at weekday vs weekend. Look at 99th percentile, not just average. Most teams have this data available but never look at it carefully enough.

## The Stateful vs Stateless Problem

Here's something that trips up every architect I know at least once: stateless and stateful systems have completely different capacity models, and most people don't account for this difference.

Stateless systems are lovely to scale. Your API instances don't care which request goes to which instance. They process it and move on. You can add or remove instances as needed. Load balancing is simple. Horizontal scaling works perfectly. You can decouple demand from resource availability, handle 10x traffic by spinning up 10x instances.

Stateful systems are different. If a user's session lives in an instance's memory, that instance needs to be available when the user's next request comes in. You can't just kill instances arbitrarily. You need session affinity (sticky sessions), which breaks horizontal scaling. Or you need to store sessions in a distributed cache like Redis, which becomes its own bottleneck.

When you have stateful systems, your capacity model changes. You can't simply say "we need 10 instances for 1000 requests/second." You need to think about session distribution, connection management, and how quickly sessions timeout.

One team I worked with was running a real-time collaboration platform where users' editing sessions were stored in-memory on each app instance. They'd designed it assuming they could scale horizontally, more requests meant more instances. In practice, it became a nightmare. When they tried to scale from 5 to 15 instances for peak traffic, existing sessions got disconnected because load balancing moved requests to new instances that didn't have that session. They had to implement sticky sessions, which defeated the purpose of horizontal scaling. When they tried to scale down, they had to gracefully drain instances (stop sending new requests, wait for existing sessions to exit). The whole thing became complicated and fragile.

The lesson: stateful systems need capacity planning for connection management, session distribution, and graceful shutdown. You can't treat them like stateless APIs.

Session storage affects this too. If you store sessions in-memory per instance, you're limited by how many sessions you can hold on a single machine, typically a few thousand depending on session size. If you store sessions in Redis, you need Redis capacity planning. If you store them in the database, you're adding database load that doesn't show up as straightforward queries. Each approach has capacity implications.

## Database Capacity: Where Most Systems Actually Break

Database is where theory meets reality and reality usually wins. Your app instances can scale horizontally, but your database is frequently the bottleneck.

**Connection pooling** is the first thing that gets you. Each app instance needs a connection to the database to execute queries. Most connection pool libraries default to something like 20-50 connections per instance. If you have 20 app instances with a default pool of 20 connections each, you're using 400 connections to your database. Your database has a maximum, often in the thousands, but not unlimited.

Here's the mistake I see constantly: someone spins up more app instances to handle higher load, and suddenly the database runs out of connections. The app instances are waiting to acquire a connection from the pool, requests queue up, response times balloon. The bottleneck isn't compute, it's database connections.

I worked with a team that scaled their app from 10 instances to 30 instances to handle peak traffic. They'd never adjusted the connection pool size. Each instance still tried to hold 20 connections to the database. Suddenly the database had 600 connection requests and a max of 500. Requests started failing immediately. They had to scale back down, reduce the pool size on each instance, and distribute the available connections. It should've been a simple scaling operation; instead, it was an incident.

**Read replicas** help but not the way people usually think. A read replica lets you distribute read queries, which reduces load on the primary database. But replicas have replication lag, writes happen on the primary, then replicate out to read replicas. If you need strongly consistent data, you can't use read replicas. If you can tolerate slightly stale data (which most systems can, for reads), read replicas are invaluable for capacity.

The problem people run into is that they set up read replicas but don't actually use them. Your ORM might need specific configuration to route reads to replicas. Or your connection strings default to the primary. Setting up read replicas and then routing all queries to the primary doesn't improve capacity, it just wastes money.

**Write capacity** is usually the real limit. If 90% of your traffic is reads, read replicas can handle the scale. But if your workload is 40% writes, you're stuck with the write capacity of a single database instance. You can't scale writes across multiple databases without sharding, which is complex and usually not worth it unless you're already at massive scale.

**Query patterns matter**. Simple key-value lookups have different capacity than complex joins across tables. If your traffic is mostly simple queries, your database can handle a lot of connections and requests. If it's complex analytical queries, you'll hit limits faster.

Real numbers: A database instance can typically handle somewhere in the range of 1000-10000 queries per second depending on query complexity, hardware, and whether they're reads or writes. If you're doing 5000 QPS and 60% of that is complex joins, you're going to start seeing latency issues and connection pool exhaustion way before you hit the theoretical max.

## Resource Mapping: From Demand to Infrastructure

Once you understand your demand, you need to figure out what infrastructure that requires.

The naive model is: X requests per second → Y app instances. But it's more complex because different parts of your system scale differently and have different limits.

Let's say you need to handle 50,000 requests per second at peak. Each app instance can comfortably handle about 5,000 RPS at your acceptable latency (let's say p99 under 500ms). That means you need 10 app instances for compute. Sounds straightforward.

But then: each request does 3 database queries on average. That's 150,000 QPS to your database. Your database can handle about 10,000 complex queries per second. So you need 15x the database capacity you thought. Suddenly a single database instance isn't enough.

So you add a read replica. Now reads (which are 70% of your traffic, let's say) go to the replica. That's 105,000 read QPS on the replica and 45,000 write QPS on the primary. The replica can handle 10,000 QPS, so you need another replica. Now you have 1 primary + 2 read replicas, and you're handling the queries, but replication lag is 50ms. Is that acceptable for your use case?

For caching: if you cache 30% of read results, you drop database load to 147,000 read QPS instead of 105,000. That's still 15,000 queries per second to the read replicas, so you still need 2 replicas. But now you need a cache cluster that handles 50,000 cache gets per second. A single Redis node can handle about 50,000 ops per second, so you're borderline. If your cache hit rate is 40% instead of 30%, you're fine. If it's 20%, you need more cache servers.

The point: capacity isn't just about compute. It's about understanding the cascade, compute → database → cache → storage → network. Each layer has limits and interactions.

## Cache Sizing and Eviction

Caching can dramatically improve capacity, but only if done right. A cache that doesn't improve hit rate is just waste.

**Cache hit rates** are the critical metric. If your cache hit rate is 10%, you're doing extra work maintaining the cache with minimal benefit. If it's 80%, you're probably onto something. Most well-tuned caches sit somewhere between 60-90% hit rate, depending on the workload.

Here's the trap: you size your cache without knowing your hit rate. You assume you'll get 80% hits, so you buy enough cache for that. Then in production, you discover your hit rate is 30% because you're caching things that change too frequently or aren't actually hot. Now you've overprovisioned cache and wasted money.

The right approach is to start with a small cache, measure hit rate in production, and size up from there. A cache that's 60% full with 80% hit rate is better than a cache that's 20% full with 70% hit rate. More data in the cache means better hit rates (usually), up to a point.

**Eviction strategies** matter. LRU (Least Recently Used) is common, when the cache is full, evict the thing that hasn't been accessed recently. LFU (Least Frequently Used) evicts things that are accessed rarely. FIFO (First In First Out) evicts the oldest item. Each strategy makes different assumptions about access patterns. For most web workloads, LRU works well. For workloads with distinct hot and cold data, LFU might be better.

**Cache coherency** becomes a problem when you have multiple caches or when data changes frequently. If you cache something for 5 minutes and it changes after 3 minutes, users see stale data. If you have multiple cache clusters, they need to stay in sync. Cache invalidation is famously hard, there are only two hard problems in computer science: cache invalidation and off-by-one errors.

I watched a team set up a massive Redis cluster (terabytes of data) expecting to solve all their performance problems. Turns out they were caching things that change constantly. Their cache hit rate was 15% and they were wasting terabytes of memory. They shrunk the cache down to gigabytes focused on truly hot data and hit rate jumped to 80%. Same workload, 1/100th the cache.

## Regional Capacity and Geographic Distribution

Most cloud systems start in a single region. Then they grow and you need to expand to other regions for latency, redundancy, or compliance reasons. This is when capacity planning gets really complicated.

**Single region capacity limits** exist but are far enough away that most people don't worry about them. AWS has a default limit on vCPUs per account per region (you can request increases). Azure has similar limits. Most teams will hit business constraints (cost, latency, regulatory) before hitting regional limits. But if you're running massive scale, regional limits are real.

**Multi-region complexity** is the issue. If your data lives in Region A and your users are in Region B, they experience latency fetching data. So you replicate data to Region B. But now your data is inconsistent, if you write in Region A and immediately read in Region B, you might get stale data. The replication lag is real.

If you need strong consistency across regions, you're limited by the speed of light and network latency. You can't make a write in Region A and have it immediately visible in Region B, that's a physics problem. Most systems accept eventual consistency (writes are eventually visible everywhere) and manage the inconsistency in application logic.

**Data affinity** matters. If all your user data lives in one region and all your inference workloads are in another region, you're constantly moving data between regions, paying for egress. Better to compute near the data.

**Cross-region replication costs** are substantial. Data transfer between regions typically costs $0.02 per GB or more, depending on which regions. If you're replicating terabytes per day, that's thousands per month in transfer costs alone.

**Failover** is expensive. Do you want hot-hot (both regions active, taking traffic)? Hot-standby (one region active, other ready to take over)? Warm-standby (other region has infrastructure but not running at full capacity)? Cold-standby (other region has backups, restart takes time)? Each approach has different capacity and cost implications.

A financial services company I worked with needed data in US and Europe for compliance and latency. They initially went hot-hot, fully replicating everything. The data replication costs were $18K/month and consistency issues were nightmare-inducing. They switched to hot-standby (primary in US, European region had warm resources but wasn't active). Replication is one-way, costs dropped to $4K/month, and consistency is simpler because the passive region isn't handling production load. Failover takes a few minutes, which is acceptable for their use case.

## Cost Modeling: When Capacity Planning Meets Finance

Capacity and cost aren't the same thing, but they're related. More capacity means more cost. The relationship isn't linear though, especially in cloud.

If you buy reserved instances, you get a discount for committing upfront. So the cost of base capacity (what you use 24/7) is cheaper than the cost of spike capacity (what you use occasionally).

Let's say your base load needs 5 instances, peak load needs 20. The math:

- 5 instances (base, reserved 1-year): ~$30K/year ($2,500/month)
- 15 instances (spike, on-demand): varies, but typically $100-150/month per instance, so roughly $150-225/month per instance average over the spiky period

If peak season is 2 months per year, you're paying the reserved rate for 12 months ($30K) plus on-demand for 2 months of spike capacity ($150 × 15 × 2 = $4,500), total ~$34.5K/year. If you tried to reserve for peak (20 instances reserved), you'd be paying for 20 × $30K/year = $600K/year, which is $7,200/month. That's way more expensive because you're paying the committed rate for capacity you only need 2 months per year.

This is why you see capacity models that include base, average, and peak:

| Metric | Instances | Duration | Cost/month |
|--------|-----------|----------|-----------|
| Base (always on) | 5 | 12 months | $2,500 |
| Average (most days) | 5 additional | 10 months | $2,500 |
| Peak (busy season) | 10 additional | 2 months | $1,500 |
| Average annual | | | $4,167 |

The key insight: planning for average capacity with spike handling (via on-demand or spot) is usually cheaper than planning for peak.

## Handling Unpredictable Spikes and Failure Modes

You can't predict everything. Markets crash, a competitor goes down and their traffic comes to you, a TV commercial mentions your product, a malicious actor targets your system with a botnet. Your capacity plan needs to handle the unpredictable.

**Circuit breakers** are your friend here. A circuit breaker is a pattern where you monitor the health of a downstream service and stop sending requests if it's degraded. If your database is timing out on 50% of queries, you circuit break, stop sending it new queries, start failing fast, let the database recover instead of piling on more traffic.

This prevents cascading failures. Without circuit breakers: Database gets slow → app instances timeout waiting for database → app instance connection pool fills up → new requests queue → memory usage spikes → app crashes → suddenly users can't connect to anything.

With circuit breakers: Database gets slow → circuit breaker detects high latency → stops sending queries → returns errors immediately → request fails fast → user gets error or fallback → database load drops → database recovers.

**Graceful degradation** is related. If the database is circuit breaker'd, can you still serve requests with cached data? Can you serve a degraded version of the page? Can you queue the request for later processing? The systems that handle spikes best are the ones that have thought through what they can do with partial functionality.

**Queue depth** and **backpressure** are signals of impending overload. If your request queue is growing (requests waiting to be processed), that's a sign you're approaching capacity. Instead of letting the queue grow until the system falls over, you can proactively reject new requests ("HTTP 503 Service Unavailable") or apply backpressure (tell clients to slow down and retry). This is way better than running out of memory and crashing.

**Cascading failures** are the real killer. Service A talks to Service B. Service B gets overloaded. It stops responding. Service A times out waiting for B and runs out of connection pools. Now A is broken too, even though A's compute is fine. If C depends on A, now C is broken. Suddenly your entire system is down because one service got overloaded.

Real incident: A company I worked with had a deployment issue that cause one API endpoint to start responding slowly. It wasn't broken, just slow. But that endpoint was called by many other internal services. Those services' connection pools filled up waiting for responses. They started failing. Those failures propagated to other services. Within 90 seconds, the entire platform was unavailable. The root cause was one slow endpoint. It took 2 hours to recover because they had to restart things in the right order to unwind the cascade. The lesson: build your system to fail fast and isolate failures.

## Scaling Policies and Auto-Scaling Configuration

Auto-scaling is how you handle demand variation without manual intervention. But it's not magic and it has limitations.

**Min and max** constraints are crucial. Minimum instances ensures you're never completely overloaded (min is your baseline capacity). Maximum prevents auto-scaling from creating an infinite bill if something goes wrong.

```yaml
scaling_policy:
  min_instances: 5  # Always have 5 up
  max_instances: 100  # Never scale beyond 100
  target_cpu: 70%  # Scale up if avg CPU hits 70%
  scale_up_cooldown: 60s  # Wait 60s after scaling up before checking again
  scale_down_cooldown: 300s  # Wait 5 min after scaling down before checking again
```

**Lag in scaling** is real. It takes time for a metric to indicate you need more capacity. It takes more time for the auto-scaler to decide to scale. It takes even more time for new instances to spin up and become ready. By the time new instances are handling traffic, the spike might be passing. This is why most teams scale to handle p99 demand, not average demand, you need headroom for the inevitable lag.

**Thrashing** happens when your auto-scaling is too aggressive. You scale up, then a few seconds later a metric shows you don't need the capacity, so you scale down, then immediately you need to scale up again. This wastes resources and money, and causes instability. Cooldown periods help prevent this, but they're a balance, too long and you don't respond to changes; too short and you thrash.

**Scale-down risk** is that you might lose requests while scaling down. If you're handling 50K RPS across 50 instances and you scale down to 40 instances, those 10 instances get a SIGTERM signal and stop accepting new requests. But the load balancer might have a lag updating its list of healthy instances. A few requests might still get routed to instances that are shutting down and those requests get dropped. Most cloud platforms handle this with connection draining (wait for in-flight requests to complete before killing the instance), but it's not perfect.

I've seen teams set super low CPU thresholds (scale at 40% CPU) because they're afraid of latency. Then they're constantly scaling up and down, wasting resources. Proper testing tells you what CPU threshold actually corresponds to your latency SLA. For most workloads, 70% CPU with 5-minute scale-down cooldown works well.

## Load Testing: Validating Your Assumptions

All this planning is only useful if your assumptions are right. Load testing is how you validate.

**Why load testing is necessary**: Actual traffic has patterns that are hard to model. Real query patterns are messier than your assumptions. Real users have uneven behavior. You need to see how the system actually behaves under load, not how you think it will behave.

**Tools**: JMeter, Gatling, and k6 are popular. Each has different strengths. JMeter is flexible but complex. Gatling has nice real-time reporting. k6 is simple and cloud-native. Pick one and get good at it.

**Test scenarios**:

- Ramp-up: Start at low load, gradually increase to peak. See where bottlenecks appear.
- Sustained: Run at peak load for 30 minutes or more. See if things degrade over time.
- Spike: Jump suddenly to 2-3x normal load. See if auto-scaling keeps up.
- Degradation: Run at high load while degrading the database (add latency). See how the system responds.

**What to measure**: Throughput (requests per second), latency (response time), percentiles (p50, p95, p99 not just average), error rate, resource utilization (CPU, memory, connections).

Latency percentiles matter way more than average. Average might be 100ms but p99 might be 2 seconds. If you're aiming for "99th percentile under 500ms," you need to measure p99, not average.

**Finding bottlenecks** happens during load testing. You'll usually find one resource hits its limit first: CPU, memory, database connections, or something else. You increase load until something breaks, note what broke, fix it, and test again.

Real example: We load tested a system to 50K RPS and it broke at database connections. We tuned the pool size, retested, and it broke at CPU. We scaled compute, retested, it broke at network bandwidth. Each bottleneck was in a different layer. You can't find this without actually testing.

**Realistic test data** matters. If you test with 100 user records and 1000 products, you're not going to see the same performance as production with millions of records and billions of products. Production queries are slower due to more data, more indices, more cache misses. Test with data volumes close to production.

## The Planning Process: Making This Repeatable

Capacity planning isn't a one-time exercise. Demand changes, your system changes, new constraints appear.

**Seasonal forecasting**: If you have seasonal demand, you need to plan for it. Tax software in Q1, retail in Q4. Plan your capacity increase 4-6 weeks before peak season. Spinning up infrastructure takes time.

**Growth planning**: If you're growing 10% month-over-month, your capacity needs change. Every 6-7 months you're essentially doubling. Plan for that. Running at 90% capacity is risky, you have no headroom for unexpected spikes.

**Architectural changes** affect capacity. A new feature that's more computationally expensive. A refactor that's slower. A new dependency. These can suddenly make your old capacity plans obsolete.

**Monitoring and feedback**: Let actual production data inform your planning. If you predicted 50K RPS and peak is 30K, you overbuilt. If peak is 80K, you underbuilt. Next time, adjust your models based on what you actually see.

**Runbooks and escalation**: Have clear runbooks for "what do we do if we're approaching capacity?" Who gets paged? What's the escalation path? Can ops add capacity on-the-fly or is it all manual?

**Communication**: Make sure ops, infrastructure, and product all know what's coming. "We're expecting 3x traffic spike on Black Friday" is information ops needs to know about proactively, not discover during the incident.

## Conclusion

Capacity planning in cloud isn't harder than on-premises, it's different. You're not constrained by the server hardware in your datacenter, but you're constrained by database limits, cache limits, regional limits, and cost. The good news is that cloud lets you be more dynamic, you can scale horizontally instead of predicting peak and building for it. The bad news is you still need to think carefully about what constrains your system.

Start with demand modeling. Understand your traffic patterns. Run load tests to find bottlenecks. Build your scaling policies based on what you learn. Monitor in production and adjust. And remember: capacity is like an iceberg. The compute part (what most people think about) is visible. The database, cache, network, and state management (where things usually break) is underwater.

The teams that handle scale well aren't the ones with the fanciest systems. They're the ones that understand their constraints and plan accordingly.
