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
npx supabase db push --linked --yes

echo "== Confirming migration status =="
npx supabase migration list --project-ref "$PROJECT_REF"

echo "== Deploying all Supabase Edge Functions =="
for function_name in intake formulario staff files email-backup; do
  npx supabase functions deploy "$function_name" --project-ref "$PROJECT_REF" --no-verify-jwt
done
# communication-email requires an authenticated staff JWT.
npx supabase functions deploy communication-email --project-ref "$PROJECT_REF"
# portal is intentionally JWT-protected in supabase/config.toml.
npx supabase functions deploy portal --project-ref "$PROJECT_REF"

echo ""
echo "Backend sync complete. The Cloudflare site was not deployed."
