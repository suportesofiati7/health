/**
 * Franciele Sofiati — email interno de recebimento de cadastro clínico.
 * Os dados enviados pelo paciente são escapados; URLs privadas, tokens e o
 * conteúdo de documentos NÃO são incorporados ao e-mail.
 */
const LOGO = "https://raw.githubusercontent.com/suportesofiati7/health/main/assets/brand/email/monograma-fs-dourado-transparente.png";
const APP = "https://app.francielesofiati.com";
const GREEN = "#526548"; // --menu-green do site, css/src/foundations/tokens.css
const LABELS = {
  initial_acknowledgement:"Ciência inicial e avaliação presencial",
  email:"E-mail", full_name:"Nome completo", preferred_name:"Nome pelo qual deseja ser chamado(a)",
  cpf:"CPF", identity_document:"Número do documento", identity_issuer:"Emissor",
  identity_letter:"Letra / complemento", phone:"Telefone / WhatsApp",
  birth_date:"Data de nascimento", address:"Endereço completo", postal_code:"CEP",
  adult_status:"Maioridade / responsável legal", guardian_details:"Dados do responsável legal",
  booking_fee_acknowledgement:"Aceite da taxa de agendamento, remarcação e cancelamento",
  treatment_área:"Área ou região a tratar", treatment_area:"Área ou região a tratar",
  appointment_date:"Data combinada", appointment_time:"Horário combinado",
  selected_procedures:"Procedimentos escolhidos", selected_procedure:"Procedimentos escolhidos (resumo)",
  health_notes:"Alergias, medicamentos, condições de saúde e observações",
  general_risk_acknowledgement:"Ciência dos riscos gerais e limitações",
  truth_declaration:"Declaração de veracidade das informações",
  technical_image_authorisation:"Autorização de registro fotográfico técnico",
  marketing_image_authorisation:"Autorização de imagem para marketing",
  marketing_revocation_acknowledgement:"Ciência sobre revogação da autorização",
  lgpd_personal_data_consent:"Consentimento para dados pessoais (LGPD)",
  lgpd_sensitive_data_consent:"Consentimento específico para dados sensíveis (LGPD)",
  promotional_communication:"Comunicações promocionais",
  signature_name:"Nome do(a) assinante", signature_method:"Método de assinatura",
  final_acceptance:"Aceite final dos termos e consentimentos",
  form_version:"Versão do formulário", language:"Idioma do formulário",
  idioma_formulario:"Idioma do formulário", versao_documento:"Versão do documento"
};
const GROUPS = [
  ["Introdução e ciência inicial",["initial_acknowledgement"]],
  ["Identificação do(a) cliente",["email","full_name","preferred_name","cpf","identity_document","identity_issuer","identity_letter","phone","birth_date","address","postal_code","adult_status","guardian_details"]],
  ["Agendamento, taxa de reserva e cancelamento",["booking_fee_acknowledgement"]],
  ["Procedimento desejado e horário",["selected_procedures","selected_procedure","treatment_área","treatment_area","appointment_date","appointment_time"]],
  ["Termos específicos dos procedimentos",[]],
  ["Segurança, contraindicações e riscos",["health_notes","general_risk_acknowledgement","truth_declaration"]],
  ["Registros fotográficos e marketing",["technical_image_authorisation","marketing_image_authorisation","marketing_revocation_acknowledgement"]],
  ["Privacidade, LGPD e comunicação",["lgpd_personal_data_consent","lgpd_sensitive_data_consent","promotional_communication"]],
  ["Assinatura e envio",["signature_name","signature_method","final_acceptance"]],
  ["Arquivos recebidos",[]]
];
const BLOCKED = /(?:^|_)(?:access_token|refresh_token|password|secret|api_key|signed_url|upload_url|storage_path|service_role|base64|upload_session|private_url|file_checksum)(?:$|_)/i;
const FILE_FIELDS = {identity_upload:"Documento de identidade",booking_payment_receipt:"Comprovante de pagamento da reserva",marketing_authorization_files:"Autorização de imagem",supporting_attachments:"Documentos adicionais"};
const choices = {yes:"Sim",no:"Não",adult:"Maior de 18 anos",minor:"Menor de idade",minor_or_guardian:"Menor / responsável legal",legal_representative:"Responsável legal",typed_name:"Nome digitado",non_identifiable:"Autorização sem identificação",partial_approval:"Autorização parcial",full_approval:"Autorização integral"};
function esc(v) { return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function plain(value, key="") {
  if (value === null || value === undefined) return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.map(x=>plain(x,key)).join(" · ") || "Nenhum";
  if (typeof value === "object") return "[Informação estruturada registrada no sistema]";
  let s = String(value).trim();
  if (key === "selected_procedures" || key === "selected_procedure") return s;
  if (choices[s]) return choices[s];
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4);
  if (/^(data:|https?:\/\/|[A-Za-z0-9+/]{1024,}={0,2}$)/i.test(s)) return "[Referência externa ou arquivo disponível apenas no sistema]";
  return s || "Não informado";
}
function label(key) {
  if (LABELS[key]) return LABELS[key];
  if (key.startsWith("accepted_term_")) return "Aceite dos termos — "+key.slice(14).replace(/_/g," ");
  return key.replace(/[_-]/g," ").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,x=>x.toUpperCase());
}
function signedDate(value) {
  const d = new Date(value || "");
  return Number.isFinite(d.getTime()) ? d.toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "Data não informada";
}
function isPlain(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
function fieldsFrom(payload, procedureSummary) {
  const items = [];
  const visited = new WeakSet();
  function add(key,value,context="",depth=0) {
    if (BLOCKED.test(key) || /(?:^|_)(?:path|token|url|hash|sha256|bucket|mime_type|size_bytes)$/.test(key)) return;
    if (key === "consent_texts") return; // textos jurídicos estáticos, não resposta preenchida
    if (depth > 10) return;
    if (Array.isArray(value) && value.every(x=>x==null || ["string","number","boolean"].includes(typeof x))) {
      const v = key==="selected_procedures" ? procedureSummary(value) : value.map(x=>plain(x,key)).join(" · ");
      items.push({key:context ? context+"."+key : key,label:label(key),value:v||"Nenhum",group:groupFor(key)});
      return;
    }
    if (Array.isArray(value)) {
      for (let i=0;i<value.length;i++) add(String(i+1),value[i],context?context+"."+key:key,depth+1);
      if (!value.length) items.push({key,label:label(key),value:"Nenhum",group:groupFor(key)});
      return;
    }
    if (isPlain(value)) {
      if (visited.has(value)) return;
      visited.add(value);
      const obj=value;
      if (typeof (obj.name ?? obj.filename ?? obj.original_name)==="string" && ("path" in obj || "size" in obj || "type" in obj)) {
        items.push({key,label:label(key),value:String(obj.name??obj.filename??obj.original_name)+" (arquivo registrado no sistema)",group:"Arquivos recebidos"});
        return;
      }
      for(const [child, val] of Object.entries(obj)) add(child,val,context?context+"."+key:key,depth+1);
      return;
    }
    const formatted = key==="selected_procedure" ? procedureSummary(value) : plain(value,key);
    items.push({key:context ? context+"."+key : key,label:context ? label(context)+" · "+label(key) : label(key),value:formatted,group:groupFor(key)});
  }
  for (const [key,value] of Object.entries(isPlain(payload)?payload:{})) add(key,value);
  return items;
}
function groupFor(key) {
  if (key.startsWith("accepted_term_")) return "Termos específicos dos procedimentos";
  const group=GROUPS.find(([,keys])=>keys.includes(key));
  return group ? group[0] : "Informações complementares";
}
function attachmentsToFields(attachments) {
  return (Array.isArray(attachments)?attachments:[]).map(f=>({
    key:String(f.field_name||"arquivo"),
    label:FILE_FIELDS[String(f.field_name||"")] || "Arquivo adicional",
    value:String(f.original_name||"Arquivo sem nome")+" — "+String(f.mime_type||"tipo não informado")+" (documento disponível na área profissional)",
    group:"Arquivos recebidos"
  }));
}
function rowHtml(f) {
  return '<tr><td width="38%" valign="top" style="padding:12px 16px;border-top:1px solid #e8eadf;font-size:11px;color:#647366;overflow-wrap:anywhere;">'+esc(f.label)+'</td>'+
    '<td valign="top" style="padding:12px 16px;border-top:1px solid #e8eadf;font-size:12px;color:#2b4437;font-weight:bold;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;">'+esc(f.value)+'</td></tr>';
}
function groupHtml(title, fields, number) {
  return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0 0 18px;border:1px solid #dfe5d8;border-collapse:separate;border-radius:9px;">'+
    '<tr><td colspan="2" style="background:#f0f4ec;padding:15px 16px;color:#344d38;font-family:Georgia,serif;font-size:16px;">'+
    '<span style="color:#a68139;font-size:11px;margin-right:10px;">'+String(number).padStart(2,"0")+'</span>'+esc(title)+'</td></tr>'+
    fields.map(rowHtml).join("")+'</table>';
}
export function buildIntakeEmail(intake, attachments, reference, procedureSummary) {
  const payload=isPlain(intake?.payload)?intake.payload:{};
  const fields=fieldsFrom(payload,procedureSummary).concat(attachmentsToFields(attachments));
  const order=GROUPS.map(x=>x[0]).concat(["Informações complementares"]);
  const groups=order.map(title=>({title,fields:fields.filter(x=>x.group===title)})).filter(x=>x.fields.length);
  const p=payload;
  const procedures=procedureSummary(p.selected_procedures || p.selected_procedure || intake.selected_procedure) || "Consultar no sistema";
  const area=plain(p["treatment_área"] ?? p.treatment_area ?? "");
  const appointmentDate=plain(p.appointment_date ?? "");
  const appointmentTime=plain(p.appointment_time ?? "");
  const name=plain(intake.full_name || p.full_name || "");
  const received=signedDate(intake.submitted_at);
  const logo = LOGO;
  const headerLogo='<img src="'+esc(logo)+'" alt="Logotipo dourado FS — Franciele Sofiati" width="128" style="width:128px;max-width:128px;height:auto;display:block;margin:0 auto;border:0;">';
  const intro='<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background:#f6f4ee;"><tr><td align="center" style="padding:30px 12px;">'+
    '<table role="presentation" width="660" cellspacing="0" cellpadding="0" border="0" style="max-width:660px;width:100%;background:#ffffff;border:1px solid #e2e3d7;border-collapse:separate;border-radius:12px;">'+
    '<tr><td height="5" style="background:#e5bc67;font-size:1px;line-height:5px;">&nbsp;</td></tr>'+
    '<tr><td align="center" style="background:#fffdf7;padding:26px 22px 22px;">'+headerLogo+
    '<p style="margin:8px 0 3px;font-family:Georgia,serif;font-size:26px;color:#283e31;">Franciele Sofiati</p>'+
    '<p style="margin:0;color:#788470;font-size:11px;letter-spacing:1.3px;text-transform:uppercase;">Biomédica · Esteticista · Cosmetóloga</p>'+
    '<p style="margin:7px 0 0;color:#7c8877;font-size:11px;">CRBM 6277 · Londrina, Paraná</p></td></tr>'+
    '<tr><td style="background:'+GREEN+';padding:35px 38px;">'+
    '<p style="margin:0 0 12px;color:#f3e1c4;font-size:11px;font-weight:bold;letter-spacing:1.8px;">CADASTRO CLÍNICO · NOTIFICAÇÃO INTERNA</p>'+
    '<h1 style="font-family:Georgia,serif;font-size:34px;font-weight:normal;line-height:1.22;color:#fffdf7;margin:0 0 12px;">Um novo formulário foi recebido.</h1>'+
    '<p style="color:#f4f6ef;line-height:1.7;font-size:13px;margin:0;">Cadastro e consentimentos preenchidos, organizados para conferência da equipe.</p></td></tr>'+
    '<tr><td style="padding:27px 34px 5px;">'+
    '<p style="font-weight:bold;letter-spacing:1.4px;color:#9b7b47;font-size:11px;margin:0 0 12px;">VISÃO GERAL DO CADASTRO</p>'+
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e6d9;background:#f7f8f3;border-radius:8px;">'+
    '<tr><td style="padding:18px;"><p style="margin:0;font-size:10px;color:#7a8978;letter-spacing:1px;">CLIENTE</p>'+
    '<p style="font-family:Georgia,serif;font-size:24px;line-height:1.3;margin:6px 0 8px;color:#314c3b;overflow-wrap:anywhere;">'+esc(name)+'</p>'+
    '<p style="font-size:11px;color:#7b8777;margin:0;">Recebido em '+esc(received)+'</p></td></tr>'+
    '<tr><td style="padding:0 18px 18px;font-size:12px;line-height:1.85;color:#314c3b;border-top:1px solid #e2e7db;">'+
    '<strong>Procedimento:</strong> '+esc(procedures)+'<br><strong>Região:</strong> '+esc(area)+
    '<br><strong>Data:</strong> '+esc(appointmentDate)+'<br><strong>Horário:</strong> '+esc(appointmentTime)+'</td></tr></table></td></tr>'+
    '<tr><td style="padding:24px 34px 0;">'+
    '<p style="font-weight:bold;color:#9b7b47;letter-spacing:1.4px;font-size:11px;margin:0 0 8px;">RESPOSTAS DO FORMULÁRIO</p>'+
    '<h2 style="font-family:Georgia,serif;font-size:26px;font-weight:normal;color:#314c3b;margin:0 0 12px;">Cadastro e consentimentos</h2>'+
    '<p style="color:#68766a;font-size:12px;line-height:1.7;margin:0 0 22px;">Todas as respostas salvas no cadastro estão listadas abaixo. Os textos jurídicos integrais e os documentos enviados permanecem no aplicativo.</p>';
  const foot='</td></tr><tr><td style="padding:6px 34px 32px;">'+
    '<p style="background:#fcf7eb;border-left:3px solid #e5bc67;padding:16px;color:#576657;font-size:12px;line-height:1.7;">'+
    '<strong>Arquivos e documentos:</strong> os nomes dos arquivos enviados aparecem no relatório. Para acessar seus conteúdos, utilize a área profissional autenticada.</p>'+
    '<a href="'+APP+'" style="display:block;text-align:center;background:'+GREEN+';border-radius:7px;padding:18px 12px;text-decoration:none;color:#fffdf7;font-size:13px;font-weight:bold;letter-spacing:.4px;">VER CADASTRO COMPLETO →</a>'+
    '<p style="color:#778375;font-size:11px;text-align:center;margin:14px 0 0;">Acesso restrito à equipe autorizada.</p></td></tr>'+
    '<tr><td align="center" style="background:#fffdf7;border-top:1px solid #e6e7dc;padding:26px 20px;">'+
    '<p style="margin:0 0 7px;font-family:Georgia,serif;font-size:20px;color:#344e3b;">Franciele Sofiati</p>'+
    '<p style="color:#7a8977;font-size:11px;line-height:1.7;margin:0;">Cuidado. Compromisso. Confiança.<br>Biomédica · Esteticista · Cosmetóloga · CRBM 6277</p>'+
    '<p style="font-size:10px;color:#929c8d;margin:13px 0 0;overflow-wrap:anywhere;">Uso interno e confidencial · Registro '+esc(reference)+'</p></td></tr></table>'+
    '<p style="margin:18px auto 0;max-width:640px;color:#707b71;text-align:center;font-size:10px;line-height:1.7;">Esta mensagem pode conter CPF e informações sensíveis de saúde. Não encaminhar. Acesso restrito à equipe.</p>'+
    '</td></tr></table>';
  const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>Novo cadastro clínico — Franciele Sofiati</title></head><body style="margin:0;padding:0;background:#f6f4ee;font-family:Arial,Helvetica,sans-serif;color:#263f32;">'+
    '<div style="display:none;opacity:0;max-height:0;overflow:hidden;">Novo cadastro clínico disponível para revisão na área profissional.</div>'+
    intro+groups.map((g,i)=>groupHtml(g.title,g.fields,i+1)).join("")+foot+'</body></html>';
  const textLines=["FRANCIELE SOFIATI — NOVO CADASTRO CLÍNICO","Paciente: "+name,"Recebido em: "+received,
    "Procedimentos: "+procedures,"Região: "+area,"Data: "+appointmentDate,"Horário: "+appointmentTime];
  for(const g of groups){textLines.push("","\u2014 "+g.title.toUpperCase()); for(const f of g.fields)textLines.push(f.label+": "+f.value);}
  textLines.push("","Cadastro e arquivos completos: "+APP,"Referência: "+reference,"CONFIDENCIAL: dados pessoais e possivelmente dados de saúde; não encaminhar.");
  return {html,text:textLines.join("\n")};
}
