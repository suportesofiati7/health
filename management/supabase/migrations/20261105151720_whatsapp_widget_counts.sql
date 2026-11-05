begin;
-- No destination, page path, visitor identifier or message is stored.
create table public.whatsapp_widget_clicks (
  event_id uuid primary key,
  recorded_at timestamptz not null default clock_timestamp()
);
create index whatsapp_widget_clicks_recorded_at_idx on public.whatsapp_widget_clicks(recorded_at);
create table public.whatsapp_widget_counter (
  singleton boolean primary key default true check (singleton),
  started_at timestamptz not null default clock_timestamp()
);
insert into public.whatsapp_widget_counter(singleton) values (true);
alter table public.whatsapp_widget_clicks enable row level security;
alter table public.whatsapp_widget_counter enable row level security;
revoke all on public.whatsapp_widget_clicks, public.whatsapp_widget_counter from public, anon, authenticated;
grant select on public.whatsapp_widget_clicks, public.whatsapp_widget_counter to authenticated;
grant all on public.whatsapp_widget_clicks, public.whatsapp_widget_counter to service_role;
create policy whatsapp_clicks_owner_read on public.whatsapp_widget_clicks for select to authenticated
using ((select private.has_role('a783bd4c-f253-4a94-9365-75c6f1000001', array['proprietario','suporte_ti'])));
create policy whatsapp_counter_owner_read on public.whatsapp_widget_counter for select to authenticated
using ((select private.has_role('a783bd4c-f253-4a94-9365-75c6f1000001', array['proprietario','suporte_ti'])));

create function public.whatsapp_widget_report() returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare today date := (now() at time zone 'America/Sao_Paulo')::date; result jsonb;
begin
  if not private.has_role('a783bd4c-f253-4a94-9365-75c6f1000001', array['proprietario','suporte_ti']) then
    raise exception 'not_authorized';
  end if;
  with counts as (
    select (recorded_at at time zone 'America/Sao_Paulo')::date as day, count(*) as clicks
    from public.whatsapp_widget_clicks
    where recorded_at >= ((today - 30)::timestamp at time zone 'America/Sao_Paulo')
      and recorded_at < ((today + 1)::timestamp at time zone 'America/Sao_Paulo')
    group by 1
  ), days as (
    select today - n as day from generate_series(0,30) as n
  )
  select jsonb_build_object(
    'started_at', (select started_at from public.whatsapp_widget_counter where singleton),
    'updated_at', now(),
    'days', jsonb_agg(jsonb_build_object('day',days.day,'clicks',coalesce(counts.clicks,0)) order by days.day)
  ) into result from days left join counts using(day);
  return result;
end;
$$;
revoke all on function public.whatsapp_widget_report() from public, anon;
grant execute on function public.whatsapp_widget_report() to authenticated;
commit;
