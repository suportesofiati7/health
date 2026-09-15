import { createClient } from "@supabase/supabase-js";
export const ORG = "a783bd4c-f253-4a94-9365-75c6f1000001";
export const config = {
  url:
    import.meta.env.VITE_SUPABASE_URL ||
    "https://naypgbhwnlbyqqqfftgn.supabase.co",
  key:
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_jH3gQ7-Tx8_-B191w3Gr1A_GkGHG9Hf",
};
export const db = createClient(config.url, config.key, {
  auth: {
    storage: typeof sessionStorage === "undefined" ? undefined : sessionStorage,
    storageKey: "sofiati-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
  },
});
export const digits = (value) => String(value || "").replace(/\D/g, "");
export function validCPF(value) {
  const n = digits(value);
  if (!n) return true;
  if (!/^\d{11}$/.test(n) || /^(\d)\1{10}$/.test(n)) return false;
  return [9, 10].every((size) => {
    const sum = [...n.slice(0, size)].reduce(
      (s, c, i) => s + Number(c) * (size + 1 - i),
      0,
    );
    return ((sum * 10) % 11) % 10 === Number(n[size]);
  });
}
export function validCNS(value) {
  const n = digits(value);
  return (
    !n ||
    (/^\d{15}$/.test(n) &&
      [...n].reduce((sum, digit, i) => sum + Number(digit) * (15 - i), 0) %
        11 ===
        0)
  );
}
export const whatsapp = (phone) => {
  const n = digits(phone);
  return /^\d{10,13}$/.test(n)
    ? `https://wa.me/${n.length <= 11 ? "55" : ""}${n}`
    : null;
};
export const whatsappWeb = (phone) => {
  const n = digits(phone);
  if (!/^\d{10,13}$/.test(n)) return null;
  const international = n.length <= 11 ? `55${n}` : n;
  return `https://web.whatsapp.com/send?phone=${international}`;
};
export const date = (value, time = false) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(time ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
      }).format(
        new Date(value.length === 10 ? `${value}T12:00:00-03:00` : value),
      )
    : "";

const DATE_INPUT_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const DATETIME_INPUT_RE = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;

export function formatDateInput(value, time = false) {
  if (!value) return "";
  const match = String(value).match(time ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/ : /^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}${time ? ` ${match[4]}:${match[5]}` : ""}` : String(value);
}

export function parseDateInput(value, time = false) {
  const match = String(value || "").match(time ? DATETIME_INPUT_RE : DATE_INPUT_RE);
  if (!match) return "";
  const [, day, month, year, hour = "00", minute = "00"] = match;
  if (Number(hour) > 23 || Number(minute) > 59) return "";
  const candidate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00-03:00`);
  if (Number.isNaN(candidate.getTime()) || candidate.getDate() !== Number(day) || candidate.getMonth() + 1 !== Number(month)) return "";
  return time ? `${year}-${month}-${day}T${hour}:${minute}` : `${year}-${month}-${day}`;
}
export const localDay = (value = new Date()) => {
  const instant = typeof value === "string"
    ? new Date(value.length === 10 ? `${value}T12:00:00-03:00` : value)
    : value;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant).reduce((result, part) => {
    if (part.type !== "literal") result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};
export const localDateTime = () =>
  `${localDay()}T${new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`;
export const toISO = (value) =>
  value
    ? new Date(value + ":00-03:00").toISOString()
    : new Date().toISOString();
export const money = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value || 0),
  );
export function age(birth) {
  if (!birth) return null;
  const today = localDay(),
    years = Number(today.slice(0, 4)) - Number(birth.slice(0, 4));
  return years - (today.slice(5) < birth.slice(5) ? 1 : 0);
}
export function safeSearch(value) {
  return value
    .replace(/[^\p{L}\p{N}@ .+_-]/gu, "")
    .trim()
    .slice(0, 80);
}
export async function checked(query) {
  const result = await query;
  if (result.error) throw result.error;
  return result.data;
}
export async function save(table, values, existing) {
  if (existing) {
    const rows = await checked(
      db
        .from(table)
        .update(values)
        .eq("id", existing.id)
        .eq("version", existing.version)
        .select(),
    );
    if (!rows.length) throw { code: "conflict" };
    return rows[0];
  }
  return checked(
    db
      .from(table)
      .insert({ ...values, organization_id: ORG })
      .select()
      .single(),
  );
}
export async function invoke(name, body) {
  const { data, error } = await db.functions.invoke(name, { body });
  if (error || data?.error) throw { code: data?.error || "request_failed" };
  return data;
}
export async function portalRequest(body, token = "") {
  const response = await fetch(`${config.url}/functions/v1/portal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.key,
      ...(token ? { "x-portal-token": token } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) throw { code: data?.error || "request_failed" };
  return data;
}
export async function allRows(table, patient) {
  const rows = [];
  let offset = 0;
  for (;;) {
    let query = db
      .from(table)
      .select("*")
      .eq("organization_id", ORG)
      .order("id")
      .range(offset, offset + 199);
    if (patient)
      query = query.eq(table === "patients" ? "id" : "patient_id", patient);
    const batch = await checked(query);
    rows.push(...batch);
    if (batch.length < 200) return rows;
    offset += batch.length;
  }
}
