PostgreSQL migrations live here.

Structure:

- `fncs/` contains shared idempotent functions that can be reused across services.
- One folder per database-backed service.
- Each service folder contains:
  - `ddls/` for idempotent schema changes that remain backward compatible for blue/green deployments
  - `fncs/` for service-specific idempotent function and procedure changes
  - `seed/` for idempotent seed data

Current folders are aligned with the databases created in `init/001-databases.sql`.

Conventions:

- PostgreSQL object names use camelCase and quoted identifiers where needed.
- PostgreSQL tables use singular names.
- Tables should include `createdAt` and `updatedAt` columns by default.
- DDL migrations must be idempotent and backward compatible across blue/green deployments.
- Files execute in lexicographic order.

Running migrations:

- Directly from the repository root:
  - `DATABASE_URL=postgres://postgres:<password>@localhost:5432/tenant npm run migrate -- tenant`
- Through Docker Compose with the dedicated migration file:
  - `docker compose -f compose.yaml -f config/compose/migrate.compose.yaml run --rm migration tenant`
- If `DATABASE_URL` is not set, the migration runner falls back to `postgres://postgres:${READOS_POSTGRES_PASSWORD}@${POSTGRES_HOST:-localhost}:5432/<service>`.
- The argument after `--` selects the service migration folder, and `DATABASE_URL` selects the database to migrate.

The migration runner executes shared SQL from `migrations/fncs` first, then service-specific SQL in this order:

- `ddls`
- `fncs`
- `seed`
