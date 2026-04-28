---
layout: post
title: "Retrieval Augmented Generation Patterns"
date: 2018-08-10
tags: [ai, architecture, search]
---

RAG combines the power of large language models with your organization's knowledge. Instead of relying solely on what the model learned during training, RAG retrieves relevant context at query time.

## The RAG Pipeline

```
Query → Embed → Search → Retrieve → Augment Prompt → Generate
```

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

```
Given the following context, answer the question.
If the answer isn't in the context, say "I don't know."

Context:
{retrieved_documents}

Question: {user_query}
```

## Evaluation

Measure retrieval quality and generation accuracy separately. Poor retrieval means irrelevant context. Poor generation means misusing good context.
