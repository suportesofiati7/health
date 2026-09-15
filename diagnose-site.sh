#!/usr/bin/env bash
set -u

ROOT="/run/media/code/Storage/GitHub/ashtra/health"
MGMT="$ROOT/management"

PASS=0
FAIL=0
WARN=0

ok()   { echo "PASS: $*"; PASS=$((PASS+1)); }
bad()  { echo "FAIL: $*"; FAIL=$((FAIL+1)); }
warn() { echo "WARN: $*"; WARN=$((WARN+1)); }

echo
echo "=================================================="
echo " FRANCIELE SITE / FORM DIAGNOSTIC"
echo "=================================================="
echo

cd "$ROOT" || exit 1

# --------------------------------------------------
# 1. Git / branch
# --------------------------------------------------
echo "=== GIT ==="

BRANCH="$(git branch --show-current 2>/dev/null || true)"
if [ "$BRANCH" = "main" ]; then
  ok "Current branch is main"
else
  bad "Current branch is '$BRANCH', expected main"
fi

if git diff --quiet && git diff --cached --quiet; then
  ok "No uncommitted tracked changes"
else
  warn "There are uncommitted changes"
  git status --short
fi

if git rev-parse origin/main >/dev/null 2>&1; then
  LOCAL="$(git rev-parse main)"
  REMOTE="$(git rev-parse origin/main)"
  if [ "$LOCAL" = "$REMOTE" ]; then
    ok "Local main matches origin/main"
  else
    bad "Local main does not match origin/main"
  fi
fi

echo

# --------------------------------------------------
# 2. Public form file
# --------------------------------------------------
echo "=== PUBLIC FORM ==="

if [ -f "$ROOT/formulario.html" ]; then
  ok "formulario.html exists"
else
  bad "formulario.html missing"
fi

if grep -q 'functions/v1/formulario' "$ROOT/formulario.html" 2>/dev/null; then
  ok "Public form points to Supabase formulario Edge Function"
else
  bad "Public form is not pointing to formulario Edge Function"
fi

if grep -q 'turnstileSiteKey:"0x' "$ROOT/formulario.html" 2>/dev/null; then
  ok "Turnstile site key is present in formulario.html"
else
  bad "Turnstile site key appears missing"
fi

if grep -q 'js/public-intake.js' "$ROOT/formulario.html" 2>/dev/null; then
  ok "public-intake.js is loaded"
else
  bad "public-intake.js is not loaded"
fi

echo

# --------------------------------------------------
# 3. Public intake JavaScript
# --------------------------------------------------
echo "=== PUBLIC INTAKE JAVASCRIPT ==="

if [ -f "$ROOT/js/public-intake.js" ]; then
  ok "js/public-intake.js exists"
else
  bad "js/public-intake.js missing"
fi

if grep -q 'turnstile.render' "$ROOT/js/public-intake.js" 2>/dev/null; then
  ok "Turnstile render code exists"
else
  bad "Turnstile render code missing"
fi

if grep -q 'fetch(endpoint' "$ROOT/js/public-intake.js" 2>/dev/null; then
  ok "Form POST fetch code exists"
else
  bad "Form POST fetch code missing"
fi

if grep -q 'body.set("token"' "$ROOT/js/public-intake.js" 2>/dev/null; then
  ok "Turnstile token is added to submission"
else
  bad "Turnstile token is not being added to submission"
fi

echo

# --------------------------------------------------
# 4. Supabase local project
# --------------------------------------------------
echo "=== SUPABASE LOCAL CONFIG ==="

cd "$MGMT" || exit 1

if [ -f "supabase/config.toml" ]; then
  ok "supabase/config.toml exists"
else
  bad "supabase/config.toml missing"
fi

if grep -A2 '\[functions.formulario\]' supabase/config.toml 2>/dev/null | grep -q 'verify_jwt = false'; then
  ok "formulario function allows public unauthenticated requests"
else
  bad "formulario verify_jwt may block public submissions"
fi

echo

# --------------------------------------------------
# 5. Supabase remote
# --------------------------------------------------
echo "=== SUPABASE REMOTE ==="

if npx supabase functions list >/tmp/functions-list.txt 2>/tmp/functions-list.err; then
  if grep -q 'formulario' /tmp/functions-list.txt; then
    ok "formulario Edge Function exists remotely"
    grep 'formulario' /tmp/functions-list.txt
  else
    bad "formulario Edge Function missing remotely"
  fi
else
  bad "Could not query Supabase functions"
  cat /tmp/functions-list.err
fi

if npx supabase migration list >/tmp/migrations-list.txt 2>/tmp/migrations-list.err; then
  LAST_LOCAL="$(awk '/202609140009/ {print $1}' /tmp/migrations-list.txt | tr -d '`' | head -1)"
  LAST_REMOTE="$(awk '/202609140009/ {print $3}' /tmp/migrations-list.txt | tr -d '`' | head -1)"
  if [ "$LAST_LOCAL" = "202609140009" ] && [ "$LAST_REMOTE" = "202609140009" ]; then
    ok "Migration 009 is applied remotely"
  else
    warn "Could not confirm migration 009"
    cat /tmp/migrations-list.txt
  fi
else
  bad "Could not query migration status"
fi

echo

# --------------------------------------------------
# 6. Required secrets
# --------------------------------------------------
echo "=== SUPABASE SECRETS ==="

if npx supabase secrets list >/tmp/secrets-list.txt 2>/tmp/secrets-list.err; then
  for SECRET in \
    TURNSTILE_SECRET_KEY \
    RATE_LIMIT_SALT \
    PUBLIC_ORIGIN \
    MANAGEMENT_ORIGIN \
    INTAKE_NOTIFICATION_EMAIL
  do
    if grep -q "$SECRET" /tmp/secrets-list.txt; then
      ok "$SECRET is configured"
    else
      bad "$SECRET is missing"
    fi
  done
else
  bad "Could not list Supabase secrets"
fi

echo

# --------------------------------------------------
# 7. Edge Function implementation
# --------------------------------------------------
echo "=== FORMULARIO FUNCTION CODE ==="

FN="supabase/functions/formulario/index.ts"

if [ -f "$FN" ]; then
  ok "formulario function source exists"
else
  bad "formulario function source missing"
fi

check_code() {
  local pattern="$1"
  local label="$2"
  if grep -q "$pattern" "$FN" 2>/dev/null; then
    ok "$label"
  else
    bad "$label"
  fi
}

check_code 'TURNSTILE_SECRET_KEY' 'Function reads Turnstile secret'
check_code 'siteverify' 'Function calls Cloudflare Turnstile verification'
check_code 'public_intakes' 'Function writes to public_intakes'
check_code 'public_intake_files' 'Function writes attachment metadata'
check_code 'intake-private' 'Function uploads private attachments'
check_code 'INTAKE_NOTIFICATION_EMAIL' 'Function reads notification email setting'
check_code 'formsubmit.co' 'Function calls FormSubmit'

echo

# --------------------------------------------------
# 8. Build
# --------------------------------------------------
echo "=== MANAGEMENT BUILD ==="

if npm run build >/tmp/build.txt 2>/tmp/build.err; then
  ok "Management app builds successfully"
else
  bad "Management app build failed"
  tail -50 /tmp/build.err
fi

echo

# --------------------------------------------------
# 9. Tests
# --------------------------------------------------
echo "=== TESTS ==="

if npm test >/tmp/tests.txt 2>/tmp/tests.err; then
  ok "Existing automated tests pass"
else
  warn "Some automated tests failed or test command returned non-zero"
  tail -80 /tmp/tests.txt
  tail -80 /tmp/tests.err
fi

echo

# --------------------------------------------------
# 10. Suspicious committed temp/backup files
# --------------------------------------------------
echo "=== REPOSITORY HYGIENE ==="

if git -C "$ROOT" ls-files | grep -q '^supabase/.temp/'; then
  warn "supabase/.temp files are committed to Git"
fi

if git -C "$ROOT" ls-files | grep -q 'backup-before'; then
  warn "Backup files are committed to Git"
fi

echo

# --------------------------------------------------
# 11. Live HTTP checks
# --------------------------------------------------
echo "=== LIVE SITE HTTP CHECKS ==="

SITE="https://francielesofiati.com/formulario"
FUNC="https://naypgbhwnlbyqqqfftgn.supabase.co/functions/v1/formulario"

STATUS="$(curl -L -s -o /tmp/live-form.html -w '%{http_code}' "$SITE" || true)"
if [ "$STATUS" = "200" ]; then
  ok "Live /formulario returns HTTP 200"
else
  bad "Live /formulario returned HTTP $STATUS"
fi

if grep -q '0x4AAAAAAE0b8mFSgQqazkH8' /tmp/live-form.html 2>/dev/null; then
  ok "Live page contains expected Turnstile site key"
else
  bad "Live page does not contain expected Turnstile site key"
fi

if grep -q 'functions/v1/formulario' /tmp/live-form.html 2>/dev/null; then
  ok "Live page points to formulario Edge Function"
else
  bad "Live page does not point to formulario Edge Function"
fi

echo

# --------------------------------------------------
# 12. CORS/preflight test
# --------------------------------------------------
echo "=== EDGE FUNCTION CORS CHECK ==="

CORS_HEADERS="$(mktemp)"
curl -s -D "$CORS_HEADERS" -o /dev/null \
  -X OPTIONS \
  -H "Origin: https://francielesofiati.com" \
  -H "Access-Control-Request-Method: POST" \
  "$FUNC" || true

if grep -qi 'access-control-allow-origin' "$CORS_HEADERS"; then
  ok "Edge Function returns Access-Control-Allow-Origin"
else
  warn "Could not confirm CORS allow-origin header"
  cat "$CORS_HEADERS"
fi

echo

# --------------------------------------------------
# 13. Final report
# --------------------------------------------------
echo "=================================================="
echo " FINAL REPORT"
echo "=================================================="
echo "PASS: $PASS"
echo "WARN: $WARN"
echo "FAIL: $FAIL"
echo

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: No obvious local/deployment configuration failure found."
  echo "If the form still fails, inspect the browser Network response for"
  echo "POST /functions/v1/formulario and the Supabase Edge Function logs."
else
  echo "RESULT: One or more concrete problems were found above."
fi

echo
echo "IMPORTANT:"
echo "This script does NOT submit fake patient data."
echo "It checks code, deployment, secrets, live HTTP, CORS, build and tests."
echo "=================================================="
