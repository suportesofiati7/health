# Patient linking verification — 30 October 2026

The form review previously showed disabled “Vincular” buttons for already-linked forms without explaining that registration had already created or linked the patient. It also used the editable status field rather than the saved patient link to decide whether linking was available.

The updated review uses patient_id to determine linking state. Unlinked forms offer the active duplicate shortcut and searchable patient picker. Linked forms explain that a patient is already associated and provide the existing “Abrir paciente” action; redundant linking controls are omitted. Concurrent-link errors now give a readable instruction to reopen the form. Existing links cannot be silently reassigned to a different patient.

The patient picker also clears its delayed blur timer when it regains focus, preventing search options from disappearing immediately after cancelling a confirmation.

A real-data-service browser test creates a uniquely named fictional patient and form with a PDF attachment. It verifies cancellation, confirmed linking to the selected existing patient, no duplicate patient creation, original-answer retention, document visibility, the linked-state explanation and opening the linked patient. It then deletes only its fictional records and revokes its test session. See [test results](result.json) and [linked form](linked-form.png).

Management unit tests and production build pass. The browser regression suite additionally covers cancellation from the duplicate shortcut and already-linked forms.

Published to https://app.francielesofiati.com via Cloudflare deployment https://c87bbfcb.app-9ac.pages.dev. The final production browser run passed all checks and verified fictional-record cleanup.
