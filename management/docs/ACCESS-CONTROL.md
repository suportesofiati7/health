# Clinic access levels

The management app uses least privilege. `proprietario` is the full owner level. The
Sofiati owner identity (`suportesofiati@gmail.com`) is the only identity allowed to
invite `proprietario` or `suporte_ti`; a technical owner can maintain the application
but cannot create another full owner. Database RLS remains authoritative over the UI.

## Roles and normal responsibilities

| Level | Typical scope |
| --- | --- |
| Proprietário | Business ownership, all clinical and administrative data, staff, permissions, audit, finance, backups, integrations and continuity. |
| Suporte técnico / desenvolvimento | Site, application, deployment, database, migrations, monitoring, security fixes and recovery support. Full access only when explicitly assigned by Sofiati; use audited sessions and never use clinical data for development. |
| Gestor(a) da clínica | Operations, quality, reports, workflow, schedules and team coordination; no owner promotion or unrestricted system administration. |
| Profissional de saúde | Patient identity plus authorized clinical assessment, anamnesis, plans, procedures, evolution, adverse events, photos, documents, consents and follow-up. |
| Médico(a), enfermeiro(a), fisioterapeuta, nutricionista, psicólogo(a) | The professional profile specialized to the person's license and scope; clinical access must still be limited to actual duties and local regulation. |
| Assistente clínico | Prepare visits, collect permitted information, coordinate follow-up and assist a clinician; no clinical finalization by default. |
| Recepção | Patient registration, contacts, enquiries, scheduling, intake workflow and operational communication; no clinical record or finance by default. |
| Secretário(a) | Registration, scheduling, administrative documents and communication. |
| Coordenador(a) operacional | Day-to-day flow, capacity, tasks, appointments and operational coordination. |
| Financeiro(a) | Charges, payments, receipts, invoices and reconciliation only when explicitly enabled; never clinical notes. The current finance module remains restricted to Sofiati. |
| Auditor(a) / qualidade | Read-only authorized records, reports and audit trails; no edits, exports or clinical work by default. |
| Marketing | Explicitly shared campaigns/assets only; no patient record or clinical photo access by default. |
| Consultor(a) externo | Time-limited, named scope only; revoke after the engagement. |
| Fornecedor / parceiro | Time-limited technical or operational scope only; no patient data by default. |
| Consulta administrativa | Limited read-only identity, schedule, intake and permitted reports. |

## Permission actions

Each area can be controlled with `view`, `create`, `edit`, `finalize`, `export`,
`share`, `delete`, `manage` and `administer`. Areas include patient identity,
appointments, intake, clinical records, assessments, anamnesis, treatment plans,
procedures, evolutions, adverse events, photos, documents, consents, reports,
exports, patient portal, communications, finance, inventory, external sharing,
settings, users, audit, integrations, security and data retention.

The role is a starting profile, not a substitute for a person's real professional
scope. Owners should reduce individual permissions for temporary or external users,
avoid exports unless necessary, require MFA in the identity provider, and review the
audit trail after access changes.
