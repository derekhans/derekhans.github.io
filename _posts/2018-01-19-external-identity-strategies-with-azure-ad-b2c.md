---
layout: post
title: "External Identity Strategies with Azure AD B2C"
date: 2018-01-19
tags: [identity, azure, architecture]
---

Azure AD B2C handles customer-facing identity scenarios. It's a separate service from Azure AD, designed for high-scale consumer authentication.

## Use Cases

- Customer portals
- E-commerce sites
- Mobile applications
- Partner access

## User Flows vs. Custom Policies

**User Flows:**
Pre-built, configurable experiences for common scenarios

**Custom Policies:**
XML-based policies for complex requirements

```xml
<TechnicalProfile Id="SelfAsserted-ProfileUpdate">
  <DisplayName>Profile Update</DisplayName>
  <Protocol Name="Proprietary" />
  <Metadata>
    <Item Key="ContentDefinitionReferenceId">api.selfasserted.profileupdate</Item>
  </Metadata>
</TechnicalProfile>
```

## Social Identity Providers

B2C supports federation with:

- Google
- Facebook
- Apple
- Any OIDC provider

## Customization

Full control over the user interface. Inject your own HTML, CSS, and JavaScript for a branded experience.
