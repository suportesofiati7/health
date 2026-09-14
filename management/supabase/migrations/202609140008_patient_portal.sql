begin;

create table public.patient_portal_accounts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
  patient_id uuid not null, cpf_hash text not null, password_salt text not null, password_hash text not null,
  status text not null default 'ativo' check(status in ('ativo','revogado','bloqueado')),
  must_change_password boolean not null default true, failed_attempts integer not null default 0,
  locked_until timestamptz, last_login_at timestamptz, created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id,id), unique(organization_id,patient_id), unique(organization_id,cpf_hash),
  foreign key(organization_id,patient_id) references public.patients(organization_id,id)
);

create table public.patient_portal_sessions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
  account_id uuid not null, token_hash text not null unique, expires_at timestamptz not null,
  revoked_at timestamptz, created_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
  unique(organization_id,id), foreign key(organization_id,account_id) references public.patient_portal_accounts(organization_id,id)
);

create index patient_portal_cpf on public.patient_portal_accounts(organization_id,cpf_hash);
create index patient_portal_sessions_token on public.patient_portal_sessions(token_hash) where revoked_at is null;
alter table public.patient_portal_accounts enable row level security;
alter table public.patient_portal_sessions enable row level security;
revoke all on public.patient_portal_accounts, public.patient_portal_sessions from anon, authenticated;

-- Only the portal Edge Function (service role) may read or mutate these tables.
-- No browser JWT can query credentials or session tokens.

commit;
