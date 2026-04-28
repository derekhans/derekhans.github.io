---
layout: post
title: "Data Platforms on Azure: A Reference Architecture"
date: 2018-11-24
tags: [azure, data, architecture]
---

Modern data platforms combine multiple services for ingestion, storage, processing, and serving. Here's a reference architecture that scales.

## The Medallion Architecture

**Bronze:** Raw data, as ingested
**Silver:** Cleaned and conformed
**Gold:** Business-ready aggregates

## Key Services

- **ADLS Gen2** - Scalable storage
- **Synapse Analytics** - Unified analytics
- **Databricks** - Spark processing
- **Purview** - Data governance

## Data Lakehouse

Combine data lake flexibility with warehouse reliability:

```sql
CREATE TABLE orders
USING DELTA
LOCATION 'abfss://container@account.dfs.core.windows.net/orders'
```

## Real-time and Batch

The same architecture handles both:

- Stream ingestion with Event Hubs
- Batch processing with Spark
- Unified serving layer
