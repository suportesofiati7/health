import { procedureSummary } from "../../../src/procedureLabels.js";
import { admin } from '../_shared/core.ts';
Deno.serve(async (req) => {
  const workerSecret = Deno.env.get('NOTIFICATION_WORKER_SECRET');
  if (!workerSecret || req.method !== 'POST' || req.headers.get('Authorization') !== `Bearer ${workerSecret}`) return new Response(null, {status:403});
  const key = Deno.env.get('RESEND_API_KEY'), from = Deno.env.get('EMAIL_FROM');
  if (!key || !from) return Response.json({error:'notification_unconfigured'}, {status:503});
  const db = admin();
  const claimed = await db.rpc('claim_intake_notifications');
  if (claimed.error) return Response.json({error:'queue_unavailable'}, {status:503});
  let sent = 0;
  for (const job of claimed.data || []) {
    try {
      const intake = await db.from('public_intakes').select('full_name,submitted_at,selected_procedure,patient_id,payload').eq('id',job.intake_id).single();
      if (intake.error || !intake.data?.patient_id) throw Error('intake_unavailable');
      const response = await fetch('https://api.resend.com/emails', {method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`intake-${job.intake_id}`},body:JSON.stringify({from,to:['suportesofiati@gmail.com','sofiatimendonca@gmail.com'],subject:'Formulário recebido — Franciele Sofiati',text:`Formulário salvo e associado ao paciente com sucesso.\nPaciente: ${intake.data.full_name}\nRecebido em: ${new Date(intake.data.submitted_at).toLocaleString("pt-BR", {timeZone:"America/Sao_Paulo"})}\nProcedimentos selecionados: ${procedureSummary(intake.data.payload?.selected_procedures || intake.data.payload?.selected_procedure || intake.data.selected_procedure) || "Consulte o formulário no aplicativo"}.\nAcesse https://app.francielesofiati.com para consultar as respostas e documentos.\nRegistro: ${job.intake_id}`}),signal:AbortSignal.timeout(20000)});
      if (!response.ok) throw Error(`provider_${response.status}`);
      const result = await db.from('intake_notification_outbox').update({status:'sent',sent_at:new Date().toISOString(),last_error:null}).eq('id',job.id);
      if (result.error) throw Error('delivery_record_failed');
      sent++;
    } catch (error) {
      await db.from('intake_notification_outbox').update({status:'failed',last_error:error instanceof Error?error.message:'delivery_failed',available_at:new Date(Date.now()+Math.min(3600000,30000*2**job.attempts)).toISOString()}).eq('id',job.id);
    }
  }
  return Response.json({sent});
});
