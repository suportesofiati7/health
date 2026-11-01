begin;
create table public.intake_notification_outbox (
 id uuid primary key default gen_random_uuid(),
 intake_id uuid not null unique references public.public_intakes(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed')),
 attempts integer not null default 0,
 available_at timestamptz not null default now(),
 sent_at timestamptz,
 last_error text,
 created_at timestamptz not null default now()
);
alter table public.intake_notification_outbox enable row level security;
revoke all on public.intake_notification_outbox from anon,authenticated;
grant all on public.intake_notification_outbox to service_role;
create function private.queue_intake_notification() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.patient_id is not null and new.status='convertido' then
  insert into public.intake_notification_outbox(intake_id) values(new.id) on conflict(intake_id) do nothing;
 end if;
 return new;
end $$;
create trigger intake_notification_queue after insert or update of patient_id,status on public.public_intakes for each row execute function private.queue_intake_notification();
create function public.claim_intake_notifications() returns setof public.intake_notification_outbox language sql security definer set search_path='' as $$
 update public.intake_notification_outbox set status='sending',attempts=attempts+1,available_at=now()+interval '5 minutes'
 where id in (select id from public.intake_notification_outbox where ((status in ('pending','failed') and available_at<=now()) or (status='sending' and available_at<=now())) and attempts<12 order by created_at for update skip locked limit 10) returning *;
$$;
revoke all on function public.claim_intake_notifications() from public,anon,authenticated;
grant execute on function public.claim_intake_notifications() to service_role;
commit;
