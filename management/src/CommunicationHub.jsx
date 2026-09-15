import React, { useEffect, useMemo, useState } from "react";
import { Check, History, MessageCircle, Plus, Send, UserCheck, UserRound, X } from "lucide-react";
import { db, ORG, checked, digits, date } from "./lib";
import { useT, label } from "./i18n";

const button = (className = "") => `button ${className}`.trim();
const displayName = (row) => row?.preferred_name || row?.full_name || row?.name || row?.email || "—";
const cleanPhone = (value) => digits(value || "");
const webWhatsApp = (phone, message) => `https://web.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone(phone))}&text=${encodeURIComponent(message)}`;

function HubButton({ children, icon: Icon, className = "", ...props }) {
  return <button className={button(className)} {...props}>{Icon && <Icon size={17} aria-hidden="true" />}{children}</button>;
}

function HubDialog({ title, close, children }) {
  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><HubButton className="icon" icon={X} aria-label="Fechar" onClick={close} /></header>{children}</section></div>;
}

function HubField({ title, value, onChange, options, type = "text", placeholder = "", required = false }) {
  return <label className="field"><span>{title}</span>{options ? <select value={value || ""} onChange={(e) => onChange(e.target.value)} required={required}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={type} value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} required={required} />}</label>;
}

function ExternalMessage({ patients, initialPatient, member, close, notify, refresh }) {
  const t = useT();
  const [patientId, setPatientId] = useState(initialPatient?.id || "");
  const [channel, setChannel] = useState("whatsapp");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);
  const patient = patients.find((row) => row.id === patientId);
  const recipient = channel === "email" ? patient?.email : patient?.phone;
  const submit = async (event) => {
    event.preventDefault();
    if (!patient || !recipient || !body.trim()) return notify(t("Escolha um paciente e escreva uma mensagem.", "Choose a patient and write a message."));
    if (channel === "whatsapp" && cleanPhone(recipient).length < 10) return notify(t("O telefone do paciente não é válido.", "The patient's phone number is not valid."));
    const target = channel === "whatsapp" ? webWhatsApp(recipient, body.trim()) : channel === "telefone" ? `tel:${cleanPhone(recipient)}` : `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    const popup = window.open(target, "_blank", "noopener,noreferrer");
    setBusy(true);
    try {
      const row = await checked(db.from("communications").insert({ organization_id: ORG, patient_id: patient.id, channel, direction: "outbound", visibility: "external", category: "administrativo", subject, body: body.trim(), rendered_signature: "", recipient_name: displayName(patient), recipient_address: recipient, status: "rascunho", packet_sha256: "", created_by: member.user_id }).select().single());
      await checked(db.from("communications").update({ status: channel === "telefone" ? "enviado" : "nao_confirmado", sent_at: new Date().toISOString() }).eq("id", row.id));
      if (!popup) notify(t("A nova aba foi bloqueada. Permita pop-ups para abrir o WhatsApp Web.", "The new tab was blocked. Allow pop-ups to open WhatsApp Web."));
      notify(t("Mensagem preparada e registrada.", "Message prepared and recorded."));
      refresh(); close();
    } catch { popup?.close(); notify(t("Não foi possível registrar a comunicação.", "Could not record the communication.")); } finally { setBusy(false); }
  };
  return <HubDialog title={t("Mensagem para paciente", "Patient message")} close={close}><form className="form-grid" onSubmit={submit}><HubField title={t("Paciente", "Patient")} value={patientId} onChange={setPatientId} required options={[{ value: "", label: t("Selecionar paciente", "Select patient") }, ...patients.map((row) => ({ value: row.id, label: `${displayName(row)} · ${row.phone || row.email || "sem contato"}` }))]} /><HubField title={t("Canal", "Channel")} value={channel} onChange={setChannel} options={[{ value: "whatsapp", label: "WhatsApp Web" }, { value: "email", label: "Email" }, { value: "telefone", label: t("Telefone", "Phone") }]} />{channel === "email" && <HubField title={t("Assunto", "Subject")} value={subject} onChange={setSubject} required />}<label className="field wide"><span>{t("Mensagem", "Message")}</span><textarea value={body} onChange={(e) => setBody(e.target.value)} required rows="8" /></label><p className="subtle">{channel === "whatsapp" ? t("Abrirá WhatsApp Web em uma nova aba do navegador.", "WhatsApp Web will open in a new browser tab.") : t("A aplicação registra a preparação, mas não confirma a entrega.", "The app records preparation but cannot confirm delivery.")}</p><footer className="form-footer"><HubButton type="button" onClick={close}>{t("Cancelar", "Cancel")}</HubButton><HubButton className="primary" icon={Send} disabled={busy}>{t("Abrir canal e registrar", "Open channel and record")}</HubButton></footer></form></HubDialog>;
}

export default function CommunicationHub({ member, openPatient, version, writable, notify }) {
  const t = useT();
  const [data, setData] = useState({ conversations: [], patients: [], staff: [], communications: [] });
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [directUser, setDirectUser] = useState("");
  const [external, setExternal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const load = async () => {
    setLoading(true); setError("");
    try {
      const [conversations, patients, staff, communications] = await Promise.all([
        checked(db.from("communication_conversations").select("*,patients(*)").order("updated_at", { ascending: false }).limit(100)),
        checked(db.from("patients").select("id,full_name,preferred_name,phone,email,status").eq("status", "ativo").order("full_name").limit(500)),
        checked(db.from("memberships").select("user_id,name,email,role").eq("status", "ativo").order("name")),
        checked(db.from("communications").select("*,patients(*)").order("created_at", { ascending: false }).limit(120)),
      ]);
      setData({ conversations, patients, staff, communications });
      setSelected((current) => current && conversations.some((row) => row.id === current.id) ? current : conversations[0] || null);
    } catch { setError(t("Não foi possível carregar a comunicação.", "Could not load communication.")); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [version]);
  useEffect(() => { if (!selected) { setMessages([]); return; } checked(db.from("communication_messages").select("*").eq("conversation_id", selected.id).order("created_at")).then(setMessages).catch(() => setMessages([])); }, [selected?.id]);
  const senderName = (id) => displayName(data.staff.find((row) => row.user_id === id));
  const createTeam = async () => { try { const row = await checked(db.from("communication_conversations").insert({ organization_id: ORG, title: newTitle.trim() || "Equipe", kind: "equipe", created_by: member.user_id }).select("*,patients(*)").single()); setNewTitle(""); setData((current) => ({ ...current, conversations: [row, ...current.conversations] })); setSelected(row); notify(t("Chat interno criado.", "Internal chat created.")); } catch { notify(t("Não foi possível criar o chat interno.", "Could not create the internal chat.")); } };
  const createDirect = async () => { if (!directUser) return; try { const person = data.staff.find((row) => row.user_id === directUser); const row = await checked(db.from("communication_conversations").insert({ organization_id: ORG, title: person?.name || person?.email || "Conversa direta", kind: "direta", created_by: member.user_id }).select("*,patients(*)").single()); await checked(db.from("communication_participants").insert([{ organization_id: ORG, conversation_id: row.id, user_id: member.user_id }, { organization_id: ORG, conversation_id: row.id, user_id: directUser }])); setDirectUser(""); setData((current) => ({ ...current, conversations: [row, ...current.conversations] })); setSelected(row); notify(t("Conversa direta criada.", "Direct conversation created.")); } catch { notify(t("Não foi possível iniciar a conversa.", "Could not start the conversation.")); } };
  const send = async (event) => { event.preventDefault(); if (!selected || !text.trim()) return; try { await checked(db.from("communication_messages").insert({ organization_id: ORG, conversation_id: selected.id, sender_id: member.user_id, body: text.trim() })); setText(""); const next = await checked(db.from("communication_messages").select("*").eq("conversation_id", selected.id).order("created_at")); setMessages(next); } catch { notify(t("Não foi possível enviar a mensagem.", "Could not send the message.")); } };
  const externalHistory = useMemo(() => data.communications, [data.communications]);
  return <><div className="communication-hub"><section className="communication-column"><header className="communication-column-head"><div><p className="eyebrow">{t("Somente equipe", "Team only")}</p><h2>{t("Comunicação interna", "Internal communication")}</h2><p className="subtle">{t("Chat com a equipe ou com um profissional, sem paciente obrigatório.", "Chat with the team or a professional, with no patient required.")}</p></div></header><div className="communication-create"><HubField title={t("Novo chat da equipe", "New team chat")} value={newTitle} onChange={setNewTitle} placeholder={t("Ex.: Operação", "E.g. Operations")} /><HubButton icon={Plus} className="primary" onClick={createTeam} disabled={!writable}>{t("Criar", "Create")}</HubButton><HubField title={t("Falar com profissional", "Talk to professional")} value={directUser} onChange={setDirectUser} options={[{ value: "", label: t("Selecionar membro", "Select member") }, ...data.staff.filter((row) => row.user_id !== member.user_id).map((row) => ({ value: row.user_id, label: `${displayName(row)} · ${label(row.role, t)}` }))]} /><HubButton icon={UserCheck} onClick={createDirect} disabled={!writable || !directUser}>{t("Iniciar", "Start")}</HubButton></div><div className="team-chat-layout"><nav className="team-chat-list" aria-label={t("Conversas internas", "Internal conversations")}>{data.conversations.map((row) => <button type="button" key={row.id} className={selected?.id === row.id ? "selected" : ""} onClick={() => setSelected(row)}><strong>{row.title || t("Equipe", "Team")}</strong><small>{row.kind === "direta" ? t("Conversa profissional", "Professional conversation") : t("Chat interno sem paciente", "Internal chat without patient")}</small></button>)}{!data.conversations.length && <p className="subtle">{t("Crie o primeiro chat interno.", "Create the first internal chat.")}</p>}</nav><div className="team-chat-thread">{selected ? <><div className="team-chat-messages">{messages.map((row) => <article className={row.sender_id === member.user_id ? "own" : ""} key={row.id}><strong>{row.sender_id === member.user_id ? t("Você", "You") : senderName(row.sender_id)}</strong><p className="preserve">{row.body}</p><small>{date(row.created_at, true)}</small></article>)}{!messages.length && <p className="subtle">{t("Nenhuma mensagem ainda.", "No messages yet.")}</p>}</div>{writable && <form className="team-chat-compose" onSubmit={send}><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Escreva para a equipe…", "Write to the team…")} required /><HubButton className="primary" icon={Send}>{t("Enviar", "Send")}</HubButton></form>}</> : <p className="subtle">{t("Selecione ou crie um chat interno.", "Select or create an internal chat.")}</p>}</div></div></section><section className="communication-column"><header className="communication-column-head"><div><p className="eyebrow">{t("Pacientes e clientes", "Patients and clients")}</p><h2>{t("Comunicação externa", "External communication")}</h2><p className="subtle">{t("Escolha um paciente e abra o WhatsApp Web em uma nova aba.", "Choose a patient and open WhatsApp Web in a new tab.")}</p></div><HubButton icon={MessageCircle} className="primary" onClick={() => setExternal({})} disabled={!writable}>{t("Nova mensagem", "New message")}</HubButton></header><div className="communication-list">{loading && <p role="status">{t("Carregando…", "Loading…")}</p>}{error && <p className="notice error" role="alert">{error}</p>}{!loading && !error && !externalHistory.length && <p className="subtle">{t("Nenhuma mensagem externa registrada.", "No external messages recorded.")}</p>}{externalHistory.map((row) => <article className="communication-card" key={row.id}><span className="communication-card-icon"><MessageCircle size={17} /></span><div><strong>{displayName(row.patients) || row.recipient_name}</strong><small>{row.channel} · {label(row.status, t)} · {date(row.created_at, true)}</small><p className="preserve communication-preview">{row.body}</p></div>{row.patients && <HubButton icon={UserRound} onClick={() => openPatient(row.patients)}>{t("Paciente", "Patient")}</HubButton>}</article>)}</div></section></div>{external && <ExternalMessage patients={data.patients} initialPatient={external.patient} member={member} close={() => setExternal(null)} notify={notify} refresh={load} />}<div className="sr-only" aria-live="polite"><Check size={1} />{loading ? t("Carregando comunicação", "Loading communication") : ""}</div></>;
}
