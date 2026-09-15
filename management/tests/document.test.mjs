import test from "node:test";
import assert from "node:assert/strict";
import { documentHeader, reportDocumentHTML } from "../src/documentSystem.js";

const t = (pt) => pt;

test("shared documents reserve a flow-based header for long and optional values", () => {
  const longPatient = "Ashlyn Ann Merrigan with a deliberately long fictional surname for QA";
  const html = reportDocumentHTML({
    title: "Prontuário completo do paciente com título deliberadamente longo para QA",
    patient: { full_name: longPatient },
    body: "<p>Conteúdo fictício</p>",
    documentId: "FS-2026-VERY-LONG-CONTROL-IDENTIFIER-0001",
    generated: "15/09/2026, 15:00",
    mode: "integral",
    t,
  });
  assert.match(html, /class="document-header-context"/);
  assert.match(html, /class="document-header-brand"/);
  assert.match(html, /document-content/);
  assert.doesNotMatch(html, /position:absolute!important.*document-footer/);
  assert.match(html, /document-header-logo/);
  assert.match(html, /VERY-LONG-CONTROL-IDENTIFIER/);
});

test("header omits optional subtitle without creating an empty text band", () => {
  const html = documentHeader({ title: "Documento sem paciente", subtitle: "", meta: "Documento clínico" });
  assert.doesNotMatch(html, /document-subtitle[^<]*<\/p>/);
  assert.match(html, /Documento sem paciente/);
});
