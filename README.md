# Reados

Reados is a modular business software platform. The product is designed as a set of loosely coupled applications and platform capabilities that can be enabled per tenant.

## Module Catalog

| Name | Description | Status |
| --- | --- | --- |
| `core` | Shared platform foundations and common services. | In progress |
| `accounting` | Financial records, ledgers, and reporting. | In progress |
| `authentication` | Sign-in, identity, and session management. | In progress |
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
| `tenant` | Tenant configuration and isolation rules. | Evaluating |
| `workflow` | Automation and cross-module process flows. | Evaluating |
| `audit` | Audit history and activity tracking. | Evaluating |
| `search` | Cross-module search and discovery. | Evaluating |
| `notification` | Alerts, messages, and delivery channels. | Evaluating |

## Product Direction

Reados is intended to support isolated tenant deployments with selectable modules. Each tenant can run its own stack and enable only the applications required for that tenant.

## Platform Decisions

- `Kafka` is the message bus for inter-service and cross-module events.
- `OpenFGA` is the authorization engine for permissions, roles, and access control.
- `PgBouncer` sits between application services and PostgreSQL.
- `PgBouncer` uses port `6432`.
- Each backend module uses its own PostgreSQL database.
- `OpenFGA` uses its own PostgreSQL database.
- A single `PgBouncer` instance is used with per-database pool modes:
  - module databases use `transaction` pooling
  - `OpenFGA` uses `session` pooling

## Development and Deployment

- Production deployments are based on Docker Compose.
- Local development is also based on Docker Compose.
- Local development should stay production-shaped:
  - use the same service topology and network model as production
  - keep the same core infrastructure dependencies and service boundaries
  - allow development-friendly container commands, mounted source code, and watch mode where needed
- `compose.yaml` lives at the repository root to make the Docker Compose workflow obvious to contributors.
- Compose definitions live under `config/compose/`.
- Root `compose.yaml` is the main Compose definition.
- Each application or infrastructure service has its own `*.compose.yaml` file.
- `Traefik` is the ingress and reverse proxy for local and production-shaped Compose environments.
- Tenant-aware local routing uses subdomains such as `<tenant>.localhost`.
- Module APIs are routed behind the tenant host using service paths such as `/api/core`, `/api/authentication`, and `/api/accounting`.
- Only `Traefik` is exposed to the host machine. Internal services stay on the Docker network.
- `PgAdmin` is available behind Traefik at `pgadmin.localhost` and connects to databases through `PgBouncer`.
- Run `./scripts/start-here.sh` first to generate `.env` and the local secret files needed by Compose.
- Start the stack with `docker compose up --build`.
- Backend module containers use the shared internal port `3000`.
- The frontend uses `frontend.dockerfile`.
- Backend modules share `server.dockerfile`.
- Infrastructure definitions should account for `Kafka`, `OpenFGA`, `PostgreSQL`, and `PgBouncer`.
- The current Compose scaffold includes `Traefik`, `PgAdmin`, `Kafka`, `OpenFGA`, `PostgreSQL`, and `PgBouncer`.
