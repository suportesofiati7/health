\set ON_ERROR_STOP on
begin;
create function pg_temp.wa_assert(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',message; end if; raise notice 'PASS: %',message; end $$;
create function pg_temp.wa_denied(command text, message text) returns void language plpgsql as $$
begin
  begin execute command; exception when others then raise notice 'PASS denied: %',message; return; end;
  raise exception 'FAIL allowed: %',message;
end $$;
insert into auth.users(id) values ('19000000-0000-4000-8000-000000000001'),('19000000-0000-4000-8000-000000000002'),('19000000-0000-4000-8000-000000000003');
insert into auth.sessions(id,user_id) values
('29000000-0000-4000-8000-000000000001','19000000-0000-4000-8000-000000000001'),
('29000000-0000-4000-8000-000000000002','19000000-0000-4000-8000-000000000002'),
('29000000-0000-4000-8000-000000000003','19000000-0000-4000-8000-000000000003');
insert into public.memberships(organization_id,user_id,email,role,status) values
('a783bd4c-f253-4a94-9365-75c6f1000001','19000000-0000-4000-8000-000000000001','wa-owner@example.invalid','proprietario','ativo'),
('a783bd4c-f253-4a94-9365-75c6f1000001','19000000-0000-4000-8000-000000000002','wa-staff@example.invalid','profissional','ativo'),
('a783bd4c-f253-4a94-9365-75c6f1000001','19000000-0000-4000-8000-000000000003','wa-software@example.invalid','suporte_ti','ativo');
set local role service_role;
insert into public.whatsapp_widget_clicks(event_id) values('39000000-0000-4000-8000-000000000001');
insert into public.whatsapp_widget_clicks(event_id) values('39000000-0000-4000-8000-000000000001') on conflict do nothing;
reset role;
select pg_temp.wa_assert((select count(*)=1 from public.whatsapp_widget_clicks),'retried event ids do not double count');
set local role anon;
select pg_temp.wa_denied('select * from public.whatsapp_widget_clicks','anonymous visitor cannot read events');
select pg_temp.wa_denied('select public.whatsapp_widget_report()','anonymous visitor cannot read report');
select pg_temp.wa_denied($q$insert into public.whatsapp_widget_clicks(event_id) values(gen_random_uuid())$q$,'anonymous direct writes blocked');
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub','19000000-0000-4000-8000-000000000002','session_id','29000000-0000-4000-8000-000000000002','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.wa_assert((select count(*)=0 from public.whatsapp_widget_clicks),'non-owner cannot read events through RLS');
select pg_temp.wa_denied('select public.whatsapp_widget_report()','non-owner cannot read report');
select set_config('request.jwt.claims',jsonb_build_object('sub','19000000-0000-4000-8000-000000000001','session_id','29000000-0000-4000-8000-000000000001','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.wa_assert((select jsonb_array_length(public.whatsapp_widget_report()->'days')=31),'owner report contains 31 days');
select pg_temp.wa_assert((select sum((x->>'clicks')::integer)=1 from jsonb_array_elements(public.whatsapp_widget_report()->'days') x),'owner sees accurate click total');
select pg_temp.wa_assert((select (x->>'day')::date=(now() at time zone 'America/Sao_Paulo')::date from jsonb_array_elements(public.whatsapp_widget_report()->'days') x where (x->>'clicks')::integer=1),'click is grouped in Brazil time');
select pg_temp.wa_denied('delete from public.whatsapp_widget_clicks','even owner cannot delete evidence from client');
select set_config('request.jwt.claims',jsonb_build_object('sub','19000000-0000-4000-8000-000000000003','session_id','29000000-0000-4000-8000-000000000003','exp',extract(epoch from now()+interval '1 hour'))::text,true);
select pg_temp.wa_assert((public.whatsapp_widget_report()->>'started_at') is not null,'software owner can read report');
select set_config('request.jwt.claims',jsonb_build_object('sub','19000000-0000-4000-8000-000000000001','session_id','29000000-0000-4000-8000-000000000001','exp',0)::text,true);
select pg_temp.wa_denied('select public.whatsapp_widget_report()','expired session cannot read report');
rollback;
