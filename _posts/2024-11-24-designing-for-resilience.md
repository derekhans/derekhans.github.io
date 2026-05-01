---
layout: post
title: "Designing for Resilience"
date: 2024-11-24
tags: [architecture, reliability, cloud]
---

Most companies discover their resilience strategy when something breaks in production. The database goes down. The cache layer fails. A service starts responding slowly. Teams scramble. The outage lasts two hours. Revenue is lost. Customers complain. Post-mortem happens.

Then nothing changes. The same failure could happen again tomorrow.

True resilience is built intentionally. You design systems that can survive failures. You test those systems repeatedly to validate they actually work. You build organizational practices and muscle memory around handling failure.

This article covers what resilience actually means, how to design for it, how to test it, and how to embed it in organizational culture.

## What Is Resilience?

Resilience is the ability of a system to continue operating when things go wrong.

This is different from reliability, which is about preventing failures. Reliability tries to avoid failures. Resilience assumes failures will happen and makes sure the system still works anyway.

### Resilience vs. high availability

High availability is about maximizing uptime through redundancy. You run multiple copies of critical services. If one fails, traffic routes to another.

Resilience is broader. It includes:

- Detecting that something went wrong
- Isolating the failure so it does not affect other parts of the system
- Continuing to serve customers (possibly in degraded mode)
- Recovering gracefully without operator intervention

High availability is a component of resilience, but they are not the same thing.

### Why resilience matters

Consider two data centers:

**Data Center A**: High availability. Multiple copies of everything. Failover is automatic.

What happens: Primary database fails. Automatic failover kicks in. Secondary becomes primary. Downtime: 30 seconds. Users notice, but service recovers.

**Data Center B**: Resilient but not necessarily highly available. Maybe only one copy of some things. But graceful degradation is built in.

What happens: Database fails. The system detects it. Services that depend on the database fall back to cached data or return partial results. Users see slightly less functionality, but they are not blocked. No downtime.

Most organizations are closer to A. Few are close to B.

B is harder to build but provides better outcomes at lower cost.

## Designing for Resilience

Resilient systems are designed with specific patterns and trade-offs in mind.

### Pattern 1: Circuit breaker

A circuit breaker prevents cascading failures by stopping requests to a failing service.

How it works:

```
State: CLOSED (normal)
Request sent → Success → Stay CLOSED
Request sent → Fail → Count failure
Failures > threshold → Switch to OPEN

State: OPEN (failing)
Request received → Immediately return error
Wait for timeout → Switch to HALF_OPEN

State: HALF_OPEN (testing)
Send one test request → Success → Switch to CLOSED
Send one test request → Fail → Switch back to OPEN
```

Example:

```python
from pybreaker import CircuitBreaker

breaker = CircuitBreaker(fail_max=5, reset_timeout=60)

try:
    response = breaker.call(requests.get, url)
except Exception:
    # Circuit is open, return cached response
    return cached_response()
```

When to use: When calling an external service (API, database, cache) that might fail.

Trade-off: You return stale data or errors instead of waiting. Users see degraded service, not complete outage.

### Pattern 2: Bulkhead

A bulkhead isolates failures so they do not cascade.

Think of a ship. If water enters through a breach in one compartment, bulkheads prevent the water from spreading to the entire ship.

In software, bulkheads are resource limits:

```yaml
Service A: Maximum 10 threads
Service B: Maximum 10 threads
Service C: Maximum 10 threads
Shared pool: 50 threads total

If Service A gets stuck and uses all 10 threads,
Service B and C still have 10 threads each available.
Service A's problem is isolated.
```

Implementation options:

- Separate thread pools for different operations
- Separate database connections for read vs. write
- Separate caches for different data types
- Separate service instances for critical vs. non-critical work

Example with Kubernetes:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-a-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "100m"
    requests.memory: "512Mi"
    limits.cpu: "500m"
    limits.memory: "2Gi"
```

Team A's services cannot consume more resources than this quota, protecting other teams from resource starvation.

When to use: When multiple services share resources (CPU, memory, database connections).

Trade-off: You need to size resource pools based on expected load. Too small and you waste resilience. Too large and you waste resources.

### Pattern 3: Retry with backoff

Transient failures (temporary network issues, service restarting) often succeed if you try again.

But naive retry can make things worse. If a service is overloaded and you retry immediately, you add more load.

Instead, use exponential backoff:

```python
import time

def call_with_retry(func, max_attempts=5):
    for attempt in range(max_attempts):
        try:
            return func()
        except Exception as e:
            if attempt == max_attempts - 1:
                raise
            wait_time = 2 ** attempt + random.uniform(0, 1)  # Exponential backoff
            print(f"Attempt {attempt + 1} failed, retrying in {wait_time:.1f}s")
            time.sleep(wait_time)
```

Wait times: 1s, 2s, 4s, 8s, 16s. By the fourth retry, the service has usually recovered.

Add jitter (randomness) to prevent thundering herd, if 1000 clients all retry at the same time, you amplify the problem.

When to use: When calling services that might be temporarily unavailable.

Trade-off: Slow requests get slower. Latency increases for some users, but they eventually get their response.

### Pattern 4: Graceful degradation

When something fails, return partial or cached data instead of an error.

Example:

**Without graceful degradation:**
- User requests profile page
- Service calls user service, order service, recommendation service
- Recommendation service is down
- Page returns 500 error
- User sees error page

**With graceful degradation:**
- User requests profile page
- Service calls user service, order service, recommendation service
- Recommendation service is down
- Page loads with user info and orders
- Recommendation section shows cached recommendations or "recommendations temporarily unavailable"
- User sees mostly functional page

Implementation:

```python
def get_user_profile(user_id):
    user = user_service.get(user_id)  # Must succeed
    orders = order_service.get(user_id)  # Must succeed
    
    try:
        recommendations = recommendation_service.get(user_id)
    except Exception:
        recommendations = cache.get(f"recs:{user_id}") or []
    
    return {
        "user": user,
        "orders": orders,
        "recommendations": recommendations
    }
```

When to use: When a feature is nice-to-have but not critical.

Trade-off: Users see degraded service. You need to manage expectations (show that something is unavailable).

### Pattern 5: Timeout

If something is hanging, stop waiting and fail fast.

```python
import signal

def timeout_handler(signum, frame):
    raise TimeoutError("Operation timed out")

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(5)  # 5 second timeout

try:
    result = slow_operation()
except TimeoutError:
    result = fallback_result()
```

Why it matters: If you do not set a timeout, a hanging request can tie up resources indefinitely. Set a reasonable timeout and move on.

When to use: On every external call.

Trade-off: You might fail on something that would eventually succeed if you waited longer. Usually worth it because user experience matters more than waiting.

### Pattern 6: Shedding load

When a system is overloaded, it can shed low-priority work to keep high-priority work running.

Example:

```python
def process_request(request):
    if system_load > 80%:
        # Overloaded, shed low-priority work
        if request.priority == "low":
            return {"error": "system overloaded, retry later"}, 503
    
    # Process high-priority requests
    return handle(request)
```

This is controversial because some users get errors. But it is better than the entire system melting down.

When to use: In systems where demand can spike beyond capacity.

Trade-off: Some requests are rejected. You need to implement retry logic on the client side so requests are not lost.

## Testing Resilience: Chaos Engineering

Designing for resilience is not enough. You must test it. That is where chaos engineering comes in.

Chaos engineering is the practice of intentionally breaking things in production (or production-like environments) to find weaknesses.

### Why chaos engineering matters

Most teams never test their resilience patterns. They design for failure, but they never actually validate that the design works.

Then, in production, a real failure happens and the system behaves completely differently than expected. The circuit breaker does not work as designed. The fallback data is stale. The retry logic causes a thundering herd.

Chaos engineering finds these gaps before a real incident.

### Common chaos engineering experiments

**1. Kill a random instance**

Take down one server and watch what happens.

Expected result: Traffic routes to healthy instances, users do not notice.

If you see errors or slowdown, your load balancing is broken.

**2. Add network latency**

Simulate slow network:

```bash
# Add 500ms latency to all network requests
tc qdisc add dev eth0 root netem delay 500ms
```

Expected result: Services handle slow responses gracefully with timeouts and retries.

If you see timeouts or cascading failures, your timeout values are too tight.

**3. Partition the network**

Simulate a network partition where two data centers cannot talk to each other.

Expected result: Services detect the partition and failover or degrade gracefully.

If you see data inconsistency or cascading failures, your split-brain handling is broken.

**4. Exhaust a resource**

Fill a disk, exhaust database connections, max out CPU:

```bash
# Fill the disk
dd if=/dev/zero of=/tmp/fillfile bs=1M count=50000
```

Expected result: Services handle resource exhaustion gracefully.

If you see crashes, your resource pooling is broken.

**5. Slow down an API response**

Make a dependent service respond slowly:

```python
@app.route('/slow')
def slow_endpoint():
    time.sleep(30)  # Simulate slow response
    return "ok"
```

Expected result: Services have short timeouts and fall back to cached data.

If you see cascading slowdown, your timeout strategy is wrong.

### Running chaos experiments

**Step 1: Form a hypothesis**

"If the recommendation service is down, the profile page should still load with cached recommendations."

**Step 2: Set up monitoring**

Before you break something, know what you are measuring:

- Error rate
- Latency (p50, p99)
- Successful requests with degraded data
- User-reported issues

**Step 3: Inject the failure**

Use a tool like Chaos Monkey, Gremlin, or manual scripts to inject failure.

**Step 4: Observe**

Watch what happens. Do not intervene unless the system is actually broken.

**Step 5: Analyze**

Did the system behave as you expected? If not, why?

**Step 6: Fix or document**

If you found a gap, fix it. If the current behavior is acceptable, document why.

### Chaos tools

**Chaos Monkey** (Netflix)

Randomly kills instances in production. Named after the idea that your infrastructure should be as resilient as a monkey, if you take away one limb, it can still function.

**Gremlin**

Commercial chaos engineering platform. Supports network, resource, state, and application experiments.

**Azure Chaos Studio**

Microsoft's chaos engineering service. Integrated with Azure, allows targeting specific resources.

**Fault Injection Attacks**

Docker and Kubernetes support injecting faults. You can simulate CPU throttling, memory limits, or network issues.

## Testing Resilience: Game Days

Beyond chaos experiments, teams need practice responding to failures.

A game day is a structured incident simulation where the team practices incident response.

### How to run a game day

**Before the day:**

- Define a scenario (e.g., "Database is down")
- Choose moderators and observers
- Brief the team on what will happen
- Set a time box (usually 1-2 hours)

**During the day:**

- Moderators inject the failure
- Team detects it and responds (or fails to detect)
- Team investigates root cause
- Team mitigates the issue
- Moderators may escalate ("Now the secondary database is failing too")

**After the day:**

- Team discusses what went well and what went poorly
- Identify gaps (missing runbooks, unclear procedures, skill gaps)
- Create action items to close gaps

### What game days teach

**Skill development:** Under time pressure with real(ish) incidents, people learn quickly.

**Identifying gaps:** You discover:

- Missing runbooks or procedures
- Tooling that is poorly documented
- Alerting that is not set up
- Individuals who do not know how to respond

**Building confidence:** When something similar happens in production, the team has rehearsed and is less panicked.

**Exposing assumptions:** "We assumed the secondary database would take over automatically." In the game day, it did not. Now the team fixes it before production relies on it.

### Game day scenarios

Pick realistic scenarios:

- Primary database is down
- Service is responding slowly
- Attackers have compromised a key server
- A bad deployment broke the API
- Network partition splits the data centers
- Disk fills up unexpectedly

Do not pick impossible scenarios ("All servers are gone"). Pick things that could actually happen.

## Measuring Resilience

How do you know if your system is resilient?

### Metrics to track

**1. Mean time to recovery (MTTR)**

When a failure happens, how long until the system recovers?

Goal: < 5 minutes for most failures.

If MTTR is high, your detection or automation is poor.

**2. Service degradation vs. outage**

How often does the system degrade gracefully vs. fully fail?

Track:

- Number of degradations per month
- Number of outages per month
- Ratio of degradations to outages

Good systems have many degradations and few outages.

**3. Impact of failures**

When a failure happens, what percentage of users are affected?

- Blast radius of 100%: All users affected (bad)
- Blast radius of 25%: Only users in one region affected (better)
- Blast radius of 0%: No users affected, handled internally (best)

**4. Automatic recovery rate**

Percentage of failures that are resolved automatically without human intervention.

Good systems: > 80% automatic.

Poor systems: < 20% automatic.

**5. Chaos experiment pass rate**

Percentage of chaos experiments where the system behaves as expected.

First run: 40% pass (you find lots of issues)

After fixing issues: 90% pass (good)

Target: 95%+ pass (very resilient)

## Organizational Practices for Resilience

Resilience is not just technical. It is organizational.

### 1. Blameless post-mortems

When an incident happens, the goal is learning, not punishment.

Post-mortem process:

- What happened (timeline)
- Why it happened (root cause)
- What we will do differently (action items)

Do not ask "who made the mistake?" Ask "what conditions allowed this mistake to happen?"

Example:

**Bad**: "Engineer deployed broken code. Fire them."

**Good**: "Engineer deployed broken code because there was no automated test for this scenario. Action: Add automated test. Action: Add peer review for deployment changes."

### 2. Incident commander role

During incidents, someone owns the response. They coordinate what needs to happen, not do everything themselves.

Incident commander job:

- Declare severity level
- Get the right people in the room (or Slack channel)
- Delegate investigation and mitigation tasks
- Keep leadership updated
- Make hard calls (take system down vs. limp along, failover now vs. wait)

### 3. On-call rotation

Spread the burden of responding to incidents. No one person should be on-call all the time.

Typical model:

- One primary on-call
- One secondary (escalation)
- One tertiary (backup for secondary)
- Rotations every week or two

Compensate on-call staff for being available. Acknowledge that being woken up at 3am is not ideal.

### 4. Runbook culture

Every significant operation should have a runbook.

Runbook includes:

- What situation triggers this runbook
- Step-by-step procedures
- Who to contact if something goes wrong
- Common pitfalls
- How to rollback if needed

Example runbook structure:

```markdown
# Database Failover Runbook

## When to use
- Primary database is unreachable
- Primary database is degraded (replication lagging)
- Planned maintenance on primary

## Prerequisites
- Access to database console
- Verify secondary is healthy
- Notify stakeholders

## Steps
1. Verify secondary replica is caught up: `SELECT LAG FROM replication_status;`
2. If lagging > 5 minutes, wait for catchup
3. Promote secondary: `ALTER DATABASE promotion_target SET ROLE PRIMARY;`
4. Update DNS to point to new primary: `az dns record-set a update ...`
5. Verify traffic is flowing: `SELECT COUNT(*) FROM connections;`
6. Notify team in Slack

## Rollback
If something went wrong, fail back to original primary:
`ALTER DATABASE promotion_target SET ROLE SECONDARY;`

## Testing
This runbook was tested on 2024-11-15. Last verified: 2024-11-15.
```

### 5. Regular testing of critical paths

Test the most important workflows monthly:

- Payment processing
- User login
- Data export
- Disaster recovery

Do not wait for them to fail in production to know they work.

### 6. Resilience as a shared value

Make it clear that resilience is not optional. It is how you build systems.

In code reviews: "How will this fail? Is the failure handled?"

In architecture reviews: "What happens if this dependency is down?"

In on-call handoffs: "Here is how to use the runbook."

## Benefits of Building Resilience

When you invest in resilience:

**Lower MTTR**

Resilient systems are designed to recover quickly. You spend less time firefighting.

**Better user experience**

Users see degraded service instead of errors. They trust your system more.

**Fewer critical incidents**

Most failures are caught by resilience patterns. Only the most severe incidents need manual intervention.

**Better on-call experience**

On-call staff are less stressed because most incidents are handled automatically.

**Competitive advantage**

Competitors who have not invested in resilience have more outages. You do not.

## Wrapping Up

Resilience is not one thing. It is a collection of patterns, testing practices, and organizational habits.

You design for failure (circuit breakers, bulkheads, graceful degradation). You test your design (chaos experiments, game days). You practice recovery (runbooks, incident response). You measure success (MTTR, degradation rate, automatic recovery).

When you do all of this, something remarkable happens: your system still works when things go wrong.

That is resilience.
