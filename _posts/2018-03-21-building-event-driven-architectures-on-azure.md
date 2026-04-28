---
layout: post
title: "Building Event-Driven Architectures on Azure"
date: 2018-03-21
tags: [azure, architecture, messaging]
---

Event-driven architecture decouples services and enables reactive systems. Azure provides multiple options for event routing and processing.

## Event Grid vs. Service Bus vs. Event Hubs

| Service | Use Case |
|---------|----------|
| Event Grid | Reactive events, serverless |
| Service Bus | Enterprise messaging, transactions |
| Event Hubs | High-volume streaming |

## Event Grid Topics

```bash
az eventgrid topic create --name my-topic --resource-group my-rg
```

## Dead Letter Handling

Always configure dead letter destinations for failed events. Don't lose data silently.

## Event Sourcing

Store events as the source of truth:

```
OrderCreated → ItemAdded → ItemAdded → OrderSubmitted → OrderShipped
```

Replay events to rebuild state at any point in time.
