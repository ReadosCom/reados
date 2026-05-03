# Deployment

This page is the starting point for deploying Reados in production-shaped environments.

## Domains

- Application root host is `app.<ROOT_FQDN>`.
- Bare root host `<ROOT_FQDN>` is reserved for a static site (for example marketing/landing pages).
- Tenant hosts follow `<tenant>.<ROOT_FQDN>`.
- Tenant module hosts follow `<module>.<tenant>.<ROOT_FQDN>`.

Examples:
- Local: `app.reados.localhost`, `demo.reados.localhost`, `accounting.demo.reados.localhost`
- Production: `app.reados.com`, `demo.reados.com`, `accounting.demo.reados.com`

## Frontend Runtime Config

- Committed default file: `public/default.config.json`
- Environment-specific runtime file: `public/config.json` (gitignored)

Current keys:
- `rootFqdn`
- `appFqdn`
- `tenantServiceFqdn`

At frontend startup, Reados fetches `/config.json` and uses it for host-routing behavior such as redirecting `<ROOT_FQDN>` to `app.<ROOT_FQDN>`.
`./scripts/start-here.sh` also syncs `.env` `ROOT_FQDN` from `public/config.json` (fallback: `public/default.config.json`) so Compose and frontend use the same root host.

## Compose Baseline

- Root compose file: `compose.yaml`
- Service compose files: `config/compose/*.compose.yaml`
- Reverse proxy/ingress: Traefik
- Data store: PostgreSQL
- Local admin UI: PgAdmin via `pgadmin.localhost`

## Deployment Workflow (Initial)

1. Provide environment-specific `public/config.json` values (`rootFqdn`, `appFqdn`, `tenantServiceFqdn`).
2. Run `./scripts/start-here.sh` to initialize local secret files and sync `.env` `ROOT_FQDN`.
3. Build and start services with Docker Compose.
4. Run database migrations.
5. Run seed flows when required.

Detailed production rollout/operations runbooks can be added here in follow-up sections.
