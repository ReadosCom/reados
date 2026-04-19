# Reados Codex Instructions

## Project Shape

- Reados is a single repository project, not a monorepo.
- The frontend is a single React application.
- Backend module entrypoints live in the same repository and share one server-side TypeScript configuration.
- Tenant deployments are isolated per tenant.

## Source Layout

- Keep application source code under `src/`.
- Keep feature code under `src/components/<componentName>/`.
- Each component folder can contain frontend, backend, and validation files for that feature.
- Shared infrastructure helpers that belong to a component should also live under `src/components/<componentName>/`.
- Use one folder per component and colocate related files instead of splitting by technical layer at the top level.

## Naming

- Use lowercase names for non-React files such as `accounting.schema.ts`, `accounting.route.ts`, and `accounting.controller.ts`.
- Use PascalCase for React component files such as `AccountingPage.tsx` and `AccountingForm.tsx`.
- Use the correct filename for each file in a component.
- Keep all component-level types in `*.schema.ts` files, including both Zod-inferred types and manually declared types, instead of creating separate `*.types.ts` files.
- Business logic lives in `*.controller.ts`.
- Prefer semicolons at the end of TypeScript statements.
- Use `*.server.ts` for server-only shared helpers and entry files.
- Use single or double quotes for import specifiers. Do not use backticks in `import` statements.

## Frontend

- Use React with TypeScript.
- Prefer functional React components.
- Use React Hook Form for forms unless a different choice is explicitly made.
- Keep the frontend as one shared application even when features belong to different modules.

## Backend

- Use Node.js LTS.
- Prefer Ubuntu latest LTS as the base image for Node.js containers.
- Share one `tsconfig.server.json` across server-side applications.
- Use one TypeScript server entrypoint per module.
- Validate backend input.
- Add error handling for network requests.
- Use `Kafka` as the message bus for asynchronous and cross-module events.
- Use `OpenFGA` for authorization.
- Use `PgBouncer` between application services and PostgreSQL.
- Use PgBouncer on port `6432`.
- Use a separate PostgreSQL database per backend module.
- Use a separate PostgreSQL database for `OpenFGA`.
- Prefer database connection strings such as `DATABASE_URL` over split database host/port/user/password environment variables.
- Use a single `PgBouncer` instance with per-database pool modes:
  - module databases use `transaction` pooling
  - `OpenFGA` uses `session` pooling

## Platform Direction

- Modules are loosely coupled.
- Each tenant has one container stack, one storage bucket, one subdomain, and isolated databases per module.
- Production deployments use Docker Compose.
- Local development also uses Docker Compose.
- Local development should be production-shaped, with the same service topology, network model, and core infrastructure dependencies as production.
- `compose.yaml` lives at the repository root to make the Docker Compose workflow obvious to contributors.
- Compose files live under `config/compose/`.
- Root `compose.yaml` is the main Compose definition.
- Each application or infrastructure service has its own `*.compose.yaml` file.
- Use `Traefik` as the ingress and reverse proxy in Compose environments.
- Use tenant-aware routing through hosts such as `<tenant>.localhost`.
- Route module APIs behind the tenant host with service paths such as `/api/core`, `/api/authentication`, and `/api/accounting`.
- Expose only `Traefik` to the host machine. Keep other services internal to the Docker network unless there is a deliberate exception.
- Use `PgAdmin` behind Traefik for local database access, connecting through `PgBouncer`.
- Generate local secret files with `./scripts/start-here.sh` and use the default `.env` file for Compose.
- Use the shared internal port `3000` for backend module containers behind Traefik.
- The frontend uses `frontend.dockerfile`.
- Backend modules share `server.dockerfile`.
- Infrastructure should include `Kafka`, `OpenFGA`, `PostgreSQL`, and `PgBouncer`.
- The current Compose scaffold includes `Traefik`, `PgAdmin`, `Kafka`, `OpenFGA`, `PostgreSQL`, and `PgBouncer`.

## Current Module Catalog

- `accounting`
- `crm`
- `sales`
- `billing`
- `contract management`
- `inventory`
- `procurement`
- `hr`
- `payroll`
- `projects`
- `documents`
- `inbox`
- `cms`
- `authentication`
- `authorization`
- `tenant`
- `workflow`
- `audit`
- `search`
- `notification`
