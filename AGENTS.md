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
- Do not consider history from other repositories, focus on this repository.

## Naming

- Use Biome as the repository formatter.
- Use lowercase names for non-React files such as `accounting.schema.ts`, `accounting.route.ts`, and `accounting.controller.ts`.
- Use PascalCase for React component files such as `AccountingPage.tsx` and `AccountingForm.tsx`.
- Use the correct filename for each file in a component.
- Keep all component-level types in `*.schema.ts` files, including both Zod-inferred types and manually declared types, instead of creating separate `*.types.ts` files.
- Business logic lives in `*.controller.ts`.
- Prefer semicolons at the end of TypeScript statements.
- Use `*.server.ts` for server-only shared helpers and entry files.
- Use single or double quotes for import specifiers. Do not use backticks in `import` statements.
- Standardize on UUID v7 for identifier generation across frontend and backend.
- Where possible, prefer PostgreSQL to generate UUID v7 values unless application-side generation is strictly necessary.

## Frontend

- Use React with TypeScript.
- Prefer functional React components.
- Use `@canonical/react-components` as the frontend design/component library for this project.
- Use `vanilla-framework` and `sass` to support Canonical React Components styling.
- Use `TanStack Router` as the frontend router for this project.
- Use the built-in `fetch` API for frontend HTTP requests instead of adding a wrapper such as Axios or Ky by default.
- Use React Query for shared cross-component state when the state fits query/cache semantics, especially for shared async or server-backed state.
- Do not use React Query as a blanket replacement for purely local UI interaction state such as modal visibility, drag-and-drop state, or short-lived transient interaction state.
- Standardize on the ECMAScript Temporal API via `@js-temporal/polyfill` for date/time handling.
- Use `react-error-boundary` for frontend error-boundary ergonomics.
- Use `dompurify` when rendering user-provided HTML.
- Treat multiple languages as a first-class frontend concern.
- Use `i18next` and `react-i18next` for localization.
- Use React Hook Form for forms unless a different choice is explicitly made.
- Keep the frontend as one shared application even when features belong to different modules.
- Do not introduce API mocking libraries such as `msw`; prefer real integration flows and Playwright end-to-end coverage instead.

## Style Guide

- Prefer right aligned buttons unless there is a solid reason not to. 
- When right aligned, primary button should be right most button.

## Backend

- Use Node.js LTS.
- Prefer Ubuntu latest LTS as the base image for Node.js containers.
- Share one `tsconfig.server.json` across server-side applications.
- Use one TypeScript server entrypoint per module.
- Use singular names and camelCase quoted identifiers for PostgreSQL tables, columns, and functions.
- Validate backend input.
- Add error handling for network requests.
- Use a separate PostgreSQL database per backend module.
- Prefer database connection strings such as `DATABASE_URL` over split database host/port/user/password environment variables.
- Use `zod-openapi` to derive OpenAPI-compatible schemas from Zod definitions.

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
- Use service-specific host-based routing locally through hosts such as `tenant.reados.localhost`, `<tenant>.reados.localhost`, and `<module>.<tenant>.reados.localhost`.
- Treat the tenant service as a global service at `tenant.reados.localhost`, while tenant-scoped module services use hosts such as `accounting.demo.reados.localhost`.
- Expose only `Traefik` to the host machine. Keep other services internal to the Docker network unless there is a deliberate exception.
- Use `PgAdmin` behind Traefik at `pgadmin.localhost` for local database access, connecting directly to PostgreSQL.
- Generate local secret files with `./scripts/start-here.sh` and use the default `.env` file for Compose.
- Use the shared internal port `3000` for backend module containers behind Traefik.
- The frontend uses `frontend.dockerfile`.
- Backend modules share `server.dockerfile`.
- Infrastructure should include `PostgreSQL` and the application services currently in use.
- The current Compose scaffold includes `Traefik`, `PgAdmin`, `PostgreSQL`, and the active application services.

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
