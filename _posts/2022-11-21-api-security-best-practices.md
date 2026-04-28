---
layout: post
title: "API Security Best Practices"
date: 2022-11-21
tags: [security, api, architecture]
---

APIs are the backbone of modern applications—and a prime target for attackers. The OWASP API Security Top 10 provides a framework for thinking about API risks.

## Authentication and Authorization

Always verify:

```
Authorization: Bearer <token>
```

Validate tokens properly:

- Check signature
- Verify expiration
- Confirm audience
- Check scopes

## Rate Limiting

Prevent abuse:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

## Input Validation

Never trust input:

```python
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    email: str
    age: int

    @validator('age')
    def age_must_be_positive(cls, v):
        if v < 0 or v > 150:
            raise ValueError('Invalid age')
        return v
```

## API Gateway Security

Centralize security controls:

- Authentication
- Rate limiting
- Request validation
- Logging
- WAF integration

## Monitoring

Track anomalies:

- Unusual request volumes
- New client IPs
- Error rate spikes
- Slow response times
