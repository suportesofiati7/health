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
      "phone",
      "email",
      "preferred_contact",
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
    const { error } = await db
      .from("enquiries")
      .insert({
        organization_id: ORG,
        full_name,
        phone,
        email,
        preferred_contact: ["whatsapp", "phone", "email"].includes(
          b.preferred_contact,
        )
          ? b.preferred_contact
          : "whatsapp",
      });
    if (error) throw Error("save");
    // Never return a record, identifier, duplicate signal or account information.
    return reply(req, { received: true }, 202);
  }),
);
