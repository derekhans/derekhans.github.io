---
layout: post
title: "API Design That Lasts"
date: 2024-09-10
tags: [architecture, api, design]
---

An API is a contract. Someone writes code that depends on your API. That code ships. Users rely on it. Two years later, you want to change something about your API. Too bad. Your customers will break if you do.

This is why API design matters. Poor design creates technical debt that compounds. Good design stays useful for years. The difference is thinking about the problem upfront.

This article covers what APIs are, why design matters, the key design decisions you face, best practices, and how good design benefits organizations.

## What Is an API?

An API (Application Programming Interface) is a contract that defines how software components communicate.

More specifically, an API defines:

- What operations are available
- What inputs each operation accepts
- What outputs each operation returns
- What errors can occur
- What behavior to expect

APIs can be:

- **REST APIs**: HTTP endpoints that manipulate resources
- **RPC APIs**: Remote procedure calls (gRPC, SOAP, JSON-RPC)
- **GraphQL APIs**: Query language for fetching exactly what you need
- **Webhook APIs**: Your service calls the client's API
- **Library APIs**: In-process interfaces (not over the network)

This article focuses on REST and gRPC, which are most common.

### Why APIs exist

APIs exist because:

**Abstraction**: The client does not need to know how you implement something. You define what is available, not how it works.

**Interoperability**: Different teams, organizations, and systems can work together through a common interface.

**Scale**: You do not copy code between systems. The API is the single source of truth.

**Evolution**: You can change internal implementation without breaking clients, as long as the API contract stays the same.

## The Cost of Poor API Design

Poor API design creates pain:

**Customers stuck on old versions**

You want to upgrade an API but customers cannot because their code depends on the old behavior. You have to support two versions forever.

**Ambiguous behavior**

Clients disagree on what the API should do. Half the clients implement one way, half implement another. You have to support both.

**Impossible to extend**

You want to add a new feature but the existing design does not accommodate it without breaking changes.

**Vendor lock-in**

Clients build systems tightly coupled to your specific API. They cannot switch to a competitor without massive effort.

**Poor developer experience**

The API is hard to use. Developers complain. Support costs increase. Adoption is slow.

### Cost in time and money

Consider a social media API that does not support pagination:

```
GET /user/123/posts
```

Returns all 100,000 posts. Clients download 500 MB of data. Network is saturated. Servers are overloaded.

Two years in, the company adds pagination:

```
GET /user/123/posts?limit=50&offset=0
```

But old clients still use the unpaginated endpoint. You have to support both. Every code path has to handle both versions. Tests multiply. Bugs emerge.

The broken pagination design costs months of engineering time and millions of dollars in infrastructure costs.

This is not hypothetical. Real companies have faced this.

## The Top 10 Considerations for API Design

These are the most important design decisions you will make.

### 1. Resource-oriented vs. RPC

**Resource-oriented** (REST):

```
GET    /orders/123         # Fetch an order
POST   /orders             # Create an order
PUT    /orders/123         # Update an order
DELETE /orders/123         # Delete an order
```

Think in terms of resources (orders, customers, products) and standard operations (create, read, update, delete).

**RPC** (Remote Procedure Call):

```
POST /createOrder
POST /getOrder?id=123
POST /updateOrder
POST /cancelOrder?id=123
```

Think in terms of operations (what do you want to do?) rather than resources (what are you working with?).

**Why resource-oriented is usually better:**

- Consistent URL structure
- Standard verbs (GET, POST, PUT, DELETE) map to standard operations
- Easier to reason about
- HTTP semantics are cleaner

**When RPC is better:**

- Complex operations that do not map to CRUD
- Custom business logic (approve invoice, ship order)
- Performance-sensitive scenarios where you want one round-trip

Recommendation: Prefer resource-oriented by default. Use RPC for specific complex operations.

### 2. Versioning strategy

You will change your API. Clients will depend on old versions. How do you manage this?

**URL versioning**

```
GET /v1/orders/123
GET /v2/orders/123
```

Pros: Clear which version you are using. Easy to track usage.

Cons: Duplicate endpoints. Hard to sunset old versions (some clients forget to upgrade).

**Header versioning**

```
GET /orders/123
Accept-Version: 1.0

or

GET /orders/123
X-API-Version: 2
```

Pros: URL is the same. Clients can upgrade without changing URLs.

Cons: Less visible. Hard to track which version is being used.

**Query parameter versioning**

```
GET /orders/123?apiVersion=2
```

Pros: Simple, visible in logs.

Cons: Looks awkward. Easy to forget.

Recommendation: Use URL versioning if you want to support multiple versions long-term. Use header or query versioning if you plan to deprecate quickly.

### 3. Pagination

How do you return large datasets?

**Offset-based pagination**

```
GET /orders?limit=50&offset=100
```

Pros: Simple. Easy to jump to arbitrary page.

Cons: Unstable when data is inserted/deleted (offset 100 might point to different items each request). Does not scale to huge datasets.

**Cursor-based pagination**

```
GET /orders?cursor=abc123&limit=50
```

The cursor is an opaque token that identifies where you are in the result set. The server decides how to encode it.

Pros: Stable even when data changes. Scales to huge datasets. Prevents jumping to arbitrary pages (which can be a security feature).

Cons: More complex to implement. Cannot jump to page 10 directly.

**Keyset pagination**

```
GET /orders?afterId=123&limit=50
```

Return items after a specific key.

Pros: Efficient for ordered data. Scales well.

Cons: Only works when ordered by a unique key.

Recommendation: Use keyset pagination for most cases. Use offset-based if you need random access. Avoid cursor-based unless your dataset is massive and insertion-heavy.

### 4. Error handling

How do you communicate what went wrong?

**HTTP status codes**

```
200 OK             - Success
201 Created        - Resource created
400 Bad Request    - Client error (invalid input)
401 Unauthorized   - Authentication required
403 Forbidden      - Authentication OK but not authorized
404 Not Found      - Resource does not exist
409 Conflict       - Request conflicts with current state
429 Too Many       - Rate limited
500 Server Error   - Something went wrong on the server
503 Unavailable    - Service temporarily unavailable
```

Use status codes correctly. Clients expect 200 for success, 400 for bad input, etc.

**Error response body**

```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email must be a valid email address",
    "details": {
      "field": "email",
      "value": "not-an-email"
    }
  }
}
```

Include:
- Machine-readable error code (for client logic)
- Human-readable message (for debugging)
- Context (which field, why it failed)

**Consistency**

Every error response should follow the same format. No surprises.

Recommendation: Use status codes correctly. Include structured error bodies. Be consistent.

### 5. Authentication and authorization

How do you know who the client is and what they are allowed to do?

**API Keys**

Simple but insecure if transmitted over HTTP (always use HTTPS).

```
GET /orders
Authorization: Bearer abc123def456
```

Good for: Simple, non-sensitive APIs. Internal tools. Server-to-server.

**OAuth 2.0**

Industry standard for delegated authorization. The client redirects to your authorization server, which gives the client a token, which the client uses to call your API.

Good for: Consumer apps. Third-party integrations. User data that needs permission.

**mTLS**

Client and server both authenticate with certificates.

Good for: High-security scenarios. Server-to-server communication. Financial systems.

**JWT**

Self-contained tokens that encode identity and claims. Server signs them; client can verify without calling server.

Good for: Scalable authorization. Stateless servers. Claims-based authorization.

Recommendation: Use OAuth 2.0 for user-facing APIs. Use API keys or mTLS for server-to-server. Use JWT for stateless scaling.

### 6. Rate limiting

How do you prevent abuse?

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1700000000
```

Tell clients how many requests they have, how many they have used, and when the limit resets.

When the limit is exceeded:

```
HTTP 429 Too Many Requests
Retry-After: 60
```

Tell them when they can retry.

Strategies:

- Per-user rate limiting
- Per-IP rate limiting
- Per-API-key rate limiting
- Per-endpoint rate limiting (some endpoints are more expensive)

Recommendation: Implement rate limiting from day one. Start generous but enforce it. This prevents cascading failures.

### 7. Response format

What should the API return?

**JSON**

```json
{
  "id": 123,
  "name": "John",
  "email": "john@example.com"
}
```

Standard. Well-supported. Human-readable. Good for: Everything.

**HAL (Hypertext Application Language)**

Adds links and relationships:

```json
{
  "id": 123,
  "name": "John",
  "_links": {
    "self": { "href": "/users/123" },
    "orders": { "href": "/users/123/orders" }
  }
}
```

Good for: Discoverable APIs. Self-documenting.

**GraphQL**

Client specifies exactly what fields it needs:

```graphql
query {
  user(id: 123) {
    name
    email
  }
}
```

Good for: Complex queries. Reducing bandwidth. Mobile clients.

**Protobuf**

Binary format. Compact. Fast.

Good for: High-performance APIs. gRPC. Bandwidth-constrained clients.

Recommendation: Use JSON by default. Use GraphQL if clients need flexibility. Use Protobuf for performance-critical systems.

### 8. Backward compatibility

How do you change your API without breaking clients?

**Additive changes** (safe)

- Add a new optional field
- Add a new endpoint
- Add a new operation to an existing endpoint

Clients using old versions ignore new fields. They continue to work.

**Breaking changes** (unsafe)

- Remove a field
- Change a field's type
- Change a field's meaning
- Remove an endpoint

Old clients break.

Strategy:

- New fields should be optional (default to something sensible)
- Removed fields should be deprecated first (exist for 1-2 versions but are discouraged)
- Field types should not change
- Field meanings should not change

Example: You want to rename "customer_id" to "customerId".

Bad: Remove customer_id, add customerId. Old clients break.

Good: Add customerId as the primary field. Keep customer_id for backward compatibility. Deprecate customer_id. In version 2, remove customer_id.

Recommendation: Make breaking changes rarely. When you must, provide a long deprecation period (at least 1-2 years for public APIs).

### 9. Documentation and discoverability

How do clients know what your API does?

**OpenAPI specification**

Machine-readable schema that describes your API:

```yaml
openapi: 3.0.0
info:
  title: Orders API
  version: 1.0.0
paths:
  /orders:
    get:
      summary: List orders
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: List of orders
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Order'
```

From this spec, you can:

- Generate interactive documentation (Swagger UI)
- Generate client libraries automatically
- Validate requests and responses
- Test the API

**Examples and runbooks**

Show clients how to use the API:

```bash
curl -X GET https://api.example.com/orders/123 \
  -H "Authorization: Bearer token123"
```

**Status page**

Let clients know if the API is up or down.

Recommendation: Use OpenAPI as the source of truth. Generate documentation from it. Provide examples. Keep a status page.

### 10. Deprecation and retirement

How do you remove old APIs?

Deprecation timeline:

1. **Announce** - Tell clients this API will change (3-6 months warning)
2. **Deprecate** - Mark the API as deprecated in documentation and responses (1-2 years of support)
3. **Sunset** - Stop supporting the old version (after 1-2 years)

In responses, include deprecation headers:

```
Deprecation: true
Sunset: Sat, 1 Jan 2025 00:00:00 GMT
Link: <https://docs.example.com/v2>; rel="successor-version"
```

Communicate through:

- Blog posts
- Email to API consumers
- In-app notifications
- Support documentation

Recommendation: Never abruptly remove an API. Always provide a deprecation window. Give clients time to migrate.

## Building and Maintaining APIs

Design is important, but execution matters too.

### API versioning in code

Keep versions separate in your codebase:

```
handlers/
  v1/
    orders_handler.go
    users_handler.go
  v2/
    orders_handler.go
    users_handler.go
```

When you add a new version, you can:

- Keep v1 as-is (low risk)
- Implement v2 with new logic
- Run both in parallel during deprecation

### Testing APIs

Test every aspect:

- Happy path (request succeeds)
- Unhappy path (invalid input, missing field)
- Edge cases (boundary values, empty lists)
- Permissions (authorized user succeeds, unauthorized fails)
- Rate limiting (exceeding rate limit returns 429)
- Backward compatibility (old fields still work)

Use contract testing to ensure client and server agree on the API:

```python
# Server test
def test_order_response_has_id():
    response = get_order(123)
    assert "id" in response
    assert isinstance(response["id"], int)

# Client test (same test, verifying client can parse)
def test_order_response_parsing():
    response = {"id": 123, "total": 50.00}
    order = Order.from_dict(response)
    assert order.id == 123
```

### Monitoring APIs

Track:

- Request volume
- Response time (p50, p99)
- Error rates
- Status codes distribution
- Rate limit violations

Alert when:

- Error rate spikes
- Response time degrades
- API returns 500 errors

Use distributed tracing to understand failures:

```
GET /orders/123
  ↓ calls
GET /payment-service/validate?customer=X
  ↓ takes 5 seconds
Response slow. Payment service is slow.
```

## Best Practices for API Design

### 1. Design for discoverability

Clients should be able to figure out how to use your API by exploring it.

```
GET /
→ Returns links to all resources

GET /orders
→ Links to specific order operations

GET /orders/123
→ Links to related resources (customer, payments)
```

### 2. Use consistent naming

If one endpoint uses `customer_id`, do not use `customerId` in another. Pick a convention and stick to it.

### 3. Use meaningful status codes

200 OK for success. 400 for client error. 500 for server error. Not everything is 200.

### 4. Provide good error messages

"Invalid request" is not helpful. "Email must be a valid email address" is.

### 5. Design for the client

Think about how the client will use your API. If clients always need orders and their customer, provide a way to fetch both in one request (compound document, embedding, or a specific endpoint).

### 6. Version early

Design versioning into your API from v1. Do not add it in v2 when you wish you had it in v1.

### 7. Deprecate carefully

Give clients time to migrate. Sunsetting too quickly causes friction.

### 8. Monitor adoption

Know which versions clients are using. If a client is still on v1 after v3 exists, reach out. They might not know about the new version.

### 9. Test against real clients

Invite early adopters to use your API. Get feedback before launch.

### 10. Document thoroughly

Someone will use your API. Make it easy for them.

## Organizational Benefits of Good API Design

**Faster integrations**

Clients can integrate with your API without reaching out to support for clarifications.

**Fewer support tickets**

Well-designed APIs are self-explanatory. Confused clients mean support requests.

**Higher adoption**

People like using good APIs. They avoid bad ones.

**Easier scaling**

You can change internal implementation without breaking clients.

**Competitive advantage**

Companies known for good APIs attract more integrations and partners.

**Lower maintenance costs**

You maintain fewer versions. You deprecate cleanly instead of supporting multiple versions forever.

## Conclusion

API design is not just about aesthetics. It is about building systems that work well for years, that are easy for clients to use, and that do not create technical debt.

The key principles:

1. **Think in resources, not operations** (REST)
2. **Plan for versioning and deprecation** (design for change)
3. **Be consistent** (naming, error format, behavior)
4. **Make breaking changes rarely** (prefer backward-compatible changes)
5. **Document well** (OpenAPI, examples, runbooks)
6. **Monitor usage** (know what clients depend on)
7. **Provide long deprecation windows** (give clients time to migrate)

Good API design takes thinking upfront, but it pays dividends for years. The best APIs feel inevitable—they are so natural that clients wonder if there was ever another way to design them.

Spend time on design. Your future self will thank you.
