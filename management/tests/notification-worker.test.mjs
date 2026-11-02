import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = (await readFile(new URL("../supabase/functions/intake-notifications/index.ts", import.meta.url), "utf8"))
  .replace(/^import .*;\n/gm, "").replace("Deno.serve(", "export const handler = (");
const renderer = (await readFile(new URL("../supabase/functions/intake-notifications/email.js", import.meta.url), "utf8"))
  .replace("export function buildIntakeEmail", "function buildIntakeEmail");
const procedureSource = (await readFile(new URL("../src/procedureLabels.js", import.meta.url), "utf8"))
  .replaceAll("export ", "");
const code = "const admin=()=>globalThis.notificationTestDB;\n" + procedureSource + "\n" + renderer + "\n" + worker;
const { handler } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

function setupFixture() {
  const writes = [];
  let claims = 0;
  let fail = false;
  const messages = [];
  const env = { NOTIFICATION_WORKER_SECRET: "test-secret" };
  const files = [
    { field_name: "identity_upload", original_name: "rg-exemplo.pdf", mime_type: "application/pdf", size_bytes: 4, path: "private/do-not-send" },
    { field_name: "booking_payment_receipt", original_name: "comprovante.jpg", mime_type: "image/jpeg", size_bytes: 4, path: "private/do-not-send" },
  ];
  const intake = {
    completed_at: "2026-11-02T12:00:00Z",
    full_name: "Paciente Fictícia",
    submitted_at: "2026-11-02T12:00:00Z",
    selected_procedure: "toxina",
    payload: {
      full_name: "Paciente Fictícia", email: "ficticia@example.invalid", phone: "(43) 99999-9999",
      cpf: "000.000.000-00", selected_procedures: ["toxina","harmony"],
      "treatment_área": "Rosto", appointment_date: "2027-11-05", appointment_time: "09:54",
      health_notes: "Alergia informada pelo paciente",
      initial_acknowledgement: "yes", booking_fee_acknowledgement: "yes",
      accepted_term_toxina: "yes", accepted_term_harmony: "yes",
      lgpd_sensitive_data_consent: "yes", promotional_communication: "no",
      signature_name: "Paciente Fictícia",
      additional_answer: "<script>alert('xss')</script>",
      access_token: "NEVER-IN-EMAIL", upload_url: "https://private.invalid/token",
    },
  };
  globalThis.notificationTestDB = {
    storage: { from(bucket) {
      assert.equal(bucket, "intake-private");
      return { download: async () => ({ data: new Blob(["abcd"]), error: null }) };
    } },
    rpc: async () => { claims++; return { data: [{ id: "job", intake_id: "intake", attempts: 1, created_at: new Date().toISOString() }] }; },
    from: table => {
      const chain = {
        select() { return chain; },
        eq() { return chain; },
        single: async () => ({ data: intake, error: null }),
        then(resolve) {
          return Promise.resolve(table === "public_intake_files" ? { data: files, error: null } : { error: null }).then(resolve);
        },
        update(value) { writes.push({ table, value }); return chain; },
      };
      return chain;
    },
  };
  const request = (authorization = "Bearer test-secret") =>
    new Request("https://qa.invalid", { method: "POST", headers: { Authorization: authorization } });
  const fetch = async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(options.headers["Idempotency-Key"], "intake-intake");
    messages.push(JSON.parse(options.body));
    return Response.json({}, { status: fail ? 503 : 200 });
  };
  return {
    env, writes, messages, request, fetch, setFail: value => { fail = value; },
    get claims() { return claims; },
  };
}

test("notification worker: auth, recipients, full answers, uploaded-file names, privacy and retries", async () => {
  const oldDeno = globalThis.Deno;
  const oldFetch = globalThis.fetch;
  const fixture = setupFixture();
  globalThis.Deno = { env: { get: key => fixture.env[key] } };
  globalThis.fetch = fixture.fetch;
  try {
    assert.equal((await handler(fixture.request("Bearer wrong"))).status, 403);
    assert.equal((await handler(fixture.request())).status, 503);
    assert.equal(fixture.claims, 0, "missing Resend configuration must not claim jobs");

    fixture.env.RESEND_API_KEY = "fictional";
    fixture.env.EMAIL_FROM = "teste@example.invalid";
    assert.equal((await (await handler(fixture.request())).json()).sent, 1);
    const message = fixture.messages.at(-1);
    assert.deepEqual(message.to, ["suportesofiati@gmail.com", "sofiatimendonca@gmail.com"]);
    assert.ok(message.html.includes("background:#526548"), "matches canonical desktop menu green");
    assert.ok(message.html.includes("assets/brand/monograma-franciele-sofiati-biomedica-esteta-estetica-avancada-gleba-palhano.webp"), "uses exact requested branded WebP monogram");
    assert.ok(message.html.includes("Paciente Fictícia"));
    assert.ok(message.html.includes("000.000.000-00"));
    assert.ok(message.html.includes("Alergia informada"));
    assert.ok(message.html.includes("rg-exemplo.pdf"));
    assert.ok(message.html.includes("comprovante.jpg"));
    assert.ok(message.html.includes("Toxina botulínica, Harmony"));
    assert.ok(message.html.includes("&lt;script&gt;"));
    assert.ok(!message.html.includes("<script>alert"));
    assert.ok(!message.html.includes("NEVER-IN-EMAIL"));
    assert.ok(!message.html.includes("private/do-not-send"));
    assert.ok(!message.html.includes("https://private.invalid"));
    assert.ok(message.text.includes("Paciente Fictícia"));
    assert.equal(fixture.writes.at(-1).value.status, "sent");
    assert.equal(message.attachments?.length, 2, "files included when attachments are enabled by default");

    // Operator can explicitly disable physical attachments on the Supabase worker.
    fixture.env.EMAIL_ATTACH_CLINICAL_FILES = "false";
    assert.equal((await (await handler(fixture.request())).json()).sent, 1);
    const withoutAttachments = fixture.messages.at(-1);
    assert.equal(withoutAttachments.attachments, undefined, "privacy opt-out disables attachments");
    fixture.env.EMAIL_ATTACH_CLINICAL_FILES = "true";
    assert.equal((await (await handler(fixture.request())).json()).sent, 1);
    const withAttachments = fixture.messages.at(-1);
    assert.equal(withAttachments.attachments.length, 2);
    assert.equal(withAttachments.attachments[0].filename, "rg-exemplo.pdf");
    assert.equal(withAttachments.attachments[0].content, "YWJjZA==");
    assert.ok(!withAttachments.html.includes("private/do-not-send"));

    fixture.setFail(true);
    assert.equal((await (await handler(fixture.request())).json()).sent, 0);
    assert.equal(fixture.writes.at(-1).value.status, "failed");
    assert.ok(!fixture.writes.some(({ table }) => table === "public_intakes"),
      "notification errors may not mutate submitted patient records");
  } finally {
    globalThis.Deno = oldDeno;
    globalThis.fetch = oldFetch;
    delete globalThis.notificationTestDB;
  }
});
