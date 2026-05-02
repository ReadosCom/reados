#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
env_file="${repo_root}/.env"
pgadmin_pgpass_file="${repo_root}/config/compose/pgadmin/pgpassfile.local"
postgres_env_file="${repo_root}/config/compose/postgres.env"
default_root_fqdn="${ROOT_FQDN:-reados.localhost}"
no_questions=false

for argument in "$@"; do
  case "${argument}" in
    --no-questions)
      no_questions=true
      ;;
    *)
      echo "Unknown argument: ${argument}" >&2
      exit 1
      ;;
  esac
done

cd "${repo_root}"

copy_service_env_files() {
  local compose_dir="${repo_root}/config/compose"
  local example_file
  local target_file
  local copied_count=0
  local skipped_count=0

  shopt -s nullglob
  for example_file in "${compose_dir}"/*.example.env; do
    target_file="${example_file/.example.env/.env}"

    if [[ -f "${target_file}" ]]; then
      skipped_count=$((skipped_count + 1))
      continue
    fi

    cp "${example_file}" "${target_file}"
    copied_count=$((copied_count + 1))
    echo "Created ${target_file#${repo_root}/} from ${example_file#${repo_root}/}."
  done
  shopt -u nullglob

  if [[ ${copied_count} -gt 0 || ${skipped_count} -gt 0 ]]; then
    echo "Service env initialization: ${copied_count} created, ${skipped_count} already existed."
  fi
}

copy_service_env_files

if [[ -f "${env_file}" && "${no_questions}" = false ]]; then
  printf ".env already exists. Overwrite it? [y/N] "
  read -r overwrite_choice

  if [[ ! "${overwrite_choice}" =~ ^[Yy]$ ]]; then
    echo "Keeping the existing .env file."
    echo "Run the stack with: docker compose up --build"
    exit 0
  fi
fi

if [[ "${no_questions}" = true ]]; then
  root_fqdn="${default_root_fqdn}"
else
  printf "Enter the root FQDN for local development [%s]: " "${default_root_fqdn}"
  read -r root_fqdn
  root_fqdn="${root_fqdn:-${default_root_fqdn}}"
fi

if [[ -z "${root_fqdn}" ]]; then
  echo "The root FQDN cannot be empty."
  exit 1
fi

cat > "${env_file}" <<EOF
ROOT_FQDN=${root_fqdn}
EOF

if [[ ! -f "${postgres_env_file}" ]]; then
  echo "Missing ${postgres_env_file#${repo_root}/}. Run this script after env files are initialized."
  exit 1
fi

postgres_password="$(sed -n 's/^POSTGRES_PASSWORD=//p' "${postgres_env_file}" | head -n 1)"

if [[ -z "${postgres_password}" ]]; then
  echo "POSTGRES_PASSWORD is missing in ${postgres_env_file#${repo_root}/}."
  exit 1
fi

cat > "${pgadmin_pgpass_file}" <<EOF
postgres:5432:postgres:postgres:${postgres_password}
EOF

chmod 600 "${env_file}"
chmod 644 "${pgadmin_pgpass_file}"

echo "Local secret files have been written."
echo "Next step:"
echo "  docker compose up --build"
