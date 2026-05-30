# Coding Standards

This document is the source of truth for coding standards in this repository.

## Naming

- Use Biome as the repository formatter.
- Use lowercase names for non-React files such as `accounting.schema.ts`, `accounting.router.ts`, and `accounting.query.ts`.
- Use PascalCase for React component files such as `AccountingPage.tsx` and `AccountingForm.tsx`.
- Do not use non-descriptive suffixes in React component or file names (for example `Page`, `View`, `Screen`, `Component`, `Container`, `Wrapper`, `Manager`, `Handler`, `Util`, `Helper`, `Thing`, `Data`). Name components by domain intent instead (for example `Accounting`, `InvoiceList`, `ProfileForm`).
- Use the correct filename for each file in a component.
- Keep all component-level types in `*.schema.ts` files, including both Zod-inferred types and manually declared types, instead of creating separate `*.types.ts` files.
- Keep component-level custom error classes in `*.schema.ts` files as well (for example `*NotFoundError`, `*ValidationError`) instead of declaring them in controllers, routers, or clients.
- Do not allow backend/frontend schema drift: when a contract is shared by both sides, define it once in the component `*.schema.ts` file and import that same schema/type everywhere.
- Do not duplicate equivalent validators across components; extract and reuse shared schema primitives when the same field contract (for example email, language, profile fields) appears in multiple flows.
- Use `*.controller.ts` only for backend business logic and data-access orchestration; keep controllers framework-agnostic and free of Express request/response handling.
- Use `*.query.ts` for TanStack Query hooks and query/mutation wrappers.
- Use `*.client.ts` for browser-side HTTP request helpers and API clients (non-React-Query wrappers).
- Prefer semicolons at the end of TypeScript statements.
- Use `*.router.ts` for route definitions.
- Reserve `*.server.ts` for service entry files only.
- Keep server-side helper logic in the component `*.controller.ts` file instead of introducing separate service files.
- Use single or double quotes for import specifiers. Do not use backticks in `import` statements.
- Use the `@components/*` alias for imports that cross component boundaries within `src/components`.
- Do not create pass-through re-export wrappers (for example forwarding a helper unchanged from one module to another). Consumers should import the canonical helper directly from its source module.
- Standardize on UUID v7 for identifier generation across frontend and backend.
- Where possible, prefer PostgreSQL to generate UUID v7 values unless application-side generation is strictly necessary.
- For API success responses, keep the transport envelope as `{ success: true, data: ... }` and pass domain payloads directly to `respond(...)`; avoid redundant wrappers like `{ segment: ... }`, `{ segments: ... }`, or `{ summary: ... }` unless additional sibling fields are required.
- Standardize timestamp representations in schemas/contracts as ISO strings (not JavaScript `Date` objects).
- Always use `Temporal.Instant.toString()` when converting Temporal values across DB/API boundaries so persisted/transmitted timestamps stay in a valid canonical format.

## Frontend

- Use React with TypeScript.
- Prefer functional React components.
- Use `shadcn/ui` as the frontend design/component library for this project.
- Use `Radix UI` primitives as the accessibility-focused foundation under `shadcn/ui`.
- Use `Tailwind CSS` and design tokens via CSS variables for styling and theming.
- Do not introduce `sass`/`scss` for application styling.
- Use `TanStack Router` as the frontend router for this project.
- Never create wrapper-only React components that only render another component unchanged. Consumers must import the canonical component directly.
- Use the built-in `fetch` API for frontend HTTP requests instead of adding a wrapper such as Axios or Ky by default.
- Use TanStack Query for shared async and server-backed data.
- Do not use TanStack Query as a blanket replacement for purely local UI interaction state such as modal visibility, drag-and-drop state, or short-lived transient interaction state.
- Standardize on the ECMAScript Temporal API via `@js-temporal/polyfill` for date/time handling.
- Use `react-error-boundary` for frontend error-boundary ergonomics.
- Use `dompurify` when rendering user-provided HTML.
- Treat multiple languages as a first-class frontend concern.
- Use `i18next` and `react-i18next` for localization.
- Use backticks for string literals everywhere except import specifiers and object keys.
- Use double quotes for import specifiers and object keys.
- Use React Hook Form for forms unless a different choice is explicitly made.
- For form validation and form state, standardize on `react-hook-form` + `zod` + `@hookform/resolvers/zod` as documented in shadcn React Hook Form guides.
- For form UI primitives, use shadcn components and patterns (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`) with repository wrappers under `src/components/uiframework/`.
- Install and use form-related shadcn primitives in `src/components/uiframework/` as needed (`Field`, `Label`, `Input`, `Textarea`, `Select`, `NativeSelect`, `Checkbox`, `RadioGroup`, `Switch`, `InputOTP`), and compose them with React Hook Form + Zod.
- Standardize page structure for application routes with a single clear heading pattern per page. Avoid duplicate top-level headers when a `CardHeader` already serves as the page heading.
- Keep route-level layout spacing in `ApplicationLayout`; do not duplicate outer frame wrappers or top-level padding/margin scaffolding inside feature components.
- Standardize async loading UX with `Skeleton` placeholders for route-level and card-level loading states instead of plain text-only loaders when layout space is known.
- Keep the frontend as one shared application even when features belong to different modules.
- Do not introduce API mocking libraries such as `msw`; prefer real integration flows and Playwright end-to-end coverage instead.
- When running end-to-end tests, use `npm test`.
- At the end of each implementation iteration, run `npm run check`.
- Treat end-to-end tests as the only test layer for feature verification in this repository; do not add or rely on separate unit or integration test suites unless explicitly requested.
- Coverage is generated from end-to-end test execution and should be treated as the repository coverage source of truth.
- In tests, do not define inline API response shapes. Import and use shared `*.schema.ts` schemas/types (prefer schema `.parse(...)`) so test assertions stay aligned with runtime contracts.
- For E2E test organization and atomicity conventions, follow `docs/testing/e2e-structure.md`.

## Style Guide

- Prefer right aligned buttons unless there is a solid reason not to.
- When right aligned, primary button should be right most button.
- In table layouts, when an `Actions` column exists, it must be the first column.

## Backend

- Use Node.js LTS.
- Prefer Ubuntu latest LTS as the base image for Node.js containers.
- Share one `tsconfig.server.json` across server-side applications.
- Use one TypeScript server entrypoint per module, and keep route registration in the component router file.
- Use singular names and camelCase quoted identifiers for PostgreSQL tables, columns, and functions.
- For PostgreSQL relationship columns, prefer the referenced domain noun over storage-specific suffixes. Use names such as `"tenant"` and `"user"` instead of `"tenantId"` or `"userEmail"` so query aliases read naturally.
- Validate backend input.
- Validate frontend request payloads and backend request/response payloads with the same shared Zod schemas for shared contracts.
- Add error handling for network requests.
- Use a separate PostgreSQL database per backend module.
- Use `ensurePool` from `src/components/postgres/pool.ts` for shared PostgreSQL access instead of creating ad hoc pools in backend modules.
- Initialize database pools at module load time in backend components; do not lazily create connections inside route registration or request handlers.
- Prefer database connection strings such as `DATABASE_URL` over split database host/port/user/password environment variables.
- Use `zod-openapi` to derive OpenAPI-compatible schemas from Zod definitions.
