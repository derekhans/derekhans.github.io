---
layout: post
title: "LLMOps: Operationalizing Language Models"
date: 2024-12-17
tags: [ai, operations, mlops]
---

Machine learning operations (MLOps) has solved many problems: versioning models, deploying them reliably, monitoring performance in production. But large language models (LLMs) broke most of the MLOps playbook.

Traditional ML models have ground truth. You train on labeled data, test on holdout data, measure accuracy. The metrics are clear. When performance degrades in production, you retrain.

LLMs are different. There is no ground truth for "Is this response helpful?" There is no labeled holdout set for summarization. A model can be great at one task and mediocre at another. Performance degrades not because the model changed, but because the prompt changed or the user expectations shifted.

This gap between "how to operationalize traditional ML" and "how to operationalize LLMs" is what LLMOps addresses. This article covers the core challenges and the practices that work.

## How LLMOps Differs from Traditional MLOps

MLOps solves the deployment, monitoring, and retraining of trained models. LLMOps solves a different set of problems.

### The MLOps playbook

Traditional MLOps workflow:

1. Train model on labeled data
2. Evaluate on holdout test set
3. Deploy to production
4. Monitor metrics (accuracy, precision, recall)
5. When metrics degrade, retrain the model
6. Redeploy

This assumes:

- You have labeled data
- Metrics are well-defined
- Model retraining is the lever to improve performance
- Deployment is infrequent (monthly, quarterly)

### Why this breaks for LLMs

**No retraining**

You cannot retrain a 7B parameter model in-house. LLMs from providers (OpenAI, Anthropic, Google) are black boxes that you cannot modify. Even open-source models require massive compute and expertise to finetune effectively.

This means the lever is not "retrain better." The lever is "use the model better."

**No ground truth**

For a classification task, you can measure accuracy against labels. For generation tasks, there is no single correct answer.

"Summarize this document in 3 sentences" has dozens of valid answers. You cannot measure one as right and one as wrong.

**Behavioral drift**

Model performance can degrade without the model changing. If you change the prompt, performance changes. If user expectations shift, the same output might be worse.

Example: A chatbot was shipping the same model with the same prompt for months. Then you changed one line in the prompt ("Be concise" → "Be very concise"). User satisfaction dropped. Did the model get worse? No. The prompt did.

**Cost is the bottleneck**

In traditional ML, training cost is front-loaded. You train once, deploy many times.

With LLMs, every API call costs money. If you serve 1M requests per day at $0.001 per request, that is $1K per day. Performance optimizations directly translate to cost savings.

This makes LLMOps as much about cost management as about quality management.

## The Unique Challenges of LLMOps

### Challenge 1: Evaluation is expensive and subjective

How do you measure if an LLM is working well?

Traditional metrics (accuracy, F1 score) do not apply. You need to evaluate things like:

- Is the response helpful?
- Is it factually correct?
- Is the tone appropriate?
- Does it follow the style guide?

Each of these requires human judgment. Hiring humans to evaluate thousands of outputs is expensive and slow.

### Challenge 2: Performance is unstable

Small changes have outsized effects. A one-word change in the prompt can shift the model's behavior significantly.

Example: "List 5 key points" vs. "List 5 critical key points" produces noticeably different outputs. One is more specific and confident. The other is more cautious.

This instability makes it hard to know if a change is an improvement or a regression.

### Challenge 3: Latency and cost are coupled

Faster models are cheaper. But slower models might be more accurate.

You face constant trade-offs:
- Use GPT-4 for quality but pay more and wait longer
- Use GPT-3.5 for speed and cost but get lower quality
- Use an open-source model locally for cost but need to run infrastructure

There is no clear best choice.

### Challenge 4: Hallucinations are hard to detect

Models confidently generate false information. They will make up facts, citations, and statistics.

Detecting this requires domain expertise or external verification. You cannot build this into a simple metric.

### Challenge 5: Compliance and safety are complicated

LLMs can violate compliance requirements by accident:

- Generating sensitive information (PII, HIPAA-covered data)
- Biased or discriminatory outputs
- Responses that expose company secrets
- Outputs that violate copyright

Detecting these issues requires specialized monitoring and content filtering.

## LLMOps Architecture

A production LLMOps system has several components:

**Prompt management**

Prompts are code. They should be versioned, tested, and reviewed like code.

```yaml
prompt_id: "customer-support-v3.2"
model: "gpt-4-turbo"
system_prompt: |
  You are a helpful customer support agent for Acme Corp.
  Respond professionally and empathetically.
  If you don't know the answer, say so. Do not make up information.
  Relevant information: {context}
user_prompt_template: |
  Customer question: {question}
  Previous conversation: {history}
  Your response:
temperature: 0.7
max_tokens: 500
```

**Request routing**

Direct requests to the appropriate model based on criteria:

- Simple queries → smaller model (cheaper)
- Complex queries → larger model (more capable)
- Sensitive queries → moderated model (safety checks)

**Output filtering**

Screen outputs for compliance and safety issues before returning to users.

**Monitoring and evaluation**

Continuous measurement of quality, cost, latency, and safety.

**A/B testing infrastructure**

Safely test new prompts and models on a percentage of traffic before rolling out.

## Evaluation Approaches for LLMs

Since traditional metrics do not work, you need a portfolio of evaluation methods.

### 1. Human evaluation

A human reads outputs and rates them on quality dimensions.

Dimensions might include:

- **Correctness**: Is the information accurate?
- **Completeness**: Does it answer the full question?
- **Clarity**: Is it well-written and easy to understand?
- **Helpfulness**: Would this actually help the user?
- **Safety**: Does it violate any policies?

You sample outputs (maybe 5-10% of traffic) and have humans rate them on a scale (1-5 stars, yes/no, etc).

Cost: $1-5 per sample depending on complexity. For high-volume systems, this adds up fast.

Cadence: Weekly or monthly.

### 2. LLM-as-judge

Use another LLM to evaluate outputs from the production LLM.

Example evaluation prompt:

```
You are an expert evaluator of customer service responses.
Rate the following response on correctness (1-5):
Question: {question}
Response: {response}
Explanation: [reason for the rating]
Rating: [1-5]
```

Advantages:

- Cheap (just another API call)
- Fast (immediate feedback)
- Scalable (evaluate everything, not just samples)

Disadvantages:

- Biased (the judge LLM might agree with the model LLM even if both are wrong)
- Not always accurate (LLMs are not perfect evaluators)

Use LLM-as-judge for quick, continuous monitoring. Use human evaluation to validate that the judge is working correctly.

### 3. Task-specific metrics

Depending on the task, you can build custom metrics.

**For summarization**:

- Use ROUGE (recall-oriented understudy for gisting evaluation) or BLEU to measure overlap with reference summaries
- Measure summary length to ensure it is not too long or short

**For retrieval-augmented generation (RAG)**:

- Measure if the response is grounded in the provided context (uses information from documents)
- Measure if sources are cited correctly

**For code generation**:

- Run generated code and check if it executes without errors
- Test it against a test suite

**For structured outputs**:

- Validate that the output matches the expected schema
- Check for required fields

### 4. User feedback

The ultimate judge is whether users find the output valuable.

Collect feedback through:

- Thumbs up/down on responses
- Explicit rating (1-5 stars)
- Qualitative feedback (comments)

Track what percentage of responses get positive feedback. When it drops, something is wrong.

### 5. A/B testing

Compare two prompts or models on real traffic and measure which performs better.

Example test:

```
Control: Original prompt with GPT-4-turbo
Variant: New prompt with GPT-4-turbo
Metric: User satisfaction rating
Duration: 1 week
Traffic split: 50/50
```

If variant has higher satisfaction, promote it. Otherwise, keep control.

## Monitoring LLMs in Production

Monitoring for LLMs is different from traditional ML.

### Metrics to track

**Performance metrics**

- **Latency**: Response time. Track p50, p90, p99. LLMs are slow (1-5s), so latency budgets matter.
- **Token usage**: Track tokens per request and total daily tokens. This directly correlates to cost.
- **Error rate**: API errors, timeouts, rate limiting.

**Quality metrics**

- **User satisfaction**: Percentage of responses with positive feedback.
- **Groundedness**: For RAG, percentage of responses that cite sources correctly.
- **Task completion**: For task-oriented systems, percentage of tasks completed successfully.

**Safety and compliance metrics**

- **Content filter triggers**: Percentage of responses flagged by content filtering.
- **Hallucinations detected**: Percentage of responses containing factually incorrect information.
- **PII exposure**: Percentage of responses containing personally identifiable information.
- **Bias incidents**: Reported cases of biased or discriminatory outputs.

**Cost metrics**

- **Cost per request**: Total API cost / number of requests.
- **Cost per user**: Total API cost / number of users.
- **Cumulative spend**: Running total of API costs.

### Monitoring setup

Use Azure Monitor or a similar service to track these metrics continuously.

```yaml
alert_rule: "High token usage"
condition:
  metric: "avg_tokens_per_request"
  operator: "greater_than"
  threshold: 2000  # More than 2K tokens per request on average
  duration: 15m
action: "notify operations team"

alert_rule: "Low user satisfaction"
condition:
  metric: "positive_feedback_percentage"
  operator: "less_than"
  threshold: 80  # Less than 80% positive feedback
  duration: 1h
action: "create incident, trigger evaluation runbook"
```

### Behavior changes to monitor

Beyond metrics, watch for behavioral changes:

- Response length shifting (outputs getting longer or shorter)
- Tone changes (more formal, more casual)
- Different types of errors (hallucinations vs. refusals)
- User complaints (qualitative feedback)

These often indicate that something has changed upstream (model version, API parameters, prompt).

## Cost Management

LLM costs are proportional to usage. The levers are:

### 1. Model selection

Different models have different cost-quality trade-offs.

Example pricing (as of 2024):

- GPT-4 Turbo: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- GPT-3.5 Turbo: $0.003 per 1K input tokens, $0.006 per 1K output tokens
- Open-source model (Llama 2): ~$0.0005 per 1K tokens on Azure Container Instances

If your use case works with GPT-3.5, use it. If you need GPT-4 quality, pay for it. Run experiments to find the minimum model that meets your quality bar.

### 2. Prompt optimization

Every token in the prompt costs money. Optimize:

- Remove unnecessary context
- Use concise instructions instead of verbose examples
- Summarize context before passing to LLM

Example: A RAG system retrieved 10 documents totaling 15,000 tokens of context. By summarizing the context first (2,000 tokens), the company reduced costs by 13,000 tokens per request. At high volume, this is significant savings.

### 3. Routing and caching

Route simple queries to cheaper models:

```python
if len(query) < 50 and len(query.split()) < 10:
    # Simple query, use GPT-3.5
    model = "gpt-3.5-turbo"
else:
    # Complex query, use GPT-4
    model = "gpt-4"
```

Cache common queries and responses:

```python
cache_key = hash(prompt)
if cache_key in response_cache:
    return response_cache[cache_key]
response = call_llm(prompt)
response_cache[cache_key] = response
return response
```

This is especially effective for support chatbots that answer the same questions repeatedly.

### 4. Batch processing

For offline work, use batch APIs that are cheaper than real-time APIs.

Azure OpenAI and other providers offer batch endpoints with 50% discounts. Processing happens with a delay (1-24 hours) but is much cheaper.

Use for:

- Summarizing logs
- Analyzing documents
- Generating training data

### 5. Output length optimization

Limit output tokens to what you actually need:

```yaml
max_tokens: 300  # Not 2000
```

But do not be too aggressive—if the model cannot finish its thought, quality degrades and users are frustrated.

### 6. Quantifying cost-quality trade-offs

Build a cost scorecard:

| Model | Cost/req | Quality | Latency | Best for |
|-------|----------|---------|---------|----------|
| GPT-3.5 | $0.004 | 75% | 500ms | Simple queries |
| GPT-4 | $0.015 | 95% | 2000ms | Complex tasks |
| Llama 2 (local) | $0.0005 | 60% | 3000ms | Budget-constrained |

Use this to make routing decisions. For a given request, pick the cheapest model that meets your quality bar.

## Best Practices for LLMOps

### 1. Treat prompts as code

- Version control prompts in Git
- Require code review for prompt changes
- Tag significant prompt versions
- Document the reasoning behind each prompt

```git
commit 123abc: "Support prompt v2.1"
- Added context length limit (prevent token bloat)
- Softened tone to reduce refusals
- Evaluated with human raters, quality +8%
- Cost: +$200/month (worth it for quality)
```

### 2. Build evaluation into CI/CD

Run evaluations on every prompt change:

```
On PR with prompt change:
  1. Deploy prompt to staging
  2. Run LLM-as-judge on 100 test cases
  3. Compare to baseline
  4. If quality ↓, block merge
  5. If quality ↑ and cost ≤ baseline, approve
```

### 3. Use a/b testing for major changes

Never roll out a major prompt change to all users. Test it on 10% first, measure satisfaction, then expand.

```
Day 1: Roll out to 10% of users
Day 2-3: Monitor satisfaction, latency, cost
Day 4: If metrics are good, roll out to 50%
Day 5-6: Monitor again
Day 7: Roll out to 100% (or revert if something is wrong)
```

### 4. Monitor for drift continuously

Set up alerts for:

- User satisfaction dropping below threshold
- Error rates spiking
- Cost per request increasing unexpectedly
- Response times degrading

When one fires, immediately investigate. It usually indicates something changed upstream (API provider made a model change, traffic pattern shifted, or your prompt needs tuning).

### 5. Measure what matters

Do not obsess over metrics that do not correlate with value. Examples:

- **Token count** is a cost driver, not a quality metric
- **Response time** matters for UX but not for batch processing
- **User satisfaction** matters more than any technical metric

Pick 3-5 metrics that actually matter for your use case and monitor them obsessively.

### 6. Build safety into the system

Do not bolt on safety after the fact.

- Filter outputs for PII, profanity, bias
- Log all interactions for audit
- Rate-limit per user to prevent abuse
- Implement content policies that the model understands

Example safety filter:

```python
def is_safe(response):
    # Check for PII
    if has_pii(response):
        return False
    # Check for sensitive content
    if flagged_by_content_filter(response):
        return False
    # Check for hallucinations
    if not is_grounded_in_context(response):
        return False
    return True
```

### 7. Document everything

For each prompt, document:

- What is it used for
- What quality level is acceptable
- How often is it evaluated
- What is the cost per request
- Any known limitations
- When it was last reviewed

This becomes institutional knowledge that helps future teams understand decisions.

## Organizational Benefits

When LLMOps is done well, organizations see:

**Faster iteration**

Without LLMOps, teams are slow to try new prompts or models. With LLMOps, you can test and evaluate in days.

Result: Faster time from idea to production.

**Better quality**

Systematic evaluation catches problems early. You know exactly which outputs are failing and why.

Result: Measurably better user experience.

**Lower costs**

Most teams can reduce costs 30-50% by optimizing prompts and routing. One company reduced costs from $50K/month to $12K/month by switching 60% of traffic to GPT-3.5 and optimizing prompts.

Result: Better unit economics.

**More confidence**

When you are monitoring quality and cost continuously, you trust your LLM system. You are not flying blind.

Result: Teams use LLMs more, because they know what to expect.

**Predictability**

When you understand your cost-quality trade-offs, you can forecast costs accurately and set SLAs confidently.

Result: Business teams can plan around AI infrastructure.

## Wrap It Up

LLMOps is not MLOps applied to LLMs. It is a new discipline for a new problem: operationalizing models you cannot retrain, with evaluation that requires human judgment, at a scale where costs matter more than accuracy.

The core practices are:

1. **Treat prompts as code**: Version, review, and test them
2. **Evaluate continuously**: Use humans, LLMs, and custom metrics
3. **Monitor relentlessly**: Track quality, cost, safety, and behavior
4. **Optimize for your constraints**: Whether that is cost, latency, or quality
5. **Test before deploying**: A/B test changes on real traffic
6. **Build safety in**: Do not bolt it on later

Teams that master these practices ship faster, maintain higher quality, and spend less. Teams that ignore LLMOps end up with expensive, unreliable systems.

Start with monitoring. Add evaluation. Then optimize systematically. LLMOps is a journey, not a destination.
