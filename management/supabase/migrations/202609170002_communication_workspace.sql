begin;

-- Conversation metadata used by the inbox, notifications, and context links.
alter table public.communication_conversations
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id),
  add column if not exists pinned_at timestamptz,
  add column if not exists pinned_by uuid references auth.users(id),
  add column if not exists last_message_at timestamptz,
  add column if not exists last_message_preview text not null default '';

alter table public.communication_messages
  add column if not exists reply_to_id uuid,
  add column if not exists message_type text not null default 'text',
  add column if not exists metadata jsonb not null default '{}' check (jsonb_typeof(metadata) = 'object'),
  add column if not exists client_message_id uuid,
  add column if not exists edited_at timestamptz,
  add column if not exists edited_by uuid references auth.users(id),
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id);
alter table public.communication_messages
  add constraint communication_messages_org_id_key unique (organization_id, id);

alter table public.communication_messages
  drop constraint if exists communication_messages_type_check;
alter table public.communication_messages
  add constraint communication_messages_type_check
  check (message_type in ('text','system','file','voice'));
alter table public.communication_messages
  add constraint communication_messages_reply_fk
  foreign key (reply_to_id) references public.communication_messages(id) on delete set null;
create unique index if not exists communication_messages_client_id
  on public.communication_messages(organization_id, client_message_id)
  where client_message_id is not null;
create index if not exists communication_conversations_last_message
  on public.communication_conversations(organization_id, last_message_at desc nulls last);

-- Per-user read state avoids mutating message rows just to display unread
-- counts and works for both team rooms and direct conversations.
create table if not exists public.communication_reads (
  organization_id uuid not null references public.organizations(id),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id),
  last_read_at timestamptz not null default now(),
  muted_until timestamptz,
  primary key (organization_id, conversation_id, user_id),
  foreign key (organization_id, conversation_id)
    references public.communication_conversations(organization_id, id) on delete cascade
);
create index if not exists communication_reads_user
  on public.communication_reads(organization_id, user_id, conversation_id);

create table if not exists public.communication_reactions (
  organization_id uuid not null references public.organizations(id),
  message_id uuid not null references public.communication_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  emoji text not null check (emoji in ('👍','❤️','😂','👏','❓','✅')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create table if not exists public.communication_attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  message_id uuid not null references public.communication_messages(id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  checksum text not null default '',
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  unique (organization_id, storage_path),
  foreign key (organization_id, message_id)
    references public.communication_messages(organization_id, id) on delete cascade
);
create index if not exists communication_attachments_message
  on public.communication_attachments(organization_id, message_id);

create table if not exists public.communication_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  conversation_id uuid not null,
  message_id uuid references public.communication_messages(id) on delete cascade,
  kind text not null default 'message' check (kind in ('message','mention','reply','task')),
  title text not null default '',
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (organization_id, conversation_id)
    references public.communication_conversations(organization_id, id) on delete cascade
);
create index if not exists communication_notifications_user
  on public.communication_notifications(organization_id, user_id, read_at, created_at desc);

-- Keep the inbox sortable without requiring a client refresh after every send.
create or replace function private.touch_communication_conversation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.communication_conversations
  set updated_at = now(), last_message_at = new.created_at,
      last_message_preview = left(coalesce(new.body, ''), 180)
  where organization_id = new.organization_id and id = new.conversation_id;
  return new;
end;
$$;

-- Notifications are created server-side so a client cannot choose recipients.
create or replace function private.notify_communication_message()
returns trigger language plpgsql security definer set search_path = '' as $$
declare c public.communication_conversations;
begin
  select * into c from public.communication_conversations
  where organization_id = new.organization_id and id = new.conversation_id;
  insert into public.communication_notifications(organization_id,user_id,conversation_id,message_id,kind,title,body)
  select new.organization_id, m.user_id, new.conversation_id, new.id,
    case when new.body like '%@%' then 'mention' else 'message' end,
    coalesce(nullif(c.title, ''), 'Nova mensagem interna'),
    left(new.body, 180)
  from public.memberships m
  where m.organization_id = new.organization_id and m.status = 'ativo'
    and m.user_id <> new.sender_id
    and (c.kind = 'equipe' or exists (
      select 1 from public.communication_participants p
      where p.organization_id = new.organization_id
        and p.conversation_id = new.conversation_id and p.user_id = m.user_id
    ));
  return new;
end;
$$;

drop trigger if exists communication_message_touch on public.communication_messages;
create trigger communication_message_touch after insert on public.communication_messages
for each row execute function private.touch_communication_conversation();
drop trigger if exists communication_message_notify on public.communication_messages;
create trigger communication_message_notify after insert on public.communication_messages
for each row execute function private.notify_communication_message();

create or replace function private.communication_message_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.sender_id <> auth.uid() and not private.has_role(old.organization_id, array['proprietario']) then
    raise exception 'not_authorized';
  end if;
  if new.sender_id <> old.sender_id or new.organization_id <> old.organization_id
     or new.conversation_id <> old.conversation_id or new.created_at <> old.created_at then
    raise exception 'message_identity_immutable';
  end if;
  if new.deleted_at is not null and old.deleted_at is null then
    new.deleted_by := auth.uid();
  elsif old.deleted_at is not null then
    new.deleted_at := old.deleted_at;
    new.deleted_by := old.deleted_by;
  end if;
  if new.body is distinct from old.body and new.deleted_at is null then
    new.edited_at := now();
    new.edited_by := auth.uid();
  end if;
  return new;
end;
$$;
drop trigger if exists communication_message_guard on public.communication_messages;
create trigger communication_message_guard before update on public.communication_messages
for each row execute function private.communication_message_guard();

-- Replace the broad historical message-update policy. Read state now lives in
-- communication_reads, so browser sessions may edit only their own message
-- body or soft-delete it.
revoke update on public.communication_messages from authenticated;
grant update(body, deleted_at) on public.communication_messages to authenticated;
drop policy if exists communication_staff_update on public.communication_messages;
create policy communication_staff_update on public.communication_messages
for update to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao'])
  and (sender_id = auth.uid() or private.has_role(organization_id, array['proprietario']))
  and exists (
    select 1 from public.communication_conversations c
    where c.organization_id = communication_messages.organization_id
      and c.id = communication_messages.conversation_id
      and (c.kind = 'equipe' or c.created_by = auth.uid() or exists (
        select 1 from public.communication_participants p
        where p.organization_id = c.organization_id and p.conversation_id = c.id and p.user_id = auth.uid()
      ))
  )
) with check (organization_id = organization_id and conversation_id = conversation_id);

-- Allow read-state updates only for the current user.
alter table public.communication_reads enable row level security;
revoke all on public.communication_reads from anon, authenticated;
grant select, insert, update on public.communication_reads to authenticated;
create policy communication_reads_own on public.communication_reads
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.communication_reactions enable row level security;
revoke all on public.communication_reactions from anon, authenticated;
grant select, insert, delete on public.communication_reactions to authenticated;
create policy communication_reactions_read on public.communication_reactions
for select to authenticated using (private.has_role(organization_id, array['proprietario','profissional','recepcao','leitura']));
create policy communication_reactions_write on public.communication_reactions
for insert to authenticated with check (user_id = auth.uid() and private.has_role(organization_id, array['proprietario','profissional','recepcao']));
create policy communication_reactions_delete on public.communication_reactions
for delete to authenticated using (user_id = auth.uid() or private.has_role(organization_id, array['proprietario']));

alter table public.communication_attachments enable row level security;
revoke all on public.communication_attachments from anon, authenticated;
grant select, insert, delete on public.communication_attachments to authenticated;
create policy communication_attachments_read on public.communication_attachments
for select to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao','leitura'])
  and exists (
    select 1 from public.communication_messages m
    join public.communication_conversations c
      on c.organization_id = m.organization_id and c.id = m.conversation_id
    where m.organization_id = communication_attachments.organization_id
      and m.id = communication_attachments.message_id
      and (c.kind = 'equipe' or c.created_by = auth.uid() or exists (
        select 1 from public.communication_participants p
        where p.organization_id = c.organization_id and p.conversation_id = c.id and p.user_id = auth.uid()
      ))
  )
);
create policy communication_attachments_write on public.communication_attachments
for insert to authenticated with check (created_by = auth.uid() and private.has_role(organization_id, array['proprietario','profissional','recepcao']));
create policy communication_attachments_delete on public.communication_attachments
for delete to authenticated using (created_by = auth.uid() or private.has_role(organization_id, array['proprietario']));

alter table public.communication_notifications enable row level security;
revoke all on public.communication_notifications from anon, authenticated;
grant select, update on public.communication_notifications to authenticated;
create policy communication_notifications_own on public.communication_notifications
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('communication-private','communication-private',false,10485760,
  array['image/jpeg','image/png','image/webp','application/pdf','text/plain','audio/webm','audio/ogg'])
on conflict (id) do update set file_size_limit = 10485760;
create policy communication_file_read on storage.objects for select to authenticated
using (bucket_id = 'communication-private' and exists (
  select 1 from public.communication_attachments a
  join public.communication_messages m on m.id = a.message_id and m.organization_id = a.organization_id
  join public.communication_conversations c on c.id = m.conversation_id and c.organization_id = m.organization_id
  where a.organization_id = split_part(storage.objects.name, '/', 1)::uuid and a.storage_path = storage.objects.name
    and (c.kind = 'equipe' or c.created_by = auth.uid() or exists (
      select 1 from public.communication_participants p
      where p.organization_id = c.organization_id and p.conversation_id = c.id and p.user_id = auth.uid()
    ))
));
create policy communication_file_write on storage.objects for insert to authenticated
with check (bucket_id = 'communication-private' and split_part(name, '/', 1) = 'a783bd4c-f253-4a94-9365-75c6f1000001');
create policy communication_file_delete on storage.objects for delete to authenticated
using (bucket_id = 'communication-private' and split_part(name, '/', 1) = 'a783bd4c-f253-4a94-9365-75c6f1000001');

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter table public.communication_conversations replica identity full;
    alter table public.communication_messages replica identity full;
    alter table public.communication_notifications replica identity full;
    alter publication supabase_realtime add table public.communication_conversations;
    alter publication supabase_realtime add table public.communication_messages;
    alter publication supabase_realtime add table public.communication_notifications;
  end if;
exception when duplicate_object then null;
end $$;

commit;
