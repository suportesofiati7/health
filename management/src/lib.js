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
export const date = (value, time = false) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        ...(time ? { timeStyle: "short" } : {}),
      }).format(
        new Date(value.length === 10 ? `${value}T12:00:00-03:00` : value),
      )
    : "";
export const localDay = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
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
