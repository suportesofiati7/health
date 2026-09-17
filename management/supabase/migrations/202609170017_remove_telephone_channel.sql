begin;

-- Phone numbers remain patient contact data and remain valid for WhatsApp.
-- Only the call workflow/channel is removed.
update public.communications set channel = 'whatsapp' where channel = 'telefone';
update public.communication_preferences set preferred_channel = 'whatsapp' where preferred_channel = 'telefone';
delete from public.communication_templates where channel = 'telefone';

alter table public.communications drop constraint if exists communications_channel_valid;
alter table public.communications add constraint communications_channel_valid check(channel in ('whatsapp','email','interno'));
alter table public.communication_preferences drop constraint if exists communication_preferences_preferred_channel_check;
alter table public.communication_preferences add constraint communication_preferences_preferred_channel_check check(preferred_channel in ('whatsapp','email'));
alter table public.communication_templates drop constraint if exists communication_templates_channel_check;
alter table public.communication_templates add constraint communication_templates_channel_check check(channel in ('whatsapp','email','interno'));

commit;
