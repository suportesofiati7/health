# Login investigation — 2026-10-27

## Confirmed live state

After CLI reconnection, read-only queries against the linked production project confirmed:

- The clinic-owner professional account exists, is email-confirmed, has an active owner membership, and is neither banned nor deleted. Its last successful sign-in was October 26. The current password was not requested, read or tested.
- Four patient records exist, but there are zero patient portal accounts and zero patient portal sessions. This portal cannot authenticate any patient until credentials are generated. No accounts were created automatically during this investigation.
- Auth audit logging has no stored entries. Failed login history could not be established from that table.
- The deployed professional bundle uses the correct Supabase project and publishable key. A single intentionally invalid, fictional professional login reached Auth and returned `invalid_credentials`.
- The remote Auth site URL and recovery redirect allow-list point to the correct app domain. These were inspected without changing configuration.
- The portal function had gateway JWT verification enabled. Its code uses CPF/password and its own session tokens. The publishable-key compatibility path allowed a diagnostic request to reach the old handler; therefore gateway configuration alone is not established as the cause of the reported failure.

## Fixes

- Normalize professional email and preserve error distinctions: invalid credentials, unconfirmed email, membership failures, throttling, network/server outage, and invalid recovery links.
- Stop claiming a recovery email was requested successfully when Auth returned an error.
- Support query-string token hashes and PKCE codes, plus existing fragment callbacks. Remove callback credentials from history. Prefill the authenticated recovery email.
- Require an active membership after successful professional authentication. Preserve database errors rather than silently treating them as absent membership.
- Add bounded patient-portal requests and reject malformed successful responses.
- Surface patient account lookup and session creation failures rather than silently issuing unusable sessions.
- Fix shared Edge error extraction: a plain `Error` has no `.code`; the old wrapper selected an empty value and replaced useful messages with `request_failed`.
- Add portal's custom-auth configuration to both deployment helpers.
- Add an owner-only patient credential control under the patient's Privacy / portal panel. It uses the existing authenticated `staff` action, requires the patient's CPF, generates a temporary password, and requires a password change at first login. Generating a password explicitly replaces any previous password. The temporary password is shown only in component state, can be hidden, and is cleared when changing patients.

## Live backend deployment

`portal`, `staff`, and `formulario` were deployed successfully with the updated shared wrapper. The existing application-level authentication checks remain in place. The clinical form deployment also completes the previously authorized email-delivery backend fix.

Live smoke checks:

- Empty patient login: HTTP 400 `credentials`.
- Portal refresh without a patient token: HTTP 400 `auth`.
- Staff activation without a user JWT: HTTP 400 `auth`.
- Clinical form missing required identity: HTTP 400 `required`.

No patient data was returned by these unauthenticated checks, and no patient was enrolled or password changed.

## Recovery and frontend rollout

A script can generate a private one-time recovery URL for the existing active clinic owner:

```bash
node management/scripts/recover-clinic-owner.mjs
```

It captures the CLI service credential in memory, does not email it or print it, verifies the existing account, and saves the recovery link to a mode-0600 file under the current user's private state directory. The owner must open the link privately, choose a new password, then delete the file. Generating another link may invalidate the previous one.

The frontend must be built with `npm --prefix management run build` and published to the existing **management** Cloudflare project. Do not publish the public-site directory to the app project. At inspection time, Wrangler's connected account contained only the separate Francis Guedes site; it could not deploy this clinic's app. The public custom domain was receiving Git deployments during the investigation, but the final patient credential control still needs publication and verification.

After publishing, the owner can use Patients → select patient → Privacy / portal → Generate temporary password. A patient's portal password is separate from a professional's email/password login.

## Verification

- 15 unit tests passed, including recovery callback formats and actual Edge HTTP error mapping.
- Existing full management browser checks passed at desktop, tablet and mobile sizes.
- Focused intercepted-browser checks passed for professional invalid credentials, recovery outage without false success, patient outage, and successful patient login.
- Management production build and changed Edge TypeScript syntax checks passed.
- `git diff --check` passed.

A successful login using the owner's chosen password or a real patient credential was not claimed or simulated against production. Complete that verification after the owner finishes recovery and a patient has been explicitly provisioned.
