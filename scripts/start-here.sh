#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
env_file="${repo_root}/.env"
pgbouncer_userlist_file="${repo_root}/config/compose/pgbouncer/userlist.local.txt"
pgadmin_pgpass_file="${repo_root}/config/compose/pgadmin/pgpassfile.local"
default_postgres_password="$(cat /proc/sys/kernel/random/uuid)"
default_pgadmin_password="$(cat /proc/sys/kernel/random/uuid)"

cd "${repo_root}"

if [[ -f "${env_file}" ]]; then
  printf ".env already exists. Overwrite it? [y/N] "
  read -r overwrite_choice

  if [[ ! "${overwrite_choice}" =~ ^[Yy]$ ]]; then
    echo "Keeping the existing .env file."
    echo "Run the stack with: docker compose up --build"
    exit 0
  fi
fi

printf "Enter the PostgreSQL password for local development [%s]: " "${default_postgres_password}"
read -r postgres_password
postgres_password="${postgres_password:-${default_postgres_password}}"

printf "Enter the pgAdmin admin password for local development [%s]: " "${default_pgadmin_password}"
read -r pgadmin_password
pgadmin_password="${pgadmin_password:-${default_pgadmin_password}}"

if [[ -z "${postgres_password}" || -z "${pgadmin_password}" ]]; then
  echo "Passwords cannot be empty."
  exit 1
fi

cat > "${env_file}" <<EOF
READOS_POSTGRES_PASSWORD=${postgres_password}
READOS_PGADMIN_PASSWORD=${pgadmin_password}
EOF

cat > "${pgbouncer_userlist_file}" <<EOF
"postgres" "${postgres_password}"
EOF

cat > "${pgadmin_pgpass_file}" <<EOF
pgbouncer:6432:postgres:postgres:${postgres_password}
EOF

chmod 600 "${env_file}"
chmod 644 "${pgbouncer_userlist_file}"
chmod 644 "${pgadmin_pgpass_file}"

echo "Local secret files have been written."
echo "Next step:"
echo "  docker compose up --build"
