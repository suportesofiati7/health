import React, { useEffect, useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { db, checked, ORG, safeSearch } from "./lib";
import { useT } from "./i18n";

const nameOf = (row) => row?.preferred_name || row?.full_name || "Paciente sem nome";
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function PatientPicker({ value, onChange, initial, title }) {
  const t = useT();
  const [term, setTerm] = useState(initial ? nameOf(initial) : "");
  const [rows, setRows] = useState(initial ? [initial] : []);
  const [open, setOpen] = useState(false);
  const selected = rows.find((row) => row.id === value) || (initial?.id === value ? initial : null);
  useEffect(() => {
    if (initial?.id && !rows.some((row) => row.id === initial.id)) setRows((current) => [initial, ...current]);
    if (initial?.id && value === initial.id && !term) setTerm(nameOf(initial));
  }, [initial?.id, value]);
  useEffect(() => {
    let live = true;
    const timer = setTimeout(async () => {
      const query = safeSearch(term);
      let request = db.from("patients").select("id,full_name,preferred_name,phone,email,cpf,status").eq("organization_id", ORG).neq("status", "inativo").order("full_name").limit(20);
      if (query) {
        const safe = query.replace(/[,()]/g, " ").trim();
        request = request.or(`full_name.ilike.%${safe}%,preferred_name.ilike.%${safe}%,cpf.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
      }
      const result = await request;
      if (live && !result.error) setRows((current) => [...new Map([...(selected ? [selected] : []), ...(result.data || [])].map((row) => [row.id, row])).values()]);
    }, 180);
    return () => { live = false; clearTimeout(timer); };
  }, [term, value]);
  const visible = useMemo(() => {
    const q = normalize(term);
    return rows.filter((row) => !q || [row.full_name, row.preferred_name, row.cpf, row.email, row.phone].some((field) => normalize(field).includes(q))).slice(0, 20);
  }, [rows, term]);
  const choose = (row) => { onChange(row.id); setTerm(nameOf(row)); setOpen(false); };
  const clear = () => { onChange(""); setTerm(""); setOpen(true); };
  return <div className="patient-picker searchable-picker">
    <label className="field"><span>{title || t("Paciente", "Patient")}</span><div className="searchable-picker-input"><Search size={16} aria-hidden="true" /><input value={term} onChange={(event) => { setTerm(event.target.value); setOpen(true); if (value) onChange(""); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder={t("Digite nome, CPF, email ou telefone", "Type name, CPF, email or phone")} autoComplete="off" /><button type="button" className="icon" onMouseDown={(event) => event.preventDefault()} onClick={clear} aria-label={t("Limpar paciente", "Clear patient")}><X size={15} /></button></div>{open && <div className="searchable-picker-menu" role="listbox">{visible.map((row) => <button type="button" role="option" key={row.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(row)} className={row.id === value ? "selected" : ""}><span><strong>{nameOf(row)}</strong><small>{[row.cpf, row.email, row.phone].filter(Boolean).join(" · ") || t("Sem contato adicional", "No additional contact")}</small></span>{row.id === value && <Check size={15} />}</button>)}{!visible.length && <p>{t("Nenhum paciente encontrado.", "No patient found.")}</p>}</div>}</label>
  </div>;
}

export function TemplatePicker({ templates, value, onChange, channel, title }) {
  const t = useT();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const available = useMemo(() => (templates || []).filter((row) => !channel || row.channel === channel), [templates, channel]);
  const selected = available.find((row) => row.id === value);
  const visible = useMemo(() => { const q = normalize(term); return available.filter((row) => !q || normalize(`${row.name} ${row.body} ${row.subject} ${row.category}`).includes(q)); }, [available, term]);
  useEffect(() => { if (!selected) setTerm(""); }, [selected?.id]);
  const choose = (row) => { onChange(row.id); setTerm(""); setOpen(false); };
  return <div className="template-picker-sections">
    <label className="field template-picker-select"><span>{t("Selecionar modelo", "Select template")}</span><select value={value || ""} onChange={(event) => { const row = available.find((item) => String(item.id) === event.target.value); if (row) choose(row); }} aria-label={title || t("Modelo", "Template")}>
      <option value="">{t("Escolha um modelo…", "Choose a template…")}</option>
      {available.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.category || t("sem categoria", "uncategorized")} · {row.variant || "standard"}</option>)}
    </select></label>
    <div className="template-picker-search"><span className="template-picker-section-label">{t("Buscar modelo", "Search templates")}</span>
      <label className="field searchable-picker"><span className="sr-only">{t("Buscar modelo", "Search templates")}</span><div className="searchable-picker-input"><Search size={16} aria-hidden="true" /><input value={term} onChange={(event) => { setTerm(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder={t("Digite nome ou conteúdo do modelo", "Type template name or content")} autoComplete="off" /></div>{open && <div className="searchable-picker-menu" role="listbox">{visible.slice(0, 30).map((row) => <button type="button" role="option" key={row.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(row)} className={row.id === value ? "selected" : ""}><span><strong>{row.name}</strong><small>{row.category} · {row.variant || "standard"} · {String(row.body || "").replace(/\s+/g, " ").slice(0, 100)}</small></span>{row.id === value && <Check size={15} />}</button>)}{!visible.length && <p>{t("Nenhum modelo encontrado.", "No template found.")}</p>}</div>}</label>
    </div>
  </div>;
}
