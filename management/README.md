# Franciele Sofiati Management App

Private clinical-management workspace for Franciele Sofiati. This app lives in
`management/` and is separate from the public site. The only public-site changes
are the small homepage access bars in `../index.html` and `../en/index.html`.

Do not enter real patient data until the remote production gates in
`docs/OPERATIONS.md` are complete and evidenced.

## Local Development

To start the local app by clicking a file, double-click the executable
`run-local.py` and choose “Run in Terminal” if your file manager asks. It tries
`127.0.0.1:5550` first, then automatically checks the next ports until the app
is running and opens the working URL in the browser.

```bash
cd management
npm install
npm run dev
```

The local app uses the existing Supabase project URL and publishable key from
`src/lib.js`. Development and browser tests use fictional data only unless you
explicitly sign into a configured remote project.

## Verification

```bash
cd management
npm test
npm run test:db
npm run build
npm run dev
MANAGEMENT_TEST_URL=http://127.0.0.1:5173 npm run test:browser
```

If Vite moves to another port, set `MANAGEMENT_TEST_URL` to the port shown by
the dev server.

## Deployment Shape

- Public site remains the repository-root static site.
- Public homepage links point to `management/pre-cadastro.html` and
  `management/access.html`.
- The private app should deploy from `management/dist` to a separate Cloudflare
  Pages project, normally `https://app.francielesofiati.com`.
- Supabase stores Auth users, memberships, clinical data, audit events, private
  files, and rate limits.
- Supabase Edge Functions handle public intake, staff links, file validation,
  and encrypted email backup packets.

## Runbooks

- Operations and deployment: `docs/OPERATIONS.md`
- Security model and production gates: `docs/SECURITY.md`
- Backup and recovery: `docs/RECOVERY.md`
- Original audit notes and evidence: `docs/AUDIT.md`
