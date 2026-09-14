import {
  admin,
  ORG,
  identity,
  endpoint,
  json,
  reply,
  clean,
  limit,
} from "../_shared/core.ts";

Deno.serve(
  endpoint(async (req) => {
    const b = await json(req);
    if (b.action === "activate") {
      const db = admin(),
        token =
          req.headers.get("authorization")?.replace(/^Bearer /i, "") || "";
      const {
        data: { user },
        error,
      } = await db.auth.getUser(token);
      if (error || !user?.email_confirmed_at) throw Error("auth");
      const { error: updateError } = await db
        .from("memberships")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("organization_id", ORG)
        .eq("status", "invited");
      if (updateError) throw Error("activate");
      return reply(req, { activated: true });
    }
    const { db, user } = await identity(req, ["owner"]);
    await limit(db, "staff:" + user.id, 20, 3600);
    const origin = Deno.env.get("MANAGEMENT_ORIGIN")!;
    if (b.action === "invite") {
      const email = clean(b.email, 254).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error("email");
      if (!["professional", "reception", "readonly"].includes(b.role))
        throw Error("role");
      const { data, error } = await db.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: origin },
      });
      if (error || !data.user) throw Error("invite");
      const { error: insertError } = await db
        .from("memberships")
        .insert({
          organization_id: ORG,
          user_id: data.user.id,
          email,
          name: clean(b.name, 200),
          role: b.role,
          profession: clean(b.profession, 100),
          council: clean(b.council, 30),
          registration: clean(b.registration, 50),
          state: clean(b.state, 2),
          specialty: clean(b.specialty, 100),
        });
      if (insertError) throw Error("membership");
      await db
        .from("audit_events")
        .insert({
          organization_id: ORG,
          actor_id: user.id,
          action: "invite",
          entity_type: "memberships",
          entity_id: data.user.id,
        });
      return reply(req, {
        link: activationLink(origin, data.properties.hashed_token, "invite"),
      });
    }
    const { data: member } = await db
      .from("memberships")
      .select("*")
      .eq("organization_id", ORG)
      .eq("user_id", b.user_id)
      .single();
    if (!member || member.role === "owner" || member.user_id === user.id)
      throw Error("protected_owner");
    if (b.action === "recovery") {
      if (!["active", "invited"].includes(member.status))
        throw Error("inactive");
      const { data, error } = await db.auth.admin.generateLink({
        type: "recovery",
        email: member.email,
        options: { redirectTo: origin },
      });
      if (error) throw Error("recovery");
      await db
        .from("audit_events")
        .insert({
          organization_id: ORG,
          actor_id: user.id,
          action: "recovery_link",
          entity_type: "memberships",
          entity_id: member.id,
        });
      return reply(req, {
        link: activationLink(origin, data.properties.hashed_token, "recovery"),
      });
    }
    if (
      b.action !== "update" ||
      !["active", "inactive", "suspended"].includes(b.status) ||
      !["professional", "reception", "readonly"].includes(b.role)
    )
      throw Error("action");
    const { error } = await db
      .from("memberships")
      .update({
        role: b.role,
        status: b.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id);
    if (error) throw Error("update");
    await db
      .from("audit_events")
      .insert({
        organization_id: ORG,
        actor_id: user.id,
        action: "access_changed",
        entity_type: "memberships",
        entity_id: member.id,
      });
    // Membership RLS revokes data access immediately, including already-issued JWTs.
    return reply(req, { saved: true });
  }),
);

function activationLink(origin: string, hash: string, type: string) {
  return `${origin}/#token_hash=${encodeURIComponent(hash)}&type=${type}`;
}
