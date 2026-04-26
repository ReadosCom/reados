#!/usr/bin/env bash

set -euo pipefail

service_type="${1:?Expected a service type argument.}"
shift

case "${service_type}" in
  backend)
    entrypoint_file="${1:?Expected a backend entrypoint file.}"
    service_name="${2:?Expected a backend service name.}"

    coverage="$(printf "%s" "${COVERAGE:-false}" | tr "[:upper:]" "[:lower:]" | tr -d "\r")"
    dev_mode="$(printf "%s" "${DEV_MODE:-false}" | tr "[:upper:]" "[:lower:]" | tr -d "\r")"

    echo "Starting ${service_name} server (coverage=${coverage}, devMode=${dev_mode})"

    if [ "${coverage}" = "true" ]; then
      echo "Mode: coverage"
      exec env NODE_OPTIONS="--loader @istanbuljs/esm-loader-hook" node --import tsx "${entrypoint_file}"
    fi

    if [ "${dev_mode}" = "true" ]; then
      echo "Mode: watch"
      exec npm run watch -- "${entrypoint_file}"
    fi

    echo "Mode: direct"
    exec node --import tsx "${entrypoint_file}"
    ;;
  frontend)
    dev_mode="$(printf "%s" "${DEV_MODE:-false}" | tr "[:upper:]" "[:lower:]" | tr -d "\r")"

    echo "Starting frontend (devMode=${dev_mode}, coverage=${COVERAGE:-false})"
    npm ci

    if [ "${dev_mode}" = "true" ]; then
      echo "Mode: watch"
      exec npm run dev -- --host 0.0.0.0
    fi

    echo "Mode: direct"
    npm run build
    exec npm run preview -- --host 0.0.0.0 --port 5173
    ;;
  *)
    echo "Unknown service type: ${service_type}" >&2
    exit 1
    ;;
esac
