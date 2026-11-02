#!/usr/bin/env bash
set -euo pipefail

# Run from management/ after editing migrations, React code, or Edge Functions.
# This updates Supabase only. It does not deploy the Cloudflare/Vite site.

PROJECT_REF="naypgbhwnlbyqqqfftgn"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "== Checking application =="
npm test
npm run build

echo "== Applying database migrations =="
npx supabase db push --project-ref "$PROJECT_REF" --yes

echo "== Confirming migration status =="
npx supabase migration list --project-ref "$PROJECT_REF"

echo "== Deploying all Supabase Edge Functions =="
bash scripts/deploy-functions.sh

echo ""
echo "Backend sync complete. The Cloudflare site was not deployed."
