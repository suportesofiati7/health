#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "${SOFIATI_TEST_CLUSTER:-}" != "active" ]]; then
  exec pg_virtualenv env SOFIATI_TEST_CLUSTER=active bash scripts/test-db.sh
fi
psql -X -v ON_ERROR_STOP=1 -q -f tests/platform.sql
for migration in supabase/migrations/*.sql; do
  psql -X -v ON_ERROR_STOP=1 -q -f "$migration"
done
psql -X -v ON_ERROR_STOP=1 -f tests/security.sql
