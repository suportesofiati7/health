import {
  ORG,
  identity,
  endpoint,
  bounded,
  reply,
  sha256,
  limit,
} from "../_shared/core.ts";

Deno.serve(
  endpoint(async (req) => {
    const { db, scoped, user } = await identity(req);
    await limit(db, "upload:" + user.id, 40, 3600);
    const bytes = await bounded(req, 8500000);
    const form = await new Response(bytes, {
      headers: { "Content-Type": req.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file"),
      patient = String(form.get("patient_id") || ""),
      kind = String(form.get("kind") || "document");
    if (!(file instanceof File) || file.size < 1 || file.size > 8388608)
      throw Error("file");
    const { data: p } = await scoped
      .from("patients")
      .select("id")
      .eq("id", patient)
      .single();
    if (!p) throw Error("patient");
    const content = new Uint8Array(await file.arrayBuffer());
    const type = detect(content);
    if (!type || file.type !== type) throw Error("type");
    const digest = await sha256(content);
    if (kind === "photo") {
      if (!type.startsWith("image/")) throw Error("photo_type");
      const category = String(form.get("category") || "");
      if (!["antes", "durante", "depois", "evolucao"].includes(category)) throw Error("photo_category");
      const path = `${ORG}/${patient}/${crypto.randomUUID()}.${type === "image/jpeg" ? "jpg" : type.slice(6)}`;
      const { error: uploadError } = await db.storage.from("clinical-photos").upload(path, content, { contentType: type, upsert: false, cacheControl: "0" });
      if (uploadError) throw Error("photo_upload");
      const { data: photo, error: photoError } = await db.from("clinical_photos").insert({
        organization_id: ORG, patient_id: patient, path, category, area: String(form.get("area") || "").slice(0, 200),
        description: String(form.get("description") || "").slice(0, 1000), mime_type: type, size_bytes: file.size, created_by: user.id,
      }).select("*").single();
      if (photoError) {
        await db.storage.from("clinical-photos").remove([path]);
        throw Error("photo_metadata");
      }
      await db.from("audit_events").insert({ organization_id: ORG, actor_id: user.id, action: "foto_clinica_enviada", entity_type: "clinical_photos", entity_id: photo.id });
      return reply(req, { photo });
    }
    const { data: doc, error } = await db.rpc("reserve_document", {
      org: ORG,
      patient,
      filename: file.name.replace(/[\x00-\x1f/\\]/g, "_").replace(/\.[^.]*$/, '').slice(0, 190) + ({'application/pdf':'.pdf','image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}[type]),
      mime: type,
      bytes: file.size,
      digest,
      category_name: String(form.get("category") || "documento").slice(0, 50),
      actor: user.id,
    });
    if (error || !doc) throw Error("reserve");
    if (doc.status === "pronto") return reply(req, { document: doc });
    if (doc.status === "falha") throw Error("previous_upload_failed");
    const { error: uploadError } = await db.storage
      .from("patient-files")
      .upload(doc.path, content, {
        contentType: type,
        upsert: false,
        cacheControl: "0",
      });
    if (uploadError) {
      await db.from("documents").update({ status: "falha" }).eq("id", doc.id);
      throw Error("arquivo_enviado");
    }
    const { error: readyError } = await db
      .from("documents")
      .update({ status: "pronto" })
      .eq("id", doc.id);
    if (readyError) throw Error("metadata");
    await db
      .from("audit_events")
      .insert({
        organization_id: ORG,
        actor_id: user.id,
        action: "arquivo_enviado",
        entity_type: "documents",
        entity_id: doc.id,
      });
    return reply(req, { document: { ...doc, status: "pronto" } });
  }),
);

function detect(b: Uint8Array) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => b[i] === n))
    return "image/png";
  const head = new TextDecoder().decode(b.slice(0, 12));
  if (head.startsWith("RIFF") && head.slice(8) === "WEBP") return "image/webp";
  if (head.startsWith("%PDF-")) {
    const source = new TextDecoder("latin1").decode(b);
    if (/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA)\b/i.test(source))
      return null;
    return "application/pdf";
  }
  return null;
}
