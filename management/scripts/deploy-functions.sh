#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Deploy every local function, using each function's JWT setting in config.toml.
npx supabase functions deploy --project-ref naypgbhwnlbyqqqfftgn
