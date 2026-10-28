// All intake notifications use these two support inboxes. Detailed records
// remain accessible in the authenticated app.
export async function notifySupport(summary: Record<string, unknown>) {
  try {
    const response = await fetch("https://formsubmit.co/ajax/suportesofiati@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...summary,
        _subject: "Novo formulário recebido - Franciele Sofiati",
        _cc: Deno.env.get("SUPPORT_SECONDARY_EMAIL") || "sofiatimendonca@gmail.com",
        _template: "table",
      }),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json().catch(() => null);
    return response.ok && (result?.success === true || result?.success === "true");
  } catch { return false; }
}
