# Authentication Service

The authentication service is responsible for sign-in flows, identity-provider integration, one-time-password login, and session establishment for tenant applications.

## Purpose

- Support sign-in with external identity providers such as GitHub, Google, and Outlook.
- Support one-time-password-based login.
- Establish authenticated sessions for tenant applications.
- Work together with the tenant service in an identifier-first login flow.

## Login Model

- Reados supports external identity providers such as GitHub, Google, and Outlook.
- Reados supports one-time-password-based login.
- Reados does not support password-based login.
- Reados uses identifier-first login.

## Relationship With Tenant Service

1. A user opens the dedicated login application, for example `login.example.com`.
2. The user enters their email address.
3. The tenant service returns the tenants that the user is registered with.
4. The user selects one tenant.
5. The user is redirected to that tenant's login UI.
6. The authentication service handles the selected login method for that tenant.

## Responsibilities

- Start and complete sign-in flows for supported external identity providers.
- Start and complete one-time-password-based login flows.
- Create and manage authenticated sessions after successful sign-in.
- Support tenant-aware login entrypoints after tenant selection has already happened.
- Keep authentication separate from password-based login because Reados does not support password authentication.

## Notes

- The authentication service is distinct from the tenant service.
- The tenant service is responsible for tenant discovery and redirect decisions.
- The authentication service is responsible for the actual sign-in flow after the tenant is known.
- The authentication service should support tenant-specific login UIs and tenant-specific identity-provider configuration where needed.
