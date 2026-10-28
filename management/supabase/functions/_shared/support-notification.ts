// All intake notifications use these two support inboxes. Detailed records
// remain accessible in the authenticated app.
export async function notifySupport(summary: Record<string, unknown>) {
  try {
    const body = new FormData();
    for (const [key, value] of Object.entries(summary)) {
      if (!key.startsWith("_")) body.set(key, String(value ?? ""));
    }
    body.set("_subject", "Novo formulário recebido - Franciele Sofiati");
    body.set("_cc", Deno.env.get("SUPPORT_SECONDARY_EMAIL") || "sofiatimendonca@gmail.com");
    body.set("_template", "table");
    const response = await fetch("https://formsubmit.co/ajax/suportesofiati@gmail.com", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Origin: "https://francielesofiati.com",
        Referer: "https://francielesofiati.com/formulario",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Sofiati public intake)",
      },
      body,
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json().catch(() => null);
    return response.ok && (result?.success === true || result?.success === "true");
  } catch { return false; }
}
