# Requested fixes: plan and implementation

The source list is `/to do.txt`. “Tarifas” was clarified as **Tarefas**.
Notification recipients were confirmed as **suportesofiati@gmail.com** and
**sofiatimendonca@gmail.com**.

| Request | Plan and implemented source change | Verification / remaining step |
| --- | --- | --- |
| Print / save PDF | Bind print buttons in the application rather than inline scripts blocked by CSP. Use the same opener for reports, receipts and consent previews. | Browser clicks and actual PDF generation under production-style CSP, summary and integral modes. |
| Patient selection | Preserve selected rows, hydrate existing IDs, and restrict generic patient fields to the caller's supplied choices. | Browser patient, follow-up, report and finance workflows. |
| Prepared WhatsApp messages | Retain the full selected patient, normalize Brazilian telephone prefixes and give specific validation feedback for missing contact/template fields. | Browser flow and template unit tests. |
| Task queue | Wrap the PostgREST request in a real Promise before handling errors; keep manual/null-source tasks in the query. | Browser tasks and database security suite. |
| Clinical follow-ups | Remove the task-loader exception that also prevented the follow-up panel from loading. | Browser follow-up creation and database tests. |
| “Tarifas” | Same task-queue fix, as clarified by the user. | No separate tariff system introduced. |
| Remove Nota Fiscal (both list entries) | Remove invoice state, actions, forms, metrics and handlers; remove the unused competing finance and receipt implementations. | Browser asserts invoice actions are absent. Historical database columns remain inert to preserve existing audit history. |
| Finance treatment thumbnails | Share the catalogue image component and match the procedure ID/current catalogue before falling back to its saved snapshot. | Management build and browser finance workflow. |
| Patient thumbnails | Include avatar paths in finance queries and render the same private-photo avatar used by patient profiles. | Browser fixture with a private patient photo. |
| Support notifications | Send to both confirmed inboxes; let the intake server notify first and use browser email as a fallback, avoiding parallel duplicate messages. | Email delivery unit tests; both functions deployed with the confirmed recipients; actual inbox delivery was not tested. |
| Date handling | Validate date-only inputs against São Paulo rather than the browser's local timezone. | Three browser timezone contexts, leap day and invalid date checks. |
| Explicit authorization | Reinstate required form fields and selected-procedure consent checks; enforce consent choices on the server; never restore acceptance or authorization from a draft. | Public form browser checks; server deployed. |
| Enzyme terms | Put an explicit enzyme term/acknowledgement in both form HTML files, with its own unchecked acceptance field. Identify that product-specific authorization still requires individual confirmation. | Public form browser check. |
| Alphanumeric fields | Use text inputs for identity number, issuer and letter; retain numeric validation for genuine quantities, money and CPF. | Browser enters letters and punctuation. |
| Separate issuer / number / letter | Separate public form fields and preserve all components in the intake and canonical patient identity value. | Browser field checks; backend deployed. |
| Edit Botox and all catalogue services | Serialize editable JSON correctly; preserve hidden structured keys and question metadata; exclude immutable row metadata; scroll to the editor. Make catalogue version history atomic in the database and detect stale edits. | Build, database version/price snapshot tests. Migration deployed. |
| Acceptance transfers to patient | Project only explicit intake choices when linking a patient, through one database trigger shared by automatic and staff conversion. Keep exact conditional marketing choices, source intake, form version and timestamps; preserve refusals; avoid duplicates. Backfill previously linked intakes using recorded choices. | Database tests for selected vs unselected terms, refusal, conditional authorization and idempotence. Migration deployed and verified. |
| Replace obsolete implementations | Delete unused finance/report variants and abandoned form/Edge Function backup copies. Share image and document components. | Management build and regression suites. |
| Remove test patients; correct real records; clear finance | Remove the old patient seeder so it cannot repopulate demo clinical/finance data. Inspect live identities before removing other patients; preserve Ashlyn and Monique, record only the treatments/consents and allergy reported by the user, and clear their financial records. | Completed after local Supabase login: two dummy patients and seeded history removed; only Ashlyn and Monique remain; finance records/payments are zero; reported treatments, consent history and Monique’s iodinated-contrast allergy recorded. Unknown treatment/acceptance dates remain unknown. |
| Remove tests from Finance | Retire the two shipped demo services in the migration and exclude them from the catalogue UI. Remove the finance-seeding patient fixture. | Frontend excludes demo services after migration; production data cleanup completed. |
| One source of truth | Shared patient/image/document paths, server-owned consent projection and atomic catalogue history; remove duplicate implementations. | Build and targeted regressions. |
| Publish service clusters and fixes to main | Keep the committed service-cluster content, fix discovered missing asset paths and duplicate journal cards, commit the requested changes and advance main to the resulting revision. | Git status/remote verification after push. |

## Validation and deployment boundary

Management unit tests, database security/consent/catalogue checks and browser
checks run against isolated fictional fixtures. No production data is used.
The targeted browser suite also checks actual PDF output and form authorization.

The full public release gate additionally reports substantial bilingual
structure/translation and SEO issues in the current content corpus. Missing
asset references and duplicate journal cards discovered during this work were
repaired. The remaining editorial/parity findings are not bypassed by weakening
validation. See the release notes in the final handoff for the latest check results.

Both `202610280001_intake_consent_and_catalogue.sql` and
`202610280002_reported_treatment_history.sql` were applied to production.
The `formulario` and `intake` functions were deployed. The migration and the new catalogue editor must be released together:
version snapshots are now written atomically by the database. The existing
`management/scripts/sync-backend.sh` runs migration and function deployment.
Configure `SUPPORT_SECONDARY_EMAIL=sofiatimendonca@gmail.com` if overriding the
built-in confirmed secondary recipient.

The live cleanup was verified: two active patients, no financial records or payments, three reported treatment-history records, reported consent status, and Monique’s contrast allergy. Three obsolete storage objects were removed. Patient-specific SQL and the local recovery snapshot were kept outside the Git repository. No dates, signatures, doses or performing professionals were invented.

Final checks: management unit tests, database security/consent/catalogue tests, desktop/tablet/mobile browser workflows, targeted CSP/PDF/date/form checks, public email tests, local asset validation, and public analytics validation passed. Public production build completed (556 pages, 1529 optimized image files). The full release gate remains failing on public bilingual/SEO findings; this is not a claim that every public-site validation passed.
