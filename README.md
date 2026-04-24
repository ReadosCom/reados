# Reados

Reados is a modular business software platform. The product is designed as a set of loosely coupled applications and platform capabilities that can be enabled per tenant.

## Module Catalog

| Name | Description | Status |
| --- | --- | --- |
| `core` | Shared platform foundations and common operations. | In progress |
| `accounting` | Financial records, ledgers, and reporting. | In progress |
| `authentication` | Sign-in, identity, and session management. | In progress |
| `tenant` | Tenant discovery, routing, and tenant configuration. | In progress |
| `crm` | Customer and relationship management. | Evaluating |
| `sales` | Quotes, orders, and sales workflows. | Evaluating |
| `billing` | Invoicing, payments, and billing flows. | Evaluating |
| `contract management` | Contracts, terms, and renewal tracking. | Evaluating |
| `inventory` | Stock, movements, and item tracking. | Evaluating |
| `procurement` | Suppliers, purchase orders, and sourcing. | Evaluating |
| `hr` | People, roles, and employment records. | Evaluating |
| `payroll` | Compensation, payroll periods, and payouts. | Evaluating |
| `projects` | Planning, delivery, and project execution. | Evaluating |
| `documents` | Versioned files and document management. | Evaluating |
| `inbox` | Email inbox and communication workflows. | Evaluating |
| `cms` | Website and content management tools. | Evaluating |
| `authorization` | Permissions, roles, and access control. | Evaluating |
| `workflow` | Automation and cross-module process flows. | Evaluating |
| `audit` | Audit history and activity tracking. | Evaluating |
| `search` | Cross-module search and discovery. | Evaluating |
| `notification` | Alerts, messages, and delivery channels. | Evaluating |

## Product Direction

Reados is intended to support isolated tenant deployments with selectable modules. Each tenant can run its own stack and enable only the applications required for that tenant.

## Authentication and Tenant Discovery

- Reados will support sign-in with external identity providers such as GitHub, Google, and Outlook.
- Reados will also support one-time-password-based login.
- Reados will not support password-based login.
- Reados will use identifier-first login.
- A dedicated login application, such as `login.example.com`, will be separate from tenant applications.
- The login flow will be:
  - a user enters their email address
  - Reados lists the tenants the user is registered with
  - the user selects a tenant
  - Reados redirects the user to that tenant's login UI
- This requires a dedicated tenant service for tenant discovery and tenant-aware login routing.

## Platform Decisions

- Each backend module uses its own PostgreSQL database.
- PostgreSQL tables use singular names.

## Development and Deployment

- Production deployments are based on Docker Compose.
- Local development is also based on Docker Compose.
- Local development should stay production-shaped:
  - use the same service topology and network model as production
  - keep the same core infrastructure dependencies and service boundaries
  - allow development-friendly container commands, mounted source code, and watch mode where needed
- `compose.yaml` lives at the repository root to make the Docker Compose workflow obvious to contributors.
- Compose definitions live under `config/compose/`.
- PostgreSQL migrations live under `config/postgres/migrations/`.
- Root `compose.yaml` is the main Compose definition.
- Each application or infrastructure service has its own `*.compose.yaml` file.
- `Traefik` is the ingress and reverse proxy for local and production-shaped Compose environments.
- Local routing uses service-specific hosts such as `tenant.reados.localhost`, `<tenant>.reados.localhost`, and `<module>.<tenant>.reados.localhost`.
- The tenant service is global at `tenant.reados.localhost`, while tenant-scoped module services use hosts such as `accounting.demo.reados.localhost`.
- Only `Traefik` is exposed to the host machine. Internal services stay on the Docker network.
- `PgAdmin` is available behind Traefik at `pgadmin.localhost` and connects directly to PostgreSQL.
- Run `./scripts/start-here.sh` first to generate `.env` and the local secret files needed by Compose.
- Start the stack with `docker compose up --build`.
- Run authentication and tenant migrations with `npm run dc:migrate authentication` and `npm run dc:migrate tenant`.
- Seed tenant data interactively with `npm run dc:seed tenant`.
- For staging and production automation, run the same seed command with `SEED_NON_INTERACTIVE=true` and the `SEED_*` environment variables documented in the PostgreSQL migrations guide.
- Backend module containers use the shared internal port `3000`.
- The frontend uses `frontend.dockerfile`.
- Backend modules share `server.dockerfile`.
- Infrastructure definitions should account for `PostgreSQL` and the application services currently in use.
- The current Compose scaffold includes `Traefik`, `PgAdmin`, `PostgreSQL`, and the active application services.

## Documentation

- [Docs Index](docs/index.md)
- [Authentication Service](docs/authentication-service/index.md)
- [Tenant Service](docs/tenant-service/index.md)
