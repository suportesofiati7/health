-- Reception operational-access profile
-- Generated 2026-09-15
--
-- Reception may perform almost all day-to-day clinic operations.
-- Reception may NOT:
--   * administer users
--   * approve/activate users
--   * alter permissions/settings
--   * perform bulk exports
--   * clinically finalize clinical records
--   * delete clinical/patient records
--
-- Existing RLS remains authoritative.

do $$
declare
  r record;
  p record;
begin
  -- Apply permissions to every existing reception user.
  for r in
    select organization_id, user_id
    from public.memberships
    where lower(role::text) in (
      'reception',
      'recepcao',
      'recepção'
    )
  loop

    for p in
      select *
      from (
        values
          ('patient_identity', true, true, true, false, false, false),
      ('appointments', true, true, true, true, false, false),
      ('intake_forms', true, true, true, true, false, true),
      ('assessments', true, true, true, false, false, false),
      ('anamnesis', true, true, true, false, false, false),
      ('treatment_plans', true, true, true, false, false, false),
      ('procedures', true, true, true, false, false, false),
      ('evolutions', true, true, true, false, false, false),
      ('adverse_events', true, true, true, false, false, false),
      ('photos', true, true, true, false, false, true),
      ('documents', true, true, true, false, false, true),
      ('consents', true, true, true, false, false, true),
      ('reports', true, true, true, false, false, false),
      ('exports', false, false, false, false, false, false),
      ('patient_portal', true, true, true, false, false, true),
      ('settings', false, false, false, false, false, false),
      ('users', false, false, false, false, false, false),
      ('audit', true, false, false, false, false, false)
      ) as permission_set(
        area,
        can_view,
        can_create,
        can_edit,
        can_finalize,
        can_export,
        can_share
      )
    loop

      insert into public.staff_permissions (
        organization_id,
        user_id,
        area,
        can_view,
        can_create,
        can_edit,
        can_finalize,
        can_export,
        can_share,
        updated_by
      )
      values (
        r.organization_id,
        r.user_id,
        p.area,
        p.can_view,
        p.can_create,
        p.can_edit,
        p.can_finalize,
        p.can_export,
        p.can_share,
        coalesce(
          (
            select m.user_id
            from public.memberships m
            where m.organization_id = r.organization_id
              and lower(m.role::text) in (
                'owner',
                'proprietario',
                'proprietário'
              )
            order by m.user_id
            limit 1
          ),
          r.user_id
        )
      )
      on conflict (organization_id, user_id, area)
      do update set
        can_view     = excluded.can_view,
        can_create   = excluded.can_create,
        can_edit     = excluded.can_edit,
        can_finalize = excluded.can_finalize,
        can_export   = excluded.can_export,
        can_share    = excluded.can_share,
        updated_by   = excluded.updated_by;

    end loop;
  end loop;
end
$$;
