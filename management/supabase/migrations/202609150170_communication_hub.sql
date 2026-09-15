begin;

-- A conversation can be a standalone team room or a direct staff room. Patient
-- and appointment context remain optional, so team chat never needs a patient.
alter table public.communication_conversations
  drop constraint if exists communication_conversations_kind_check;
alter table public.communication_conversations
  add constraint communication_conversations_kind_check check(kind in ('equipe','direta','patient_internal'));

create table if not exists public.communication_participants (
  organization_id uuid not null references public.organizations(id),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (organization_id, conversation_id, user_id),
  foreign key (organization_id, conversation_id)
    references public.communication_conversations(organization_id, id) on delete cascade
);

create index if not exists communication_participants_user
  on public.communication_participants(organization_id, user_id, conversation_id);

alter table public.communication_participants enable row level security;
revoke all on public.communication_participants from anon, authenticated;
grant select, insert, update on public.communication_participants to authenticated;

drop policy if exists communication_participants_read on public.communication_participants;
create policy communication_participants_read on public.communication_participants
for select to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao','leitura'])
);
drop policy if exists communication_participants_insert on public.communication_participants;
create policy communication_participants_insert on public.communication_participants
for insert to authenticated with check (
  private.has_role(organization_id, array['proprietario','profissional','recepcao'])
  and exists (
    select 1 from public.memberships m
    where m.organization_id = communication_participants.organization_id
      and m.user_id = communication_participants.user_id
      and m.status = 'ativo'
  )
);
drop policy if exists communication_participants_update on public.communication_participants;
create policy communication_participants_update on public.communication_participants
for update to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao','leitura'])
) with check (
  private.has_role(organization_id, array['proprietario','profissional','recepcao','leitura'])
);

drop policy if exists communication_staff_read on public.communication_conversations;
create policy communication_staff_read on public.communication_conversations
for select to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao','leitura'])
  and (
    kind = 'equipe'
    or created_by = auth.uid()
    or exists (
      select 1 from public.communication_participants p
      where p.organization_id = communication_conversations.organization_id
        and p.conversation_id = communication_conversations.id
        and p.user_id = auth.uid()
    )
  )
);
drop policy if exists communication_staff_write on public.communication_conversations;
create policy communication_staff_write on public.communication_conversations
for insert to authenticated with check (
  private.has_role(organization_id, array['proprietario','profissional','recepcao'])
  and created_by = auth.uid()
);
drop policy if exists communication_staff_update on public.communication_conversations;
create policy communication_staff_update on public.communication_conversations
for update to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao'])
  and (kind = 'equipe' or created_by = auth.uid() or exists (
    select 1 from public.communication_participants p
    where p.organization_id = communication_conversations.organization_id
      and p.conversation_id = communication_conversations.id
      and p.user_id = auth.uid()
  ))
) with check (
  private.has_role(organization_id, array['proprietario','profissional','recepcao'])
);

drop policy if exists communication_staff_read on public.communication_messages;
create policy communication_staff_read on public.communication_messages
for select to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao','leitura'])
  and exists (
    select 1 from public.communication_conversations c
    where c.organization_id = communication_messages.organization_id
      and c.id = communication_messages.conversation_id
      and (c.kind = 'equipe' or c.created_by = auth.uid() or exists (
        select 1 from public.communication_participants p
        where p.organization_id = c.organization_id and p.conversation_id = c.id and p.user_id = auth.uid()
      ))
  )
);
drop policy if exists communication_staff_write on public.communication_messages;
create policy communication_staff_write on public.communication_messages
for insert to authenticated with check (
  private.has_role(organization_id, array['proprietario','profissional','recepcao'])
  and sender_id = auth.uid()
  and exists (
    select 1 from public.communication_conversations c
    where c.organization_id = communication_messages.organization_id
      and c.id = communication_messages.conversation_id
      and (c.kind = 'equipe' or c.created_by = auth.uid() or exists (
        select 1 from public.communication_participants p
        where p.organization_id = c.organization_id and p.conversation_id = c.id and p.user_id = auth.uid()
      ))
  )
);
drop policy if exists communication_staff_update on public.communication_messages;
create policy communication_staff_update on public.communication_messages
for update to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao','leitura'])
  and (sender_id = auth.uid() or exists (
    select 1 from public.communication_participants p
    where p.organization_id = communication_messages.organization_id and p.conversation_id = communication_messages.conversation_id and p.user_id = auth.uid()
  ))
) with check (sender_id = sender_id);

create or replace function private.touch_communication_conversation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.communication_conversations
  set updated_at = now()
  where organization_id = new.organization_id and id = new.conversation_id;
  return new;
end;
$$;
drop trigger if exists communication_message_touch on public.communication_messages;
create trigger communication_message_touch after insert on public.communication_messages
for each row execute function private.touch_communication_conversation();

commit;
