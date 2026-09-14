begin;
create function private.valid_cns(value text) returns boolean
language sql immutable set search_path='' as $$
select value is null or (value ~ '^[0-9]{15}$' and (select sum(substring(value,i,1)::integer*(16-i))%11=0 from generate_series(1,15) i))
$$;
alter table public.patients add constraint patients_cns_checksum check(private.valid_cns(cns));
alter table public.patients add constraint patients_birth_not_future check(birth_date is null or birth_date<=current_date);
alter table public.patients add constraint patients_address_size check(octet_length(address::text)<12000 and octet_length(guardian::text)<12000 and octet_length(emergency_contact::text)<12000);
alter table public.appointments add constraint appointment_label_size check(length(label)<=200);
alter table public.tasks add constraint task_title_size check(length(title)<=500);
create extension if not exists btree_gist with schema extensions;
alter table public.appointments add constraint appointments_no_professional_overlap exclude using gist
(organization_id with =,professional_id with =,tstzrange(starts_at,ends_at,'[)') with &&)
where (professional_id is not null and status not in ('cancelado','reagendado','faltou'));
create function private.enquiry_guard() returns trigger language plpgsql set search_path='' as $$
begin
  if old.patient_id is not null and new.status<>'convertido' then raise exception 'converted_enquiry_is_linked'; end if;
  if new.status='convertido' and new.patient_id is null then raise exception 'conversion_requires_patient'; end if;
  new.updated_at:=now();new.version:=old.version+1;
  return new;
end $$;
create trigger enquiry_guard before update on public.enquiries for each row execute function private.enquiry_guard();
create function private.created_stamp() returns trigger language plpgsql set search_path='' as $$
begin
  if auth.uid() is not null then new.created_by:=auth.uid(); end if;
  new.created_at:=now();return new;
end $$;
create trigger admin_note_stamp before insert on public.admin_notes for each row execute function private.created_stamp();
create trigger document_link_stamp before insert on public.document_links for each row execute function private.created_stamp();
revoke all on function private.valid_cns(text),private.enquiry_guard(),private.created_stamp() from public,anon;
grant execute on function private.valid_cpf(text),private.valid_cns(text) to authenticated,service_role;
commit;
