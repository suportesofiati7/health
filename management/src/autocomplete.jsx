import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

let procedureCatalog = [];

export function setProcedureCatalog(rows) {
  procedureCatalog = (rows || []).filter((row) => row?.active !== false && row?.name).map((row) => ({
    id: row.id,
    label: row.name,
    value: row.name,
    kind: "procedure",
    detail: row.category || "Procedimento",
  }));
}

const BUILT_IN_SNIPPETS = [
  ["aval", "Avaliação realizada antes da definição da conduta.", "Avaliação"],
  ["bot", "Botox / toxina botulínica", "Procedimento"],
  ["pos", "Orientações de pós-cuidado foram explicadas e as dúvidas foram esclarecidas.", "Pós-cuidado"],
  ["ret", "Retorno recomendado conforme evolução e resposta ao cuidado.", "Retorno"],
  ["cons", "Consentimento e finalidade do procedimento foram revisados com o paciente.", "Consentimento"],
  ["sem", "Sem intercorrências observadas no momento do registro.", "Registro clínico"],
  ["enc", "Orientado procurar avaliação profissional/serviço de referência se houver piora ou sinais de alerta.", "Orientação"],
  ["msg", "Olá, {{nome}}. Estamos à disposição para ajudar e combinar os próximos passos do seu atendimento.", "Mensagem"],
].map(([trigger, value, detail]) => ({ trigger, label: value, value, kind: "snippet", detail }));

const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function currentSuggestions() {
  return [...BUILT_IN_SNIPPETS, ...procedureCatalog];
}

function matchingSuggestions(value, suggestions, max = 7) {
  const text = String(value || "");
  const fragment = text.slice(Math.max(text.lastIndexOf(" "), text.lastIndexOf("\n"), text.lastIndexOf("\t")) + 1);
  const query = normalize(fragment);
  if (!query) return [];
  const rows = suggestions.filter((item) => {
    const trigger = item.trigger ? normalize(item.trigger) : "";
    const label = normalize(item.label);
    return (trigger && trigger.startsWith(query)) || label.startsWith(query) || label.includes(query);
  });
  return rows.sort((a, b) => {
    const aTrigger = a.trigger && normalize(a.trigger).startsWith(query) ? 0 : 1;
    const bTrigger = b.trigger && normalize(b.trigger).startsWith(query) ? 0 : 1;
    return aTrigger - bTrigger || a.label.localeCompare(b.label);
  }).slice(0, max);
}

function replaceFragment(value, replacement) {
  const text = String(value || "");
  const start = Math.max(text.lastIndexOf(" "), text.lastIndexOf("\n"), text.lastIndexOf("\t")) + 1;
  return `${text.slice(0, start)}${replacement}${text.slice(text.length).trimStart() ? " " : ""}`;
}

export function SmartTextControl({ as = "input", value = "", onChange, suggestions = currentSuggestions(), disabled = false, ...props }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = useMemo(() => matchingSuggestions(value, suggestions), [value, suggestions]);
  useEffect(() => { setActive(0); setOpen(matches.length > 0); }, [matches.length]);
  const choose = (item) => {
    onChange(replaceFragment(value, item.value));
    setOpen(false);
    requestAnimationFrame(() => ref.current?.focus());
  };
  const onKeyDown = (event) => {
    if (!open || !matches.length) {
      props.onKeyDown?.(event);
      return;
    }
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => (index + 1) % matches.length); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => (index - 1 + matches.length) % matches.length); return; }
    if (event.key === "Enter" || event.key === "Tab") { event.preventDefault(); choose(matches[active]); return; }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    props.onKeyDown?.(event);
  };
  const Control = as === "textarea" ? "textarea" : "input";
  return <div className="smart-field-control">
    <Control ref={ref} value={value ?? ""} onChange={(event) => { onChange(event.target.value); setOpen(true); }} onFocus={() => setOpen(matches.length > 0)} onBlur={() => setTimeout(() => setOpen(false), 120)} onKeyDown={onKeyDown} disabled={disabled} {...props} />
    {open && matches.length > 0 && <div className="autocomplete-menu" role="listbox">
      {matches.map((item, index) => <button type="button" role="option" aria-selected={index === active} className={index === active ? "selected" : ""} key={`${item.kind}-${item.id || item.trigger}-${item.value}`} onMouseDown={(event) => { event.preventDefault(); choose(item); }}><span><strong>{item.kind === "snippet" ? `${item.trigger} · ` : ""}{item.label}</strong><small>{item.detail}</small></span>{index === active ? <Check size={15} /> : <ChevronDown size={15} />}</button>)}
      <footer>↑↓ {" "} escolher · Enter/Tab inserir · Esc fechar</footer>
    </div>}
  </div>;
}
