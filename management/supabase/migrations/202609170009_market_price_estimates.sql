begin;

-- Provisional 2026 market estimates in BRL. These are not official prices,
-- offers, or Franciele's final price list. They are intentionally stored with
-- provenance and can be overridden in the catalogue at any time.
update public.procedures p set
  price_cents = case p.name
    when 'Enzimas' then 60000
    when 'Jato de Plasma' then 50000
    when 'Laser CO₂ AcuPulse — rejuvenescimento profundo' then 180000
    when 'Laser Harmony — clareamento de manchas' then 70000
    when 'Laser Harmony — melasma' then 80000
    when 'Laser Harmony — rejuvenescimento leve/moderado' then 70000
    when 'Laser Harmony — remoção de tatuagem/micropigmentação' then 70000
    when 'Laser LightSheer Duet — remoção de pelos / foliculite' then 30000
    when 'Limpeza de Pele' then 22000
    when 'Mesoterapia Capilar / MMP Capilar' then 90000
    when 'MMP — rejuvenescimento / cicatriz de acne / estrias' then 80000
    when 'Peeling de Cristal' then 18000
    when 'Peeling de Diamante' then 18000
    when 'Peeling Químico' then 28000
    when 'Peeling Ultrassônico' then 15000
    when 'PEIM' then 70000
    when 'Radiofrequência' then 20000
    when 'Toxina Botulínica — facial' then 150000
    when 'Toxina Botulínica — pescoço/mandíbula / técnica Nefertiti' then 180000
    when 'Ultraformer MPT' then 250000
    else price_cents end,
  commercial_config = commercial_config || jsonb_build_object(
    'price_status','Estimativa provisória de mercado — confirmar com a proprietária',
    'market_average_brl',case p.name
      when 'Enzimas' then 600
      when 'Jato de Plasma' then 500
      when 'Laser CO₂ AcuPulse — rejuvenescimento profundo' then 1800
      when 'Laser Harmony — clareamento de manchas' then 700
      when 'Laser Harmony — melasma' then 800
      when 'Laser Harmony — rejuvenescimento leve/moderado' then 700
      when 'Laser Harmony — remoção de tatuagem/micropigmentação' then 700
      when 'Laser LightSheer Duet — remoção de pelos / foliculite' then 300
      when 'Limpeza de Pele' then 220
      when 'Mesoterapia Capilar / MMP Capilar' then 900
      when 'MMP — rejuvenescimento / cicatriz de acne / estrias' then 800
      when 'Peeling de Cristal' then 180
      when 'Peeling de Diamante' then 180
      when 'Peeling Químico' then 280
      when 'Peeling Ultrassônico' then 150
      when 'PEIM' then 700
      when 'Radiofrequência' then 200
      when 'Toxina Botulínica — facial' then 1500
      when 'Toxina Botulínica — pescoço/mandíbula / técnica Nefertiti' then 1800
      when 'Ultraformer MPT' then 2500
      else null end,
    'market_estimate_basis','Public Brazilian aesthetic price references reviewed in September 2026; actual price varies by area, product, number of lines/units, equipment, professional and clinic.',
    'market_estimate_reviewed_on','2026-09-17',
    'market_price_sources',jsonb_build_array('https://agendiva.com.br/blog/quanto-cobrar-procedimento-estetico','https://beleza360.co/blog/quanto-custa-botox-preco','https://clinicarenasce.com.br/blog/ultraformer-valor/','https://plusdin.com.br/depilacao-a-laser-quanto-custa/')
  ),
  catalog_version = greatest(coalesce(catalog_version,1),5)
where p.organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001';

insert into public.procedure_versions(organization_id, procedure_id, version, snapshot, created_by)
select p.organization_id, p.id, p.catalog_version, to_jsonb(p), coalesce(p.created_by, auth.uid())
from public.procedures p
where p.organization_id = 'a783bd4c-f253-4a94-9365-75c6f1000001'
  and p.catalog_version >= 5
on conflict (organization_id, procedure_id, version) do nothing;

commit;
