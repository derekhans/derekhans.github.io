---
layout: post
title: "API Authentication Through Azure Entra and API Management"
date: 2026-05-08
tags: [azure, api, identity, entra]
---

Most organizations do not have an API authentication problem. They have dozens of API authentication problems — one for every service team that decided to handle it themselves. The team running the payments API chose HMAC signatures. The reporting service validates JWTs but only checks expiry. The internal data platform accepts API keys stored in a shared vault that nobody has rotated in two years. Each approach has gaps, inconsistencies, and its own operational burden. None of them talk to each other.

Centralizing authentication and authorization through Microsoft Entra ID and Azure API Management is not just an architectural preference — it is a practical answer to the compounding risk of distributed auth logic. This post covers how the two components divide responsibility, what each one actually manages, how they are configured to work together, and why the economics often justify the investment even before you factor in compliance requirements.

## The Problem With Letting Each API Handle Its Own Auth

The instinct to build auth into each service makes sense at first. Teams are moving fast, services are small, and the idea of waiting on a shared platform feels like bureaucratic overhead. The problem compounds over time.

When services own their own authentication:

- Token validation logic diverges across teams. One service checks `aud`. Another does not. One validates signature algorithms correctly. Another accepts `alg: none` because a developer copy-pasted example code from a blog post.
- Secret sprawl becomes impossible to track. API keys, client secrets, certificates, and tokens accumulate across configuration stores, environment variables, and occasionally source control.
- Observability is fragmented. You cannot answer the question "who has been calling our APIs in the last 24 hours?" without aggregating logs from five different places in five different formats.
- Revocation is slow and inconsistent. When a credential is compromised, revoking it means finding every service that uses it and manually coordinating a rotation. That takes hours or days, not minutes.
- Security posture is opaque. Security teams cannot audit or enforce consistent policy when every API team has invented its own approach.

The bigger risk is that your weakest link becomes the path in. An attacker who finds a service with lax token validation or an unrotated API key does not stop at that service — they pivot from it.

## What Centralized Auth Actually Means

Centralized authentication means that the decision about whether a request is allowed to proceed is made at a single, well-controlled enforcement point, rather than scattered across every backend service.

In practice, this looks like:

- One identity provider issues tokens (Entra ID).
- One gateway validates those tokens before requests reach backend services (Azure API Management).
- Backend services receive authenticated, enriched requests and apply only domain-level authorization — things like "can this specific user modify this specific resource?" rather than "is this a valid token at all?"

The backend service is still involved in authorization. It still enforces business rules, ownership checks, and data-level permissions. But it is not responsible for token cryptography, signature verification, scope parsing, or credential lifecycle. That work lives in the shared layer.

## Microsoft Entra ID: What It Manages

Entra ID is the identity and policy layer. Its job is to issue tokens and enforce conditions on who can request them.

### App Registrations and Service Principals

Every API and every client that calls an API gets an app registration in Entra ID. The API registration defines what the API is and what permissions it exposes. The client registration defines who is calling.

For APIs, the registration includes:

- An application ID URI (e.g., `api://your-api-name`) that becomes the audience claim in tokens.
- Scopes (delegated permissions) that human users can consent to.
- App roles (application permissions) for service-to-service access.

For clients, the registration includes:

- Client ID and credentials (a secret or certificate — prefer certificates).
- Delegated permissions the client needs on behalf of users.
- Application permissions for machine-to-machine calls.

This structure lets you represent the exact API surface area in the identity plane. A client has access to specific scopes on specific APIs, not blanket access to everything.

### Token Issuance

Entra ID issues OAuth 2.0 access tokens as JWTs. Those tokens carry claims the gateway and backend can read:

- `iss`: the issuer, which APIM validates against your Entra tenant.
- `aud`: the audience, which must match the API's registered URI.
- `sub` or `oid`: the caller's identity.
- `scp` or `roles`: the scopes or app roles granted.
- `exp` and `nbf`: expiry and not-before windows.
- Tenant-specific claims like `tid`.

Token lifetimes are configurable in Entra ID through token lifetime policies and Conditional Access sessions. The default access token lifetime is 75 minutes, but for high-sensitivity APIs you can push that down significantly.

### Conditional Access

Conditional Access sits in front of the token issuance process. Before Entra ID issues a token, it evaluates policies based on signals from the sign-in context:

- Is the user or device compliant?
- Is the sign-in coming from a trusted location?
- What is the sign-in risk level?
- Is this an interactive user flow or machine-to-machine?

For API access patterns, Conditional Access is most relevant for interactive flows where a user is authorizing a client application. For daemon or service-to-service calls using client credentials, the evaluation is simpler — the app credential is either valid or it is not, and the app roles assigned are either present or absent.

Where Conditional Access adds the most value for API scenarios is when combined with Continuous Access Evaluation (CAE), which allows real-time revocation of token validity when user state changes — account disabled, password changed, or session revoked — even within the token's normal lifetime.

### Groups, Roles, and Claims Mapping

Entra ID can include group memberships, app roles, and custom claims in tokens. This is how coarse authorization context flows from identity to the API layer.

For example, an API might define app roles like `DataReader`, `DataWriter`, and `Admin`. Those roles appear in the token's `roles` claim. The gateway can validate that the caller has a required role before forwarding the request, or the backend can read the claim and enforce domain-specific rules.

Custom claims can be configured through optional claims and claims mapping policies. You can add things like employee ID, department, or tenant identifier to tokens if those attributes are relevant to downstream API authorization.

## Azure API Management: What It Manages

APIM is the enforcement layer. It sits between the caller and the backend and is responsible for everything that happens to a request before it reaches the service.

### JWT Validation

The primary job of APIM in this pattern is validating tokens before forwarding requests. This is done through the `validate-jwt` policy, which is attached to APIs or API products.

A minimal policy looks like this:

```xml
<validate-jwt header-name="Authorization" failed-validation-httpcode="401">
    <openid-config url="https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid-configuration" />
    <audiences>
        <audience>api://your-api-name</audience>
    </audiences>
    <required-claims>
        <claim name="roles" match="any">
            <value>DataReader</value>
            <value>DataWriter</value>
        </claim>
    </required-claims>
</validate-jwt>
```

APIM fetches and caches the public signing keys from Entra's OIDC discovery endpoint. It validates the token signature, checks the issuer and audience, verifies expiry, and can enforce required claims or scopes before passing the request downstream. If validation fails, APIM returns a 401 and the backend never sees the request.

This policy lives in the APIM configuration plane, which means auth requirements for every API are visible, auditable, and managed through code or the Azure portal rather than buried in application logic.

### Rate Limiting and Quotas

APIM applies rate limits and quotas at the product, API, or operation level. You can enforce limits by subscription, by IP, or by a claim value extracted from the token (such as the caller's tenant ID).

```xml
<rate-limit-by-key calls="100" renewal-period="60"
    counter-key="@(context.Request.Headers.GetValueOrDefault("Authorization","").Split(' ').Last())" />
```

This prevents a single client — even a fully authenticated one — from overwhelming a backend service. Without a gateway layer, implementing this consistently requires every backend service to build its own rate limiting, which typically does not happen.

### Claims Extraction and Header Forwarding

Once a token is validated, APIM can extract claims and forward them to the backend as HTTP headers. The backend service reads trusted headers rather than parsing tokens itself.

```xml
<set-header name="X-User-Id" exists-action="override">
    <value>@(context.Request.Headers.GetValueOrDefault("Authorization","").AsJwt()?.Subject ?? "")</value>
</set-header>
<set-header name="X-Tenant-Id" exists-action="override">
    <value>@(context.Request.Headers.GetValueOrDefault("Authorization","").AsJwt()?.Claims.GetValueOrDefault("tid","") ?? "")</value>
</set-header>
<set-header name="X-Roles" exists-action="override">
    <value>@(string.Join(",", context.Request.Headers.GetValueOrDefault("Authorization","").AsJwt()?.Claims.Where(c => c.Key == "roles").SelectMany(c => c.Value) ?? new List<string>()))</value>
</set-header>
```

The backend trusts these headers because they came from APIM, and the backend is on an internal network path that only APIM can reach. The raw `Authorization` header is typically stripped before forwarding so backend services do not process tokens they were not designed to handle.

### Subscriptions and Products

APIM organizes APIs into Products, which can require a subscription key in addition to or instead of a bearer token. For external-facing APIs, subscription keys provide a secondary access control layer and allow per-consumer tracking.

Subscription keys are not a substitute for OAuth tokens — they do not carry identity or authorization context — but they are useful for client-level throttling, onboarding workflows, and tracking API consumption by partner or team before you have a full OAuth client credential story in place.

### Backend Authentication

APIM also manages how it authenticates to backend services. Options include:

- **Managed identity**: APIM can use its own managed identity to request a token for the backend if the backend is another Azure resource (e.g., Azure Functions, App Service, or a different API protected by Entra).
- **Client certificates**: APIM can present a certificate to backend services that require mTLS.
- **Named values and secrets**: Static credentials stored in Key Vault references in APIM configuration, not hardcoded in policy XML.

This keeps credential material out of application code and into a managed plane with audit logs and access controls.

### Observability

APIM emits logs and metrics to Azure Monitor and Application Insights. Every request — including the caller subscription, response code, latency, and matched policies — is recorded. Failed JWT validation events show up distinctly.

This gives security and platform teams a single place to look for API access anomalies: who is calling what, at what volume, and with what result codes. That signal does not exist when auth is spread across backend services.

## How the Two Layers Divide Responsibility

The division of responsibility is clean:

| Concern | Entra ID | APIM |
|---|---|---|
| Token issuance | Yes | No |
| Token validation | No | Yes |
| Client registration | Yes | No |
| Scope and role definition | Yes | No |
| Rate limiting | No | Yes |
| Conditional Access | Yes | No |
| Claims forwarding to backend | No | Yes |
| Backend credential management | No | Yes |
| API catalog and documentation | No | Yes |
| Observability (request logs) | Partial (sign-in logs) | Yes |

Entra ID owns the identity of the caller. APIM owns the enforcement of access to the API surface. Backend services own domain-level authorization using claims they receive as headers.

## Cost Savings

The cost argument for centralized auth is not just about license fees. It is about operational cost and risk.

**Reduced development time.** When teams do not build their own auth, they ship faster. JWT validation, scope checking, token refresh handling, and credential rotation are hard to get right. Teams that inherit those problems lose sprint cycles to security fixes that centralized auth would have prevented.

**Reduced incident response cost.** A compromised credential or misconfigured token validation in a service that does its own auth typically requires a manual response from the service team, the security team, and potentially the on-call rotation. With centralized auth, revocation happens at the Entra or APIM layer and is immediate across all APIs.

**APIM tier selection.** APIM pricing varies significantly by tier. The Developer tier is suitable for non-production. Basic and Standard cover most internal and moderate-traffic external APIs. Premium is required for multi-region deployments and private virtual network integration. For many organizations, two or three APIM instances (dev, staging, prod) cover the full environment at a fraction of the cost of building equivalent gateway infrastructure independently.

**Entra ID P1 versus P2.** Most of the patterns described here — OAuth app registrations, scopes, app roles, JWT issuance — require only Entra ID P1. Conditional Access requires P1. Continuous Access Evaluation and Identity Protection require P2. Price the license tier against the risk you are mitigating; not every API warrants the CAE controls that P2 enables.

**Reduced audit and compliance overhead.** When every API team produces their own auth implementation, audits require reviewing every implementation independently. With a centralized gateway, a single APIM audit covers the enforcement layer for all APIs. That is a material reduction in audit scope and cost at renewal time.

## Regulatory and Compliance Drivers

A number of regulatory frameworks either explicitly require or strongly imply centralized access control for APIs:

**SOC 2 (Type II).** The common criteria around logical access controls (CC6) require that access to systems and data is restricted based on least privilege, that access is logged, and that credentials are managed with appropriate controls. Distributed API auth makes it difficult to demonstrate consistent logical access controls across a system boundary.

**ISO 27001.** Control A.9 (Access Control) requires a formal user registration process, access provisioning procedures, and review of access rights. App registrations in Entra ID with defined scopes and roles map directly to these controls. Ad hoc API keys scattered across services do not.

**PCI DSS.** Requirements 7 and 8 mandate restricting access to system components based on business need, and assigning a unique ID to each person with computer access. For APIs handling cardholder data, this means being able to trace every API call to a specific authenticated identity. A gateway that validates tokens and emits logs with caller identity satisfies this in a way that self-managed API keys cannot.

**HIPAA.** The Access Control technical safeguard (§164.312(a)(1)) requires assigning unique user identification and controlling access to ePHI. APIs that process health data need to demonstrate that every access event can be attributed to a specific, authenticated identity. Centralized token issuance through Entra ID provides that attribution.

**GDPR.** Article 25 (Data Protection by Design and Default) and Article 32 (Security of Processing) require that access to personal data is appropriately controlled and auditable. While GDPR does not mandate specific technologies, a centralized auth gateway with consistent logging satisfies the intent of these requirements more reliably than distributed implementations.

**NIS2 (EU) and equivalent cyber frameworks.** The emphasis on access management, incident response, and audit trails in network and information security frameworks aligns directly with what a centralized auth layer provides.

In practical terms, when your compliance team is preparing for an audit, being able to show one place where API authentication is configured and one place where access logs are collected is significantly easier than explaining ten different approaches across ten services.

## Implementation Considerations

### Start with a Claims Contract

Before configuring policies, define the claims contract: what claims will tokens carry, what headers will APIM forward, and what will backend services expect. This contract should be documented and version-controlled.

A minimal contract might define:

- `X-User-Id`: the `sub` or `oid` claim from the token.
- `X-Tenant-Id`: the `tid` claim for multi-tenant APIs.
- `X-Roles`: the comma-separated `roles` claims.
- `X-Scopes`: the `scp` claim values.

Backend services read these headers and implement domain-level authorization based on them. If the contract changes, it changes in one place (the APIM policy) and is communicated to backend teams.

### Use Separate App Registrations Per API

Resist the temptation to use a single app registration for all your APIs. Each API should have its own registration with its own audience URI. This gives you fine-grained control over which clients can access which APIs and avoids situations where a token issued for one API is accepted by another.

### Validate the Full Token Chain

The `validate-jwt` policy in APIM should always check:

- Signature (done automatically using the OIDC discovery endpoint).
- Issuer (`iss` matches your Entra tenant ID).
- Audience (`aud` matches the API's specific application ID URI).
- Expiry (`exp` is not in the past).
- Required claims or scopes appropriate for the API.

Validating only expiry and signature is insufficient. An access token issued for API A should not be accepted by API B. Audience validation is the control that prevents this.

### Use Backend Private Networking

APIM and backend services should be on the same private virtual network, with the backend services not exposed to public internet. This ensures that the only path to the backend is through APIM, which has validated the token. A backend service that can be reached directly bypasses all the gateway-level controls.

### Log Token Validation Failures

Configure APIM to log failed JWT validation events to Log Analytics or Application Insights, and create alerts for sustained spikes in 401 or 403 responses. That pattern is often the first signal of a credential compromise or misconfiguration.

## What This Architecture Does Not Cover

Centralized auth at the gateway is an external enforcement layer. It does not:

- Replace service-to-service authorization for east-west traffic inside your network. For that, use managed identities, service mesh policies, or internal token validation.
- Replace application-level business logic authorization. The gateway validates that the caller is authenticated and has the right role. It does not know that a specific user is not allowed to edit a specific record.
- Protect against insider threats where a valid token is used for unintended purposes within its scope. That requires anomaly detection and behavioral monitoring layered on top of the access logs.

The gateway layer is the foundation, not the complete solution. It narrows the attack surface and creates a consistent enforcement point, but it works best when paired with defense in depth at the backend layer.

## Conclusion

Centralized API authentication through Entra ID and Azure API Management is not the most exciting architecture to implement, but it is one of the more durable investments a platform team can make. The configuration work is front-loaded. The operational benefit compounds over time as the number of APIs grows and the alternative — every team managing their own auth — becomes progressively more expensive and more fragile.

Entra ID owns who the caller is. APIM owns whether the caller can proceed. Backend services own what the caller can do with specific resources. Keeping those responsibilities separated and giving each layer the right tools is what makes the pattern work.

The compliance and regulatory angle adds urgency for organizations in regulated industries, but the operational case stands on its own even without an audit in the calendar. Consistent token validation, centralized credential management, and unified observability are worth having regardless of who is asking.
