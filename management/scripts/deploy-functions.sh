#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npx supabase link --project-ref naypgbhwnlbyqqqfftgn
for function_name in intake staff files email-backup; do
  npx supabase functions deploy "$function_name" --project-ref naypgbhwnlbyqqqfftgn
done
