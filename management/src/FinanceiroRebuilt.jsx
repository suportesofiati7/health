import { Avatar, ProcedureImage } from "./Images";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Plus,
  Receipt,
  RotateCcw,
  Save,
  WalletCards,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  db,
  ORG,
  checked,
  date,
  formatDateInput,
  localDay,
  money,
  parseDateInput,
} from "./lib";
import { useT, label } from "./i18n";
import { openDocument, receiptDocumentHTML } from "./documentSystem";
import ContextActions from "./ContextActions";

const paymentMethods = [
  ["pix", "PIX", "PIX"],
  ["cartao_credito", "Cartão de crédito", "Credit card"],
  ["cartao_debito", "Cartão de débito", "Debit card"],
  ["dinheiro", "Dinheiro", "Cash"],
  ["transferencia", "Transferência", "Bank transfer"],
  ["boleto", "Boleto", "Boleto"],
  ["outro", "Outro", "Other"],
];
const paymentMethodLabel = (method, t) => {
  const row = paymentMethods.find(([key]) => key === method);
  return row ? t(row[1], row[2]) : method;
};
const cents = (value) =>
  Math.round(Number(String(value || "").replace(",", ".")) * 100);
const activePayments = (payments) =>
  payments.filter((p) => p.status === "recebido");
const receivedCents = (payments) =>
  activePayments(payments).reduce(
    (sum, p) => sum + Number(p.amount_cents || 0),
    0,
  );
const recordBalance = (record) =>
  Math.max(
    0,
    Number(record.total_cents || 0) - receivedCents(record.payments || []),
  );
const derivedStatus = (record) => {
  if (["cancelado", "corrigido"].includes(record.status)) return record.status;
  const received = receivedCents(record.payments || []);
  if (received >= Number(record.total_cents || 0)) return "pago";
  if (received > 0) return "parcial";
  if (record.due_on && record.due_on < localDay()) return "vencido";
  return "pendente";
};

function Field({
  label: title,
  value,
  onChange,
  type = "text",
  options,
  ...props
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dateField = type === "date" || type === "datetime-local";
  const dateTimeField = type === "datetime-local";
  const [dateText, setDateText] = useState(() =>
    dateField ? formatDateInput(value, dateTimeField) : "",
  );
  useEffect(() => {
    if (dateField) setDateText(formatDateInput(value, dateTimeField));
  }, [dateField, dateTimeField, value]);

  const password = type === "password";
  return (
    <label className="finance-field">
      <span>{title}</span>
      {options ? (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        >
          {options.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      ) : (
        <span
          className={
            password
              ? "field-input-wrap has-password-toggle"
              : "field-input-wrap"
          }
        >
          <input
            type={
              dateField ? "text" : password && passwordVisible ? "text" : type
            }
            inputMode={dateField ? "numeric" : undefined}
            placeholder={
              dateField
                ? dateTimeField
                  ? "dd/mm/aaaa hh:mm"
                  : "dd/mm/aaaa"
                : props.placeholder
            }
            value={dateField ? dateText : (value ?? "")}
            onChange={(e) => {
              if (!dateField) return onChange(e.target.value);
              const raw = e.target.value
                .replace(/[^\d/ :]/g, "")
                .slice(0, dateTimeField ? 16 : 10);
              setDateText(raw);
              const parsed = parseDateInput(raw, dateTimeField);
              if (parsed || raw === "") onChange(parsed);
            }}
            onBlur={() => {
              if (!dateField) return;
              const parsed = parseDateInput(dateText, dateTimeField);
              setDateText(parsed ? formatDateInput(parsed, dateTimeField) : "");
              onChange(parsed);
            }}
            {...props}
          />
          {password && (
            <button
              type="button"
              className="password-toggle"
              aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={passwordVisible}
              onClick={() => setPasswordVisible((visible) => !visible)}
            >
              {passwordVisible ? (
                <EyeOff size={17} aria-hidden="true" />
              ) : (
                <Eye size={17} aria-hidden="true" />
              )}
            </button>
          )}
        </span>
      )}
    </label>
  );
}

function Modal({ title, close, children }) {
  return (
    <div
      className="finance-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section
        className="finance-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <div>
            <p className="finance-kicker">Franciele Sofiati · Financeiro</p>
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="finance-icon-button"
            aria-label="Fechar"
            onClick={close}
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default function Financeiro({ notify, version }) {
  const t = useT();
  const [expanded, setExpanded] = useState(null),
    [showCharge, setShowCharge] = useState(false),
    [refund, setRefund] = useState(null),
    [refundReason, setRefundReason] = useState(""),
    [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    procedure_id: "",
    procedure_name: "",
    total: "",
    discount: "",
    package_name: "",
    installment_number: "",
    installment_total: "",
    due_on: localDay(),
    notes: "",
  });
  const [payment, setPayment] = useState({
    amount: "",
    paid_on: localDay(),
    method: "pix",
    notes: "",
  });
  useEffect(() => {
    if (refund) setRefundReason("");
  }, [refund]);
  const patients = useLoadFinance(
    () =>
      checked(
        db
          .from("patients")
          .select("id,full_name,preferred_name,cpf,avatar_path")
          .eq("status", "ativo")
          .order("full_name"),
      ),
    [],
  );
  const procedures = useLoadFinance(
    () =>
      checked(
        db
          .from("procedures")
          .select(
            "*",
          )
          .eq("active", true)
          .order("name"),
      ),
    [],
  );
  const state = useLoadFinance(async () => {
    const records = await checked(
      db
        .from("financial_records")
        .select("*,patients(id,full_name,preferred_name,cpf,avatar_path)")
        .order("created_at", { ascending: false }),
    );
    const payments = records.length
      ? await checked(
          db
            .from("financial_payments")
            .select("*")
            .in(
              "record_id",
              records.map((r) => r.id),
            )
            .order("paid_on", { ascending: false }),
        )
      : [];
    return records.map((r) => ({
      ...r,
      payments: payments.filter((p) => p.record_id === r.id),
    }));
  }, [version]);
  const records = state.data || [];
  const totals = useMemo(
    () =>
      records.reduce(
        (a, r) => {
          const status = derivedStatus(r),
            received = receivedCents(r.payments),
            balance = recordBalance(r);
          a.received += received;
          a.balance += ["cancelado", "corrigido"].includes(status)
            ? 0
            : balance;
          a.overdue += status === "vencido" ? balance : 0;
          return a;
        },
        { received: 0, balance: 0, overdue: 0 },
      ),
    [records],
  );
  if (state.loading)
    return (
      <main className="finance-workspace">
        <div className="finance-state" role="status">
          Carregando financeiro…
        </div>
      </main>
    );
  if (state.error)
    return (
      <main className="finance-workspace">
        <div className="finance-state finance-state-error" role="alert">
          <AlertCircle size={20} />
          <span>Não foi possível carregar os dados financeiros.</span>
          <button
            type="button"
            className="finance-secondary"
            onClick={state.refresh}
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  const setCharge = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const saveCharge = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const selectedProcedure = (procedures.data || []).find(
        (p) =>
          p.id === form.procedure_id ||
          p.name.toLowerCase() === form.procedure_name.trim().toLowerCase(),
      );
      const record = await checked(
        db
          .from("financial_records")
          .insert({
            organization_id: ORG,
            patient_id: form.patient_id,
            procedure_id: selectedProcedure?.id || null,
            procedure_name: form.procedure_name.trim(),
            procedure_snapshot: selectedProcedure
              ? { ...selectedProcedure, selected_at: new Date().toISOString() }
              : {},
            total_cents: cents(form.total),
            discount_cents: cents(form.discount),
            package_name: form.package_name.trim(),
            installment_number: form.installment_number
              ? Number(form.installment_number)
              : null,
            installment_total: form.installment_total
              ? Number(form.installment_total)
              : null,
            due_on: form.due_on || null,
            notes: form.notes,
            receipt_number: `FS-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          })
          .select()
          .single(),
      );
      setForm({
        patient_id: "",
        procedure_id: "",
        procedure_name: "",
        total: "",
        discount: "",
        package_name: "",
        installment_number: "",
        installment_total: "",
        due_on: localDay(),
        notes: "",
      });
      setShowCharge(false);
      state.refresh();
      notify(
        selectedProcedure
          ? t(
              "Cobrança criada a partir do catálogo.",
              "Charge created from the catalogue.",
            )
          : t(
              "Cobrança criada como serviço personalizado.",
              "Charge created as a custom service.",
            ),
      );
      return record;
    } catch {
      notify(
        t("Não foi possível criar a cobrança.", "Could not create the charge."),
      );
    } finally {
      setBusy(false);
    }
  };
  const addPayment = async (record) => {
    const amount = cents(payment.amount);
    const balance = recordBalance(record);
    if (amount <= 0)
      return notify(t("Informe um valor válido.", "Enter a valid amount."));
    if (amount > balance)
      return notify(
        t(
          "O pagamento não pode ser maior que o saldo atual.",
          "Payment cannot exceed the current balance.",
        ),
      );
    setBusy(true);
    try {
      await checked(
        db
          .from("financial_payments")
          .insert({
            organization_id: ORG,
            record_id: record.id,
            patient_id: record.patient_id,
            amount_cents: amount,
            paid_on: payment.paid_on,
            method: payment.method,
            notes: payment.notes,
          }),
      );
      setPayment({ amount: "", paid_on: localDay(), method: "pix", notes: "" });
      state.refresh();
      notify(
        t(
          "Pagamento registrado e saldo atualizado.",
          "Payment recorded and balance updated.",
        ),
      );
    } catch (error) {
      notify(
        error?.code === "finance_payment_over_total"
          ? t("O pagamento excede o saldo.", "Payment exceeds the balance.")
          : t(
              "Não foi possível registrar o pagamento.",
              "Could not record the payment.",
            ),
      );
    } finally {
      setBusy(false);
    }
  };
  const openReceipt = (record) => {
    try {
      const receipt = receiptDocumentHTML({
        record,
        patient: record.patients,
        payments: record.payments,
        paymentMethodLabel,
        money,
        date,
        t,
      });
      if (!openDocument(receipt)) throw Error("popup_blocked");
      notify(
        t(
          "Recibo aberto em uma nova aba. Use Imprimir / salvar PDF.",
          "Receipt opened in a new tab. Use Print / save PDF.",
        ),
      );
    } catch {
      notify(
        t(
          "Não foi possível abrir o recibo. Permita pop-ups para este site e tente novamente.",
          "Could not open the receipt. Allow pop-ups for this site and try again.",
        ),
      );
    }
  };
  const refundPayment = async (e) => {
    e.preventDefault();
    if (!refundReason.trim())
      return notify(
        t("Informe o motivo do estorno.", "Enter a refund reason."),
      );
    setBusy(true);
    try {
      await checked(
        db
          .from("financial_payments")
          .update({
            status: "estornado",
            refunded_on: localDay(),
            refund_reason: refundReason.trim(),
          })
          .eq("id", refund.id),
      );
      setRefund(null);
      setRefundReason("");
      state.refresh();
      notify(
        t(
          "Pagamento estornado e saldo recalculado.",
          "Payment refunded and balance recalculated.",
        ),
      );
    } catch {
      notify(
        t(
          "Não foi possível estornar o pagamento.",
          "Could not refund the payment.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="finance-workspace">
      <div className="finance-titlebar">
        <div>
          <p className="finance-kicker">
            {t(
              "Área exclusiva do proprietário · suportesofiati@gmail.com",
              "Owner-only area · suportesofiati@gmail.com",
            )}
          </p>
          <h1>{t("Financeiro", "Finance")}</h1>
          <p className="finance-intro">
            {t(
              "Cobranças, pagamentos e documentos fiscais em uma visão clara e auditável.",
              "Charges, payments and tax documents in a clear, auditable view.",
            )}
          </p>
        </div>
        <button
          type="button"
          className="finance-primary"
          onClick={() => setShowCharge(true)}
        >
          <Plus size={18} /> {t("Nova cobrança", "New charge")}
        </button>
      </div>
      <section
        className="finance-metrics"
        aria-label={t("Resumo financeiro", "Financial summary")}
      >
        <Metric
          icon={WalletCards}
          label={t("Total recebido", "Total received")}
          value={money(totals.received / 100)}
          tone="received"
        />
        <Metric
          label={t("Saldo em aberto", "Open balance")}
          value={money(totals.balance / 100)}
          tone="open"
        />
        <Metric
          label={t("Vencido", "Overdue")}
          value={money(totals.overdue / 100)}
          tone="overdue"
        />

      </section>
      <section className="finance-ledger">
        <div className="finance-section-heading">
          <div>
            <p className="finance-kicker">
              {t("Livro financeiro", "Financial ledger")}
            </p>
            <h2>{t("Cobranças", "Charges")}</h2>
          </div>
          <span title={t("Use os botões ou clique com o botão direito em um lançamento para ações rápidas.", "Use the buttons or right-click an entry for quick actions.")}>
            {records.length}{" "}
            {records.length === 1
              ? t("lançamento", "entry")
              : t("lançamentos", "entries")}
          </span>
        </div>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead>
              <tr>
                {[
                  "Paciente|Patient",
                  "Serviço|Service",
                  "Total|Total",
                  "Recebido|Received",
                  "Saldo|Balance",
                  "Vencimento|Due date",
                  "Status|Status",
                ].map((v) => {
                  const [pt, en] = v.split("|");
                  return <th key={v}>{t(pt, en)}</th>;
                })}
                <th />
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const status = derivedStatus(record),
                  open = expanded === record.id;
                return (
                  <tr key={record.id} className={open ? "is-expanded" : ""}>
                    <td>
                      <Avatar person={record.patients} className="finance-patient-thumb" size={40} />
                      <strong>
                        {record.patients?.preferred_name ||
                          record.patients?.full_name ||
                          t("Paciente", "Patient")}
                      </strong>
                      <small>
                        {record.patients?.cpf ||
                          t("CPF não informado", "CPF not provided")}
                      </small>
                    </td>
                    <td><ProcedureImage className="finance-service-thumb" procedure={(procedures.data || []).find((row) => row.id === record.procedure_id) || { ...record.procedure_snapshot, name: record.procedure_name }} />{record.procedure_name || "—"}</td>
                    <td>{money(record.total_cents / 100)}</td>
                    <td className="finance-received">
                      {money(receivedCents(record.payments) / 100)}
                    </td>
                    <td
                      className={
                        recordBalance(record)
                          ? "finance-balance"
                          : "finance-paid"
                      }
                    >
                      {money(recordBalance(record) / 100)}
                    </td>
                    <td>{record.due_on ? date(record.due_on) : "—"}</td>
                    <td>
                      <span
                        className={`finance-status finance-status-${status}`}
                      >
                        {label(status, t)}
                      </span>
                    </td>
                    <td>
                      <ContextActions
                        label={`${record.patients?.preferred_name || record.patients?.full_name || t("Paciente", "Patient")} · ${record.procedure_name || t("Cobrança", "Charge")}`}
                        actions={[
                          recordBalance(record) > 0 && { icon: WalletCards, label: t("Registrar pagamento", "Record payment"), onClick: () => setExpanded(record.id) },
                          { icon: Receipt, label: t("Abrir recibo / PDF", "Open receipt / PDF"), onClick: () => openReceipt(record) },
                        ]}
                        actionLabel={t("Ações rápidas", "Quick actions")}
                        showTrigger={false}
                      >
                        <div className="finance-row-actions">
                          {recordBalance(record) > 0 && <button type="button" className="finance-detail-button finance-quick-payment" onClick={() => setExpanded(record.id)}>{t("Registrar pagamento", "Record payment")}</button>}
                          <button type="button" className="finance-detail-button" onClick={() => setExpanded(open ? null : record.id)}>{open ? t("Fechar", "Close") : t("Detalhes", "Details")}</button>
                        </div>
                      </ContextActions>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!records.length && (
          <div className="finance-empty">
            <WalletCards size={30} />
            <h3>{t("Nenhuma cobrança registrada", "No charges recorded")}</h3>
            <p>
              {t(
                "Comece pelo primeiro lançamento financeiro.",
                "Start with the first financial entry.",
              )}
            </p>
          </div>
        )}
        {records.map(
          (record) =>
            expanded === record.id && (
              <ChargeDetails
                key={`details-${record.id}`}
                record={record}
                t={t}
                busy={busy}
                payment={payment}
                setPayment={setPayment}
                onPayment={() => addPayment(record)}
                onReceipt={() => openReceipt(record)}
                onRefund={setRefund}
              />
            ),
        )}
      </section>
      {showCharge && (
        <Modal
          title={t("Nova cobrança", "New charge")}
          close={() => !busy && setShowCharge(false)}
        >
          <form className="finance-form" onSubmit={saveCharge}>
            <Field
              label={t("Paciente", "Patient")}
              value={form.patient_id}
              onChange={(v) => setCharge("patient_id", v)}
              options={[
                ["", t("Selecionar paciente", "Select patient")],
                ...(patients.data || []).map((p) => [
                  p.id,
                  p.preferred_name || p.full_name,
                ]),
              ]}
              required
            />
            <Field
              label={t("Procedimento do catálogo", "Catalogue procedure")}
              value={form.procedure_id}
              onChange={(v) => {
                const procedure = (procedures.data || []).find((row) => row.id === v);
                setCharge("procedure_id", v);
                if (procedure) {
                  setCharge("procedure_name", procedure.name);
                  if (procedure.price_cents != null) setCharge("total", (Number(procedure.price_cents) / 100).toFixed(2));
                }
              }}
              options={[
                ["", t("Serviço personalizado", "Custom service")],
                ...(procedures.data || []).map((p) => [p.id, `${p.name}${p.price_cents == null ? "" : ` · R$ ${(Number(p.price_cents) / 100).toFixed(2).replace(".", ",")}`}`]),
              ]}
            />
            <Field
              label={t("Serviço / procedimento", "Service / treatment")}
              value={form.procedure_name}
              onChange={(v) => setCharge("procedure_name", v)}
              required
            />
            <Field
              label={t("Valor total (R$)", "Total amount (BRL)")}
              type="number"
              min="0.01"
              step="0.01"
              value={form.total}
              onChange={(v) => setCharge("total", v)}
              required
            />
            <Field
              label={t("Desconto (R$)", "Discount (BRL)")}
              type="number"
              min="0"
              step="0.01"
              value={form.discount}
              onChange={(v) => setCharge("discount", v)}
            />
            <Field
              label={t("Pacote / plano comercial", "Package / commercial plan")}
              value={form.package_name}
              onChange={(v) => setCharge("package_name", v)}
            />
            <Field
              label={t("Parcela nº", "Installment no.")}
              type="number"
              min="1"
              value={form.installment_number}
              onChange={(v) => setCharge("installment_number", v)}
            />
            <Field
              label={t("Total de parcelas", "Total installments")}
              type="number"
              min="1"
              value={form.installment_total}
              onChange={(v) => setCharge("installment_total", v)}
            />
            <Field
              label={t("Vencimento", "Due date")}
              type="date"
              value={form.due_on}
              onChange={(v) => setCharge("due_on", v)}
            />
            <label className="finance-field">
              <span>{t("Observações", "Notes")}</span>
              <textarea
                value={form.notes}
                onChange={(e) => setCharge("notes", e.target.value)}
                rows="4"
              />
            </label>
            <div className="finance-modal-actions">
              <button
                type="button"
                className="finance-secondary"
                onClick={() => setShowCharge(false)}
              >
                {t("Cancelar", "Cancel")}
              </button>
              <button className="finance-primary" disabled={busy}>
                <Save size={17} />{" "}
                {busy
                  ? t("Salvando…", "Saving…")
                  : t("Salvar cobrança", "Save charge")}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {refund && (
        <Modal
          title={t(
            "Corrigir / reembolsar pagamento",
            "Correct / refund payment",
          )}
          close={() => !busy && setRefund(null)}
        >
          <form className="finance-form" onSubmit={refundPayment}>
            <div className="finance-refund-warning">
              <AlertCircle size={18} />
              <span>
                {t(
                  "O pagamento será preservado no histórico e marcado como estornado. O saldo será recalculado automaticamente.",
                  "The payment will remain in history and be marked as refunded. The balance will be recalculated automatically.",
                )}
              </span>
            </div>
            <p>
              <strong>{money(refund.amount_cents / 100)}</strong> ·{" "}
              {date(refund.paid_on)}
            </p>
            <Field
              label={t("Motivo", "Reason")}
              value={refundReason}
              onChange={setRefundReason}
              name="reason"
              required
            />
            <div className="finance-modal-actions">
              <button
                type="button"
                className="finance-secondary"
                onClick={() => setRefund(null)}
              >
                {t("Cancelar", "Cancel")}
              </button>
              <button className="finance-primary" disabled={busy}>
                <RotateCcw size={17} />{" "}
                {t("Confirmar estorno", "Confirm refund")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}

function Metric({ icon: Icon, label: title, value, tone }) {
  return (
    <div className={`finance-metric finance-metric-${tone}`}>
      {Icon && <Icon size={19} />}
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
function ChargeDetails({
  record,
  t,
  busy,
  payment,
  setPayment,
  onPayment,
  onReceipt,
  onRefund,
}) {
  const active = activePayments(record.payments);
  return (
    <div className="finance-charge-details">
      <div className="finance-detail-heading">
        <div>
          <p className="finance-kicker">
            {t("Detalhes do lançamento", "Entry details")}
          </p>
          <h3>{record.procedure_name || t("Serviço", "Service")}</h3>
        </div>
        <div className="finance-detail-total">
          <span>{t("Saldo atual", "Current balance")}</span>
          <strong>{money(recordBalance(record) / 100)}</strong>
        </div>
      </div>
      <div className="finance-detail-grid">
        <div>
          <span>{t("Total", "Total")}</span>
          <strong>{money(record.total_cents / 100)}</strong>
        </div>
        <div>
          <span>{t("Recebido", "Received")}</span>
          <strong>{money(receivedCents(record.payments) / 100)}</strong>
        </div>
        <div>
          <span>{t("Pagamentos ativos", "Active payments")}</span>
          <strong>{active.length}</strong>
        </div>
        <div>
          <span>{t("Desconto", "Discount")}</span>
          <strong>{money(Number(record.discount_cents || 0) / 100)}</strong>
        </div>
        <div>
          <span>{t("Pacote / parcela", "Package / installment")}</span>
          <strong>{record.package_name || (record.installment_total ? `${record.installment_number || 1}/${record.installment_total}` : "—")}</strong>
        </div>
      </div>
      <div className="finance-detail-actions">
        <button type="button" className="finance-primary" onClick={onReceipt}>
          <Receipt size={17} />{" "}
          {t("Gerar recibo / PDF", "Generate receipt / PDF")}
        </button>
        <button
          type="button"
          className="finance-secondary"
          onClick={() => onRefund(active[0])}
          disabled={!active.length}
        >
          <RotateCcw size={17} />{" "}
          {t("Corrigir / Reembolsar", "Correct / Refund")}
        </button>
      </div>
      <div className="finance-payment-box">
        <h4>{t("Registrar pagamento", "Record payment")}</h4>
        <div className="finance-payment-form">
          <Field
            label={t("Valor recebido (R$)", "Amount received (BRL)")}
            type="number"
            min="0.01"
            step="0.01"
            value={payment.amount}
            onChange={(v) => setPayment({ ...payment, amount: v })}
          />
          <Field
            label={t("Data", "Date")}
            type="date"
            value={payment.paid_on}
            onChange={(v) => setPayment({ ...payment, paid_on: v })}
          />
          <Field
            label={t("Forma", "Method")}
            value={payment.method}
            onChange={(v) => setPayment({ ...payment, method: v })}
            options={paymentMethods.map(([key, pt, en]) => [key, t(pt, en)])}
          />
          <button
            type="button"
            className="finance-primary"
            disabled={busy || recordBalance(record) <= 0}
            onClick={onPayment}
          >
            <Check size={17} /> {t("Registrar pagamento", "Record payment")}
          </button>
        </div>
      </div>
      <div className="finance-history">
        <h4>{t("Histórico de pagamentos", "Payment history")}</h4>
        {record.payments.length ? (
          record.payments.map((p) => (
            <div
              className={`finance-history-row finance-payment-${p.status}`}
              key={p.id}
            >
              <span>
                {date(p.paid_on)} · {paymentMethodLabel(p.method, t)}
                <small>
                  {p.status === "estornado"
                    ? `${t("Estornado", "Refunded")}${p.refund_reason ? ` · ${p.refund_reason}` : ""}`
                    : p.notes || t("Recebido", "Received")}
                </small>
              </span>
              <strong>{money(p.amount_cents / 100)}</strong>
            </div>
          ))
        ) : (
          <p className="finance-muted">
            {t("Nenhum pagamento registrado.", "No payments recorded.")}
          </p>
        )}
      </div>
    </div>
  );
}

function useLoadFinance(loader, deps) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: false,
  });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: false }));
    Promise.resolve(loader())
      .then((data) => alive && setState({ data, loading: false, error: false }))
      .catch(
        () => alive && setState({ data: null, loading: false, error: true }),
      );
    return () => {
      alive = false;
    };
  }, [...deps, tick]);
  return { ...state, refresh: () => setTick((n) => n + 1) };
}
