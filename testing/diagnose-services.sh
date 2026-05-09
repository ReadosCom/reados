#!/usr/bin/env bash

set -euo pipefail

TAIL_LINES="${TAIL_LINES:-200}"

echo "== docker compose ps =="
docker compose ps --format json || docker compose ps

echo
echo "== docker compose logs (last ${TAIL_LINES} lines per service) =="
docker compose logs --no-color --tail="${TAIL_LINES}" || true
