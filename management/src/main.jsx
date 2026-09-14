import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Home,
  Users,
  CalendarDays,
  ClipboardList,
  Inbox,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Save,
  Paperclip,
  Download,
  Mail,
  MessageCircle,
  FileText,
  ShieldCheck,
  Clock,
  AlertCircle,
  Menu,
  Eye,
  LockKeyhole,
  RefreshCw,
  Printer,
  UserRound,
  Send,
  History,
  Link as LinkIcon,
} from "lucide-react";
import {
  db,
  ORG,
  checked,
  save,
  invoke,
  date,
  localDay,
  localDateTime,
  toISO,
  money,
  age,
  validCPF,
  validCNS,
  digits,
  whatsapp,
  safeSearch,
  allRows,
} from "./lib";
import { encryptPackets, decryptPackets, fileBase64, download } from "./crypto";
import { Language, useT, label } from "./i18n";
import "./style.css";

const LOGO = "/brand.png";
function Button({ icon: Icon, children, className = "", ...props }) {
  return (
    <button className={className} {...props}>
      {Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </button>
  );
}
function Status({ value }) {
  const t = useT();
  return <span className={`status status-${value}`}>{label(value, t)}</span>;
}
function Empty({ icon: Icon = ClipboardList, children }) {
  return (
    <div className="empty">
      <Icon size={28} />
      <p>{children}</p>
    </div>
  );
}
function Field({
  name,
  title,
  type = "text",
  value,
  onChange,
  options,
  wide,
  ...props
}) {
  return (
    <label className={wide ? "field wide" : "field"}>
      <span>{title}</span>
      {options ? (
        <select
          name={name}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          {...props}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      )}
    </label>
  );
}
function Dialog({ title, close, children, wide = false }) {
  const ref = useRef(),
    t = useT();
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "dialog-wide" : ""}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <header className="dialog-head">
        <h2>{title}</h2>
        <Button
          icon={X}
          className="icon"
          aria-label={t("Fechar", "Close")}
          title={t("Fechar", "Close")}
          onClick={close}
        />
      </header>
      {children}
    </dialog>
  );
}
function useLoad(loader, deps) {
  const [state, set] = useState({ data: null, loading: true, error: false });
  const [tick, update] = useState(0);
  useEffect(() => {
    let live = true;
    set({ data: null, loading: true, error: false });
    loader()
      .then((data) => {
        if (live) set({ data, loading: false, error: false });
      })
      .catch(() => {
        if (live) set({ data: null, loading: false, error: true });
      });
    return () => {
      live = false;
    };
  }, [...deps, tick]);
  return { ...state, refresh: () => update((n) => n + 1) };
}
function LoadState({ state, children }) {
  const t = useT();
  if (state.loading)
    return (
      <p className="loading" role="status">
        {t("Carregando...", "Loading...")}
      </p>
    );
  if (state.error)
    return (
      <div className="notice error" role="alerta">
        {t("Não foi possível carregar.", "Could not load.")}{" "}
        <Button icon={RefreshCw} onClick={state.refresh}>
          {t("Tentar novamente", "Retry")}
        </Button>
      </div>
    );
  return children(state.data);
}
function useDirty() {
  const [dirty, setDirty] = useState(false),
    t = useT();
  useEffect(() => {
    const stop = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", stop);
    return () => window.removeEventListener("beforeunload", stop);
  }, [dirty]);
  return {
    dirty,
    touch: () => setDirty(true),
    clean: () => setDirty(false),
    canClose: () =>
      !dirty ||
      confirm(
        t("Descartar alterações não salvas?", "Discard unsaved changes?"),
      ),
  };
}
function App() {
  const [lang, setLang] = useState(
    localStorage.getItem("sofiati-language") || "pt",
  );
  return (
    <Language.Provider value={lang}>
      <Clinic
        language={lang}
        setLanguage={(value) => {
          localStorage.setItem("sofiati-language", value);
          setLang(value);
        }}
      />
    </Language.Provider>
  );
}
function PublicIntakeRoute({ languageControl }) {
  return (
    <div className="public-intake-route">
      <header className="public-intake-route-head">
        <img src={LOGO} alt="Franciele Sofiati" />
        <span>Formulário público</span>
        {languageControl}
      </header>
      <main>
        <h1>Formulário de cadastro e consentimentos</h1>
        <p>O formulário oficial está no site Franciele Sofiati. Esta rota é pública e não abre nenhuma área da clínica.</p>
        <a className="button primary" href="https://francielesofiati.com/formulario">Abrir formulário</a>
      </main>
    </div>
  );
}
function Clinic({ language, setLanguage }) {
  const t = useT();
  const [member, setMember] = useState(null),
    [checking, setChecking] = useState(true),
    [activation, setActivation] = useState(false);
  const [view, setView] = useState("home"),
    [patient, setPatient] = useState(null),
    [modal, setModal] = useState(null),
    [version, setVersion] = useState(0),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false);
  const notify = (text) => setToast(text);
  const loadMember = async () => {
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) {
      setMember(null);
      return;
    }
    const { data } = await db
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("organization_id", ORG)
      .single();
    setMember(data || null);
    if (!data)
      notify(
        t(
          "Acesso não autorizado ou conta inativa.",
          "Access not authorized or account inactive.",
        ),
      );
  };
  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  }, [language]);
  useEffect(() => {
    const start = async () => {
      const fragment = new URLSearchParams(location.hash.slice(1));
      if (fragment.has("token_hash")) {
        history.replaceState(null, "", location.pathname);
        const type = fragment.get("type");
        if (!["invite", "recovery"].includes(type)) throw Error("token");
        const { error } = await db.auth.verifyOtp({
          token_hash: fragment.get("token_hash"),
          type,
        });
        if (error) throw error;
        setActivation(true);
      } else if (fragment.has("access_token") && fragment.has("refresh_token")) {
        history.replaceState(null, "", location.pathname);
        if (!["invite", "recovery"].includes(fragment.get("type"))) throw Error("token");
        const { error } = await db.auth.setSession({
          access_token: fragment.get("access_token"),
          refresh_token: fragment.get("refresh_token"),
        });
        if (error) throw error;
        setActivation(true);
      } else await loadMember();
    };
    start()
      .catch(() =>
        notify(
          t(
            "Link inválido ou expirado. Solicite um novo acesso.",
            "Invalid or expired link. Request a new link.",
          ),
        ),
      )
      .finally(() => setChecking(false));
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setMember(null);
        setPatient(null);
        setModal(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const logout = useCallback(async () => {
    setMember(null);
    setPatient(null);
    setModal(null);
    setView("home");
    await db.rpc("revoke_current_session");
    await db.auth.signOut({ scope: "local" });
    sessionStorage.removeItem("sofiati-auth");
  }, []);
  useEffect(() => {
    if (!member) return;
    let last = Date.now();
    const active = () => {
      last = Date.now();
    };
    const check = setInterval(async () => {
      if (Date.now() - last > 15 * 60 * 1000) {
        await logout();
        return;
      }
      const { data, error } = await db
        .from("memberships")
        .select("status,role")
        .eq("id", member.id)
        .single();
      if (
        error ||
        !data ||
        data.status !== "ativo" ||
        data.role !== member.role
      )
        await logout();
    }, 30000);
    window.addEventListener("pointerdown", active);
    window.addEventListener("keydown", active);
    return () => {
      clearInterval(check);
      window.removeEventListener("pointerdown", active);
      window.removeEventListener("keydown", active);
    };
  }, [member?.id, logout]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 6500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  const languageControl = (
    <div className="languages" aria-label={t("Idioma", "Language")}>
      {["pt", "en"].map((l) => (
        <button
          key={l}
          aria-pressed={language === l}
          onClick={() => setLanguage(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
  const refreshed = () => {
    setVersion((n) => n + 1);
    setModal(null);
    notify(t("Salvo", "Saved"));
  };
  const openPatient = (p) => {
    setPatient(p);
    setView("patient");
  };
  const navigate = (v) => {
    setView(v);
    setPatient(null);
    setMenu(false);
  };
  const clinical = ["proprietario", "profissional"].includes(member?.role),
    writable = member?.role !== "leitura";
  const nav = [
    ["home", Home, t("Início", "Today")],
    ["agenda", CalendarDays, t("Agenda", "Schedule")],
    ["patients", Users, t("Pacientes", "Patients")],
    ["enquiries", Inbox, t("Pré-cadastros", "Enquiries")],
    ["tasks", ClipboardList, t("Tarefas", "Tasks")],
    ["reports", BarChart3, t("Relatórios", "Reports")],
    ["settings", Settings, t("Configurações", "Settings")],
  ];
  const common = {
    member,
    openPatient,
    setModal,
    notify,
    version,
    clinical,
    writable,
  };
  if (["/formulario", "/formulario.html", "/management/formulario", "/pre-cadastro", "/pre-cadastro.html"].includes(location.pathname))
    return <PublicIntakeRoute languageControl={languageControl} />;
  return (
    <>
      {checking ? (
        <div className="auth-screen">
          <p role="status">
            {t("Verificando acesso...", "Checking access...")}
          </p>
        </div>
      ) : !member || activation ? (
        <Auth
          activation={activation}
          languageControl={languageControl}
          notify={notify}
          onLogin={async () => {
            setActivation(false);
            await loadMember();
          }}
        />
      ) : (
        <div className="app-shell">
          <a className="skip" href="#main">
            {t("Ir ao conteúdo", "Skip to content")}
          </a>
          <aside className={menu ? "sidebar open" : "sidebar"}>
            <a
              className="brand"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("home");
              }}
            >
              <img src={LOGO} alt="Franciele Sofiati" />
              <span>
                Franciele Sofiati
                <small>{t("Área Profissional", "Professional Area")}</small>
              </span>
            </a>
            <nav aria-label={t("Navegação principal", "Main navigation")}>
              {nav.map(([key, Icon, title]) => (
                <button
                  key={key}
                  className={
                    view === key || (view === "patient" && key === "patients")
                      ? "selected"
                      : ""
                  }
                  onClick={() => navigate(key)}
                >
                  <Icon size={19} />
                  <span>{title}</span>
                  {key === "patients" && <ChevronRight size={15} />}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <ShieldCheck size={18} />
              <span>{t("Ambiente restrito", "Restricted workspace")}</span>
            </div>
          </aside>
          <div className="workspace">
            <header className="topbar">
              <Button
                icon={Menu}
                className="icon mobile-menu"
                aria-label={t("Menu", "Menu")}
                onClick={() => setMenu(!menu)}
              />
              <span className="breadcrumb">
                {t("Clínica", "Clinic")} <ChevronRight size={13} />{" "}
                {view === "patient"
                  ? t("Prontuário", "Patient record")
                  : nav.find((n) => n[0] === view)?.[2]}
              </span>
              <div className="topbar-right">
                {languageControl}
                <span className="user-avatar">
                  {member.name?.slice(0, 1) || "F"}
                </span>
                <span className="user-name">
                  {member.name || member.email}
                  <small>{label(member.role, t)}</small>
                </span>
                <Button
                  icon={LogOut}
                  className="icon"
                  title={t("Sair", "Sign out")}
                  aria-label={t("Sair", "Sign out")}
                  onClick={logout}
                />
              </div>
            </header>
            <main id="main" tabIndex={-1}>
              {view === "home" && <HomeView {...common} />}
              {view === "patients" && <Patients {...common} />}
              {view === "patient" && patient && (
                <Patient
                  key={patient.id + ":" + version}
                  patient={patient}
                  {...common}
                />
              )}
              {view === "agenda" && <Agenda {...common} />}
              {view === "tasks" && <Tasks {...common} />}
              {view === "enquiries" && <Enquiries {...common} />}
              {view === "reports" && <Reports {...common} />}
              {view === "settings" && <SettingsView {...common} />}
            </main>
            <footer className="app-footer">
              <span>Franciele Sofiati</span>
              <span>{t("Londrina, PR", "Londrina, PR")}</span>
            </footer>
          </div>
        </div>
      )}
      {member && modal?.type === "patient" && (
        <PatientForm
          patient={modal.patient}
          close={() => setModal(null)}
          done={refreshed}
          notify={notify}
        />
      )}
      {member && modal?.type === "entry" && (
        <EntryForm
          {...modal}
          member={member}
          close={() => setModal(null)}
          done={refreshed}
          notify={notify}
        />
      )}
      {member && modal?.type === "appointment" && (
        <AppointmentForm
          {...modal}
          close={() => setModal(null)}
          done={refreshed}
          notify={notify}
        />
      )}
      {member && modal?.type === "task" && (
        <TaskForm
          {...modal}
          close={() => setModal(null)}
          done={refreshed}
          notify={notify}
        />
      )}
      {member && modal?.type === "documento" && (
        <DocumentForm
          {...modal}
          close={() => setModal(null)}
          done={refreshed}
          notify={notify}
        />
      )}
      {member && modal?.type === "workflow" && (
        <WorkflowForm
          {...modal}
          member={member}
          close={() => setModal(null)}
          done={refreshed}
          notify={notify}
        />
      )}
      {member && modal?.type === "enquiry" && (
        <EnquiryQuickView enquiry={modal.enquiry} close={() => setModal(null)} />
      )}
      {member && modal?.type === "export" && (
        <ExportDialog {...modal} close={() => setModal(null)} notify={notify} />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
function Auth({ activation, onLogin, languageControl, notify }) {
  const t = useT(),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirmPassword, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [recovery, setRecovery] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (activation) {
        if (password.length < 12 || password !== confirmPassword) {
          notify(
            t(
              "Use ao menos 12 caracteres e confirme a senha.",
              "Use at least 12 characters and confirm the password.",
            ),
          );
          return;
        }
        await checked(db.auth.updateUser({ password }));
        await invoke("staff", { action: "activate" });
        await onLogin();
      } else if (recovery) {
        await db.auth.resetPasswordForEmail(email, {
          redirectTo: location.origin,
        });
        notify(
          t(
            "Solicitação recebida. Verifique seu email ou peça um link ao proprietário.",
            "Request received. Check your email or ask the owner for a link.",
          ),
        );
      } else {
        await checked(db.auth.signInWithPassword({ email, password }));
        await onLogin();
      }
    } catch {
      notify(
        t(
          "Não foi possível entrar. Verifique os dados ou solicite um novo link.",
          "Could not sign in. Check your details or request a new link.",
        ),
      );
    } finally {
      setBusy(false);
      setPassword("");
      setConfirm("");
    }
  };
  return (
    <div className="auth-screen">
      <header className="auth-top">
        <a href="https://francielesofiati.com">Franciele Sofiati</a>
        {languageControl}
      </header>
      <main className="auth-main">
        <img className="auth-logo" src={LOGO} alt="Franciele Sofiati" />
        <p className="eyebrow">{t("Área Profissional", "Professional Area")}</p>
        <h1>
          {activation
            ? t("Defina sua senha", "Set your password")
            : recovery
              ? t("Recuperar acesso", "Recover access")
              : t("Bem-vinda de volta", "Welcome back")}
        </h1>
        <form onSubmit={submit}>
          {!activation && (
            <Field
              name="email"
              title="Email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={setEmail}
            />
          )}
          {!recovery && (
            <Field
              name="password"
              title={t("Senha", "Password")}
              type="password"
              autoComplete={activation ? "new-password" : "current-password"}
              required
              minLength={activation ? 12 : undefined}
              value={password}
              onChange={setPassword}
            />
          )}
          {activation && (
            <Field
              title={t("Confirmar senha", "Confirm password")}
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={setConfirm}
            />
          )}
          <Button
            icon={activation ? LockKeyhole : ArrowRight}
            className="primary full"
            disabled={busy}
          >
            {busy
              ? t("Aguarde...", "Please wait...")
              : activation
                ? t("Salvar senha e entrar", "Save password and sign in")
                : recovery
                  ? t("Recuperar acesso", "Recover access")
                  : t("Entrar", "Sign in")}
          </Button>
          {!activation && (
            <button
              className="text-button"
              type="button"
              onClick={() => setRecovery(!recovery)}
            >
              {recovery
                ? t("Voltar ao login", "Back to sign in")
                : t("Esqueci minha senha", "Forgot password")}
            </button>
          )}
        </form>
        <div className="auth-security">
          <LockKeyhole size={15} />
          {t(
            "Acesso exclusivo para pessoas autorizadas",
            "Authorized staff only",
          )}
        </div>
      </main>
      <footer className="auth-footer">Franciele Sofiati · Londrina, PR</footer>
    </div>
  );
}
function PageHead({ eyebrow, title, children }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      <div className="actions">{children}</div>
    </div>
  );
}
function HomeView({
  member,
  openPatient,
  setModal,
  version,
  writable,
  clinical,
}) {
  const t = useT(),
    today = localDay();
  const state = useLoad(async () => {
    const [appointments, tasks, patients, enquiries, followups, adverseEvents] = await Promise.all([
      checked(
        db
          .from("appointments")
          .select("*,patients(*)")
          .gte("starts_at", today + "T00:00:00-03:00")
          .lte("starts_at", today + "T23:59:59-03:00")
          .order("starts_at")
          .limit(30),
      ),
      checked(
        db
          .from("tasks")
          .select("*,patients(*)")
          .eq("status", "pendente")
          .lte("due_at", today + "T23:59:59-03:00")
          .order("due_at")
          .limit(15),
      ),
      checked(
        db
          .from("patients")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ),
      checked(db.from("public_intakes").select("id,full_name,status,created_at").in("status", ["novo", "em_analise"]).order("created_at", { ascending: false }).limit(10)),
      checked(db.from("follow_ups").select("id,patient_id,expected_on,status,patients(full_name)").in("status", ["aguardando_agendamento", "vencido"]).limit(10)).catch(() => []),
      clinical ? checked(db.from("adverse_events").select("id,patient_id,description,status,patients(full_name)").eq("status", "em_acompanhamento").limit(10)).catch(() => []) : [],
    ]);
    return { appointments, tasks, patients, enquiries, followups, adverseEvents };
  }, [version]);
  return (
    <>
      <PageHead
        eyebrow={new Intl.DateTimeFormat(t("pt-BR", "en-GB"), {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: "America/Sao_Paulo",
        }).format(new Date())}
        title={t("Seu dia, com clareza.", "Your day, at a glance.")}
      >
        {writable && (
          <>
            <Button
              icon={CalendarDays}
              onClick={() => setModal({ type: "appointment" })}
            >
              {t("Agendar", "Schedule")}
            </Button>
            <Button
              icon={Plus}
              className="primary"
              onClick={() => setModal({ type: "patient" })}
            >
              {t("Novo paciente", "New patient")}
            </Button>
          </>
        )}
      </PageHead>
      <LoadState state={state}>
        {({ appointments, tasks, patients, enquiries, followups, adverseEvents }) => (
          <>
            <div className="today-strip">
              <div>
                <CalendarDays size={22} />
                <span>
                  <strong>
                    {
                      appointments.filter(
                        (a) => !["cancelado", "reagendado"].includes(a.status),
                      ).length
                    }
                  </strong>
                  {t("agendamentos hoje", "appointments today")}
                </span>
              </div>
              <div>
                <Inbox size={22} />
                <span><strong>{enquiries.length + followups.length + adverseEvents.length}</strong>{t("itens de atenção", "attention items")}</span>
              </div>
              <div>
                <Clock size={22} />
                <span>
                  <strong>
                    {tasks.length}
                    {tasks.length === 15 ? "+" : ""}
                  </strong>
                  {t("tarefas para acompanhar", "tasks to follow up")}
                </span>
              </div>
              <div className="today-person">
                <span>{t("Bom trabalho,", "Welcome,")}</span>
                <strong>{member.name.split(" ")[0] || "Franciele"}</strong>
              </div>
            </div>
            <div className="dashboard-grid">
              <section>
                <div className="section-heading">
                  <h2>{t("Agenda de hoje", "Today’s appointments")}</h2>
                  <span className="subtle">{date(today)}</span>
                </div>
                {appointments.length ? (
                  <div className="rows">
                    {appointments.map((a) => (
                      <AppointmentRow
                        key={a.id}
                        appointment={a}
                        openPatient={openPatient}
                        setModal={setModal}
                        clinical={clinical}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty icon={CalendarDays}>
                    {t("Nenhum agendamento para hoje", "No appointments today")}
                  </Empty>
                )}
              </section>
              <section className="followup">
                <div className="section-heading">
                  <h2>{t("Precisa de atenção", "Needs attention")}</h2>
                  <Clock size={18} />
                </div>
                {tasks.length ? (
                  tasks.map((task) => (
                    <button
                      className="task-row"
                      key={task.id}
                      onClick={() =>
                        task.patients
                          ? openPatient(task.patients)
                          : setModal({ type: "task", task })
                      }
                    >
                      <span className="task-mark" />
                      <span>
                        <strong>
                          {task.title || t("Retorno", "Follow-up")}
                        </strong>
                        <small>
                          {task.patients?.full_name || t("Clínica", "Clinic")}
                        </small>
                        <small
                          className={
                            new Date(task.due_at) < new Date() ? "overdue" : ""
                          }
                        >
                          {date(task.due_at, true)}
                        </small>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  ))
                ) : (
                  <Empty icon={Check}>
                    {t("Tudo em dia", "All caught up")}
                  </Empty>
                )}
              </section>
            </div>
            <section className="recent">
              <div className="section-heading">
                <h2>{t("Pacientes recentes", "Recent patients")}</h2>
                <Users size={18} />
              </div>
              <div className="recent-grid">
                {patients.map((p) => (
                  <button
                    className="patient-card"
                    key={p.id}
                    onClick={() => openPatient(p)}
                  >
                    <span className="avatar">{initials(p.full_name)}</span>
                    <span>
                      <strong>
                        {p.full_name ||
                          t("Paciente sem nome", "Unnamed patient")}
                      </strong>
                      <small>
                        {p.phone || p.email || t("Sem contato", "No contact")}
                      </small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
              {!patients.length && (
                <Empty icon={Users}>
                  {t(
                    "Seu próximo cuidado começa com um paciente",
                    "Your next care journey starts with a patient",
                  )}
                </Empty>
              )}
            </section>
            <section className="recent attention-queue">
              <div className="section-heading"><h2>{t("Fila de atenção", "Attention queue")}</h2><AlertCircle size={18} /></div>
              {[...enquiries.map((item) => ({ id: `e-${item.id}`, title: t("Novo pré-cadastro", "New enquiry"), content: item.full_name, action: () => setModal({ type: "enquiry", enquiry: item }) })), ...followups.map((item) => ({ id: `f-${item.id}`, title: t("Retorno pendente", "Pending follow-up"), content: item.patients?.full_name || t("Paciente", "Patient"), action: () => openPatient(item.patients) })), ...adverseEvents.map((item) => ({ id: `a-${item.id}`, title: t("Intercorrência aberta", "Open adverse event"), content: item.patients?.full_name || item.description, action: () => openPatient(item.patients) }))].slice(0, 8).map((item) => <button className="task-row" key={item.id} onClick={item.action}><span className="task-mark" /><span><strong>{item.title}</strong><small>{item.content}</small></span><ChevronRight size={16} /></button>)}
              {!enquiries.length && !followups.length && !adverseEvents.length && <Empty icon={Check}>{t("Nenhuma pendência crítica", "No critical pending items")}</Empty>}
            </section>
          </>
        )}
      </LoadState>
    </>
  );
}
const initials = (name) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "P";
function Pager({ page, count, setPage }) {
  const t = useT();
  return (
    <div className="pager">
      <span>
        {t("Página", "Page")} {page + 1}
      </span>
      <Button
        icon={ChevronLeft}
        className="icon"
        aria-label={t("Anterior", "Previous")}
        disabled={!page}
        onClick={() => setPage(page - 1)}
      />
      <Button
        icon={ChevronRight}
        className="icon"
        aria-label={t("Próxima", "Next")}
        disabled={count < 20}
        onClick={() => setPage(page + 1)}
      />
    </div>
  );
}
function Patients({ openPatient, setModal, version, writable }) {
  const t = useT(),
    [search, setSearch] = useState(""),
    [term, setTerm] = useState(""),
    [page, setPage] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => {
      setTerm(safeSearch(search));
      setPage(0);
    }, 250);
    return () => clearTimeout(id);
  }, [search]);
  const state = useLoad(async () => {
    let q = db
      .from("patients")
      .select("*")
      .order("full_name")
      .range(page * 20, page * 20 + 19);
    if (term)
      q = q.or(
        `full_name.ilike.%${term}%,cpf.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`,
      );
    return checked(q);
  }, [term, page, version]);
  return (
    <>
      <PageHead
        eyebrow={t("Cuidado contínuo", "Continuity of care")}
        title={t("Pacientes", "Patients")}
      >
        {writable && (
          <Button
            icon={Plus}
            className="primary"
            onClick={() => setModal({ type: "patient" })}
          >
            {t("Novo paciente", "New patient")}
          </Button>
        )}
      </PageHead>
      <div className="toolbar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label={t("Buscar pacientes", "Search patients")}
            placeholder={t(
              "Nome, CPF, telefone ou email",
              "Name, CPF, phone or email",
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <LoadState state={state}>
        {(patients) => (
          <>
            <div className="patient-list">
              {patients.map((p) => (
                <button
                  key={p.id}
                  className="patient-row"
                  onClick={() => openPatient(p)}
                >
                  <span className="avatar">{initials(p.full_name)}</span>
                  <span className="patient-identity">
                    <strong>
                      {p.full_name || t("Paciente sem nome", "Unnamed patient")}
                    </strong>
                    <small>
                      {p.preferred_name ||
                        (p.birth_date
                          ? `${age(p.birth_date)} ${t("anos", "years")}`
                          : t("Sem data de nascimento", "No date of birth"))}
                    </small>
                  </span>
                  <span className="patient-contact">
                    {p.phone}
                    <small>{p.email}</small>
                  </span>
                  <Status value={p.status} />
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
            {!patients.length && (
              <Empty icon={Search}>
                {t("Nenhum paciente encontrado", "No patients found")}
              </Empty>
            )}
            <Pager page={page} count={patients.length} setPage={setPage} />
          </>
        )}
      </LoadState>
    </>
  );
}
const patientFields = [
  ["full_name", "Nome completo", "Full name"],
  ["preferred_name", "Nome social / preferido", "Preferred name"],
  ["birth_date", "Data de nascimento", "Date of birth", "date"],
  ["cpf", "CPF", "CPF"],
  ["rg", "RG", "RG"],
  ["cns", "CNS", "CNS"],
  ["phone", "Telefone / WhatsApp", "Phone / WhatsApp", "tel"],
  ["email", "Email", "Email", "email"],
  ["occupation", "Ocupação", "Occupation"],
  ["insurance", "Convênio", "Insurance"],
];
function PatientForm({ patient, close, done, notify }) {
  const t = useT(),
    [form, setForm] = useState(patient || {}),
    [busy, setBusy] = useState(false),
    [duplicates, setDuplicates] = useState([]),
    dirty = useDirty();
  const change = (key, value) => {
    dirty.touch();
    setForm((f) => ({ ...f, [key]: value }));
  };
  const nested = (section, key, value) =>
    change(section, { ...(form[section] || {}), [key]: value });
  useEffect(() => {
    const id = setTimeout(async () => {
      const terms = [
        form.cpf && `cpf.eq.${digits(form.cpf)}`,
        form.phone && `phone.eq.${digits(form.phone)}`,
        form.full_name?.length > 3 &&
          `full_name.ilike.${safeSearch(form.full_name)}`,
      ].filter(Boolean);
      if (!terms.length) {
        setDuplicates([]);
        return;
      }
      let q = db
        .from("patients")
        .select("id,full_name,phone")
        .or(terms.join(","))
        .limit(5);
      if (patient) q = q.neq("id", patient.id);
      const { data } = await q;
      setDuplicates(data || []);
    }, 400);
    return () => clearTimeout(id);
  }, [form.cpf, form.phone, form.full_name]);
  const submit = async (e) => {
    e.preventDefault();
    if (!validCPF(form.cpf) || !validCNS(form.cns)) {
      notify(t("Revise o CPF ou CNS.", "Check the CPF or CNS."));
      return;
    }
    if (form.birth_date && form.birth_date > localDay()) {
      notify(
        t(
          "A data de nascimento não pode estar no futuro.",
          "Date of birth cannot be in the future.",
        ),
      );
      return;
    }
    setBusy(true);
    try {
      const values = Object.fromEntries(
        patientFields.map(([k]) => [k, form[k] || ""]),
      );
      Object.assign(values, {
        cpf: digits(form.cpf) || null,
        cns: digits(form.cns) || null,
        phone: digits(form.phone),
        birth_date: form.birth_date || null,
        address: form.address || {},
        emergency_contact: form.emergency_contact || {},
        guardian: form.guardian || {},
        status: form.status || "ativo",
      });
      await save("patients", values, patient);
      dirty.clean();
      done();
    } catch (e) {
      notify(
        e.code === "23505"
          ? t(
              "Já existe um paciente com este CPF.",
              "A patient with this CPF already exists.",
            )
          : e.code === "conflict"
            ? t(
                "Este cadastro mudou. Reabra antes de editar.",
                "This record changed. Reopen before editing.",
              )
            : t(
                "Não foi possível salvar. Revise os dados.",
                "Could not save. Check the details.",
              ),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      title={
        patient
          ? t("Editar paciente", "Edit patient")
          : t("Novo paciente", "New patient")
      }
      close={() => dirty.canClose() && close()}
      wide
    >
      <form onSubmit={submit}>
        <div className="form-grid">
          {patientFields.map(([key, pt, en, type]) => (
            <Field
              key={key}
              name={key}
              title={t(pt, en)}
              type={type}
              value={form[key]}
              onChange={(value) => change(key, value)}
              maxLength={type === "date" ? undefined : 200}
            />
          ))}
        </div>
        {!!duplicates.length && (
          <div className="notice">
            <AlertCircle size={18} />
            <div>
              {t("Possível cadastro existente", "Possible existing record")}
              {duplicates.map((p) => (
                <p key={p.id}>
                  {p.full_name} · {p.phone}
                </p>
              ))}
            </div>
          </div>
        )}
        <details>
          <summary>{t("Endereço", "Address")}</summary>
          <div className="form-grid">
            {[
              ["cep", "CEP", "Postal code"],
              ["street", "Rua", "Street"],
              ["number", "Número", "Number"],
              ["complement", "Complemento", "Complement"],
              ["neighborhood", "Bairro", "Neighbourhood"],
              ["city", "Município", "City"],
              ["state", "UF", "State"],
              ["country", "País", "Country"],
            ].map(([k, pt, en]) => (
              <Field
                key={k}
                title={t(pt, en)}
                value={form.address?.[k]}
                onChange={(v) => nested("address", k, v)}
                maxLength={k === "state" ? 2 : 200}
              />
            ))}
          </div>
        </details>
        {[
          ["emergency_contact", "Contato de emergência", "Emergency contact"],
          ["guardian", "Responsável", "Guardian"],
        ].map(([section, pt, en]) => (
          <details key={section}>
            <summary>{t(pt, en)}</summary>
            <div className="form-grid">
              {[
                ["name", "Nome", "Name"],
                ["relationship", "Vínculo", "Relationship"],
                ["phone", "Telefone", "Phone"],
                ["email", "Email", "Email"],
              ].map(([k, p, e]) => (
                <Field
                  key={k}
                  title={t(p, e)}
                  value={form[section]?.[k]}
                  onChange={(v) => nested(section, k, v)}
                  maxLength={200}
                />
              ))}
            </div>
          </details>
        ))}
        {patient && (
          <Field
            title={t("Situação", "Status")}
            options={["ativo", "inativo"].map((s) => ({
              value: s,
              label: label(s, t),
            }))}
            value={form.status}
            onChange={(v) => change("status", v)}
          />
        )}
        <FormFooter
          busy={busy}
          dirty={dirty.dirty}
          close={() => dirty.canClose() && close()}
        />
      </form>
    </Dialog>
  );
}
function FormFooter({ busy, dirty, close, children }) {
  const t = useT();
  return (
    <footer className="form-footer">
      <span className="save-state">
        {dirty
          ? t("Alterações não salvas", "Unsaved changes")
          : t("Sem alterações pendentes", "No pending changes")}
      </span>
      <Button type="button" onClick={close}>
        {t("Cancelar", "Cancel")}
      </Button>
      {children}
      <Button icon={Save} className="primary" disabled={busy}>
        {busy ? t("Salvando...", "Saving...") : t("Salvar", "Save")}
      </Button>
    </footer>
  );
}

function Patient({
  patient: initial,
  member,
  setModal,
  notify,
  clinical,
  writable,
}) {
  const t = useT(),
    [tab, setTab] = useState("summary"),
    [page, setPage] = useState(0),
    [filter, setFilter] = useState("all");
  const state = useLoad(async () => {
    const patient = await checked(
      db.from("patients").select("*").eq("id", initial.id).single(),
    );
    const [
      entries,
      documents,
      appointments,
      tasks,
      notes,
      staff,
      communications,
      followups,
      adverseEvents,
    ] = await Promise.all([
      clinical
        ? checked(
            db
              .from("entries")
              .select("*")
              .eq("patient_id", patient.id)
              .order("clinical_at", { ascending: false })
              .range(page * 20, page * 20 + 19),
          )
        : [],
      clinical
        ? checked(
            db
              .from("documents")
              .select("*")
              .eq("patient_id", patient.id)
              .eq("status", "pronto")
              .order("created_at", { ascending: false })
              .range(page * 20, page * 20 + 19),
          )
        : [],
      checked(
        db
          .from("appointments")
          .select("*")
          .eq("patient_id", patient.id)
          .order("starts_at", { ascending: false })
          .limit(20),
      ),
      checked(
        db
          .from("tasks")
          .select("*")
          .eq("patient_id", patient.id)
          .order("due_at")
          .limit(20),
      ),
      checked(
        db
          .from("admin_notes")
          .select("*")
          .eq("patient_id", patient.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ),
      checked(
        db
          .from("memberships")
          .select("user_id,name,council,registration,state")
          .limit(200),
      ),
      clinical
        ? checked(
            db
              .from("communications")
              .select("*")
              .eq("patient_id", patient.id)
              .order("created_at", { ascending: false })
              .limit(20),
          )
        : [],
      clinical
        ? checked(db.from("follow_ups").select("*").eq("patient_id", patient.id).order("expected_on")).catch(() => [])
        : [],
      clinical
        ? checked(db.from("adverse_events").select("*").eq("patient_id", patient.id).order("event_at", { ascending: false })).catch(() => [])
        : [],
    ]);
    if (clinical)
      await checked(
        db.rpc("record_access", {
          org: ORG,
          entity: patient.id,
          event: "abertura_prontuario",
        }),
      );
    return {
      patient,
      entries,
      documents,
      appointments,
      tasks,
      notes,
      staff,
      communications,
      followups,
      adverseEvents,
    };
  }, [initial.id, page]);
  const [adminText, setAdminText] = useState(""),
    [adminBusy, setAdminBusy] = useState(false);
  const addAdminNote = async (patient) => {
    setAdminBusy(true);
    try {
      await checked(
        db
          .from("admin_notes")
          .insert({
            organization_id: ORG,
            patient_id: patient.id,
            content: adminText,
          }),
      );
      setAdminText("");
      state.refresh();
      notify(t("Salvo", "Saved"));
    } catch {
      notify(t("Não foi possível salvar.", "Could not save."));
    } finally {
      setAdminBusy(false);
    }
  };
  return (
    <LoadState state={state}>
      {({
        patient,
        entries,
        documents,
        appointments,
        tasks,
        notes,
        staff,
        communications,
        followups,
        adverseEvents,
      }) => {
        const author = (id) =>
          staff.find((s) => s.user_id === id)?.name ||
          t("Profissional", "Professional");
        const tabs = [
          ["summary", t("Resumo", "Summary")],
          ["details", t("Dados", "Details")],
          ...(clinical
            ? [
                ["record", t("Prontuário", "Clinical record")],
                ["documents", t("Documentos e fotos", "Documents & photos")],
              ]
            : []),
          ["appointments", t("Agenda e retornos", "Schedule & follow-ups")],
          ["notes", t("Administrativo", "Administrative")],
          ["timeline", t("Histórico", "Timeline")],
        ];
        const actions = (kind) => setModal({ type: "entry", kind, patient });
        return (
          <>
            <div className="patient-heading">
              <span className="avatar large">
                {initials(patient.full_name)}
              </span>
              <div>
                <p className="eyebrow">{t("Paciente", "Patient")}</p>
                <h1>
                  {patient.preferred_name ||
                    patient.full_name ||
                    t("Paciente sem nome", "Unnamed patient")}
                </h1>
                <p className="patient-meta">
                  {patient.birth_date && (
                    <span>
                      {age(patient.birth_date)} {t("anos", "years")} ·{" "}
                      {date(patient.birth_date)}
                    </span>
                  )}
                  <span>{patient.phone}</span>
                  <Status value={patient.status} />
                  {whatsapp(patient.phone) && (
                    <a
                      className="whatsapp"
                      href={whatsapp(patient.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                    >
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                  )}
                </p>
              </div>
              <div className="actions">
                {writable && (
                  <Button
                    icon={CalendarDays}
                    onClick={() => setModal({ type: "appointment", patient })}
                  >
                    {t("Agendar", "Schedule")}
                  </Button>
                )}
                {clinical && (
                  <Button
                    icon={Plus}
                    className="primary"
                    onClick={() => actions("atendimento")}
                  >
                    {t("Novo atendimento", "New consultation")}
                  </Button>
                )}
              </div>
            </div>
            <nav
              className="tabs"
              aria-label={t("Áreas do paciente", "Patient sections")}
            >
              {tabs.map(([k, title]) => (
                <button
                  key={k}
                  aria-current={tab === k ? "page" : undefined}
                  className={tab === k ? "selected" : ""}
                  onClick={() => {
                    setTab(k);
                    setPage(0);
                  }}
                >
                  {title}
                </button>
              ))}
            </nav>
            {tab === "summary" && (
              <>
                <div className="journey">
                  {[
                    "avaliacao",
                    "anamnese",
                    "plano",
                    "atendimento",
                    "evolucao",
                  ].map((kind, i) => (
                    <button
                      key={kind}
                      disabled={!clinical}
                      onClick={() => actions(kind)}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <strong>{label(kind, t)}</strong>
                      {entries.some(
                        (e) => e.kind === kind && e.status === "finalizado",
                      ) ? (
                        <Check size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="dashboard-grid">
                  <section>
                    <div className="section-heading">
                      <h2>{t("Últimos registros", "Latest records")}</h2>
                      {clinical && (
                        <Button
                          icon={Plus}
                          className="text-button"
                          onClick={() => actions("anotacao")}
                        >
                          {t("Anotação", "Note")}
                        </Button>
                      )}
                    </div>
                    {entries.slice(0, 4).map((e) => (
                      <Entry
                        key={e.id}
                        entry={e}
                        author={author(e.created_by)}
                        member={member}
                        onEdit={() =>
                          setModal({
                            type: "entry",
                            patient,
                            entry: e,
                            kind: e.kind,
                          })
                        }
                        onAmend={() =>
                          setModal({
                            type: "entry",
                            patient,
                            amends: e,
                            kind: e.kind,
                          })
                        }
                      />
                    ))}
                    {!entries.length && (
                      <Empty>
                        {clinical
                          ? t(
                              "Nenhum registro clínico ainda",
                              "No clinical records yet",
                            )
                          : t("Acesso administrativo", "Administrative access")}
                      </Empty>
                    )}
                  </section>
                  <section>
                    <div className="section-heading">
                      <h2>
                        {t("Alertas e continuidade", "Alerts & continuity")}
                      </h2>
                      <ShieldCheck size={18} />
                    </div>
                    {entries
                      .filter((e) => e.kind === "alerta")
                      .map((e) => (
                        <div className="notice" key={e.id}>
                          <AlertCircle size={18} />
                          <span>{e.content}</span>
                        </div>
                      ))}
                    {adverseEvents.filter((event) => event.status === "em_acompanhamento").map((event) => (
                      <div className="notice error" key={event.id}>
                        <AlertCircle size={18} />
                        <span><strong>{t("Intercorrência em acompanhamento", "Adverse event under follow-up")}</strong><br />{event.description}</span>
                      </div>
                    ))}
                    {followups.filter((item) => item.status !== "concluido").slice(0, 3).map((item) => (
                      <p key={item.id}><Clock size={15} /> {t("Retorno", "Follow-up")} · {date(item.expected_on)}</p>
                    ))}
                    {clinical && (
                      <Button icon={Plus} onClick={() => actions("alerta")}>
                        {t("Alerta clínico", "Clinical alert")}
                      </Button>
                    )}
                    <h3>{t("Próximo retorno", "Next follow-up")}</h3>
                    {appointments
                      .filter(
                        (a) =>
                          new Date(a.starts_at) > new Date() &&
                          !["cancelado", "reagendado"].includes(a.status),
                      )
                      .slice(-1)
                      .map((a) => (
                        <p key={a.id}>
                          {date(a.starts_at, true)} <Status value={a.status} />
                        </p>
                      ))}
                    <h3>{t("Tarefas pendentes", "Pending tasks")}</h3>
                    {tasks
                      .filter((task) => task.status === "pendente")
                      .map((task) => (
                        <p key={task.id}>
                          {task.title}
                          <small className="block">
                            {date(task.due_at, true)}
                          </small>
                        </p>
                      ))}
                    {writable && (
                      <Button
                        icon={Plus}
                        onClick={() => setModal({ type: "task", patient })}
                      >
                        {t(
                          "Adicionar retorno / tarefa",
                          "Add follow-up / task",
                        )}
                      </Button>
                    )}
                  </section>
                </div>
              </>
            )}
            {tab === "details" && (
              <section className="detail-section">
                <div className="section-heading">
                  <h2>{t("Dados cadastrais", "Patient details")}</h2>
                  {writable && (
                    <Button
                      icon={UserRound}
                      onClick={() => setModal({ type: "patient", patient })}
                    >
                      {t("Editar", "Edit")}
                    </Button>
                  )}
                </div>
                <dl className="details-grid">
                  {patientFields.map(([key, pt, en]) => (
                    <div key={key}>
                      <dt>{t(pt, en)}</dt>
                      <dd>
                        {key === "birth_date"
                          ? date(patient[key]) || "—"
                          : patient[key] || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
                {["address", "emergency_contact", "guardian"].map((key, i) => (
                  <div key={key}>
                    <h3>
                      {
                        [
                          t("Endereço", "Address"),
                          t("Emergência", "Emergency"),
                          t("Responsável", "Guardian"),
                        ][i]
                      }
                    </h3>
                    <p>
                      {Object.values(patient[key] || {})
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                ))}
              </section>
            )}
            {tab === "record" && (
              <>
                <div className="toolbar wrap">
                  <div className="actions">
                    {[
                      "avaliacao",
                      "anamnese",
                      "plano",
                      "evolucao",
                      "anotacao",
                      "consentimento",
                    ].map((kind) => (
                      <Button
                        key={kind}
                        icon={Plus}
                        onClick={() => actions(kind)}
                      >
                        {label(kind, t)}
                      </Button>
                    ))}
                    <Button icon={Clock} onClick={() => setModal({ type: "workflow", resource: "followup", patient })}>
                      {t("Retorno", "Follow-up")}
                    </Button>
                    <Button icon={AlertCircle} onClick={() => setModal({ type: "workflow", resource: "adverse_event", patient })}>
                      {t("Intercorrência", "Adverse event")}
                    </Button>
                  </div>
                  <Button
                    icon={Download}
                    onClick={() => setModal({ type: "export", patient })}
                  >
                    {t("Exportar / enviar", "Export / send")}
                  </Button>
                </div>
                {entries.map((e) => (
                  <Entry
                    key={e.id}
                    entry={e}
                    author={author(e.created_by)}
                    member={member}
                    onEdit={() =>
                      setModal({
                        type: "entry",
                        patient,
                        entry: e,
                        kind: e.kind,
                      })
                    }
                    onAmend={() =>
                      setModal({
                        type: "entry",
                        patient,
                        amends: e,
                        kind: e.kind,
                      })
                    }
                  />
                ))}
                {!entries.length && (
                  <Empty>
                    {t("Prontuário sem registros", "No clinical records")}
                  </Empty>
                )}
                <Pager page={page} setPage={setPage} count={entries.length} />
              </>
            )}
            {tab === "documents" && (
              <>
                <div className="toolbar">
                  <h2>{t("Biblioteca do paciente", "Patient library")}</h2>
                  <Button
                    icon={Paperclip}
                    className="primary"
                    onClick={() =>
                      setModal({ type: "documento", patient, entries })
                    }
                  >
                    {t("Anexar arquivo", "Attach file")}
                  </Button>
                </div>
                <div className="document-list">
                  {documents.map((doc) => (
                    <div className="document-row" key={doc.id}>
                      <FileText size={24} />
                      <span>
                        <strong>{doc.name}</strong>
                        <small>
                          {label(doc.category, t)} ·{" "}
                          {(doc.size_bytes / 1048576).toFixed(2)} MB ·{" "}
                          {date(doc.created_at)} · {author(doc.created_by)}
                        </small>
                      </span>
                      <Button
                        icon={Download}
                        className="icon"
                        title={t("Baixar arquivo", "Download file")}
                        aria-label={t("Baixar arquivo", "Download file")}
                        onClick={async () => {
                          try {
                            await checked(
                              db.rpc("record_access", {
                                org: ORG,
                                entity: doc.id,
                                event: "download_documento",
                              }),
                            );
                            const blob = await checked(
                              db.storage
                                .from("patient-files")
                                .download(doc.path),
                            );
                            download(blob, doc.name);
                          } catch {
                            notify(
                              t(
                                "Não foi possível baixar.",
                                "Could not download.",
                              ),
                            );
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
                {!documents.length && (
                  <Empty icon={Paperclip}>
                    {t("Nenhum documento anexado", "No documents attached")}
                  </Empty>
                )}
                <Pager page={page} setPage={setPage} count={documents.length} />
              </>
            )}
            {tab === "appointments" && (
              <>
                <div className="toolbar">
                  <h2>{t("Agenda e retornos", "Schedule & follow-ups")}</h2>
                  {writable && (
                    <Button
                      icon={Plus}
                      onClick={() => setModal({ type: "task", patient })}
                    >
                      {t("Nova tarefa", "New task")}
                    </Button>
                  )}
                </div>
                {appointments.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={{ ...a, patients: patient }}
                    setModal={setModal}
                    openPatient={() => {}}
                    clinical={clinical}
                    writable={writable}
                  />
                ))}
                {!appointments.length && (
                  <Empty icon={CalendarDays}>
                    {t("Nenhum agendamento", "No appointments")}
                  </Empty>
                )}
                {tasks.map((task) => (
                  <div className="list-row" key={task.id}>
                    <span>
                      <strong>{task.title}</strong>
                      <small>{date(task.due_at, true)}</small>
                    </span>
                    <Status value={task.status} />
                    {writable && (
                      <Button
                        onClick={() =>
                          setModal({ type: "task", patient, task })
                        }
                      >
                        {t("Editar", "Edit")}
                      </Button>
                    )}
                  </div>
                ))}
              </>
            )}
            {tab === "notes" && (
              <>
                <h2>
                  {t("Anotações administrativas", "Administrative notes")}
                </h2>
                {writable && (
                  <div className="quick-note">
                    <Field
                      title={t(
                        "Anotação administrativa",
                        "Administrative note",
                      )}
                      type="textarea"
                      value={adminText}
                      onChange={setAdminText}
                    />
                    <Button
                      icon={Save}
                      className="primary"
                      disabled={adminBusy}
                      onClick={() => addAdminNote(patient)}
                    >
                      {t("Salvar anotação", "Save note")}
                    </Button>
                  </div>
                )}
                {notes.map((n) => (
                  <article className="entry" key={n.id}>
                    <div className="entry-meta">
                      {author(n.created_by)} · {date(n.created_at, true)}
                    </div>
                    <p className="preserve">{n.content}</p>
                  </article>
                ))}
              </>
            )}
            {tab === "timeline" && (
              <>
                <div className="toolbar">
                  <h2>{t("Histórico do paciente", "Patient timeline")}</h2>
                  <Field
                    title={t("Filtrar", "Filter")}
                    value={filter}
                    onChange={setFilter}
                    options={[
                      { value: "all", label: t("Todos", "All") },
                      { value: "entries", label: t("Registros", "Records") },
                      {
                        value: "documents",
                        label: t("Documentos", "Documents"),
                      },
                      {
                        value: "appointments",
                        label: t("Agenda", "Appointments"),
                      },
                    ]}
                  />
                </div>
                <div className="timeline">
                  {[
                    {
                      id: patient.id,
                      at: patient.created_at,
                      type: "registration",
                      title: t("Paciente cadastrado", "Patient registered"),
                      content: patient.full_name,
                    },
                    ...entries.map((e) => ({
                      id: e.id,
                      at: e.clinical_at,
                      type: "entries",
                      title: label(e.kind, t),
                      content: e.content,
                    })),
                    ...documents.map((d) => ({
                      id: d.id,
                      at: d.created_at,
                      type: "documents",
                      title: t("Documento anexado", "Document attached"),
                      content: d.name,
                    })),
                    ...appointments.map((a) => ({
                      id: a.id,
                      at: a.starts_at,
                      type: "appointments",
                      title: t("Agendamento", "Appointment"),
                      content: label(a.status, t),
                    })),
                    ...notes.map((n) => ({
                      id: n.id,
                      at: n.created_at,
                      type: "notes",
                      title: t(
                        "Anotação administrativa",
                        "Administrative note",
                      ),
                      content: n.content,
                    })),
                    ...communications.map((c) => ({
                      id: c.id,
                      at: c.created_at,
                      type: "email",
                      title: t("Backup por email", "Email backup"),
                      content: label(c.status, t),
                    })),
                    ...followups.map((f) => ({
                      id: f.id,
                      at: f.created_at,
                      type: "followups",
                      title: t("Retorno", "Follow-up"),
                      content: `${date(f.expected_on)} · ${label(f.status, t)}`,
                    })),
                    ...adverseEvents.map((event) => ({
                      id: event.id,
                      at: event.event_at,
                      type: "adverse_events",
                      title: t("Intercorrência", "Adverse event"),
                      content: event.description,
                    })),
                  ]
                    .filter((e) => filter === "all" || e.type === filter)
                    .sort((a, b) => b.at.localeCompare(a.at))
                    .map((e) => (
                      <details key={e.id}>
                        <summary>
                          <time>{date(e.at, true)}</time>
                          <strong>{e.title}</strong>
                        </summary>
                        <p className="preserve">{e.content}</p>
                      </details>
                    ))}
                </div>
                <Pager
                  page={page}
                  count={Math.max(entries.length, documents.length)}
                  setPage={setPage}
                />
              </>
            )}
          </>
        );
      }}
    </LoadState>
  );
}
function WorkflowForm({ resource, patient, member, close, done, notify }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ status: resource === "adverse_event" ? "em_acompanhamento" : "aguardando_agendamento", expected_on: localDay(), template_version: "2026-09-14", kind: "procedimento", description: "", symptoms: "", actions: "", guidance: "", notes: "" });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const title = resource === "followup" ? t("Novo retorno", "New follow-up") : t("Nova intercorrência", "New adverse event");
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = resource === "followup"
        ? { organization_id: ORG, patient_id: patient.id, expected_on: form.expected_on, notes: form.notes, status: form.status, created_by: member.user_id }
        : { organization_id: ORG, patient_id: patient.id, description: form.description, symptoms: form.symptoms, actions: form.actions, guidance: form.guidance, status: form.status, created_by: member.user_id };
      await checked(db.from(resource === "followup" ? "follow_ups" : "adverse_events").insert(payload));
      done();
    } catch (error) {
      notify(t("Não foi possível salvar. Verifique se a migração clínica está aplicada.", "Could not save. Check that the clinical migration is applied."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog title={title} close={() => !busy && close()} wide>
      <form onSubmit={submit}>
        {resource === "followup" ? (
          <>
            <Field title={t("Data esperada", "Expected date")} type="date" value={form.expected_on} onChange={(v) => set("expected_on", v)} required />
            <Field title={t("Status", "Status")} value={form.status} onChange={(v) => set("status", v)} options={["aguardando_agendamento", "agendado", "concluido"].map((value) => ({ value, label: label(value, t) }))} />
            <Field title={t("Observações do retorno", "Follow-up notes")} type="textarea" value={form.notes} onChange={(v) => set("notes", v)} />
          </>
        ) : (
          <>
            <p className="notice"><AlertCircle size={18} /> {t("Registre o fato observado. O sistema não faz diagnóstico automático.", "Record what was observed. The system does not diagnose automatically.")}</p>
            <Field title={t("Descrição do evento", "Event description")} type="textarea" value={form.description} onChange={(v) => set("description", v)} required />
            <Field title={t("Sinais e sintomas", "Signs and symptoms")} type="textarea" value={form.symptoms} onChange={(v) => set("symptoms", v)} />
            <Field title={t("Ações tomadas", "Actions taken")} type="textarea" value={form.actions} onChange={(v) => set("actions", v)} />
            <Field title={t("Orientações e encaminhamento", "Guidance and referral")} type="textarea" value={form.guidance} onChange={(v) => set("guidance", v)} />
            <Field title={t("Status", "Status")} value={form.status} onChange={(v) => set("status", v)} options={["em_acompanhamento", "resolvida", "encaminhada"].map((value) => ({ value, label: label(value, t) }))} />
          </>
        )}
        <footer className="form-footer"><Button type="button" onClick={close}>{t("Cancelar", "Cancel")}</Button><Button className="primary" icon={Save} disabled={busy}>{busy ? t("Salvando...", "Saving...") : t("Salvar", "Save")}</Button></footer>
      </form>
    </Dialog>
  );
}
function EnquiryQuickView({ enquiry, close }) {
  const t = useT();
  return <Dialog title={t("Pré-cadastro para revisão", "Enquiry for review")} close={close}>
    <dl className="details-grid"><div><dt>{t("Nome", "Name")}</dt><dd>{enquiry.full_name}</dd></div><div><dt>{t("Recebido em", "Received")}</dt><dd>{date(enquiry.created_at, true)}</dd></div><div><dt>{t("Status", "Status")}</dt><dd><Status value={enquiry.status} /></dd></div></dl>
    <p>{t("Abra Pré-cadastros para pesquisar duplicidade, contatar e converter com autorização.", "Open Enquiries to check duplicates, contact and convert with authorization.")}</p>
    <Button className="primary" onClick={close}>{t("Fechar", "Close")}</Button>
  </Dialog>;
}
function Entry({ entry: e, author, member, onEdit, onAmend }) {
  const t = useT();
  return (
    <article className="entry">
      <div className="entry-head">
        <span className="entry-kind">
          {label(e.kind, t)}
          {e.amends_id && <small> · {t("Adendo", "Amendment")}</small>}
        </span>
        <Status value={e.status} />
      </div>
      <h3>{e.title || label(e.kind, t)}</h3>
      <p className="preserve entry-preview">{e.content}</p>
      <details>
        <summary>{t("Ver registro completo", "View full record")}</summary>
        <p className="preserve">{e.content}</p>
        <dl className="record-data">
          {Object.entries(e.data || {}).map(([k, v]) => (
            <div key={k}>
              <dt>{fieldTitle(k, t)}</dt>
              <dd className="preserve">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </details>
      <div className="entry-foot">
        <span>
          {author} · {date(e.clinical_at, true)}
          <small>
            {t("Registrado em", "Recorded at")} {date(e.created_at, true)} · v
            {e.version}
          </small>
        </span>
        {e.status === "rascunho" && e.created_by === member.user_id && (
          <Button icon={FileText} onClick={onEdit}>
            {t("Continuar", "Continue")}
          </Button>
        )}
        {e.status === "finalizado" && (
          <Button icon={Plus} className="text-button" onClick={onAmend}>
            {t("Adendo", "Amendment")}
          </Button>
        )}
      </div>
    </article>
  );
}
const clinicalFields = {
  concern: ["Queixa e objetivos", "Concern and goals"],
  area: ["Região / avaliação estética", "Area / aesthetic assessment"],
  skin: ["Pele / achados", "Skin / findings"],
  expectations: ["Expectativas", "Expectations"],
  allergies: ["Alergias", "Allergies"],
  medications: ["Medicamentos", "Medications"],
  conditions: ["Condições e antecedentes", "Conditions and history"],
  procedures: ["Procedimentos anteriores", "Previous procedures"],
  family: ["Histórico familiar", "Family history"],
  habits: ["Hábitos e contexto", "Habits and context"],
  measurements: ["Medidas relevantes", "Relevant measurements"],
  assessment: ["Avaliação", "Assessment"],
  plan: ["Conduta / plano", "Care plan"],
  recommendations: ["Orientações", "Recommendations"],
  followup: ["Retorno", "Follow-up"],
  procedure: ["Procedimento realizado", "Procedure performed"],
  products: ["Produtos / lote / validade", "Products / batch / expiry"],
  technique: ["Técnica / parâmetros / região", "Technique / settings / area"],
  response: ["Resposta / intercorrências", "Response / adverse events"],
  sessions: ["Sessões previstas", "Planned sessions"],
  price: ["Valor previsto (R$)", "Estimated price (R$)"],
  consent_scope: ["Finalidade e abrangência", "Purpose and scope"],
  consent_decision: ["Manifestação do paciente", "Patient decision"],
  consent_version: ["Versão do termo", "Consent version"],
};
const fieldTitle = (key, t) =>
  clinicalFields[key] ? t(...clinicalFields[key]) : key;
const templateFields = {
  avaliacao: ["concern", "area", "skin", "expectations"],
  anamnese: [
    "allergies",
    "medications",
    "conditions",
    "procedures",
    "family",
    "habits",
    "measurements",
  ],
  plano: ["plan", "sessions", "price", "recommendations", "followup"],
  atendimento: [
    "concern",
    "avaliacao",
    "procedure",
    "products",
    "technique",
    "response",
    "recommendations",
    "followup",
  ],
  evolucao: ["response", "plan", "followup"],
  consentimento: ["consent_scope", "consent_decision", "consent_version"],
  anotacao: [],
  alerta: [],
};
function EntryForm({
  patient,
  entry,
  amends,
  kind,
  close,
  done,
  notify,
  member,
}) {
  const t = useT(),
    [form, setForm] = useState(entry || { title: "", content: "", data: {} }),
    [saved, setSaved] = useState(entry),
    [busy, setBusy] = useState(false),
    [section, setSection] = useState(0),
    dirty = useDirty();
  const [clinicalAt, setClinicalAt] = useState(
    entry
      ? `${localDay(new Date(entry.clinical_at))}T${new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(entry.clinical_at))}`
      : localDateTime(),
  );
  const change = (key, v) => {
    dirty.touch();
    setForm((f) => ({ ...f, [key]: v }));
  };
  const fields = templateFields[kind] || [],
    sections = [fields.slice(0, 3), fields.slice(3)].filter((x) => x.length);
  const currentValue = useRef();
  currentValue.current = JSON.stringify({ form, clinicalAt });
  const persistRef = useRef();
  useEffect(() => {
    if (!dirty.dirty || busy) return;
    const timer = setTimeout(() => persistRef.current(false, false), 20000);
    return () => clearTimeout(timer);
  }, [form, clinicalAt, dirty.dirty, busy]);
  const persist = async (final = false, exit = false) => {
    if (busy) return;
    const snapshot = currentValue.current;
    setBusy(true);
    try {
      const values = {
        patient_id: patient.id,
        kind,
        title: form.title || "",
        content: form.content || "",
        data: form.data || {},
        clinical_at: toISO(clinicalAt),
        status: final ? "finalizado" : "rascunho",
        amends_id: amends?.id || saved?.amends_id || null,
        pinned: kind === "alerta",
      };
      const result = await save("entries", values, saved);
      setSaved(result);
      if (snapshot === currentValue.current) dirty.clean();
      notify(t("Salvo", "Saved"));
      if ((exit || final) && snapshot === currentValue.current) done();
    } catch (e) {
      notify(
        e.code === "conflict"
          ? t(
              "O registro mudou em outra sessão. Reabra para continuar.",
              "The record changed in another session. Reopen to continue.",
            )
          : t(
              "Não foi possível salvar. Seu texto continua aqui.",
              "Could not save. Your text is still here.",
            ),
      );
    } finally {
      setBusy(false);
    }
  };
  persistRef.current = persist;
  return (
    <Dialog
      wide
      title={`${amends ? t("Adendo: ", "Amendment: ") : ""}${label(kind, t)}`}
      close={() => dirty.canClose() && close()}
    >
      <div className="context-line">
        <span className="avatar small">{initials(patient.full_name)}</span>
        <strong>
          {patient.full_name || t("Paciente sem nome", "Unnamed patient")}
        </strong>
        <Status value={saved?.status || "rascunho"} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          persist(false, true);
        }}
      >
        <div className="form-grid">
          <Field
            title={t("Título", "Title")}
            disabled={busy}
            value={form.title}
            onChange={(v) => change("title", v)}
            maxLength={300}
          />
          <Field
            title={t("Data e hora clínica", "Clinical date and time")}
            disabled={busy}
            type="datetime-local"
            value={clinicalAt}
            onChange={(v) => {
              dirty.touch();
              setClinicalAt(v);
            }}
          />
        </div>
        {!!sections.length && (
          <>
            <div className="tabs compact">
              {sections.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className={section === i ? "selected" : ""}
                  onClick={() => setSection(i)}
                >
                  {i === 0
                    ? t("Registro", "Record")
                    : t("Complementos", "Additional details")}
                </button>
              ))}
            </div>
            <div className="form-grid">
              {sections[section]?.map((key) => (
                <Field
                  key={key}
                  title={fieldTitle(key, t)}
                  disabled={busy}
                  type="textarea"
                  value={form.data?.[key]}
                  onChange={(v) => change("data", { ...form.data, [key]: v })}
                  maxLength={15000}
                />
              ))}
            </div>
            <Button
              type="button"
              icon={Save}
              className="text-button"
              disabled={busy}
              onClick={() => persist(false, false)}
            >
              {t("Salvar esta seção", "Save this section")}
            </Button>
          </>
        )}
        <Field
          wide
          title={t(
            "Registro livre / observações",
            "Free-text record / observations",
          )}
          type="textarea"
          disabled={busy}
          value={form.content}
          onChange={(v) => change("content", v)}
          maxLength={100000}
        />
        <footer className="form-footer">
          <span className="save-state">
            {busy
              ? t("Salvando...", "Saving...")
              : dirty.dirty
                ? t("Alterações não salvas", "Unsaved changes")
                : saved
                  ? t("Salvo como rascunho", "Saved as draft")
                  : t("Novo rascunho", "New draft")}
          </span>
          <Button
            type="button"
            icon={Check}
            disabled={busy}
            onClick={() => {
              if (
                confirm(
                  t(
                    "Finalizar este registro? Correções futuras serão feitas por adendo.",
                    "Finalize this record? Future corrections will be added as amendments.",
                  ),
                )
              )
                persist(true, true);
            }}
          >
            {t("Finalizar", "Finalize")}
          </Button>
          <Button icon={Save} className="primary" disabled={busy}>
            {t("Salvar rascunho", "Save draft")}
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
function PatientPicker({ value, onChange, initial }) {
  const t = useT(),
    [term, setTerm] = useState(""),
    [options, setOptions] = useState(initial ? [initial] : []);
  useEffect(() => {
    let live = true;
    const timer = setTimeout(async () => {
      let q = db
        .from("patients")
        .select("id,full_name,phone")
        .order("full_name")
        .limit(20);
      if (term) q = q.ilike("full_name", `%${safeSearch(term)}%`);
      const { data } = await q;
      if (live)
        setOptions((rows) => [
          ...new Map(
            [
              ...(initial ? [initial] : []),
              ...rows.filter((r) => r.id === value),
              ...(data || []),
            ].map((r) => [r.id, r]),
          ).values(),
        ]);
    }, 250);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [term]);
  return (
    <div className="patient-picker">
      <Field
        title={t("Buscar paciente", "Find patient")}
        value={term}
        onChange={setTerm}
      />
      <Field
        title={t("Paciente", "Patient")}
        value={value}
        onChange={onChange}
        options={[
          { value: "", label: t("Selecionar paciente", "Select patient") },
          ...options.map((p) => ({
            value: p.id,
            label: p.full_name || t("Paciente sem nome", "Unnamed patient"),
          })),
        ]}
      />
    </div>
  );
}
function AppointmentRow({
  appointment: a,
  openPatient,
  setModal,
  clinical,
  writable = true,
}) {
  const t = useT();
  return (
    <div className="appointment-row">
      <time>
        {new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(a.starts_at))}
        <small>{date(a.starts_at)}</small>
      </time>
      <button
        className="row-name"
        onClick={() => a.patients && openPatient(a.patients)}
      >
        <strong>{a.patients?.full_name || t("Paciente", "Patient")}</strong>
        <small>{a.label || t("Atendimento", "Consultation")}</small>
      </button>
      <Status value={a.status} />
      {clinical && (
        <Button
          icon={ArrowRight}
          className="icon"
          title={t("Iniciar atendimento", "Start consultation")}
          aria-label={t("Iniciar atendimento", "Start consultation")}
          onClick={() =>
            setModal({
              type: "entry",
              patient: a.patients,
              kind: "atendimento",
            })
          }
        />
      )}{" "}
      {writable && (
        <Button
          icon={CalendarDays}
          className="icon"
          title={t("Editar agendamento", "Edit appointment")}
          aria-label={t("Editar agendamento", "Edit appointment")}
          onClick={() =>
            setModal({
              type: "appointment",
              appointment: a,
              patient: a.patients,
            })
          }
        />
      )}
    </div>
  );
}
function AppointmentForm({ appointment, patient, close, done, notify }) {
  const t = useT(),
    dirty = useDirty(),
    [form, setForm] = useState(
      appointment || {
        patient_id: patient?.id || "",
        status: "agendado",
        label: "",
        professional_id: "",
      },
    ),
    [start, setStart] = useState(
      appointment
        ? `${localDay(new Date(appointment.starts_at))}T${new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.starts_at))}`
        : localDateTime(),
    ),
    [duration, setDuration] = useState(
      appointment
        ? (new Date(appointment.ends_at) - new Date(appointment.starts_at)) /
            60000
        : 60,
    ),
    [busy, setBusy] = useState(false);
  const staff = useLoad(
    () =>
      checked(
        db
          .from("memberships")
          .select("user_id,name")
          .in("role", ["proprietario", "profissional"])
          .eq("status", "ativo"),
      ),
    [],
  );
  const change = (k, v) => {
    dirty.touch();
    setForm((f) => ({ ...f, [k]: v }));
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !start) {
      notify(
        t(
          "Selecione um paciente e um horário.",
          "Select a patient and a time.",
        ),
      );
      return;
    }
    setBusy(true);
    try {
      await save(
        "appointments",
        {
          patient_id: form.patient_id,
          professional_id: form.professional_id || null,
          label: form.label,
          starts_at: toISO(start),
          ends_at: new Date(
            new Date(toISO(start)).getTime() + Number(duration) * 60000,
          ).toISOString(),
          status: form.status,
        },
        appointment,
      );
      dirty.clean();
      done();
    } catch {
      notify(
        t(
          "Não foi possível agendar. Verifique o horário.",
          "Could not schedule. Check the time.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      title={t("Agendamento", "Appointment")}
      close={() => dirty.canClose() && close()}
    >
      <form onSubmit={submit}>
        <PatientPicker
          value={form.patient_id}
          onChange={(v) => change("patient_id", v)}
          initial={patient}
        />
        <div className="form-grid">
          <Field
            title={t("Data e hora", "Date and time")}
            type="datetime-local"
            value={start}
            onChange={(v) => {
              dirty.touch();
              setStart(v);
            }}
          />
          <Field
            title={t("Duração (minutos)", "Duration (minutes)")}
            type="number"
            min="5"
            max="720"
            step="5"
            value={duration}
            onChange={(v) => {
              dirty.touch();
              setDuration(v);
            }}
          />
          <Field
            title={t("Profissional", "Professional")}
            value={form.professional_id}
            onChange={(v) => change("professional_id", v)}
            options={[
              { value: "", label: t("Sem atribuição", "Unassigned") },
              ...(staff.data || []).map((s) => ({
                value: s.user_id,
                label: s.name,
              })),
            ]}
          />
          <Field
            title={t("Situação", "Status")}
            value={form.status}
            onChange={(v) => change("status", v)}
            options={[
              "agendado",
              "confirmado",
              "aguardando",
              "em_atendimento",
              "concluido",
              "cancelado",
              "faltou",
              "reagendado",
            ].map((s) => ({ value: s, label: label(s, t) }))}
          />
        </div>
        <Field
          title={t("Tipo de agendamento", "Appointment type")}
          value={form.label}
          onChange={(v) => change("label", v)}
          maxLength={150}
        />
        <FormFooter
          busy={busy}
          dirty={dirty.dirty}
          close={() => dirty.canClose() && close()}
        />
      </form>
    </Dialog>
  );
}
function Agenda({ openPatient, setModal, version, clinical, writable }) {
  const t = useT(),
    [day, setDay] = useState(localDay()),
    [mode, setMode] = useState("day");
  const days = mode === "day" ? 1 : mode === "week" ? 7 : 31;
  const end = new Date(
    new Date(day + "T00:00:00-03:00").getTime() + days * 86400000,
  ).toISOString();
  const state = useLoad(
    () =>
      checked(
        db
          .from("appointments")
          .select("*,patients(*)")
          .gte("starts_at", day + "T00:00:00-03:00")
          .lt("starts_at", end)
          .order("starts_at")
          .limit(200),
      ),
    [day, mode, version],
  );
  return (
    <>
      <PageHead
        title={t("Agenda", "Schedule")}
        eyebrow={t("Cada encontro importa", "Every visit matters")}
      >
        {writable && (
          <Button
            icon={Plus}
            className="primary"
            onClick={() => setModal({ type: "appointment" })}
          >
            {t("Agendar", "Schedule")}
          </Button>
        )}
      </PageHead>
      <div className="toolbar wrap">
        <div className="actions">
          <Button
            icon={ChevronLeft}
            className="icon"
            aria-label={t("Período anterior", "Previous period")}
            onClick={() =>
              setDay(
                localDay(
                  new Date(
                    new Date(day + "T12:00:00-03:00").getTime() -
                      days * 86400000,
                  ),
                ),
              )
            }
          />
          <Field
            title={t("Data", "Date")}
            type="date"
            value={day}
            onChange={setDay}
          />
          <Button
            icon={ChevronRight}
            className="icon"
            aria-label={t("Próximo período", "Next period")}
            onClick={() =>
              setDay(
                localDay(
                  new Date(
                    new Date(day + "T12:00:00-03:00").getTime() +
                      days * 86400000,
                  ),
                ),
              )
            }
          />
          <Button onClick={() => setDay(localDay())}>
            {t("Hoje", "Today")}
          </Button>
        </div>
        <div className="segmented">
          {[
            ["day", t("Dia", "Day")],
            ["week", t("Semana", "Week")],
            ["month", t("31 dias", "31 days")],
          ].map(([k, title]) => (
            <button
              key={k}
              aria-pressed={mode === k}
              onClick={() => setMode(k)}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
      <LoadState state={state}>
        {(rows) => (
          <>
            {rows.map((a, i) => (
              <React.Fragment key={a.id}>
                {(i === 0 ||
                  localDay(new Date(rows[i - 1].starts_at)) !==
                    localDay(new Date(a.starts_at))) && (
                  <h2 className="date-heading">{date(a.starts_at)}</h2>
                )}
                <AppointmentRow
                  appointment={a}
                  openPatient={openPatient}
                  setModal={setModal}
                  clinical={clinical}
                  writable={writable}
                />
              </React.Fragment>
            ))}
            {!rows.length && (
              <Empty icon={CalendarDays}>
                {t(
                  "Nenhum agendamento neste período",
                  "No appointments in this period",
                )}
              </Empty>
            )}
            {rows.length === 200 && (
              <p className="notice">
                {t(
                  "Mostrando 200 agendamentos. Selecione um período menor.",
                  "Showing 200 appointments. Select a shorter period.",
                )}
              </p>
            )}
          </>
        )}
      </LoadState>
    </>
  );
}
function TaskForm({ task, patient, close, done, notify }) {
  const t = useT(),
    dirty = useDirty(),
    [form, setForm] = useState(
      task || {
        patient_id: patient?.id || "",
        title: "",
        priority: "normal",
        status: "pendente",
        assigned_to: "",
      },
    ),
    [due, setDue] = useState(
      task ? `${localDay(new Date(task.due_at))}T09:00` : localDateTime(),
    ),
    [busy, setBusy] = useState(false);
  const staff = useLoad(
    () =>
      checked(
        db.from("memberships").select("user_id,name").eq("status", "ativo"),
      ),
    [],
  );
  const change = (k, v) => {
    dirty.touch();
    setForm((f) => ({ ...f, [k]: v }));
  };
  return (
    <Dialog
      title={t("Tarefa / retorno", "Task / follow-up")}
      close={() => dirty.canClose() && close()}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await save(
              "tasks",
              {
                patient_id: form.patient_id || null,
                assigned_to: form.assigned_to || null,
                title: form.title,
                priority: form.priority,
                status: form.status,
                due_at: toISO(due),
              },
              task,
            );
            dirty.clean();
            done();
          } catch {
            notify(t("Não foi possível salvar.", "Could not save."));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field
          title={t("Tarefa", "Task")}
          value={form.title}
          onChange={(v) => change("title", v)}
          maxLength={200}
        />
        <PatientPicker
          initial={patient}
          value={form.patient_id}
          onChange={(v) => change("patient_id", v)}
        />
        <div className="form-grid">
          <Field
            title={t("Prazo", "Due date")}
            type="datetime-local"
            value={due}
            onChange={(v) => {
              dirty.touch();
              setDue(v);
            }}
          />
          <Field
            title={t("Responsável", "Assigned to")}
            value={form.assigned_to}
            onChange={(v) => change("assigned_to", v)}
            options={[
              { value: "", label: t("Sem atribuição", "Unassigned") },
              ...(staff.data || []).map((s) => ({
                value: s.user_id,
                label: s.name,
              })),
            ]}
          />
          {[
            ["priority", t("Prioridade", "Priority"), ["normal", "alta"]],
            [
              "status",
              t("Situação", "Status"),
              ["pendente", "concluida", "cancelado"],
            ],
          ].map(([k, title, options]) => (
            <Field
              key={k}
              title={title}
              value={form[k]}
              onChange={(v) => change(k, v)}
              options={options.map((s) => ({ value: s, label: label(s, t) }))}
            />
          ))}
        </div>
        <FormFooter
          busy={busy}
          dirty={dirty.dirty}
          close={() => dirty.canClose() && close()}
        />
      </form>
    </Dialog>
  );
}
function Tasks({ setModal, openPatient, version, writable, notify }) {
  const t = useT(),
    [status, setStatus] = useState("pendente"),
    [page, setPage] = useState(0);
  const state = useLoad(
    () =>
      checked(
        db
          .from("tasks")
          .select("*,patients(*)")
          .eq("status", status)
          .order("due_at")
          .range(page * 20, page * 20 + 19),
      ),
    [status, page, version],
  );
  return (
    <>
      <PageHead title={t("Tarefas e retornos", "Tasks & follow-ups")}>
        {writable && (
          <Button
            icon={Plus}
            className="primary"
            onClick={() => setModal({ type: "task" })}
          >
            {t("Nova tarefa", "New task")}
          </Button>
        )}
      </PageHead>
      <div className="toolbar">
        <div className="segmented">
          {["pendente", "concluida", "cancelado"].map((s) => (
            <button
              key={s}
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setPage(0);
              }}
            >
              {label(s, t)}
            </button>
          ))}
        </div>
      </div>
      <LoadState state={state}>
        {(rows) => (
          <>
            {rows.map((task) => (
              <div className="list-row" key={task.id}>
                {writable && (
                  <Button
                    icon={Check}
                    className="icon"
                    aria-label={t("Concluir tarefa", "Complete task")}
                    onClick={async () => {
                      try {
                        await save("tasks", { status: "concluida" }, task);
                        state.refresh();
                        notify(t("Salvo", "Saved"));
                      } catch {
                        notify(
                          t("Não foi possível salvar.", "Could not save."),
                        );
                      }
                    }}
                  />
                )}
                <button
                  className="row-name"
                  onClick={() => task.patients && openPatient(task.patients)}
                >
                  <strong>{task.title || t("Tarefa", "Task")}</strong>
                  <small>
                    {task.patients?.full_name || t("Clínica", "Clinic")}
                  </small>
                </button>
                <span
                  className={
                    task.status === "pendente" &&
                    new Date(task.due_at) < new Date()
                      ? "overdue"
                      : ""
                  }
                >
                  {date(task.due_at, true)}
                </span>
                <Status value={task.priority} />
                {writable && (
                  <Button
                    onClick={() =>
                      setModal({ type: "task", task, patient: task.patients })
                    }
                  >
                    {t("Editar", "Edit")}
                  </Button>
                )}
              </div>
            ))}
            {!rows.length && (
              <Empty icon={Check}>
                {t("Nenhuma tarefa nesta lista", "No tasks in this list")}
              </Empty>
            )}
            <Pager page={page} count={rows.length} setPage={setPage} />
          </>
        )}
      </LoadState>
    </>
  );
}

function Enquiries({ openPatient, version, writable, notify }) {
  const t = useT(),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState(null),
    [notes, setNotes] = useState(""),
    [duplicates, setDuplicates] = useState([]),
    [files, setFiles] = useState([]),
    [busy, setBusy] = useState(false);
  const state = useLoad(
    () =>
      checked(
        db
          .from("public_intakes")
          .select("*")
          .order("created_at", { ascending: false })
          .range(page * 20, page * 20 + 19),
      ),
    [page, version],
  );
  const review = async (row) => {
    setSelected(row);
    setNotes(row.internal_notes);
    setDuplicates([]);
    setFiles([]);
    checked(db.from("public_intake_files").select("id,kind,path").eq("intake_id", row.id))
      .then(setFiles).catch(() => setFiles([]));
    const terms = [
      row.cpf && `cpf.eq.${digits(row.cpf)}`,
      row.phone && `phone.eq.${digits(row.phone)}`,
      row.email && `email.eq.${safeSearch(row.email)}`,
      row.full_name && `full_name.ilike.${safeSearch(row.full_name)}`,
    ].filter(Boolean);
    if (terms.length) {
      const { data } = await db
        .from("patients")
        .select("*")
        .or(terms.join(","))
        .limit(10);
      setDuplicates(data || []);
    }
  };
  const convert = async (existing) => {
    if (
      !confirm(
        existing
          ? t(
              "Vincular este pré-cadastro ao paciente selecionado?",
              "Link this enquiry to the selected patient?",
            )
          : t(
              "Criar um paciente com estes dados?",
              "Create a patient from these details?",
            ),
      )
    )
      return;
    setBusy(true);
    try {
      await checked(
        db
          .from("public_intakes")
          .update({ internal_notes: notes })
          .eq("id", selected.id),
      );
      const id = await checked(
        db.rpc("convert_public_intake", {
          enquiry: selected.id,
          existing_patient: existing || null,
        }),
      );
      const p = await checked(
        db.from("patients").select("*").eq("id", id).single(),
      );
      setSelected(null);
      openPatient(p);
    } catch {
      notify(t("Não foi possível converter.", "Could not convert."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHead
        title={t("Pré-cadastros", "Enquiries")}
        eyebrow={t("Primeiro contato", "First contact")}
      >
        <a
          className="button"
          href="/formulario"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkIcon size={17} />
          {t("Formulário público", "Public form")}
        </a>
      </PageHead>
      <LoadState state={state}>
        {(rows) => (
          <>
            {rows.map((row) => (
              <button
                className="patient-row"
                key={row.id}
                onClick={() => review(row)}
              >
                <span className="avatar">{initials(row.full_name)}</span>
                <span className="patient-identity">
                  <strong>
                    {row.full_name || t("Novo contato", "New contact")}
                  </strong>
                  <small>{row.phone || row.email}</small>
                </span>
                <span>{date(row.created_at)}</span>
                <Status value={row.status} />
                <ChevronRight size={18} />
              </button>
            ))}
            {!rows.length && (
              <Empty icon={Inbox}>
                {t("Nenhum formulário recebido", "No intake forms received")}
              </Empty>
            )}
            <Pager page={page} count={rows.length} setPage={setPage} />
          </>
        )}
      </LoadState>
      {selected && (
        <Dialog
          title={t("Revisar formulário", "Review intake form")}
          close={() => setSelected(null)}
        >
          <h3>{selected.full_name || t("Novo contato", "New contact")}</h3>
          <p>
            {selected.phone} · {selected.email}
          </p>
          {whatsapp(selected.phone) && (
            <a
              className="button"
              href={whatsapp(selected.phone)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          )}
          <p className="subtle">
            {t("Autorização de contato", "Contact permission")}:{" "}
            {date(selected.consent_at, true)}
          </p>
          {files.length > 0 && (
            <div className="notice">
              <strong>{t("Arquivos privados", "Private files")}</strong>
              {files.map((file) => (
                <p key={file.id}>
                  <Button
                    icon={Eye}
                    onClick={async () => {
                      const { data } = await db.storage.from("intake-private").createSignedUrl(file.path, 300);
                      if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {file.kind === "identity" ? t("Documento de identidade", "Identity document") : t("Comprovante de pagamento", "Payment proof")}
                  </Button>
                </p>
              ))}
            </div>
          )}
          <Field
            title={t("Anotações internas", "Internal notes")}
            type="textarea"
            value={notes}
            onChange={setNotes}
            disabled={!writable}
          />
          {duplicates.length > 0 && (
            <div className="notice">
              <div>
                <strong>
                  {t("Possíveis duplicados", "Possible duplicates")}
                </strong>
                {duplicates.map((p) => (
                  <div className="duplicate" key={p.id}>
                    <span>
                      {p.full_name} · {p.phone}
                    </span>
                    {writable && (
                      <Button
                        disabled={busy || selected.status === "convertido"}
                        onClick={() => convert(p.id)}
                      >
                        {t("Vincular", "Link")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {writable && (
            <footer className="form-footer">
              <Button
                icon={Save}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await checked(
                      db
                        .from("public_intakes")
                        .update({
                          internal_notes: notes,
                          ...(selected.status === "novo"
                            ? { status: "em_analise" }
                            : {}),
                        })
                        .eq("id", selected.id),
                    );
                    state.refresh();
                    setSelected(null);
                    notify(t("Salvo", "Saved"));
                  } catch {
                    notify(t("Não foi possível salvar.", "Could not save."));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t("Salvar análise", "Save review")}
              </Button>
              {!selected.patient_id && (
                <Button
                  icon={Plus}
                  className="primary"
                  disabled={busy}
                  onClick={() => convert(null)}
                >
                  {t("Converter em paciente", "Convert to patient")}
                </Button>
              )}
            </footer>
          )}
        </Dialog>
      )}
    </>
  );
}
function DocumentForm({ patient, entries = [], close, done, notify }) {
  const t = useT(),
    [file, setFile] = useState(null),
    [category, setCategory] = useState("documento"),
    [entry, setEntry] = useState(""),
    [busy, setBusy] = useState(false),
    [uploaded, setUploaded] = useState(null);
  return (
    <Dialog
      title={t("Anexar documento", "Attach document")}
      close={() => !busy && close()}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!file && !uploaded) return;
          if (
            file &&
            (![
              "application/pdf",
              "image/jpeg",
              "image/png",
              "image/webp",
            ].includes(file.type) ||
              file.size > 8388608)
          ) {
            notify(
              t(
                "Use PDF, JPG, PNG ou WebP de até 8 MB.",
                "Use PDF, JPG, PNG or WebP up to 8 MB.",
              ),
            );
            return;
          }
          setBusy(true);
          try {
            let doc = uploaded;
            if (!doc) {
              const body = new FormData();
              body.set("file", file);
              body.set("patient_id", patient.id);
              body.set("category", category);
              const result = await invoke("files", body);
              doc = result.document;
              setUploaded(doc);
            }
            if (entry)
              await checked(
                db
                  .from("document_links")
                  .upsert(
                    {
                      organization_id: ORG,
                      patient_id: patient.id,
                      document_id: doc.id,
                      entry_id: entry,
                    },
                    {
                      onConflict: "document_id,entry_id",
                      ignoreDuplicates: true,
                    },
                  ),
              );
            done();
          } catch {
            notify(
              t(
                "Não foi possível concluir. O arquivo já salvo será mantido.",
                "Could not complete. Any saved file will be retained.",
              ),
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="upload-zone">
          <Paperclip size={28} />
          <label>
            <span>{t("Selecionar arquivo", "Choose file")}</span>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              disabled={!!uploaded}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </label>
          <small>PDF · JPG · PNG · WebP · 8 MB</small>
          {file && (
            <p>
              {file.name} · {(file.size / 1048576).toFixed(2)} MB
            </p>
          )}
        </div>
        <Field
          title={t("Categoria", "Category")}
          value={category}
          onChange={setCategory}
          options={["documento", "fotografia", "exame", "consentimento"].map((s) => ({
            value: s,
            label: label(s, t),
          }))}
        />
        <Field
          title={t("Associar ao registro", "Link to record")}
          value={entry}
          onChange={setEntry}
          options={[
            {
              value: "",
              label: t("Biblioteca do paciente", "Patient library"),
            },
            ...entries.map((e) => ({
              value: e.id,
              label: `${label(e.kind, t)} · ${date(e.clinical_at)}`,
            })),
          ]}
        />
        <footer className="form-footer">
          <Button type="button" disabled={busy} onClick={close}>
            {t("Cancelar", "Cancel")}
          </Button>
          <Button
            icon={Paperclip}
            className="primary"
            disabled={busy || (!file && !uploaded)}
          >
            {busy
              ? t("Anexando...", "Uploading...")
              : t("Salvar documento", "Save document")}
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
async function collectPatient(patient) {
  const tables = [
    "patients",
    "entries",
    "entry_versions",
    "admin_notes",
    "appointments",
    "tasks",
    "documents",
    "document_links",
    "communications",
  ];
  const data = {
    format: "sofiati-patient-v1",
    exported_at: new Date().toISOString(),
    tables: {},
    files: [],
  };
  for (const table of tables)
    data.tables[table] = await allRows(table, patient.id);
  data.tables.memberships = await checked(
    db
      .from("memberships")
      .select("user_id,name,profession,council,registration,state,specialty")
      .eq("organization_id", ORG),
  );
  for (const doc of data.tables.documents.filter((d) => d.status === "pronto")) {
    const blob = await checked(
      db.storage.from("patient-files").download(doc.path),
    );
    const raw = new Uint8Array(await blob.arrayBuffer());
    const digest = [
      ...new Uint8Array(await crypto.subtle.digest("SHA-256", raw)),
    ]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (digest !== doc.sha256) throw Error("integrity");
    data.files.push({
      id: doc.id,
      path: doc.path,
      sha256: digest,
      mime_type: doc.mime_type,
      base64: await fileBase64(blob),
    });
  }
  await checked(
    db.rpc("record_access", {
      org: ORG,
      entity: patient.id,
      event: "exportacao_prontuario",
    }),
  );
  return data;
}
function ExportDialog({ patient, close, notify }) {
  const t = useT(),
    [pass, setPass] = useState(""),
    [confirmPass, setConfirm] = useState(""),
    [packet, setPacket] = useState(null),
    [data, setData] = useState(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("");
  const prepare = async () => {
    if (pass.length < 16 || pass !== confirmPass) {
      notify(
        t(
          "Use uma frase de pelo menos 16 caracteres e confirme.",
          "Use a passphrase of at least 16 characters and confirm it.",
        ),
      );
      return;
    }
    setBusy(true);
    try {
      const result = await collectPatient(patient),
        encrypted = await encryptPackets(result, pass);
      setData(result);
      setPacket(encrypted);
      setPass("");
      setConfirm("");
      notify(t("Backup criptografado preparado", "Encrypted backup prepared"));
    } catch {
      notify(
        t(
          "Não foi possível preparar todos os registros e anexos.",
          "Could not prepare all records and attachments.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  const bytes = packet ? packet.reduce((sum,p)=>sum+new Blob([JSON.stringify(p)]).size,0) : 0;
  return (
    <Dialog
      wide
      title={t("Exportar e enviar", "Export & send")}
      close={() => !busy && close()}
    >
      <p>
        <strong>{patient.full_name || t("Paciente", "Patient")}</strong>
      </p>
      {!packet ? (
        <>
          <div className="notice">
            <LockKeyhole size={18} />
            <span>
              {t(
                "Guarde a frase de recuperação separadamente. Ela é necessária para abrir o backup.",
                "Keep the recovery passphrase separately. It is required to open the backup.",
              )}
            </span>
          </div>
          <div className="form-grid">
            <Field
              title={t("Frase de recuperação", "Recovery passphrase")}
              type="password"
              autoComplete="new-password"
              minLength={16}
              value={pass}
              onChange={setPass}
            />
            <Field
              title={t("Confirmar frase", "Confirm passphrase")}
              type="password"
              autoComplete="new-password"
              value={confirmPass}
              onChange={setConfirm}
            />
          </div>
          <Button
            icon={LockKeyhole}
            className="primary"
            disabled={busy}
            onClick={prepare}
          >
            {busy
              ? t("Preparando...", "Preparing...")
              : t(
                  "Preparar todos os registros e anexos",
                  "Prepare all records and attachments",
                )}
          </Button>
        </>
      ) : (
        <>
          <dl className="details-grid">
            <div>
              <dt>{t("Para", "To")}</dt>
              <dd>suportesofiati@gmail.com</dd>
            </div>
            <div>
              <dt>{t("Assunto", "Subject")}</dt>
              <dd>Franciele Sofiati - backup criptografado</dd>
            </div>
            <div>
              <dt>{t("Mensagem", "Message")}</dt>
              <dd>
                {t(
                  "Arquivo criptografado. A chave é mantida separadamente pela clínica.",
                  "Encrypted file. The key is kept separately by the clinic.",
                )}
              </dd>
            </div>
            <div>
              <dt>{t("Anexos", "Attachments")}</dt>
              <dd>{packet.length} {t('partes criptografadas','encrypted parts')} · {(bytes / 1048576).toFixed(2)} MB</dd>
            </div>
          </dl>
          <p>
            {data.tables.entries.length} {t("registros", "records")} ·{" "}
            {data.files.length} {t("arquivos", "files")}
          </p>
          <div className="actions wrap">
            {packet.map((part,index)=><Button key={index}
              icon={Download}
              onClick={() =>
                download(
                  new Blob([JSON.stringify(part)], {
                    type: "application/json",
                  }),
                  `backup-${index+1}-of-${packet.length}.encrypted.json`,
                )
              }
            >
              {t("Baixar parte", "Download part")} {index+1}/{packet.length}
            </Button>)}
            <Button icon={Printer} onClick={() => printRecord(data, t)}>
              {t("Relatório para impressão", "Printable report")}
            </Button>
            <Button
              icon={Send}
              className="primary"
              disabled={busy || status === "aceito"}
              onClick={async () => {
                setBusy(true);
                try {
                  for (const part of packet) {
                    const result = await invoke("email-backup", {patient_id:patient.id,packet:part});
                    if(result.status!=='aceito') throw Error('send');
                  }
                  setStatus('aceito');
                } catch {
                  setStatus("nao_confirmado");
                  notify(
                    t(
                      "Envio não confirmado. O registro salvo permanece disponível.",
                      "Send unconfirmed. The saved record remains available.",
                    ),
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy
                ? t("Enviando...", "Sending...")
                : t("Enviar backup por email", "Email backup")}
            </Button>
          </div>
          {status && (
            <p role="status">
              <Status value={status} />
            </p>
          )}
        </>
      )}
    </Dialog>
  );
}
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function printRecord(data, t) {
  const p = data.tables.patients[0],
    win = window.open("", "_blank");
  if (!win) return;
  win.opener = null;
  const section = (title, content) =>
    `<section><h2>${escapeHTML(title)}</h2>${content}</section>`;
  const entries = data.tables.entries
    .map((e) => {
      const staff = data.tables.memberships.find(
        (m) => m.user_id === e.created_by,
      );
      return `<article><h3>${escapeHTML(label(e.kind, t))}: ${escapeHTML(e.title)}</h3><p class="meta">${escapeHTML(date(e.clinical_at, true))} · ${escapeHTML(staff?.name || e.created_by)} · ${escapeHTML(staff?.council)} ${escapeHTML(staff?.registration)} · ${escapeHTML(label(e.status, t))} · v${e.version}</p><p>${escapeHTML(e.content)}</p>${Object.entries(
        e.data || {},
      )
        .map(
          ([k, v]) =>
            `<h4>${escapeHTML(fieldTitle(k, t))}</h4><p>${escapeHTML(v)}</p>`,
        )
        .join(
          "",
        )}${e.amends_id ? `<p class="meta">${escapeHTML(t("Adendo ao registro", "Amends record"))}: ${escapeHTML(e.amends_id)}</p>` : ""}</article>`;
    })
    .join("");
  win.document.write(
    `<!doctype html><html lang="${t("pt-BR", "en")}"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>${escapeHTML(t("Prontuário", "Patient record"))}</title><style>body{font:14px/1.6 system-ui;color:#1d3026;max-width:850px;margin:40px auto;padding:24px}h1,h2,h3{font-family:Georgia,serif}h1{font-size:32px}header{border-bottom:3px solid #3f5039;padding-bottom:20px}h2{border-bottom:1px solid #aaa;padding-bottom:10px;margin-top:36px}p{white-space:pre-wrap;overflow-wrap:anywhere}article{border-bottom:1px solid #ddd;padding:12px 0}.meta{font-size:11px;color:#46554c}button{padding:12px;cursor:pointer}@media print{button{display:none}body{margin:0;padding:0}h2,h3{break-after:avoid}article{break-inside:auto}@page{margin:18mm}}</style></head><body><button id="print">${escapeHTML(t("Imprimir / Salvar PDF", "Print / Save PDF"))}</button><header><h1>Franciele Sofiati</h1><p>${escapeHTML(t("Prontuário confidencial", "Confidential patient record"))}</p></header>${section(t("Identificação", "Identification"), `<h2>${escapeHTML(p.full_name)}</h2><p>${escapeHTML(date(p.birth_date))} · ${escapeHTML(p.phone)} · ${escapeHTML(p.email)}</p><p>CPF: ${escapeHTML(p.cpf)}</p>`)}${section(t("Registros clínicos", "Clinical records"), entries)}${section(t("Documentos", "Documents"), data.tables.documents.map((d) => `<p>${escapeHTML(d.name)} · ${escapeHTML(date(d.created_at))}<br><span class="meta">SHA-256: ${escapeHTML(d.sha256)}</span></p>`).join(""))}${section(t("Agenda", "Appointments"), data.tables.appointments.map((a) => `<p>${escapeHTML(date(a.starts_at, true))} · ${escapeHTML(label(a.status, t))}</p>`).join(""))}<footer><p class="meta">${escapeHTML(t("Exportado em", "Exported at"))} ${escapeHTML(date(data.exported_at, true))} · ${escapeHTML(t("Registro eletrônico sem assinatura ICP-Brasil", "Electronic record without ICP-Brasil signature"))}</p></footer></body></html>`,
  );
  win.document.close();
  win.document.getElementById("print").onclick = () => win.print();
}
function Reports() {
  const t = useT(),
    [start, setStart] = useState(localDay().slice(0, 7) + "-01"),
    [end, setEnd] = useState(localDay());
  const state = useLoad(async () => {
    const stats = {};
    for (const status of [
      "agendado",
      "confirmado",
      "concluido",
      "cancelado",
      "faltou",
    ]) {
      const { count, error } = await db
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", status)
        .gte("starts_at", start + "T00:00:00-03:00")
        .lte("starts_at", end + "T23:59:59-03:00");
      if (error) throw error;
      stats[status] = count;
    }
    const { count, error } = await db
      .from("patients")
      .select("id", { count: "exact", head: true })
      .gte("created_at", start + "T00:00:00-03:00")
      .lte("created_at", end + "T23:59:59-03:00");
    if (error) throw error;
    return { stats, patients: count };
  }, [start, end]);
  return (
    <>
      <PageHead
        title={t("Relatórios", "Reports")}
        eyebrow={t("Rotina da clínica", "Clinic operations")}
      />
      <div className="toolbar">
        <div className="actions">
          <Field
            title={t("De", "From")}
            type="date"
            value={start}
            onChange={setStart}
          />
          <Field
            title={t("Até", "To")}
            type="date"
            value={end}
            onChange={setEnd}
          />
        </div>
      </div>
      <LoadState state={state}>
        {(data) => (
          <section className="report">
            <h2>{t("Atendimentos no período", "Appointments in period")}</h2>
            {Object.entries(data.stats).map(([s, n]) => (
              <div className="report-row" key={s}>
                <span>{label(s, t)}</span>
                <strong>{n}</strong>
              </div>
            ))}
            <div className="report-row">
              <span>{t("Novos pacientes", "New patients")}</span>
              <strong>{data.patients}</strong>
            </div>
          </section>
        )}
      </LoadState>
    </>
  );
}
function ProcedureCatalog({ notify }) {
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "outro", default_duration: 60, followup_days: 30, product_relevant: false, lot_required: false, device_relevant: false, photos_expected: false });
  const state = useLoad(() => checked(db.from("procedures").select("*").order("active", { ascending: false }).order("name")), [showForm]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const saveProcedure = async (event) => {
    event.preventDefault();
    try {
      await checked(db.from("procedures").insert({ organization_id: ORG, ...form, default_duration: Number(form.default_duration), followup_days: form.followup_days === "" ? null : Number(form.followup_days) }));
      setForm({ name: "", category: "outro", default_duration: 60, followup_days: 30, product_relevant: false, lot_required: false, device_relevant: false, photos_expected: false });
      setShowForm(false);
      state.refresh();
      notify(t("Procedimento salvo", "Procedure saved"));
    } catch {
      notify(t("Não foi possível salvar o procedimento.", "Could not save procedure."));
    }
  };
  return <section className="detail-section">
    <div className="toolbar"><div><h2>{t("Catálogo de procedimentos", "Procedure catalogue")}</h2><p className="subtle">{t("Serviços verificados no site público; o proprietário controla o que está ativo.", "Services verified against the public site; the owner controls what is active.")}</p></div><Button icon={Plus} className="primary" onClick={() => setShowForm(!showForm)}>{t("Novo procedimento", "New procedure")}</Button></div>
    {showForm && <form className="form-grid" onSubmit={saveProcedure}><Field title={t("Nome", "Name")} value={form.name} onChange={(v) => set("name", v)} required wide /><Field title={t("Categoria", "Category")} value={form.category} onChange={(v) => set("category", v)} /><Field title={t("Duração (min)", "Duration (min)")} type="number" min="5" max="720" value={form.default_duration} onChange={(v) => set("default_duration", v)} /><Field title={t("Retorno após (dias)", "Follow-up after (days)")} type="number" min="0" max="3650" value={form.followup_days} onChange={(v) => set("followup_days", v)} /><footer className="form-footer"><Button type="button" onClick={() => setShowForm(false)}>{t("Cancelar", "Cancel")}</Button><Button className="primary" icon={Save}>{t("Salvar", "Save")}</Button></footer></form>}
    <LoadState state={state}>{(rows) => <div className="rows">{rows.map((procedure) => <div className="list-row" key={procedure.id}><span><strong>{procedure.name}</strong><small>{procedure.category} · {procedure.default_duration} min · {procedure.followup_days ? `${procedure.followup_days} dias` : t("sem retorno padrão", "no default follow-up")}</small></span><Status value={procedure.active ? "ativo" : "inativo"} /></div>)}{!rows.length && <Empty icon={ClipboardList}>{t("Nenhum procedimento configurado.", "No procedures configured.")}</Empty>}</div>}</LoadState>
  </section>;
}
function SettingsView({ member, notify }) {
  const t = useT(),
    [tab, setTab] = useState("profile"),
    [add, setAdd] = useState(false),
    [link, setLink] = useState(""),
    [busy, setBusy] = useState(false),
    [recoveryFile, setRecoveryFile] = useState([]),
    [recovered, setRecovered] = useState(null),
    [pass, setPass] = useState("");
  const state = useLoad(
    () => checked(db.from("memberships").select("*").order("name")),
    [],
  );
  const usage = useLoad(
    () =>
      member.role === "proprietario"
        ? checked(db.rpc("storage_usage"))
        : Promise.resolve(null),
    [member.role],
  );
  const audit = useLoad(
    () =>
      member.role === "proprietario" && tab === "audit"
        ? checked(
            db
              .from("audit_events")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(100),
          )
        : Promise.resolve([]),
    [tab],
  );
  const change = async (user, values) => {
    setBusy(true);
    try {
      const result = await invoke("staff", {
        action: "update",
        user_id: user.user_id,
        role: user.role,
        status: user.status,
        ...values,
      });
      state.refresh();
      notify(t("Acesso atualizado", "Access updated"));
    } catch {
      notify(
        t("Não foi possível alterar o acesso.", "Could not update access."),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHead title={t("Configurações", "Settings")} />
      <nav className="tabs">
        {[
          ["profile", t("Meu perfil", "My profile")],
          ...(member.role === "proprietario"
            ? [
                ["users", t("Usuários", "Users")],
                [
                  "storage",
                  t("Armazenamento e recuperação", "Storage & recovery"),
                ],
                ["procedures", t("Procedimentos", "Procedures")],
                ["audit", t("Auditoria", "Audit")],
              ]
            : []),
        ].map(([key, title]) => (
          <button
            key={key}
            className={tab === key ? "selected" : ""}
            onClick={() => setTab(key)}
          >
            {title}
          </button>
        ))}
      </nav>
      {tab === "profile" && (
        <section className="detail-section">
          <h2>{member.name || member.email}</h2>
          <p>{member.email}</p>
          <p>{label(member.role, t)}</p>
          <p>
            {member.profession} · {member.council} {member.registration}{" "}
            {member.state}
          </p>
          <Status value={member.status} />
        </section>
      )}
      {tab === "users" && (
        <>
          <div className="toolbar">
            <h2>{t("Equipe autorizada", "Authorized team")}</h2>
            <Button
              icon={Plus}
              className="primary"
              onClick={() => setAdd(true)}
            >
              {t("Adicionar usuário", "Add user")}
            </Button>
          </div>
          <LoadState state={state}>
            {(rows) => (
              <>
                {rows.map((user) => (
                  <div className="staff-row" key={user.id}>
                    <span className="avatar">{initials(user.name)}</span>
                    <span>
                      <strong>{user.name || user.email}</strong>
                      <small>{user.email}</small>
                      <small>
                        {user.profession} · {user.council} {user.registration}
                      </small>
                    </span>
                    {user.role === "proprietario" ? (
                      <Status value="proprietario" />
                    ) : (
                      <>
                        <Field
                          title={t("Acesso", "Access")}
                          value={user.role}
                          disabled={busy}
                          onChange={(role) => change(user, { role })}
                          options={[
                            "profissional",
                            "recepcao",
                            "leitura",
                          ].map((s) => ({ value: s, label: label(s, t) }))}
                        />
                        <Field
                          title={t("Situação", "Status")}
                          value={user.status}
                          disabled={busy}
                          onChange={(status) => change(user, { status })}
                          options={[
                            "convidado",
                            "ativo",
                            "inativo",
                            "suspenso",
                          ].map((s) => ({ value: s, label: label(s, t) }))}
                        />
                        <Button
                          icon={LinkIcon}
                          disabled={
                            busy || !["ativo", "convidado"].includes(user.status)
                          }
                          onClick={async () => {
                            setBusy(true);
                            try {
                              const result = await invoke("staff", {
                                action: "recovery",
                                user_id: user.user_id,
                              });
                              setLink(result.link);
                            } catch {
                              notify(
                                t(
                                  "Não foi possível criar o link.",
                                  "Could not create the link.",
                                ),
                              );
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          {t("Novo link", "New link")}
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </>
            )}
          </LoadState>
        </>
      )}
      {tab === "storage" && (
        <>
          <LoadState state={usage}>
            {(u) =>
              u && (
                <section className="detail-section">
                  <h2>{t("Arquivos privados", "Private files")}</h2>
                  <p>
                    {(u.bytes / 1000000).toFixed(1)} / 800 MB · {u.files}{" "}
                    {t("arquivos", "files")}
                  </p>
                  <progress value={u.bytes} max={800000000} />
                  <p>
                    {t("Banco de dados", "Database")}:{" "}
                    {(u.database_bytes / 1000000).toFixed(1)} / 500 MB
                  </p>
                  {u.bytes > 640000000 && (
                    <p className="notice">
                      {t(
                        "Armazenamento próximo do limite. Revise o plano de continuidade.",
                        "Storage is approaching the limit. Review continuity planning.",
                      )}
                    </p>
                  )}
                </section>
              )
            }
          </LoadState>
          <section className="detail-section">
            <h2>{t("Abrir backup criptografado", "Open encrypted backup")}</h2>
            <label className="field">
              <span>{t("Arquivo de backup", "Backup file")}</span>
              <input
                type="file"
                accept="application/json,.json"
                multiple
                onChange={(e) => setRecoveryFile([...e.target.files])}
              />
            </label>
            <Field
              title={t("Frase de recuperação", "Recovery passphrase")}
              type="password"
              value={pass}
              onChange={setPass}
            />
            <Button
              icon={LockKeyhole}
              disabled={!recoveryFile.length || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const result = await decryptPackets(
                    await Promise.all(recoveryFile.map(async file=>JSON.parse(await file.text()))),
                    pass,
                  );
                  if (result.format !== "sofiati-patient-v1")
                    throw Error("format");
                  setRecovered(result);
                  notify(
                    t(
                      "Backup aberto. Nenhum registro foi alterado.",
                      "Backup opened. No records were changed.",
                    ),
                  );
                } catch {
                  notify(
                    t(
                      "Não foi possível abrir. Verifique o arquivo e a frase.",
                      "Could not open. Check the file and passphrase.",
                    ),
                  );
                } finally {
                  setPass("");
                  setBusy(false);
                }
              }}
            >
              {t("Abrir relatório", "Open report")}
            </Button>
            {recovered && <div className="recovered-files"><h3>{t('Backup recuperado','Recovered backup')}</h3><Button icon={Printer} onClick={()=>printRecord(recovered,t)}>{t('Abrir relatório','Open report')}</Button>{recovered.files.map(file=><div key={file.id} className="document-row"><span>{recovered.tables.documents.find(d=>d.id===file.id)?.name || file.id}</span><Button icon={Download} onClick={()=>download(new Blob([Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0))],{type:file.mime_type}),recovered.tables.documents.find(d=>d.id===file.id)?.name || file.id)}>{t('Baixar','Download')}</Button></div>)}</div>}
          </section>
        </>
      )}
      {tab === "procedures" && <ProcedureCatalog notify={notify} />}
      {tab === "audit" && (
        <LoadState state={audit}>
          {(rows) => (
            <div className="audit-list">
              {rows.map((row) => (
                <div key={row.id} className="audit-row">
                  <time>{date(row.created_at, true)}</time>
                  <span>{auditLabel(row.action, t)}</span>
                  <span>{entityLabel(row.entity_type, t)}</span>
                  <code>{row.entity_id?.slice(0, 8)}</code>
                </div>
              ))}
              {!rows.length && (
                <Empty icon={History}>{t("Nenhum evento", "No events")}</Empty>
              )}
            </div>
          )}
        </LoadState>
      )}
      {add && (
        <InviteForm
          close={() => setAdd(false)}
          notify={notify}
          done={(result) => {
            setAdd(false);
            setLink(result.link);
            state.refresh();
          }}
        />
      )}
      {link && (
        <Dialog
          title={t("Ativação de acesso", "Access activation")}
          close={() => setLink("")}
        >
          <p>
            {t(
              "Compartilhe este link de uso único em um canal privado com a pessoa autorizada.",
              "Share this one-time link privately with the authorized person.",
            )}
          </p>
          <Field
            title={t("Link de ativação", "Activation link")}
            value={link}
            onChange={() => {}}
            readOnly
          />
          <Button
            icon={LinkIcon}
            className="primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                notify(t("Link copiado", "Link copied"));
              } catch {
                notify(
                  t(
                    "Selecione o link para copiar.",
                    "Select the link to copy.",
                  ),
                );
              }
            }}
          >
            {t("Copiar link", "Copy link")}
          </Button>
        </Dialog>
      )}
    </>
  );
}
const entityLabel = (type, t) =>
  ({
    patients: t("Paciente", "Patient"),
    entries: t("Registro clínico", "Clinical record"),
    memberships: t("Usuário", "User"),
    documents: t("Documento", "Document"),
    appointments: t("Agendamento", "Appointment"),
    tasks: t("Tarefa", "Task"),
    enquiries: t("Pré-cadastro", "Enquiry"),
    communications: t("Comunicação", "Communication"),
    admin_notes: t("Anotação administrativa", "Administrative note"),
    document_links: t("Anexo", "Attachment"),
  })[type] || type;
const auditLabel = (action, t) =>
  ({
    insert: t("Criado", "Created"),
    update: t("Atualizado", "Updated"),
    invite: t("Convite criado", "Invitation created"),
    recovery_link: t("Link de recuperação", "Recovery link"),
    access_changed: t("Acesso alterado", "Access changed"),
    patient_open: t("Prontuário aberto", "Record opened"),
    patient_export: t("Prontuário exportado", "Record exported"),
    document_download: t("Documento baixado", "Document downloaded"),
    upload: t("Arquivo enviado", "File uploaded"),
  })[action] || action;
function InviteForm({ close, done, notify }) {
  const t = useT(),
    [form, setForm] = useState({ role: "profissional" }),
    [busy, setBusy] = useState(false);
  return (
    <Dialog
      title={t("Adicionar usuário", "Add user")}
      close={() => !busy && close()}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const result = await invoke("staff", { action: "convite", ...form });
            done(result);
          } catch {
            notify(
              t(
                "Não foi possível criar o convite. Confira se o email já está cadastrado.",
                "Could not create invitation. Check whether the email is already registered.",
              ),
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          {[
            ["name", "Nome", "Name"],
            ["email", "Email", "Email"],
            ["profession", "Profissão", "Profession"],
            ["council", "Conselho", "Council"],
            ["registration", "Registro", "Registration"],
            ["state", "UF", "State"],
            ["specialty", "Especialidade", "Specialty"],
          ].map(([key, pt, en]) => (
            <Field
              key={key}
              title={t(pt, en)}
              value={form[key]}
              type={key === "email" ? "email" : "text"}
              required={key === "email"}
              onChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
            />
          ))}
        </div>
        <Field
          title={t("Nível de acesso", "Access level")}
          value={form.role}
          onChange={(v) => setForm((f) => ({ ...f, role: v }))}
          options={["profissional", "recepcao", "leitura"].map((s) => ({
            value: s,
            label: label(s, t),
          }))}
        />
        <footer className="form-footer">
          <Button type="button" onClick={close}>
            {t("Cancelar", "Cancel")}
          </Button>
          <Button icon={Plus} className="primary" disabled={busy}>
            {busy
              ? t("Criando...", "Creating...")
              : t("Criar convite", "Create invitation")}
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
function PreRegistration({ languageControl }) {
  const t = useT(),
    [form, setForm] = useState({ preferred_contact: "whatsapp" }),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false),
    [error, setError] = useState(""),
    [token, setToken] = useState("");
  const widget = useRef();
  useEffect(() => {
    const key = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!key) return;
    let id;
    const init = () => {
      id = window.turnstile.render(widget.current, {
        sitekey: key,
        action: "preregister",
        callback: setToken,
        "expired-callback": () => setToken(""),
      });
    };
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = init;
    document.head.append(script);
    return () => {
      if (id !== undefined) window.turnstile?.remove(id);
      script.remove();
    };
  }, []);
  return (
    <div className="auth-screen">
      <header className="auth-top">
        <a href="https://francielesofiati.com">Franciele Sofiati</a>
        {languageControl}
      </header>
      <main className="preregister">
        <img className="auth-logo" src={LOGO} alt="Franciele Sofiati" />
        <p className="eyebrow">{t("Primeiro contato", "First contact")}</p>
        <h1>{t("Pré-cadastro", "Pre-registration")}</h1>
        {success ? (
          <div className="success-panel" role="status">
            <Check size={30} />
            <h2>{t("Recebemos seu contato", "We received your enquiry")}</h2>
            <p>
              {t(
                "Nossa equipe entrará em contato.",
                "Our team will contact you.",
              )}
            </p>
            <a href="https://francielesofiati.com">
              {t("Voltar ao site", "Back to website")}
            </a>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await invoke("intake", {
                  ...form,
                  token,
                  privacy: form.privacy === true,
                });
                setSuccess(true);
              } catch {
                setError(
                  t(
                    "Não foi possível enviar. Tente novamente ou entre em contato com a clínica.",
                    "Could not submit. Try again or contact the clinic.",
                  ),
                );
                setToken("");
                window.turnstile?.reset();
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field
              title={t("Nome", "Name")}
              value={form.full_name}
              onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
              maxLength={200}
            />
            <Field
              title={t("Telefone / WhatsApp", "Phone / WhatsApp")}
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              maxLength={20}
            />
            <Field
              title="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              maxLength={254}
            />
            <Field
              title={t("Prefiro contato por", "Preferred contact")}
              value={form.preferred_contact}
              onChange={(v) => setForm((f) => ({ ...f, preferred_contact: v }))}
              options={[
                { value: "whatsapp", label: "WhatsApp" },
                { value: "phone", label: t("Telefone", "Phone") },
                { value: "email", label: "Email" },
              ]}
            />
            <label className="honeypot" aria-hidden="true">
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, website: e.target.value }))
                }
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.privacy || false}
                required
                onChange={(e) =>
                  setForm((f) => ({ ...f, privacy: e.target.checked }))
                }
              />
              <span>
                {t(
                  "Autorizo a clínica a usar estes dados para responder ao meu contato.",
                  "I authorize the clinic to use these details to respond to my enquiry.",
                )}
              </span>
            </label>
            <details className="privacy">
              <summary>{t("Privacidade", "Privacy")}</summary>
              <p>
                {t(
                  "Responsável: Franciele Sofiati, Londrina, PR. A equipe autorizada usa seus dados somente para contato e organização do atendimento. Para acessar, corrigir ou solicitar exclusão do pré-cadastro: suportesofiati@gmail.com. Não envie informações de saúde neste formulário.",
                  "Controller: Franciele Sofiati, Londrina, PR. Authorized staff use your details for contact and appointment administration. To access, correct or request deletion of your enquiry: suportesofiati@gmail.com. Do not submit health information in this form.",
                )}
              </p>
            </details>
            <div ref={widget} />
            {!import.meta.env.VITE_TURNSTILE_SITE_KEY && (
              <p className="notice">
                {t(
                  "Pré-cadastro temporariamente indisponível. Entre em contato com a clínica.",
                  "Pre-registration is temporarily unavailable. Please contact the clinic.",
                )}
              </p>
            )}
            {error && (
              <p className="notice error" role="alerta">
                {error}
              </p>
            )}
            <Button
              icon={ArrowRight}
              className="primary full"
              disabled={busy || !token}
            >
              {busy
                ? t("Enviando...", "Sending...")
                : t("Enviar pré-cadastro", "Submit enquiry")}
            </Button>
          </form>
        )}
      </main>
      <footer className="auth-footer">Franciele Sofiati · Londrina, PR</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
