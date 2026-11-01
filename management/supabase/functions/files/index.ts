import {
  ORG,
  admin,
  identity,
  endpoint,
  bounded,
  reply,
  sha256,
  limit,
} from "../_shared/core.ts";

Deno.serve(
  endpoint(async (req) => {
    // suporte_ti is the software-owner alias and is intentionally accepted
    // here. private.has_role() still enforces the organization/session checks
    // inside the database RPCs and table policies.
    const { db, scoped, user } = await identity(req, ["proprietario", "suporte_ti", "profissional", "medico", "enfermeiro", "fisioterapeuta", "nutricionista", "psicologo", "gestor_clinica", "recepcao", "secretaria", "coordenador_operacional"]);
    await limit(db, "upload:" + user.id, 40, 3600);
    const body = req.headers.get("content-type")?.includes("application/json")
      ? await req.json()
      : null;
    if (body?.action === "delete_patient") {
      const patientId = String(body.patient_id || "");
      if (!patientId) throw Error("patient_not_found");

      // Storage objects must be removed through the Storage API. Collect the
      // paths before the RPC because the RPC removes the relational metadata.
      const targets = [
        ["profile-photos", `${ORG}/patient/${patientId}`],
        ["clinical-photos", `${ORG}/${patientId}`],
        ["patient-files", `${ORG}/${patientId}`],
      ] as const;
      const removals: Array<readonly [string, string[]]> = [];
      for (const [bucket, prefix] of targets) {
        const paths = await listStorageTree(db, bucket, prefix);
        removals.push([bucket, paths]);
      }
      const { data: intakes, error: intakeError } = await scoped.from("public_intakes")
        .select("id").eq("patient_id", patientId);
      if (intakeError) throw intakeError;
      for (const intake of intakes || []) {
        removals.push(["intake-private", await listStorageTree(db, "intake-private", `${ORG}/${intake.id}`)]);
      }
      const { error: deleteError } = await scoped.rpc("delete_patient", { target_patient: patientId });
      if (deleteError) throw deleteError;
      for (const [bucket, paths] of removals) {
        if (paths.length) {
          const { error: removeError } = await db.storage.from(bucket).remove(paths);
          if (removeError) throw Error("storage_remove");
        }
      }
      const { data: stillThere, error: verifyError } = await db
        .from("patients")
        .select("id")
        .eq("id", patientId)
        .maybeSingle();
      if (verifyError) throw Error("delete_verify");
      if (stillThere) throw Error("delete_not_complete");
      return reply(req, { deleted: patientId });
    }
    if (body?.action === "delete_intake") {
      const intakeId = String(body.intake_id || "");
      if (!intakeId) throw Error("intake_not_found");
      const { data: files, error: fileLookupError } = await scoped
        .from("public_intake_files")
        .select("path")
        .eq("intake_id", intakeId);
      if (fileLookupError) throw fileLookupError;
      const storedPaths = await listStorageTree(db, "intake-private", `${ORG}/${intakeId}`);
      const { error: deleteError } = await scoped.rpc("delete_public_intake", { target_intake: intakeId });
      if (deleteError) throw deleteError;
      const paths = [...new Set([...storedPaths, ...(files || []).map((file) => file.path)])];
      if (paths.length) {
        const { error: removeError } = await db.storage.from("intake-private").remove(paths);
        if (removeError) throw Error("storage_remove");
      }
      const { data: stillThere, error: verifyError } = await db
        .from("public_intakes")
        .select("id")
        .eq("id", intakeId)
        .maybeSingle();
      if (verifyError) throw Error("delete_verify");
      if (stillThere) throw Error("delete_not_complete");
      return reply(req, { deleted: intakeId });
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
    if (!["document", "photo", "photo_replace", "photo_delete"].includes(kind)) throw Error("file_kind");
    const area = kind === "document" ? "documents" : "photos";
    const action = kind === "photo_delete" ? "delete" : kind === "photo_replace" ? "edit" : "create";
    const permission = await scoped.rpc("can_patient_operation", { permission_area: area, permission_action: action });
    if (permission.error || permission.data !== true) throw Error("not_authorized");
    const procedureId = String(form.get("clinical_procedure_id") || "");
    if (procedureId) {
      const result = await scoped.from("clinical_procedures").select("id").eq("organization_id", ORG).eq("patient_id", patient).eq("id", procedureId).single();
      if (result.error || !result.data) throw Error("patient_relationship_mismatch");
    }
    if (kind === "photo_delete") {
      const photoId = String(form.get("photo_id") || "");
      if (!photoId) throw Error("photo_not_found");
      const removal = await scoped.rpc("delete_clinical_photo", { photo_id: photoId, patient });
      if (removal.error) throw removal.error;
      for (const job of removal.data || []) {
        const removed = await db.storage.from(job.bucket).remove([job.path]);
        if (removed.error) throw Error("storage_remove");
        const acknowledged = await db.from("pending_storage_deletions").delete().eq("id", job.id);
        if (acknowledged.error) throw Error("storage_cleanup_acknowledgement");
      }
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
        : await scoped.from("clinical_photos").insert({ organization_id: ORG, patient_id: patient, ...metadata, clinical_procedure_id: procedureId || null, created_by: user.id }).select("*").single();
      if (photoError) {
        await db.storage.from("clinical-photos").remove([path]);
        throw Error("photo_metadata");
      }
      // Old bytes remain referenced by clinical_photo_versions.
      await audit(db, { organization_id: ORG, actor_id: user.id, action: "foto_clinica_enviada", entity_type: "clinical_photos", entity_id: photo.id });
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

async function listStorageTree(db: ReturnType<typeof admin>, bucket: string, root: string) {
  const paths: string[] = [];
  const visit = async (prefix: string): Promise<void> => {
    for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from(bucket).list(prefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw Error("storage_list");
    for (const entry of data || []) {
      const path = `${prefix}/${entry.name}`;
      if (entry.id) paths.push(path);
      else await visit(path);
    }
    if (!data || data.length < 1000) break;
    }
  };
  await visit(root);
  return paths;
}

async function audit(db: ReturnType<typeof admin>, event: Record<string, unknown>) {
  const result = await db.from("audit_events").insert(event);
  if (result.error) throw Error("audit_write");
}
