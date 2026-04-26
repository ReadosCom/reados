#!/usr/bin/env bash

set -euo pipefail

docker compose run --rm --no-deps frontend /usr/bin/bash -lc "rm -rf /app/testing/output/.nyc_frontend /app/testing/output/.nyc_backend /app/testing/output/.nyc_merged /app/testing/output/coverage /app/testing/output/playwright-report /app/testing/output/test-results" >/dev/null 2>&1 || true
docker compose down -v >/dev/null 2>&1 || true
rm -rf testing/output/*

status=0
mkdir -p testing/output/.nyc_frontend
chmod 0777 testing/output/.nyc_frontend

COVERAGE=true docker compose up -d --build
if [ $? -ne 0 ]; then
  echo "Failed to start the Docker containers."
  exit 1
fi

for migration_service in core tenant authentication accounting; do
  npm run dc:migrate -- "${migration_service}"
  if [ $? -ne 0 ]; then
    echo "Failed to run migrations for ${migration_service}."
    exit 1
  fi
done

tsx testing/wait-for-url.ts http://demo.reados.localhost
tsx testing/wait-for-url.ts http://tenant.reados.localhost
tsx testing/wait-for-url.ts http://accounting.demo.reados.localhost
if [ $? -ne 0 ]; then
  echo "Failed to wait for the URL."
  exit 1
fi

set +e
playwright test --config testing/playwright.config.ts
status=$?
tsx testing/collect-backend-coverage.ts
collect_status=$?
docker compose down
down_status=$?
tsx testing/normalize-coverage.ts
normalize_status=$?
mkdir -p testing/output/.nyc_merged
nyc report --all --nycrc-path testing/.nycrc.json --temp-dir testing/output/.nyc_merged --reporter=text --reporter=lcov --reporter=html --report-dir=testing/output/coverage --exclude-after-remap=false
report_status=$?
set -e

if [ $down_status -ne 0 ]; then
  echo "Failed to stop the Docker containers."
  exit $down_status
fi

if [ $collect_status -ne 0 ]; then
  echo "Failed to collect backend coverage data."
  exit $collect_status
fi

if [ $normalize_status -ne 0 ]; then
  echo "Failed to normalize coverage data."
  exit $normalize_status
fi

if [ $report_status -ne 0 ]; then
  echo "Failed to generate the coverage report."
  exit $report_status
fi

exit $status
