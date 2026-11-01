begin;

-- The role-seeding trigger only refreshed can_view on a role update. Existing
-- reception/operations accounts could therefore see Agenda yet be denied the
-- appointment-create RPC after permissions were introduced or a role changed.
create or replace function private.seed_staff_permissions()
returns trigger language plpgsql security definer set search_path = '' as $$
declare a record; v boolean; c boolean; e boolean; f boolean; x boolean; s boolean;
begin
  for a in select unnest(array['patient_identity','appointments','intake_forms','assessments','anamnesis','treatment_plans','procedures','evolutions','adverse_events','photos','documents','consents','reports','exports','patient_portal','settings','users','audit']) as area loop
    v := case
      when new.role in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo') then a.area in ('patient_identity','appointments','intake_forms','assessments','anamnesis','treatment_plans','procedures','evolutions','adverse_events','photos','documents','consents','reports','patient_portal')
      when new.role in ('gestor_clinica','recepcao','secretaria','coordenador_operacional') then a.area in ('patient_identity','appointments','intake_forms','reports','patient_portal')
      when new.role = 'leitura' then a.area in ('patient_identity','appointments','intake_forms','reports')
      when new.role = 'auditor' then a.area in ('patient_identity','appointments','intake_forms','reports','audit') else false end;
    c := (new.role in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo') and a.area in ('patient_identity','appointments','intake_forms','assessments','anamnesis','treatment_plans','procedures','evolutions','adverse_events','photos','documents','consents','patient_portal')) or (new.role in ('gestor_clinica','recepcao','secretaria','coordenador_operacional') and a.area in ('patient_identity','appointments','intake_forms','patient_portal'));
    e := c;
    f := new.role in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo') and a.area in ('assessments','anamnesis','treatment_plans','procedures','evolutions','adverse_events','consents');
    x := new.role in ('profissional','medico','enfermeiro','fisioterapeuta','nutricionista','psicologo') and a.area in ('reports','exports');
    s := v and a.area in ('photos','documents','consents','patient_portal');
    insert into public.staff_permissions(organization_id,user_id,area,can_view,can_create,can_edit,can_finalize,can_export,can_share,updated_by)
      values(new.organization_id,new.user_id,a.area,v,c,e,f,x,s,new.user_id)
    on conflict (organization_id,user_id,area) do update set can_view=excluded.can_view,can_create=excluded.can_create,can_edit=excluded.can_edit,can_finalize=excluded.can_finalize,can_export=excluded.can_export,can_share=excluded.can_share,updated_by=excluded.updated_by,updated_at=now();
  end loop;
  return new;
end $$;

-- Backfill every active existing staff member once; no patient or clinical
-- record is touched, and any later owner override remains possible afterwards.
update public.memberships set role=role where status='ativo';

-- All tables queried by the communication workspace need explicit table
-- grants as well as policies. These grants make an upgraded database match a
-- clean installation without widening the RLS predicates.
grant select, insert, update on public.communication_reads, public.communication_reactions, public.communication_attachments to authenticated;
grant select, update on public.communication_notifications to authenticated;
commit;
