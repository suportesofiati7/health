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
    const { db, scoped, user } = await identity(req, ["proprietario", "profissional", "recepcao"]);
    await limit(db, "upload:" + user.id, 40, 3600);
    const body = req.headers.get("content-type")?.includes("application/json")
      ? await req.json()
      : null;
    if (body?.action === "delete_patient") {
      const patientId = String(body.patient_id || "");
      if (!patientId) throw Error("patient_not_found");

      // Storage objects must be removed through the Storage API. Listing is
      // done before the RPC because the RPC removes the relational metadata.
      const targets = [
        ["profile-photos", `${ORG}/patient/${patientId}`],
        ["clinical-photos", `${ORG}/${patientId}`],
        ["patient-files", `${ORG}/${patientId}`],
      ] as const;
      for (const [bucket, prefix] of targets) {
        const { data: listed, error: listError } = await db.storage
          .from(bucket)
          .list(prefix, { limit: 1000, offset: 0 });
        if (listError) throw Error("storage_list");
        const paths = (listed || [])
          .filter((entry) => entry.id)
          .map((entry) => `${prefix}/${entry.name}`);
        if (paths.length) {
          const { error: removeError } = await db.storage.from(bucket).remove(paths);
          if (removeError) throw Error("storage_remove");
        }
      }
      const { error: deleteError } = await scoped.rpc("delete_patient", { target_patient: patientId });
      if (deleteError) throw deleteError;
      return reply(req, { deleted: patientId });
    }
    const bytes = await bounded(req, 8500000);
    const form = await new Response(bytes, {
      headers: { "Content-Type": req.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file"),
      patient = String(form.get("patient_id") || ""),
      kind = String(form.get("kind") || "document");
    const { data: p } = await scoped
      .from("patients")
      .select("id")
      .eq("id", patient)
      .single();
    if (!p) throw Error("patient");
    if (kind === "photo_delete") {
      const photoId = String(form.get("photo_id") || "");
      if (!photoId) throw Error("photo_not_found");
      const { data: photo, error: photoLookupError } = await db
        .from("clinical_photos")
        .select("id,path")
        .eq("id", photoId)
        .eq("patient_id", patient)
        .single();
      if (photoLookupError || !photo) throw Error("photo_not_found");
      const { error: removeError } = await db.from("clinical_photos").delete().eq("id", photoId).eq("patient_id", patient);
      if (removeError) throw Error("photo_metadata");
      if (photo.path) await db.storage.from("clinical-photos").remove([photo.path]);
      await db.from("audit_events").insert({ organization_id: ORG, actor_id: user.id, action: "foto_clinica_removida", entity_type: "clinical_photos", entity_id: photoId });
      return reply(req, { removed: photoId });
    }
    if (!(file instanceof File) || file.size < 1 || file.size > 8388608)
      throw Error("file");
    const content = new Uint8Array(await file.arrayBuffer());
    const type = detect(content);
    if (!type || file.type !== type) throw Error("type");
    const digest = await sha256(content);
    if (kind === "photo" || kind === "photo_replace") {
      if (!type.startsWith("image/")) throw Error("photo_type");
      const existingId = String(form.get("photo_id") || "");
      let existing = null;
      if (existingId) {
        const result = await scoped.from("clinical_photos").select("*").eq("id", existingId).eq("patient_id", patient).single();
        if (result.error || !result.data) throw Error("photo_not_found");
        existing = result.data;
      }
      const category = String(form.get("category") || existing?.category || "");
      if (!["antes", "durante", "depois", "evolucao"].includes(category)) throw Error("photo_category");
      const path = `${ORG}/${patient}/${crypto.randomUUID()}.${type === "image/jpeg" ? "jpg" : type.slice(6)}`;
      const { error: uploadError } = await db.storage.from("clinical-photos").upload(path, content, { contentType: type, upsert: false, cacheControl: "0" });
      if (uploadError) throw Error("photo_upload");
      const metadata = {
        path, category, area: String(form.get("area") || existing?.area || "").slice(0, 200),
        description: String(form.get("description") || existing?.description || "").slice(0, 1000),
        note: String(form.get("note") || existing?.note || "").slice(0, 1000),
        mime_type: type, size_bytes: file.size,
      };
      const { data: photo, error: photoError } = existing
        ? await scoped.from("clinical_photos").update(metadata).eq("id", existing.id).select("*").single()
        : await db.from("clinical_photos").insert({ organization_id: ORG, patient_id: patient, ...metadata, clinical_procedure_id: String(form.get("clinical_procedure_id") || "") || null, created_by: user.id }).select("*").single();
      if (photoError) {
        await db.storage.from("clinical-photos").remove([path]);
        throw Error("photo_metadata");
      }
      if (existing?.path) await db.storage.from("clinical-photos").remove([existing.path]);
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
