---
layout: post
title: "Machine Learning in Production: Lessons Learned"
date: 2025-10-19
tags: [ai, machine-learning, architecture]
---

Training a model is the easy part. Putting it into production and keeping it there is where the real work begins. The gap between a notebook experiment and a production system that runs reliably for months is often wider than teams anticipate. This post covers what machine learning actually is, what it does well, what it struggles with, how it differs from AI and LLMs, and the patterns that tend to keep systems running.

## What Machine Learning Is

Machine learning is a computational approach to building systems that improve their performance on a task by learning from data, without being explicitly programmed for every case.

At its core, ML is function approximation. You have training data—inputs and their associated correct outputs—and you want to build a function that generalizes: given a new input that wasn't in the training set, it produces a reasonable output. The model learns the relationship between inputs and outputs through an optimization process, typically by minimizing an error or loss function.

The essential components are:

- **Training data**: examples of inputs and correct outputs
- **Model architecture**: the structure (neural network, decision tree, linear model, etc.) that will learn
- **Loss function**: a mathematical measure of how wrong predictions are
- **Optimization algorithm**: the process (gradient descent, etc.) that adjusts the model to reduce loss
- **Hyperparameters**: tunable knobs that control how learning happens (learning rate, regularization, etc.)

Machine learning comes in three main flavors:

- **Supervised learning**: you have labeled data (input-output pairs), and the model learns to map inputs to outputs
- **Unsupervised learning**: you have inputs only, and the model finds structure (clustering, dimensionality reduction, etc.)
- **Reinforcement learning**: an agent learns through interaction, receiving rewards or penalties for actions

## What Machine Learning Does Well

Machine learning excels at tasks where:

- **The relationship is complex or nonlinear**. A linear model can't capture nuance; ML models can learn hierarchical, nonlinear patterns.
- **You have lots of data but can't write the rules by hand**. Recognizing cats in images or detecting fraud involves too many subtle patterns to hard-code.
- **The pattern is consistent but noisy**. ML models can learn despite measurement error, missing values, and other real-world messiness.
- **The task requires adaptive improvement**. Retrain the model on recent data, and it adapts to new patterns without code changes.
- **You need probabilistic predictions, not just classifications**. ML models can output confidence scores and probability distributions.

Real use cases where ML has had lasting impact:

- **Recommendation systems**: predicting what users will engage with
- **Computer vision**: object detection, segmentation, quality inspection
- **Time series forecasting**: demand planning, sensor anomaly detection
- **Natural language classification**: spam detection, sentiment analysis, intent classification
- **Predictive maintenance**: predicting equipment failures before they happen
- **Fraud detection**: identifying anomalous transactions or behavior

## What Machine Learning Doesn't Do

Machine learning has hard boundaries. Understanding them prevents wasted effort and bad deployment decisions.

What ML does *not* do:

- It does not guarantee causality. A model that predicts well may exploit spurious correlations. Correlation is not causation; machine learning finds correlations at scale.
- It does not reason or explain itself in a human way. A deep neural network can classify an image as "cat" but can't articulate why in natural language. It's a black box.
- It does not handle out-of-distribution data gracefully. If the test data is very different from training data, accuracy often crashes. Models are brittle to domain shift.
- It does not work without enough good data. A model trained on 100 examples of fraud is unreliable. Data quality, coverage, and volume matter enormously.
- It does not eliminate human judgment. Someone must decide what to predict, how to measure success, and whether the model's behavior is acceptable.
- It does not guarantee fairness. Models can learn and amplify historical biases present in training data.
- It does not replace domain expertise. Understanding the business problem, the data, and constraints is essential. A data scientist building a model without talking to subject-matter experts will likely build the wrong thing.
- It does not scale indefinitely. There's a training cost, an inference latency, and resource constraints. A model that runs on a GPU in 2 seconds won't work on a mobile phone.
- It does not automatically retrain or adapt. You have to build the infrastructure to capture new data, retrain, validate, and deploy new versions. Left alone, models decay as the world changes.

## Machine Learning vs. AI vs. LLMs

These terms are often used interchangeably, but they mean different things.

### AI (Artificial Intelligence)

AI is the broadest umbrella. It encompasses any computational system designed to exhibit behavior that we'd call intelligent. This includes:

- Rule-based expert systems from the 1980s that used if-then logic
- Search algorithms and game-playing engines (like chess engines)
- Robotics and planning systems
- Machine learning
- Large language models

AI is the goal; machine learning is one tool for achieving it.

### Machine Learning

Machine learning is a subset of AI. It's the approach of learning from data through optimization rather than explicit programming. Not all AI uses ML (a chess engine uses search, not learning), and historically, much AI was rule-based.

### Large Language Models (LLMs)

LLMs are a specific type of machine learning model. They are neural networks trained on vast amounts of text data using self-supervised learning (predicting the next word in a sequence). They excel at:

- **Text generation**: writing coherent, contextually relevant text
- **Few-shot learning**: performing tasks with minimal examples
- **Instruction following**: understanding and executing commands in natural language

But LLMs have different trade-offs than other ML approaches:

- They are expensive to train and run (require significant computational resources)
- They tend to hallucinate: generate plausible-sounding but incorrect information
- They lack grounding in the real world; they understand statistical patterns in text, not external facts or logic
- They are hard to control; you can't easily constrain what they output
- They are general-purpose, which means they're often not as good as specialized models for specific tasks

### The Distinctions in Practice

In practice:

- **Traditional ML** (linear regression, random forests, SVMs) is still heavily used for structured data and tabular problems. It's interpretable, fast, and data-efficient.
- **Deep learning** (neural networks) dominates images, audio, and sequences. It's powerful but needs lots of data and compute.
- **LLMs** are for language understanding and generation. They're versatile but resource-hungry and probabilistic.
- **Specialized models** (graph neural networks for networks, sequence models for time series) exist for specific data structures.

The right choice depends on your data, your problem, your resources, and your constraints. Choosing LLMs for every problem is as misguided as ignoring them completely.

## Common Machine Learning Patterns in Production

### 1. Batch Inference

**When to use**: You have a large dataset and predictions don't need to be immediate.

**Characteristics**:
- Run inference on thousands or millions of records periodically (nightly, hourly)
- Results are stored in a database or data warehouse
- Low latency requirements; you can tolerate a delay between data arriving and predictions being available

**Example**: predicting churn risk for all customers every night, writing results to a database that a UI queries.

**Advantages**: simple, cheap, easier to validate and monitor.

**Trade-offs**: not real-time; requires batch processing infrastructure.

### 2. Real-time Inference

**When to use**: Predictions are needed immediately as part of a user-facing request.

**Characteristics**:
- API endpoint receives a request, returns a prediction in milliseconds
- Model runs in-process or in a dedicated service
- Must handle concurrent requests with low latency

**Example**: predicting whether a credit card transaction is fraud, returning a decision before the transaction is authorized.

**Advantages**: truly responsive to new data; immediate feedback.

**Trade-offs**: higher operational complexity; cost scales with traffic; latency is critical.

### 3. Edge Inference

**When to use**: Predictions need to happen on-device, without sending data to a server.

**Characteristics**:
- Model is embedded in mobile app, browser, or IoT device
- Often uses quantized or compressed models to fit memory/compute constraints
- Inference is local; no network latency

**Example**: real-time object detection in a mobile camera app.

**Advantages**: privacy (data never leaves device); no network dependency; instant response.

**Trade-offs**: model must be small; updating is harder; can't easily use server-side compute.

### 4. Online Learning / Continuous Updating

**When to use**: Your data distribution changes rapidly, and the model must adapt quickly.

**Characteristics**:
- Model incrementally updates as new data arrives (streaming)
- No batch retraining cycle; learning is continuous
- Often uses incremental algorithms or online learning techniques

**Example**: a recommendation engine that learns user preferences in real-time as they interact.

**Advantages**: responsive to recent trends and user behavior.

**Trade-offs**: harder to manage; easier to overfit or diverge; requires monitoring.

### 5. Ensemble and Multi-Model Systems

**When to use**: A single model isn't good enough; combining multiple models improves accuracy.

**Characteristics**:
- Multiple models vote or combine their outputs
- Can combine different model types (tree + neural network + linear model)
- Reduces variance and captures different aspects of the problem

**Example**: predicting housing prices using a random forest, gradient boosting model, and neural network, then averaging their outputs.

**Advantages**: more robust; often better accuracy.

**Trade-offs**: higher complexity and latency; harder to debug.

## Best Practices for Production Machine Learning

### Start with a Baseline

Before building a complex neural network, establish a simple baseline. A logistic regression or decision tree trained on raw features tells you:

- What performance is achievable with simple methods
- Whether the problem is even solvable with ML
- How much benefit you get from added complexity

A baseline also makes it obvious when a complex model isn't actually better—and that happens more often than you'd think.

### Invest in Data Quality Early

Models are only as good as the data they learn from. Spend time:

- Understanding your features and labels
- Checking for missing values, outliers, and errors
- Validating that the data represents the real-world scenario
- Documenting data provenance and assumptions

Bad data ruins models, no amount of fancy algorithms can fix it.

### Hold Out Test Data and Don't Leak

Split your data into training and test sets before you build anything. Don't touch the test set until you're done tuning. Don't let information from the test set into the training set (data leakage kills model validity).

A common anti-pattern: training on data from January-December, then testing on data from the same period. When you deploy in January of the next year, performance crashes because the model hasn't seen recent data patterns.

### Monitor for Drift

Once deployed, track:

- **Data drift**: the distribution of input features changes (e.g., customer profile changes, sensor calibration shifts)
- **Concept drift**: the relationship between inputs and outputs changes (e.g., user preferences shift, fraud patterns evolve)
- **Prediction drift**: the model's outputs change even though inputs haven't (a sign of upstream issues)

Set alerts. When drift is detected, investigate. You may need to retrain, recalibrate, or change the model entirely.

### A/B Test Before Full Deployment

Don't push a new model to 100% of production traffic immediately. Instead:

- Run the old model on 90% of traffic, the new model on 10%
- Measure both accuracy and business impact
- If the new model performs worse on any important metric, roll back
- Gradually increase traffic to the new model as confidence builds

This prevents catastrophic failures. A model that looks good in retrospective testing can still fail in production due to unforeseen interactions.

### Version Everything

Your model is not just code; it's the code + the data it was trained on + the hyperparameters + the preprocessing + the feature engineering. All of this must be reproducible.

- Use git for code
- Track training data versions (e.g., with data versioning tools like DVC or Pachyderm)
- Log hyperparameters and model metadata
- Store trained model artifacts with clear versioning

If a model fails in production, you need to be able to go back and figure out what happened.

### Set Up Automated Retraining

Don't manually retrain models. Build a pipeline that:

- Continuously ingests new training data
- Retrains on a schedule (nightly, weekly, etc.)
- Validates the new model against held-out test data
- Compares performance to the current production model
- Automatically deploys if performance is better

This is what "MLOps" really means: treating model training and deployment like software deployment.

### Measure What Matters

Accuracy is one metric, but it's often not the right one. Depending on your problem:

- **Precision vs. recall**: in fraud detection, you might care more about not missing fraud (recall) than avoiding false alarms (precision).
- **Fairness**: does the model perform equally well for all demographic groups?
- **Latency**: how fast must predictions be returned?
- **Throughput**: how many predictions per second can the system handle?
- **Cost**: how much does it cost to train and serve this model?
- **Business metrics**: what actually matters to your organization? Revenue, engagement, safety?

Pick metrics that align with business goals. Optimizing the wrong metric is worse than not optimizing at all.

### Make Models Interpretable When Possible

If your model is making consequential decisions (loan approval, medical diagnosis, hiring), you need to understand why it's making those decisions.

Strategies:

- Use interpretable model types (linear models, decision trees) when possible
- For complex models, use explanation techniques (SHAP, LIME) to understand individual predictions
- Audit the model for bias and fairness
- Log decisions and audit them post-hoc

Sometimes accuracy and interpretability are in tension. That's a business decision, not a technical one.

### Plan for Model Failure

Models fail. They make bad predictions, they slow down, they become obsolete. Plan for it:

- Have fallback logic (return a default prediction if the model is unavailable)
- Have human-in-the-loop for high-stakes decisions
- Have rollback procedures to quickly revert to a previous model
- Have alerts so you know when things are going wrong

A model that crashes silently is worse than a model that alerts you to problems.

## Practical Deployment Architecture

A robust ML system typically looks like this:

1. **Data pipeline**: ingest, clean, and transform raw data into features
2. **Training pipeline**: train the model on historical data, validate on held-out test data
3. **Model serving**: expose the model via an API or batch job
4. **Monitoring**: track model performance, data drift, and system health
5. **Retraining loop**: automatically retrain when performance degrades or new data arrives

All of this lives in version control, runs on infrastructure you can scale, and has observability so you know what's happening.

## Wrapping Up

Machine learning in production is less about sophisticated algorithms and more about infrastructure, monitoring, and operational discipline. The hard problems aren't "which model architecture should I use?" but "how do I ensure this model keeps working correctly six months from now?" and "what do I do when the model's predictions are wrong?"

Start simple. Use baselines. Invest in data quality. Monitor relentlessly. Automate retraining. A boring, reproducible system that delivers consistent value is infinitely better than a cutting-edge model that nobody can understand or maintain.

And remember: not every problem needs machine learning. Sometimes a well-designed heuristic, a simpler statistical model, or even a rules engine will solve your problem faster and more reliably. Use ML when it's the right tool, not because it's fashionable.
