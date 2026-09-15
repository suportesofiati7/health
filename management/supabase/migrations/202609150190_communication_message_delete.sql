begin;

revoke delete on public.communication_messages from anon, authenticated;

drop policy if exists communication_message_delete on public.communication_messages;
create policy communication_message_delete on public.communication_messages
for delete to authenticated using (
  private.has_role(organization_id, array['proprietario','profissional','recepcao'])
  and (
    sender_id = auth.uid()
    or private.has_role(organization_id, array['proprietario'])
  )
  and exists (
    select 1 from public.communication_conversations c
    where c.organization_id = communication_messages.organization_id
      and c.id = communication_messages.conversation_id
      and (
        c.kind = 'equipe'
        or c.created_by = auth.uid()
        or exists (
          select 1 from public.communication_participants p
          where p.organization_id = c.organization_id
            and p.conversation_id = c.id
            and p.user_id = auth.uid()
        )
      )
  )
);

grant delete on public.communication_messages to authenticated;

commit;
