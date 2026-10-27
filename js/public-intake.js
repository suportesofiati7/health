import { deliveryTracker, formSignature, sendEmail, fetchWithTimeout, intakeErrorMessage } from './core/form-delivery.js';

/* Confirm the complete intake in the app before sending its email copy.
 * Attachments remain in the private application storage. */
(() => {
  document.querySelector("#consent-form-introduction")?.remove();
  document.querySelector(".skip-past-hero")?.remove();
  const form = document.querySelector("form[data-public-intake]");
  if (!form) return;
  const thankYouPath = () => (document.documentElement.lang || "pt-BR").toLowerCase().startsWith("en") ? "en/thank-you.html" : "obrigada.html";
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
  const trackDelivery = deliveryTracker();
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
        if (field.checked) draft[field.name] = [].concat(draft[field.name] || [], field.value);
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
          if (field.type === "checkbox" || field.type === "radio") field.checked = [].concat(value).includes(field.value);
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

  const english = (document.documentElement.lang || "").startsWith("en");
  const submitCard = form.querySelector(".sf-consent-card--submit");
  const primarySubmitButton = submitCard?.querySelector('button[type="submit"]');
  // These are deliberately two entry points to one delivery transaction, not
  // two independent submissions. Either choice saves to the app first and
  // then sends the FormSubmit copy, preventing one channel from cancelling
  // the other or creating duplicate patients.
  if (primarySubmitButton && !submitCard.querySelector("[data-delivery-trigger]")) {
    primarySubmitButton.dataset.deliveryTrigger = "system";
    primarySubmitButton.replaceChildren(
      document.createTextNode(english ? "Send to the system " : "Enviar para o sistema "),
      Object.assign(document.createElement("small"), { textContent: english ? "includes an email copy" : "inclui a cópia por e-mail" }),
    );
    const note = document.createElement("p");
    note.className = "sf-delivery-note";
    note.textContent = english
      ? "Both buttons use the same secure delivery: the form is saved in the system first, then an email copy is sent. Use either button once."
      : "Os dois botões fazem o mesmo envio seguro: primeiro salvam no sistema e, em seguida, enviam a cópia por e-mail. Use apenas um deles.";
    const actions = document.createElement("div");
    actions.className = "sf-delivery-actions";
    primarySubmitButton.before(note);
    primarySubmitButton.before(actions);
    actions.append(primarySubmitButton);
    const emailButton = document.createElement("button");
    emailButton.type = "submit";
    emailButton.className = "sf-button sf-button--outline";
    emailButton.dataset.deliveryTrigger = "email";
    emailButton.append(
      document.createTextNode(english ? "Send email copy " : "Enviar cópia por e-mail "),
      Object.assign(document.createElement("small"), { textContent: english ? "also saves in the system" : "também salva no sistema" }),
    );
    actions.append(emailButton);
  }
  const submitButtons = [...form.querySelectorAll('button[type="submit"]')];
  const setSubmitDisabled = (disabled) => submitButtons.forEach((button) => { button.disabled = disabled; });
  const state = (name, text, title) => {
    form.querySelectorAll("[data-form-state]").forEach((node) => { node.hidden = node.dataset.formState !== name; });
    const heading = form.querySelector(`[data-form-state="${name}"] strong`);
    if (heading) {
      heading.dataset.defaultText ||= heading.textContent;
      heading.textContent = title || heading.dataset.defaultText;
    }
    if (text) form.querySelector(`[data-form-state="${name}"]`)?.querySelector("span")?.replaceChildren(document.createTextNode(text));
  };
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !form.checkValidity()) { form.reportValidity(); return; }
    const cpfField = form.elements.cpf;
    if (String(cpfField?.value || '').replace(/\D/g, '').length !== 11) {
      state("error", intakeErrorMessage({ code: "cpf" }, (document.documentElement.lang || "").startsWith("en")));
      cpfField?.focus();
      return;
    }
    if (!selectedProcedures().length) {
      const firstProcedure = allProcedureInputs[0];
      firstProcedure?.setCustomValidity("Selecione pelo menos um procedimento.");
      firstProcedure?.reportValidity();
      firstProcedure?.setCustomValidity("");
      return;
    }
    submitting = true;
    setSubmitDisabled(true);
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
    body.set("payload", JSON.stringify(values));
    const files = [...form.querySelectorAll('input[type="file"]')].flatMap((input) => [...input.files].map((file) => ({ input, file })));
    if (files.length > 10 || files.some(({ file }) => file.size < 1 || file.size > 10 * 1024 * 1024) || files.reduce((sum, { file }) => sum + file.size, 0) > 50 * 1024 * 1024) {
      state("error", "Cada arquivo pode ter até 10 MB e o envio pode conter até 10 arquivos (50 MB no total).");
      submitting = false;
      setSubmitDisabled(false);
      return;
    }
    files.forEach(({ input, file }) => {
      body.append("attachments", file, file.name);
      body.append("attachment_field", input.name);
    });
    const deliver = trackDelivery(formSignature(form));
    try {
      let appResult = null;
      let appError = null;
      try {
        appResult = await deliver("app", async () => {
          body.set("payload", JSON.stringify({ ...values, email_already_sent: deliver.has("email") }));
          const response = await fetchWithTimeout(endpoint, {
            method: "POST",
            body,
            credentials: "omit",
            cache: "no-store"
          }, files.length ? 120000 : 45000);

          const responseText = await response.text();
          let responseData = null;

          try {
            responseData = responseText ? JSON.parse(responseText) : null;
          } catch {
            responseData = { raw: responseText };
          }

          if (!response.ok || responseData?.received !== true) {
            throw Object.assign(new Error("app_delivery_failed"), { code: responseData?.error || "request_failed" });
          }
          return responseData;
        });
      } catch (error) {
        appError = error;
      }
      if (appError) {
        state("error", intakeErrorMessage(appError, (document.documentElement.lang || "").startsWith("en")));
        submitting = false;
        setSubmitDisabled(false);
        return;
      }
      // The server normally sends the email after saving. If that email failed,
      // retry just the email copy after the app has confirmed receipt.
      // Never forward security tokens or file contents in the email payload.
      let emailError = null;
      try {
        await deliver("email", async () => {
          if (appResult?.email_status === "sent") return;
          const email = Object.fromEntries(Object.entries(values).filter(([key]) =>
            !key.startsWith("_") && !["token", "cf-turnstile-response", "website"].includes(key)
          ).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : value]));
          await sendEmail({ ...email,
            _subject: "Novo formulário recebido - Franciele Sofiati",
            _template: "table",
            pagina: window.location.href,
            arquivos: files.map(({ file }) => file.name).join(", "),
            armazenamento_app: "Salvo no aplicativo"
          });
        });
      } catch (error) {
        emailError = error;
      }
      if (emailError) {
        const english = (document.documentElement.lang || "").startsWith("en");
        state("error",
          english ? "Your complete form is saved in the app. The email copy is pending. Retry to send only the email copy." : "Seu formulário completo está salvo no aplicativo. A cópia por e-mail está pendente. Tente novamente para enviar apenas a cópia por e-mail.",
          english ? "Saved in the app" : "Salvo no aplicativo");
        submitting = false;
        setSubmitDisabled(false);
        return;
      }
      sessionStorage.removeItem(draftKey);
      form.reset();
      state("success");
      form.querySelector(".sf-consent-card--submit")?.scrollIntoView({ block: "start" });
      window.location.assign(new URL(thankYouPath(), window.location.origin).href);
    } catch (error) {
      console.error("FORMULARIO_CAUGHT_ERROR", error);
      state("error");
      submitting = false;
      setSubmitDisabled(false);
    }
  });
})();
