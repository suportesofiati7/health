/* Public intake controller. It is deliberately separate from the generic
 * contact-form handler: no sensitive field is sent to a mail provider. */
(() => {
  document.querySelector("#consent-form-introduction")?.remove();
  document.querySelector(".skip-past-hero")?.remove();
  const form = document.querySelector("form[data-public-intake]");
  if (!form) return;
  const firstCard = form.querySelector(":scope > .sf-consent-card");
  const sectionBrand = document.createElement("div");
  sectionBrand.className = "sf-section-brand";
  sectionBrand.innerHTML = '<div class="sf-section-brand__row"><img src="assets/shared/brand/hero-marks/logotipo-franciele-sofiati-acolhimento-clinico-estetica-avancada-londrina-centro.webp" alt="Franciele Sofiati" width="72" height="72"><div><p class="sf-section-brand__name">Franciele Sofiati</p><p class="sf-eyebrow">Cadastro clínico · atendimento estético</p></div></div><div class="sf-section-brand__row sf-section-brand__row--copy"><div><h1>Formulário de cadastro e consentimentos</h1><p class="sf-section-brand__lede">Um registro claro para preparar seu atendimento com cuidado, segurança e orientação individual.</p><p class="sf-section-brand__meta">Franciele Sofiati · Biomédica, Esteticista e Cosmetóloga · CRBM 6277</p></div></div>';
  firstCard?.prepend(sectionBrand);
  form.querySelectorAll("[required]").forEach((field) => { field.required = field.name === "cpf"; });
  const endpoint = form.action;
  const cards = [...form.querySelectorAll(":scope > .sf-consent-card")];
  const procedureInputs = [...form.querySelectorAll('input[name="selected_procedures"]')];
  let procedureDetails = [...form.querySelectorAll("details[data-consent-term-for]")];
  let step = 0;
  let submitting = false;
  const draftKey = "sofiati-public-intake-draft-v2026-09-14";

  // The approved form already contains the long terms. These additional
  // choices preserve the Google Form distinctions while reusing the matching
  // approved technology/peeling annex where the source uses a shared annex.
  const extra = [
    ["peeling_ultrassonico", "Peeling Ultrassônico", "Renovação superficial e preparo da pele."],
    ["peeling_cristal", "Peeling de Cristal", "Microdermoabrasão superficial conforme avaliação."],
    ["peeling_diamante", "Peeling de Diamante", "Renovação mecânica superficial conforme avaliação."],
    ["enzimas", "Enzimas", "Redução de papada e flacidez de face, pescoço e colo conforme avaliação."],
    ["limpeza_pele", "Limpeza de Pele", "Higienização e cuidados da pele conforme avaliação."],
  ];
  const procedureList = form.querySelector(".sf-consent-procedures");
  const template = procedureList?.querySelector(".sf-consent-procedure:last-child");
  if (procedureList && template) {
    extra.forEach(([value, title, description]) => {
      const article = template.cloneNode(true);
      const input = article.querySelector('input[name="selected_procedures"]');
      const heading = article.querySelector("strong");
      const small = article.querySelector("small");
      const details = article.querySelector("details");
      const acceptance = article.querySelector('input[name^="accepted_term_"]');
      input.value = value;
      input.required = false;
      heading.textContent = title;
      small.textContent = description;
      details.dataset.consentTermFor = value;
      details.querySelector("h4").textContent = `Termo específico: ${title}`;
      details.querySelectorAll("p").forEach((p) => {
        p.textContent = `Declaro compreender a finalidade, benefícios possíveis, limitações, riscos, contraindicações, cuidados antes e depois, necessidade de reavaliação e ausência de garantia de resultado do procedimento ${title}. Fui orientado(a) a informar condições de saúde, medicamentos, alergias, gestação, exposição solar e qualquer circunstância relevante. A profissional poderá adaptar, adiar, interromper ou contraindicar o procedimento por segurança.`;
      });
      acceptance.name = `accepted_term_${value}`;
      article.querySelector("span").textContent = "Li e compreendi o termo específico completo deste procedimento.";
      procedureList.append(article);
    });
  }
  const allProcedureInputs = [...form.querySelectorAll('input[name="selected_procedures"]')];
  procedureDetails = [...form.querySelectorAll("details[data-consent-term-for]")];

  // The public intake accepts supporting documents in any file format. They
  // are sent only to the private intake bucket; the server still enforces the
  // per-file, total-size and file-count limits.
  form.querySelectorAll('input[type="file"]').forEach((input) => input.removeAttribute("accept"));

  // Keep the custom file-status label synchronized with the real browser
  // file input. Event delegation also covers file inputs added dynamically.
  form.addEventListener("change", (event) => {
    const input = event.target;

    if (!(input instanceof HTMLInputElement) || input.type !== "file") return;

    const field = input.closest(".sf-consent-field");
    const status = field?.querySelector(".sf-file-status");
    if (!status) return;

    const files = Array.from(input.files || []);

    if (files.length === 0) {
      status.textContent = "Nenhum arquivo selecionado";
      status.removeAttribute("title");
      return;
    }

    if (files.length === 1) {
      status.textContent = files[0].name;
      status.title = files[0].name;
      return;
    }

    status.textContent = `${files.length} arquivos selecionados`;
    status.title = files.map((file) => file.name).join(", ");
  });
  const marketingCard = cards.find((card) => card.querySelector("h2")?.textContent.includes("Registro fotográfico"));
  if (marketingCard && !form.elements.marketing_authorization_files) {
    const uploads = document.createElement("div");
    uploads.className = "sf-consent-grid sf-public-upload-grid";
    uploads.innerHTML = '<div class="sf-consent-field"><label for="marketing_authorization_files">Arquivo da autorização de uso de imagem</label><input class="sf-consent-file-input" data-analytics-ignore="" data-analytics-sensitive="" id="marketing_authorization_files" name="marketing_authorization_files" multiple type="file"><div class="sf-file-control"><label class="sf-file-button" for="marketing_authorization_files">Selecionar arquivos</label><span class="sf-file-status">Nenhum arquivo selecionado</span></div><p>Opcional. Aceitamos qualquer tipo de arquivo, até 10 MB por arquivo.</p></div><div class="sf-consent-field"><label for="supporting_attachments">Documentos ou informações adicionais</label><input class="sf-consent-file-input" data-analytics-ignore="" data-analytics-sensitive="" id="supporting_attachments" name="supporting_attachments" multiple type="file"><div class="sf-file-control"><label class="sf-file-button" for="supporting_attachments">Selecionar arquivos</label><span class="sf-file-status">Nenhum arquivo selecionado</span></div><p>Opcional. Aceitamos documentos, imagens e outros formatos, até 10 MB por arquivo.</p></div>';
    marketingCard.append(uploads);
  }

  const addressField = form.querySelector("#address")?.closest(".sf-consent-field");
  if (addressField && !form.elements.postal_code) {
    const wrapper = document.createElement("div");
    wrapper.className = "sf-consent-field";
    wrapper.innerHTML = '<label for="postal_code">CEP</label><input id="postal_code" name="postal_code" inputmode="numeric" autocomplete="postal-code" type="text" maxlength="9"><p>Informe o CEP do endereço completo.</p>';
    addressField.after(wrapper);
  }
  const adultField = form.elements.adult_status;
  const guardianField = form.elements.guardian_details;
  if (adultField) {
    const representative = document.createElement("option");
    representative.value = "legal_representative";
    representative.textContent = "Estou preenchendo como responsável legal do(a) cliente";
    adultField.append(representative);
  }
  const syncGuardian = () => {
    if (!guardianField) return;
    const relevant = adultField?.value && adultField.value !== "adult";
    guardianField.required = false;
    guardianField.closest(".sf-consent-field")?.toggleAttribute("hidden", !relevant);
    if (!relevant) guardianField.value = "Não se aplica";
  };
  adultField?.addEventListener("change", syncGuardian);
  syncGuardian();

  const progress = document.createElement("div");
  progress.className = "sf-intake-progress";
  progress.setAttribute("aria-label", "Progresso do formulário");
  form.before(progress);
  const nav = document.createElement("div");
  nav.className = "sf-intake-nav";
  const back = document.createElement("button");
  back.type = "button";
  back.className = "sf-button sf-button--outline";
  back.textContent = "Voltar";
  const next = document.createElement("button");
  next.type = "button";
  next.className = "sf-button sf-button--primary";
  next.textContent = "Continuar";
  nav.append(back, next);
  form.append(nav);
  // Keep the complete approved form visible; the content is not hidden behind
  // step-by-step “Continuar” clicks.
  cards.forEach((card) => { card.hidden = false; });
  progress.remove();
  nav.remove();

  const saveDraft = () => {
    const draft = {};
    form.querySelectorAll("input,select,textarea").forEach((field) => {
      if (field.type === "file" || field.name === "token" || !field.name) return;
      if (field.type === "checkbox" || field.type === "radio") {
        if (field.checked) draft[field.name] = field.value;
      } else draft[field.name] = field.value;
    });
    try { sessionStorage.setItem(draftKey, JSON.stringify(draft)); } catch {}
  };
  const restoreDraft = () => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey) || "null");
      if (!draft) return;
      Object.entries(draft).forEach(([name, value]) => {
        form.querySelectorAll(`[name="${CSS.escape(name)}"]`).forEach((field) => {
          if (field.type === "checkbox" || field.type === "radio") field.checked = field.value === value;
          else field.value = value;
        });
      });
    } catch {}
  };
  restoreDraft();

  function selectedProcedures() {
    return allProcedureInputs.filter((input) => input.checked).map((input) => input.value);
  }
  function selectedProcedure() {
    return selectedProcedures().join(", ");
  }
  function syncProcedure() {
    const selected = new Set(selectedProcedures());
    procedureDetails.forEach((detail) => {
      const active = selected.has(detail.dataset.consentTermFor);
      detail.hidden = !active;
      detail.open = active;
      const acceptance = detail.querySelector('input[name^="accepted_term_"]');
      if (acceptance) {
        acceptance.disabled = !active;
        acceptance.required = false;
        if (!active) acceptance.checked = false;
      }
    });
    allProcedureInputs.forEach((input) => { input.type = "checkbox"; input.required = false; });
  }
  allProcedureInputs.forEach((input) => input.addEventListener("change", () => { syncProcedure(); saveDraft(); }));
  syncProcedure();

  function setStep(nextStep) {
    step = Math.max(0, Math.min(cards.length - 1, nextStep));
    cards.forEach((card, index) => { card.hidden = index !== step; });
    progress.innerHTML = cards.map((card, index) => `<span class="${index === step ? "is-current" : index < step ? "is-done" : ""}"><b>${index + 1}</b><em>${card.querySelector("h2")?.textContent || "Etapa"}</em></span>`).join("");
    back.hidden = step === 0;
    next.hidden = step === cards.length - 1;
    next.textContent = "Continuar";
    cards[step]?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  function validateCurrent() {
    const fields = [...cards[step].querySelectorAll("input,select,textarea")].filter((field) => !field.disabled && field.type !== "hidden");
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) { invalid.reportValidity(); invalid.focus(); return false; }
    return true;
  }
  back.addEventListener("click", () => setStep(step - 1));
  next.addEventListener("click", () => { if (validateCurrent()) { saveDraft(); setStep(step + 1); } });
  form.addEventListener("input", saveDraft);
  form.addEventListener("change", saveDraft);

  const submitButton = form.querySelector('button[type="submit"]');
  const state = (name, text) => {
    form.querySelectorAll("[data-form-state]").forEach((node) => { node.hidden = node.dataset.formState !== name; });
    if (text) form.querySelector(`[data-form-state="${name}"]`)?.querySelector("span")?.replaceChildren(document.createTextNode(text));
  };
  function renderTurnstile() {
    const sitekey = window.SOFIATI_PUBLIC?.turnstileSiteKey || "0x4AAAAAAE0b8mFSgQqazkH8";
    if (!sitekey) return;
    const holder = document.createElement("div");
    holder.id = "intake-turnstile";
    form.querySelector(".sf-consent-card--submit")?.prepend(holder);
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => window.turnstile.render(holder, { sitekey, action: "formulario", callback: (token) => { form.dataset.turnstile = token; submitButton.disabled = false; }, "expired-callback": () => { form.dataset.turnstile = ""; submitButton.disabled = true; } });
    document.head.append(script);
  }
  renderTurnstile();
  if (!window.SOFIATI_PUBLIC?.turnstileSiteKey) {
    submitButton.disabled = true;
    state("error");
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !form.checkValidity()) { form.reportValidity(); return; }
    if (!selectedProcedures().length) {
      const firstProcedure = allProcedureInputs[0];
      firstProcedure?.setCustomValidity("Selecione pelo menos um procedimento.");
      firstProcedure?.reportValidity();
      firstProcedure?.setCustomValidity("");
      return;
    }
    if (!form.dataset.turnstile) { state("error"); return; }
    submitting = true;
    submitButton.disabled = true;
    state("loading");
    const values = {};
    for (const [key, value] of new FormData(form).entries()) {
      if (value instanceof File) continue;
      if (key === "selected_procedures" || key.startsWith("accepted_term_")) {
        if (key === "selected_procedures") values[key] = values[key] ? [].concat(values[key], value) : [value];
        else values[key] = value;
      } else values[key] = value;
    }
    values.selected_procedure = selectedProcedure();
    values.selected_procedures = selectedProcedures();
    values.form_version = form.dataset.formVersion;
    values.language = document.documentElement.lang || "pt-BR";
    const body = new FormData();
    body.set("token", form.dataset.turnstile);
    body.set("payload", JSON.stringify(values));
    const files = [...form.querySelectorAll('input[type="file"]')].flatMap((input) => [...input.files].map((file) => ({ input, file })));
    if (files.length > 10 || files.some(({ file }) => file.size < 1 || file.size > 10 * 1024 * 1024) || files.reduce((sum, { file }) => sum + file.size, 0) > 50 * 1024 * 1024) {
      state("error", "Cada arquivo pode ter até 10 MB e o envio pode conter até 10 arquivos (50 MB no total).");
      submitting = false;
      submitButton.disabled = false;
      return;
    }
    files.forEach(({ input, file }) => {
      body.append("attachments", file, file.name);
      body.append("attachment_field", input.name);
    });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body,
        credentials: "omit",
        cache: "no-store"
      });

      const responseText = await response.text();
      let responseData = null;

      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = { raw: responseText };
      }

      console.log("FORMULARIO_RESPONSE", {
        status: response.status,
        ok: response.ok,
        body: responseData
      });

      if (!response.ok) {
        console.error("FORMULARIO_SUBMIT_FAILED", {
          status: response.status,
          body: responseData
        });

        const errorCode =
          responseData?.error ||
          responseData?.message ||
          responseData?.code ||
          `HTTP_${response.status}`;

        throw new Error(String(errorCode));
      }
      sessionStorage.removeItem(draftKey);
      form.reset();
      state("success");
      form.querySelector(".sf-consent-card--submit")?.scrollIntoView({ block: "start" });
    } catch (error) {
      console.error("FORMULARIO_CAUGHT_ERROR", error);
      state("error");
      submitting = false;
      submitButton.disabled = false;
      if (window.turnstile) window.turnstile.reset();
      form.dataset.turnstile = "";
    }
  });
})();
