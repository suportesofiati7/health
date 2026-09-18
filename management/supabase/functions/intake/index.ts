import {
  admin,
  ORG,
  endpoint,
  json,
  reply,
  clean,
  sha256,
  limit,
} from "../_shared/core.ts";

Deno.serve(
  endpoint(async (req) => {
    const b = await json(req, 6000);
    const allowed = [
      "full_name",
      "cpf",
      "phone",
      "email",
      "preferred_contact",
      "interest_note",
      "language",
      "reason",
      "message",
      "form_type",
      "source",
      "privacy",
      "website",
      "token",
    ];
    if (Object.keys(b).some((k) => !allowed.includes(k))) throw Error("fields");
    if (b.website) return reply(req, { received: true }, 202);
    if (b.privacy !== true) throw Error("privacy");
    const full_name = clean(b.full_name, 200),
      phone = clean(b.phone, 20).replace(/\D/g, ""),
      email = clean(b.email, 254).toLowerCase();
    if (phone && !/^\d{10,13}$/.test(phone)) throw Error("phone");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw Error("email");
    const secret = Deno.env.get("TURNSTILE_SECRET_KEY"),
      salt = Deno.env.get("RATE_LIMIT_SALT");
    if (!secret || !salt) throw Error("unconfigured");
    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: clean(b.token, 2048) }),
      },
    ).then((r) => r.json());
  const allowedHosts = [Deno.env.get("PUBLIC_ORIGIN"), Deno.env.get("MANAGEMENT_ORIGIN")].filter(Boolean).map(value => new URL(value!).hostname);
    if (
      !verification.success ||
    !allowedHosts.includes(verification.hostname) ||
      verification.action !== "preregister"
    )
      throw Error("challenge");
    const db = admin();
    // Supabase's gateway supplies x-forwarded-for. Turnstile is the primary anti-bot
    // boundary; global/contact caps still apply if proxy IP attribution is unavailable.
    const ip = (req.headers.get("x-forwarded-for") || "nao_confirmado")
      .split(",")[0]
      .trim();
    const hash = await sha256(new TextEncoder().encode(salt + ip));
    await limit(db, "intake:ip:" + hash, 5, 3600);
    await limit(db, "intake:all", 100, 86400);
    if (phone || email)
      await limit(
        db,
        "intake:contact:" +
          (await sha256(new TextEncoder().encode(salt + phone + email))),
        3,
        86400,
      );
    const interest_note = clean(b.interest_note || [b.reason, b.message].filter(Boolean).join(" — "), 1000);
    const cpf = clean(b.cpf, 30).replace(/\D/g, "");
    const payload = {
      form_type: clean(b.form_type, 40) || "site",
      source: clean(b.source, 500),
      reason: clean(b.reason, 300),
      message: clean(b.message, 1200),
      interest_note,
      preferred_contact: clean(b.preferred_contact, 20),
    };
    const { error } = await db
      .from("public_intakes")
      .insert({
        organization_id: ORG,
        full_name: full_name || "Contato sem nome",
        preferred_name: full_name.split(/\s+/)[0] || "",
        phone,
        email,
        cpf,
        selected_procedure: clean(b.reason, 300),
        form_version: payload.form_type,
        language: clean(b.language, 20) || "pt-BR",
        payload,
      });
    if (error) throw Error("save");
    // Never return a record, identifier, duplicate signal or account information.
    return reply(req, { received: true }, 202);
  }),
);
