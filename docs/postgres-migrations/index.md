PostgreSQL migrations live under `config/postgres/migrations/`.

Structure:

- `fncs/` contains shared idempotent functions that can be reused across services.
- One folder per database-backed service.
- Each service folder contains:
  - `ddls/` for idempotent schema changes that remain backward compatible for blue/green deployments
  - `fncs/` for service-specific idempotent function and procedure changes
  - `seed/` for idempotent SQL seed data when a service truly needs static SQL seeds

Current folders are aligned with the databases created in `init/001-databases.sql`.

Conventions:

- PostgreSQL object names use camelCase and quoted identifiers where needed.
- PostgreSQL tables use singular names.
- Relationship columns use the referenced domain noun instead of the storage key suffix, such as `"tenant"` and `"user"` instead of `"tenantId"` or `"userEmail"`.
- Tables should include `createdAt` and `updatedAt` columns by default.
- DDL migrations must be idempotent and backward compatible across blue/green deployments.
- Files execute in lexicographic order.

Running migrations:

- Directly from the repository root:
  - `DATABASE_URL=postgres://postgres:<password>@localhost:5432/authentication npm run migrate -- authentication`
  - `DATABASE_URL=postgres://postgres:<password>@localhost:5432/tenant npm run migrate -- tenant`
- Through Docker Compose with the dedicated migration file:
  - `npm run dc:migrate authentication`
  - `npm run dc:migrate tenant`
- If `DATABASE_URL` is not set, the migration runner falls back to `postgres://postgres:${READOS_POSTGRES_PASSWORD}@${POSTGRES_HOST:-localhost}:5432/<service>`.
- The argument after `--` selects the service migration folder, and `DATABASE_URL` selects the database to migrate.

The migration runner executes shared SQL from `migrations/fncs` first, then service-specific SQL in this order:

- `ddls`
- `fncs`
- `seed`

Tenant seed data:

- The `"user"` table belongs to the `authentication` database. The tenant database stores tenant membership by `"user"` without owning the user row.
- Run authentication and tenant migrations before seeding.
- Run `npm run dc:seed tenant` to ask for tenant, admin user, and billing account values interactively inside the Compose network.
- If you are connecting to externally reachable databases, `npm run seed -- tenant` also works with `AUTHENTICATION_DATABASE_URL` and `TENANT_DATABASE_URL`.
- For staging and production automation, set `SEED_NON_INTERACTIVE=true` and provide values through environment variables.
- Non-interactive mode requires every supported `SEED_*` variable unless `SEED_USE_DEFAULTS=true` is set for local automation.
- Supported variables are `SEED_TENANT_NAME`, `SEED_TENANT_SLUG`, `SEED_USER_EMAIL`, `SEED_USER_FIRST_NAME`, `SEED_USER_MIDDLE_NAME`, `SEED_USER_LAST_NAME`, `SEED_USER_DISPLAY_NAME`, `SEED_BILLING_ACCOUNT_NAME`, `SEED_BILLING_ACCOUNT_ADDRESS`, and `SEED_BILLING_ACCOUNT_TAX_ID`.
