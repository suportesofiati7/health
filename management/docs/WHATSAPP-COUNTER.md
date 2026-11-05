# WhatsApp widget counter

Owners open **Cliques no WhatsApp** in the management sidebar. The report shows today, the last 7 days, this calendar month, a 7/30-day chart and downloadable CSV, using America/Sao_Paulo. It refreshes every 30 seconds. Days before counter activation are unavailable, not measured zeros. The first day and current periods may be partial. This is a click counter, not a count of messages, leads or unique people.

The public site's existing analytics click handler sends one UUID to the `whatsapp-click` Edge Function only after analytics consent and for WhatsApp links across the public site (hero, header, body, footer and floating widget). It does not send page URLs, messages, destinations or visitor identifiers. GA4's existing contact_click remains unchanged. Counting no longer depends on GTM event forwarding.

The collector uses the existing origin allowlist and daily salted IP rate-limit bucket (30 requests/minute). IPs are not stored in click rows. The existing rate limiter expires old buckets. This is basic abuse protection, not proof that each event represents a human. Duplicate UUIDs are acknowledged without being counted twice. Client delivery is best-effort and ad blockers/network failures may cause undercounting. WhatsApp navigation never waits for measurement.

The table records only a random event UUID and the server timestamp. Anonymous direct database writes and all non-owner reads are blocked. The report RPC is SECURITY INVOKER, uses RLS, and checks the existing active membership/session helper for clinic/software owners. It never accesses clinical records.

## Local preview

Run `npm run dev -- --host 127.0.0.1 --port 5560 --strictPort` in `management`, then open http://127.0.0.1:5560/preview/whatsapp . The preview uses a separate SQLite database at ignored `management/.cache/whatsapp-preview.sqlite`; it persists actual test clicks across reloads. The embedded test runs the public analytics script, with Google disabled and navigation suppressed. Check the consent box, click the test button, then refresh. The preview data is explicitly labeled local. Only loopback requests are accepted; external origins are rejected. The preview handler and auth-free preview route are absent from production serving/builds.

## Production activation (not performed by a local preview)

1. Apply the migration `20261105151720_whatsapp_widget_counts.sql` using the existing controlled management release workflow. This creates the counter start timestamp. Do not insert sample events in production.
2. Deploy `management/supabase/functions/whatsapp-click`, with the existing `RATE_LIMIT_SALT`, `PUBLIC_ORIGIN`, Supabase service credentials and `verify_jwt = false` config. Both www/non-www aliases of PUBLIC_ORIGIN are accepted for this endpoint; clinical endpoint access is unchanged.
3. Build/deploy the public website (updated analytics.js and analytics-config.js) and management app. The management production page requires the existing owner login. No new Google account connection or secrets in the frontend are needed.
4. After consent on the live site, click a WhatsApp button once. Check for HTTP 202 from the collector, then verify the authenticated management count increased. Do not claim production tracking is active until this check passes.

Existing Google Analytics history is not imported. Earlier data cannot be reconstructed by this counter.

## Verification

`npm test`, `npm run test:db`, `npm run build` in management; `npm run check:analytics` in repository root. With the dev server above running, `node management/tests/whatsapp-browser.mjs` verifies consent denied/granted, one click/one count, duplicate retry, persistence, chart filtering, CSV download, mobile layout, dark mode and failed-refresh behavior. Browser tests add a labeled local test click, never a production event.

The collector also counts direct WhatsApp CTAs introduced in the organic-contact update. Counts represent all measured site WhatsApp clicks, not just the floating widget. The database table/RPC names retain their original widget names for compatibility. Direct Instagram/Google/WhatsApp contacts outside the site are not included.
