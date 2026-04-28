---
layout: post
title: "API Design That Lasts"
date: 2019-12-10
tags: [architecture, api, design]
---

APIs are contracts. Once published, they're hard to change. Thoughtful design upfront prevents painful migrations later.

## Versioning Strategy

Plan for change:

- URL versioning: /v1/users
- Header versioning: Accept: application/vnd.api+json;version=1
- Query parameter: ?version=1

## Resource Design

Think in resources, not operations:

```
GET /orders/123        # Good
POST /getOrder         # Bad
```

## Error Handling

Consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [...]
  }
}
```

## Pagination

Design pagination from day one:

```
GET /orders?page=2&size=20
GET /orders?cursor=abc123
```

## Deprecation

Communicate changes:

```
Deprecation: true
Sunset: Sat, 1 Jan 2025 00:00:00 GMT
```

## Documentation

OpenAPI specs as source of truth. Generate from code or validate code against spec.
