---
layout: post
title: "Prompt Engineering: The New Programming"
date: 2022-04-18
tags: [ai, practices, development]
---

Prompt engineering is how we program language models. The right prompt can mean the difference between useful output and garbage.

## Prompt Structure

Effective prompts include:

1. **System context** - Role and constraints
2. **Examples** - Show, don't tell
3. **Task description** - What you want
4. **Output format** - How to respond

## Few-Shot Learning

```
Classify the sentiment:

Text: "I love this product!"
Sentiment: Positive

Text: "Worst purchase ever."
Sentiment: Negative

Text: "It's okay, nothing special."
Sentiment:
```

## Chain of Thought

Ask for reasoning:

```
Think step by step before answering.
Q: If I have 3 apples and buy 2 more...
```

## Temperature and Tokens

- **Temperature 0** - Deterministic, factual
- **Temperature 1** - Creative, varied

## Iteration

Prompt engineering is empirical. Try variations, measure results, refine.
