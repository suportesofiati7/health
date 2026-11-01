begin;

-- The original FK used NO ACTION, which prevented deleting any populated chat.
alter table public.communication_messages
  drop constraint communication_messages_organization_id_conversation_id_fkey;
alter table public.communication_messages
  add constraint communication_messages_organization_id_conversation_id_fkey
  foreign key (organization_id, conversation_id)
  references public.communication_conversations(organization_id, id) on delete cascade;

-- Edits and soft deletion must also refresh the list preview.
create or replace function private.touch_communication_conversation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.communication_conversations c
  set updated_at = now(),
      last_message_at = latest.created_at,
      last_message_preview = case when latest.deleted_at is not null
        then 'Mensagem excluída' else left(coalesce(latest.body, ''), 180) end
  from (
    select m.created_at, m.deleted_at, m.body
    from public.communication_messages m
    where m.organization_id = new.organization_id and m.conversation_id = new.conversation_id
    order by m.created_at desc, m.id desc limit 1
  ) latest
  where c.organization_id = new.organization_id and c.id = new.conversation_id;
  return new;
end;
$$;
drop trigger if exists communication_message_touch on public.communication_messages;
create trigger communication_message_touch after insert or update of body, deleted_at
on public.communication_messages for each row
execute function private.touch_communication_conversation();

commit;
