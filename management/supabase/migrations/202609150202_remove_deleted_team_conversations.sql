begin;

-- The first communication-hub build could create a default "Equipe" room
-- without exposing a room-delete action. Remove those empty remnants so a
-- deleted room cannot reappear on the team tab. Rooms with messages are kept.
delete from public.communication_conversations c
where c.organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
  and c.kind = 'equipe'
  and coalesce(nullif(trim(c.title), ''), 'Equipe') = 'Equipe'
  and not exists (
    select 1 from public.communication_messages m
    where m.organization_id = c.organization_id
      and m.conversation_id = c.id
  );

-- Allow future explicit deletion by the creator or owner. Cascading removes
-- participant links and internal messages together.
revoke delete on public.communication_conversations from anon, authenticated;
drop policy if exists communication_conversation_delete on public.communication_conversations;
create policy communication_conversation_delete on public.communication_conversations
for delete to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao'])
  and (created_by = auth.uid() or private.has_role(organization_id, array['proprietario']))
);
grant delete on public.communication_conversations to authenticated;

commit;
