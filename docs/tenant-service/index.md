# Tenant Service

The tenant service is responsible for tenant discovery and tenant-aware login routing.

## Purpose

- Identify which tenants a user belongs to.
- Support identifier-first login.
- Redirect users to the correct tenant login UI.
- Act as the discovery layer behind a dedicated login host such as `login.example.com`.

## Login Model

- Reados supports external identity providers such as GitHub, Google, and Outlook.
- Reados supports one-time-password-based login.
- Reados does not support password-based login.
- Reados uses identifier-first login.

## Login Flow

1. A user opens the dedicated login application, for example `login.example.com`.
2. The user enters their email address.
3. The tenant service looks up the tenants that the user is registered with.
4. Reados shows the list of available tenants.
5. The user selects one tenant.
6. Reados redirects the user to that tenant's login UI.

## Responsibilities

- Resolve a user identifier, initially email address, to one or more tenant memberships.
- Return tenant choices in a form suitable for the login application.
- Provide tenant metadata needed for redirect decisions.
- Support tenant-aware login entrypoints for each tenant deployment.
- Keep the global login experience separate from tenant-local login UIs.

## Notes

- A host such as `login.example.com` is a separate application from tenant-local applications.
- Tenant selection happens before the final tenant login UI is shown.
- The tenant service is a platform capability and should remain independent from password-based authentication because Reados does not support password login.
