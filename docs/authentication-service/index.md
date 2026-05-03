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

1. A user opens the dedicated login application, for example `app.reados.localhost`.
2. The user opens `/identify` and enters their email address.
3. The tenant service returns the tenants that the user is registered with.
4. The user selects one tenant.
5. The user is redirected to that tenant's login UI at `<tenant>.<root_fqdn>/authentication` (for example `demo.reados.localhost/authentication`).
6. The authentication service handles the selected login method for that tenant.

## Responsibilities

- Start and complete sign-in flows for supported external identity providers.
- Start and complete one-time-password-based login flows.
- Create and manage authenticated sessions after successful sign-in.
- Support tenant-aware login entrypoints after tenant selection has already happened.
- Keep authentication separate from password-based login because Reados does not support password authentication.

## Email Transport Configuration

The authentication service supports two OTP delivery modes controlled by `AUTHENTICATION_EMAIL_TRANSPORT`.

- `AUTHENTICATION_EMAIL_TRANSPORT=smtp`
- This is the default runtime mode for normal environments.
- OTP emails are sent using SMTP.
- Required SMTP environment variables:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASSWORD`
  - `SMTP_FROM`
- Optional SMTP environment variable:
  - `SMTP_SECURE` (`true` or `false`)

- `AUTHENTICATION_EMAIL_TRANSPORT=test`
- This is intended for automated testing.
- OTP emails are not sent over SMTP.
- OTP codes are captured in-memory by the authentication service.
- The test-only endpoint `GET /test/otp/latest?email=<email>` can be used by e2e tests to retrieve the latest code.
- This endpoint is only exposed in test-oriented runtime conditions.

## Notes

- The authentication service is distinct from the tenant service.
- The tenant service is responsible for tenant discovery and redirect decisions.
- The authentication service is responsible for the actual sign-in flow after the tenant is known.
- The authentication service should support tenant-specific login UIs and tenant-specific identity-provider configuration where needed.
