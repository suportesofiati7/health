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
  UserRoundPlus,
  Syringe,
  RotateCcw,
  TriangleAlert,
  Send,
  History,
  Link as LinkIcon,
  Moon,
  Sun,
  Cake,
  Pencil,
  ExternalLink,
  WalletCards,
  Receipt,
  Upload,
  Camera,
  Trash2,
  CheckCircle2,
  Phone,
  CalendarPlus,
  Sparkles,
  Stethoscope,
  ListChecks,
  List,
  MoreHorizontal,
  SlidersHorizontal,
  Repeat2,
  DoorOpen,
  Bell,
  UserCheck,
  CheckCheck,
  ClipboardCheck,
  Keyboard,
  ShieldAlert,
  FileDown,
  EyeOff,
  Archive,
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
  whatsappWeb,
  safeSearch,
  allRows,
  portalRequest,
} from "./lib";
import { encryptPackets, decryptPackets, fileBase64, download } from "./crypto";
import { Language, useT, label } from "./i18n";
import "./style.css";
import FinanceiroRebuilt from "./FinanceiroRebuilt";
import { documentEscape, openDocument, receiptDocumentHTML, reportDocumentHTML } from "./documentSystem";
// App chrome and generated documents share the same clinic brand source.
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
function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const password = type === "password";
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
        <span className={password ? "field-input-wrap has-password-toggle" : "field-input-wrap"}>
          <input
            name={name}
            type={password && passwordVisible ? "text" : type}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          />
          {password && <button type="button" className="password-toggle" aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={passwordVisible} onClick={() => setPasswordVisible((visible) => !visible)}>{passwordVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button>}
        </span>
      )}
    </label>
  );
}
function usePrivateImage(bucket, path) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let live = true;
    let objectUrl = "";
    setUrl("");
    if (!path) return () => { live = false; };
    checked(db.storage.from(bucket).download(path))
      .then((blob) => {
        if (!live) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => { if (live) setUrl(""); });
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [bucket, path]);
  return url;
}
async function openPrivateImage(bucket, path) {
  const popup = window.open("about:blank", "_blank", "noopener,noreferrer");
  if (!popup) throw Error("popup_blocked");
  try {
    const blob = await checked(db.storage.from(bucket).download(path));
    const url = URL.createObjectURL(blob);
    popup.document.open("text/html", "replace");
    popup.document.write(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Franciele Sofiati · Foto</title><style>html,body{margin:0;min-height:100%;background:#1d3026}body{display:grid;place-items:center;padding:24px;box-sizing:border-box}img{max-width:100%;max-height:calc(100vh - 48px);object-fit:contain;background:#fff;border-radius:8px;box-shadow:0 12px 40px #0008}</style></head><body><img src="${url}" alt="Fotografia clínica"></body></html>`);
    popup.document.close();
    popup.focus();
    popup.addEventListener("beforeunload", () => URL.revokeObjectURL(url), { once: true });
  } catch (error) {
    popup.close();
    throw error;
  }
}
function Avatar({ person, className = "avatar", size = 40, onReplace }) {
  const t = useT(), url = usePrivateImage("profile-photos", person?.avatar_path);
  const name = person?.preferred_name || person?.name || person?.full_name || person?.email || "";
  return <span className={className} style={{ width: size, height: size }} aria-label={name || t("Pessoa", "Person")} onContextMenu={(event) => { if (onReplace) { event.preventDefault(); onReplace(); } }} title={onReplace ? t("Clique com o botão direito para substituir a imagem", "Right-click to replace this image") : undefined}>
    {url ? <img src={url} alt="" /> : initials(name)}
  </span>;
}
function PhotoPicker({ value, onChange, hasPhoto = false, onRemove, title }) {
  const t = useT(), video = useRef(null), stream = useRef(null), [camera, setCamera] = useState(false), [videoReady, setVideoReady] = useState(false), [cameraError, setCameraError] = useState(""), [preview, setPreview] = useState("");
  useEffect(() => { if (!value) { setPreview(""); return undefined; } const url = URL.createObjectURL(value); setPreview(url); return () => URL.revokeObjectURL(url); }, [value]);
  const stop = () => { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; setCamera(false); };
  useEffect(() => () => stop(), []);
  useEffect(() => { if (camera && video.current && stream.current) { video.current.srcObject = stream.current; video.current.play().catch(() => {}); } }, [camera]);
  const openCamera = async () => {
    setCameraError(""); setVideoReady(false);
    try { if (!navigator.mediaDevices?.getUserMedia) throw Error("secure_context"); stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); setCamera(true); }
    catch { setCameraError(t("A câmera precisa de permissão e de uma conexão HTTPS (ou localhost). Você também pode usar o botão de imagem abaixo.", "Camera access requires permission and HTTPS (or localhost). You can also use the image button below.")); }
  };
  const capture = () => { if (!videoReady || !video.current?.videoWidth) return; const canvas = document.createElement("canvas"); canvas.width = video.current.videoWidth; canvas.height = video.current.videoHeight; canvas.getContext("2d").drawImage(video.current, 0, 0); canvas.toBlob((blob) => { if (blob) onChange(new File([blob], "profile-photo.jpg", { type: "image/jpeg" })); stop(); }, "image/jpeg", .9); };
  return <div className="photo-picker">
    <label className="field"><span>{title || t("Foto do perfil", "Profile photo")}</span><input type="file" accept="image/*" capture="user" onChange={(e) => { setCameraError(""); onChange(e.target.files[0] || null); }} /></label>
    {(preview || value) && <div className="photo-picker-preview"><img src={preview} alt={t("Pré-visualização da foto selecionada", "Preview of selected photo")} /><div><strong>{t("Pré-visualização", "Preview")}</strong><small>{value?.name || "photo"}</small></div></div>}
    <div className="photo-picker-actions"><Button type="button" icon={Camera} onClick={openCamera}>{t("Usar câmera", "Use camera")}</Button>{(value || hasPhoto) && <Button type="button" icon={Trash2} onClick={() => onRemove ? onRemove() : onChange(null)}>{t("Remover foto", "Remove photo")}</Button>}</div>
    {cameraError && <p className="notice error">{cameraError}</p>}
    {camera && <div className="camera-capture"><video ref={video} playsInline muted onLoadedMetadata={() => setVideoReady(true)} /><Button type="button" className="primary" disabled={!videoReady} icon={Camera} onClick={capture}>{videoReady ? t("Capturar", "Capture") : t("Preparando câmera...", "Preparing camera...")}</Button><Button type="button" onClick={stop}>{t("Cancelar", "Cancel")}</Button></div>}
  </div>;
}
async function saveProfilePhoto(table, id, file, userId, oldPath) {
  if (!file) return null;
  if (!file.type?.startsWith("image/")) throw Error("photo_type");
  let upload = file;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5242880) {
    const bitmap = await createImageBitmap(file), canvas = document.createElement("canvas"), scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale)); canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", .9));
    if (!blob || blob.size > 5242880) throw Error("photo_size");
    upload = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
  }
  const path = `${ORG}/${table === "patients" ? "patient" : (userId || id)}/${crypto.randomUUID()}.${upload.type.split("/")[1]}`;
  await checked(db.storage.from("profile-photos").upload(path, upload, { upsert: false, contentType: upload.type }));
  await checked(db.from(table).update({ avatar_path: path }).eq("id", id));
  if (oldPath && oldPath !== path) await db.storage.from("profile-photos").remove([oldPath]);
  return path;
}
async function removeProfilePhoto(table, id, path) {
  if (path) await checked(db.storage.from("profile-photos").remove([path]));
  await checked(db.from(table).update({ avatar_path: null }).eq("id", id));
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
function PatientPortal({ languageControl, themeControl }) {
  const t = useT();
  const [cpf, setCpf] = useState(""), [password, setPassword] = useState(""), [newPassword, setNewPassword] = useState(""), [session, setSession] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const tokenKey = "sofiati-patient-portal-token";
  const apply = (data, token) => { if (token) sessionStorage.setItem(tokenKey, token); setSession({ ...data, token: token || session?.token }); };
  useEffect(() => { const token = sessionStorage.getItem(tokenKey); if (token) portalRequest({ action: "refresh" }, token).then((data) => apply(data, token)).catch(() => sessionStorage.removeItem(tokenKey)); }, []);
  const login = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { const data = await portalRequest({ action: "login", cpf, password }); apply(data, data.token); setPassword(""); } catch { setError(t("Não foi possível entrar. Verifique CPF e senha.", "Could not sign in. Check CPF and password.")); } finally { setBusy(false); } };
  const changePassword = async (event) => { event.preventDefault(); if (newPassword.length < 12) { setError(t("Use pelo menos 12 caracteres.", "Use at least 12 characters.")); return; } setBusy(true); try { await portalRequest({ action: "change_password", password: newPassword }, session.token); const data = await portalRequest({ action: "refresh" }, session.token); apply(data); setNewPassword(""); } catch { setError(t("Não foi possível alterar a senha.", "Could not change password.")); } finally { setBusy(false); } };
  const logout = async () => { try { if (session?.token) await portalRequest({ action: "logout" }, session.token); } catch {} sessionStorage.removeItem(tokenKey); setSession(null); };
  return <div className="auth-screen"><header className="auth-top"><a href="https://francielesofiati.com" target="_blank" rel="noopener noreferrer">Franciele Sofiati</a>{languageControl}</header><main className="auth-main"> <img className="auth-logo" src={LOGO} alt="Franciele Sofiati" /><p className="eyebrow">{t("Área do Paciente", "Patient Area")}</p>{!session ? <><h1>{t("Acesso seguro", "Secure access")}</h1><form onSubmit={login}><Field title="CPF" value={cpf} onChange={setCpf} inputMode="numeric" autoComplete="username" required /><Field title={t("Senha", "Password")} type="password" value={password} onChange={setPassword} autoComplete="current-password" required /><Button className="primary full" icon={LockKeyhole} disabled={busy}>{t("Entrar", "Sign in")}</Button></form></> : <><h1>{session.patient?.preferred_name || session.patient?.full_name}</h1><p>{t("Recursos disponibilizados pela clínica", "Resources shared by the clinic")}</p>{session.must_change_password && <form className="detail-section" onSubmit={changePassword}><h2>{t("Defina uma nova senha", "Set a new password")}</h2><Field title={t("Nova senha", "New password")} type="password" minLength={12} value={newPassword} onChange={setNewPassword} required /><Button className="primary" disabled={busy}>{t("Salvar senha", "Save password")}</Button></form>}<div className="document-list">{(session.resources || []).map((resource) => <div className="document-row" key={`${resource.type}-${resource.id}`}><span><strong>{label(resource.type, t)}{resource.name ? ` · ${resource.name}` : ""}</strong><small>{resource.description || resource.post_care || resource.area || resource.label || date(resource.starts_at, true)}</small></span>{resource.url && <a className="button" href={resource.url} target="_blank" rel="noopener noreferrer">{t("Abrir", "Open")}</a>}</div>)}{!session.resources?.length && <Empty icon={ShieldCheck}>{t("Ainda não há recursos compartilhados.", "No resources have been shared yet.")}</Empty>}</div><Button onClick={logout}>{t("Sair", "Sign out")}</Button></>}{error && <p className="notice error" role="alert">{error}</p>}</main><footer className="auth-footer">Franciele Sofiati · Londrina, PR</footer></div>;
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="fatal-error"><div><p className="eyebrow">Franciele Sofiati · Área Profissional</p><h1>{this.props.t("Não foi possível abrir esta tela", "This screen could not be opened")}</h1><p>{this.props.t("Atualize a página. Se o problema continuar, envie este código para o suporte:", "Refresh the page. If the problem continues, send this code to support:")}</p><code>{this.state.error?.message || "unknown_error"}</code><button className="primary" onClick={() => window.location.reload()}>{this.props.t("Recarregar", "Reload")}</button></div></div>;
  }
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
  const t = useT();
  return (
    <div className="public-intake-route">
      <header className="public-intake-route-head">
        <img src={LOGO} alt="Franciele Sofiati" />
        <span>{t("Formulário público", "Public form")}</span>
        {languageControl}
      </header>
      <main>
        <h1>{t("Formulário de cadastro e consentimentos", "Registration and consent form")}</h1>
        <p>{t("O formulário oficial está no site Franciele Sofiati. Esta rota é pública e não abre nenhuma área da clínica.", "The official form is hosted on the Franciele Sofiati website. This public route does not open any clinic workspace.")}</p>
        <a className="button primary" href="https://francielesofiati.com/formulario" target="_blank" rel="noopener noreferrer">{t("Abrir formulário", "Open form")}</a>
      </main>
    </div>
  );
}
function Clinic({ language, setLanguage }) {
  const t = useT();
  const [theme, setTheme] = useState(
    localStorage.getItem("sofiati-theme") ||
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );
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
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("sofiati-theme", theme);
  }, [theme]);
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
  const themeControl = (
    <Button
      icon={theme === "dark" ? Sun : Moon}
      className="icon theme-toggle"
      aria-label={theme === "dark" ? t("Usar tema claro", "Use light theme") : t("Usar tema escuro", "Use dark theme")}
      title={theme === "dark" ? t("Usar tema claro", "Use light theme") : t("Usar tema escuro", "Use dark theme")}
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
    />
  );
  if (["/patient", "/patient.html", "/paciente", "/paciente.html"].includes(location.pathname))
    return <PatientPortal languageControl={languageControl} themeControl={themeControl} />;
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
  const financeAllowed = member?.role === "proprietario" && member?.email?.toLowerCase() === "suportesofiati@gmail.com";
  const clinical = ["proprietario", "profissional"].includes(member?.role),
    writable = member?.role !== "leitura";
  const nav = [
    ["home", Home, t("Início", "Today")],
    ["communication", MessageCircle, t("Comunicação", "Communication")],
    ["patients", Users, t("Pacientes", "Patients")],
    ["enquiries", Inbox, t("Formulários", "Forms")],
    ["agenda", CalendarDays, t("Agenda", "Schedule")],
    ["tasks", ClipboardList, t("Tarefas", "Tasks")],
    ["reports", BarChart3, t("Relatórios", "Reports")],
    ...(financeAllowed ? [["finance", WalletCards, t("Financeiro", "Finance")]] : []),
    ["settings", Settings, t("Configurações", "Settings")],
  ];
  const common = {
    member,
    openPatient,
    navigate,
    setModal,
    notify,
    version,
    clinical,
    writable,
    financeAllowed,
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
          themeControl={themeControl}
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
                <Button
                  icon={theme === "dark" ? Sun : Moon}
                  className="icon theme-toggle"
                  aria-label={
                    theme === "dark"
                      ? t("Usar tema claro", "Use light theme")
                      : t("Usar tema escuro", "Use dark theme")
                  }
                  title={
                    theme === "dark"
                      ? t("Usar tema claro", "Use light theme")
                      : t("Usar tema escuro", "Use dark theme")
                  }
                  onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                />
                <Avatar person={member} className="user-avatar" size={38} onReplace={() => navigate("settings")} />
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
              {view === "communication" && <Communication {...common} />}
              {view === "patients" && <Patients {...common} />}
              {view === "patient" && patient && (
                <Patient
                  key={patient.id + ":" + version}
                  patient={patient}
                  {...common}
                />
              )}
              {view === "agenda" && <AgendaHub {...common} />}
              {view === "tasks" && <Tasks {...common} />}
              {view === "enquiries" && <Enquiries {...common} />}
              {view === "reports" && <Reports {...common} />}
              {view === "finance" && financeAllowed && <FinanceiroRebuilt {...common} />}
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
      {member && modal?.type === "patient-lifecycle" && (
        <PatientLifecycleDialog
          patient={modal.patient}
          member={member}
          close={() => setModal(null)}
          done={() => { setModal(null); navigate("patients"); setVersion((n) => n + 1); }}
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
      {member && modal?.type === "whatsapp" && (
        <WhatsappComposer
          appointment={modal.appointment}
          patient={modal.patient}
          close={() => setModal(null)}
          notify={notify}
        />
      )}
      {member && modal?.type === "communication" && (
        <CommunicationComposer
          {...modal}
          member={member}
          close={() => setModal(null)}
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
              {member && modal?.type === "master-intake" && (
                <MasterIntake
                  patient={modal.patient}
                  sourceIntake={modal.sourceIntake}
                  member={member}
                  close={() => setModal(null)}
                  done={() => setVersion((n) => n + 1)}
                  notify={notify}
                />
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
function Auth({ activation, onLogin, languageControl, themeControl, notify }) {
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
        <a href="https://francielesofiati.com" target="_blank" rel="noopener noreferrer">Franciele Sofiati</a>
        <div className="auth-tools">{languageControl}{themeControl}</div>
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
  navigate,
  setModal,
  version,
  writable,
  clinical,
}) {
  const t = useT(), today = localDay(), now = new Date();
  const state = useLoad(async () => {
    const optional = (query) => checked(query).catch(() => []);
    const nextWeek = shiftDay(today, 7);
    const [appointments, tasks, patients, enquiries, followups, adverseEvents, masterIntakes, entries, plans, procedures, audit, finance] = await Promise.all([
      optional(db.from("appointments").select("*,patients(*)").gte("starts_at", today + "T00:00:00-03:00").lt("starts_at", nextWeek + "T00:00:00-03:00").order("starts_at").limit(160)),
      optional(db.from("tasks").select("*,patients(*)").eq("status", "pendente").order("due_at").limit(80)),
      optional(db.from("patients").select("*").order("created_at", { ascending: false }).limit(6)),
      optional(db.from("public_intakes").select("id,full_name,status,created_at,submitted_at,patient_id").in("status", ["novo", "em_analise", "contatado", "aguardando"]).order("created_at", { ascending: false }).limit(30)),
      optional(db.from("follow_ups").select("id,patient_id,expected_on,status,notes,patients(*)").in("status", ["aguardando_agendamento", "vencido"]).order("expected_on").limit(30)),
      clinical ? optional(db.from("adverse_events").select("id,patient_id,description,status,followup_deadline,patients(*)").eq("status", "em_acompanhamento").order("followup_deadline").limit(20)) : [],
      optional(db.from("master_intakes").select("id,patient_id,status,missing_fields,updated_at,patients(*)").neq("status", "finalizado").limit(30)),
      clinical ? optional(db.from("entries").select("id,patient_id,kind,status,created_at").eq("status", "finalizado").limit(200)) : [],
      clinical ? optional(db.from("treatment_plans").select("id,patient_id,status,expected_followup,patients(*)").in("status", ["planejado", "em_andamento"]).limit(100)) : [],
      clinical ? optional(db.from("clinical_procedures").select("id,patient_id,status,followup_due,patients(*)").eq("status", "finalizado").limit(100)) : [],
      member?.role === "proprietario" ? optional(db.from("audit_events").select("id,action,entity_type,created_at").order("created_at", { ascending: false }).limit(6)) : [],
      member?.role === "proprietario" ? optional(db.from("financial_records").select("id,total_cents,status,due_on,patient_id,financial_payments(amount_cents,status)").neq("status", "cancelado").limit(100)) : [],
    ]);
    return { appointments, tasks, patients, enquiries, followups, adverseEvents, masterIntakes, entries, plans, procedures, audit, finance };
  }, [version, member?.role, clinical]);
  return (
    <>
      <PageHead
        eyebrow={new Intl.DateTimeFormat(t("pt-BR", "en-GB"), {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: "America/Sao_Paulo",
        }).format(new Date())}
        title="Franciele Sofiati"
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
        {({ appointments, tasks, patients, enquiries, followups, adverseEvents, masterIntakes, entries, plans, procedures, audit, finance }) => {
          const todayAppointments = appointments.filter((a) => validDateValue(a.starts_at) && localDay(a.starts_at) === today);
          const homePatients = patients.length ? patients : appointments.map((a) => a.patients).filter(Boolean).filter((p, index, rows) => rows.findIndex((item) => item.id === p.id) === index);
          const activeAppointments = todayAppointments.filter((a) => !["cancelado", "reagendado"].includes(a.status));
          const checkedIn = todayAppointments.filter((a) => ["aguardando", "em_atendimento"].includes(a.status));
          const pendingTasks = tasks.filter((task) => new Date(task.due_at) <= new Date(`${today}T23:59:59-03:00`));
          const attention = [
            ...pendingTasks.map((item) => ({ id: `task-${item.id}`, tone: item.priority === "alta" ? "urgent" : "task", title: item.title || t("Tarefa pendente", "Pending task"), detail: item.patients?.preferred_name || item.patients?.full_name || t("Clínica", "Clinic"), due: item.due_at, action: () => setModal({ type: "task", task: item }) })),
            ...enquiries.map((item) => ({ id: `intake-${item.id}`, tone: "intake", title: t("Pré-cadastro aguardando triagem", "Pre-registration awaiting review"), detail: item.full_name, due: item.created_at, action: () => setModal({ type: "enquiry", enquiry: item }) })),
            ...masterIntakes.map((item) => ({ id: `master-${item.id}`, tone: "intake", title: t("Intake incompleto", "Incomplete intake"), detail: item.patients?.preferred_name || item.patients?.full_name, due: item.updated_at, action: () => item.patients && openPatient(item.patients) })),
            ...followups.map((item) => ({ id: `follow-${item.id}`, tone: "clinical", title: t("Retorno clínico pendente", "Pending clinical follow-up"), detail: item.patients?.preferred_name || item.patients?.full_name, due: item.expected_on, action: () => item.patients && openPatient(item.patients) })),
            ...adverseEvents.map((item) => ({ id: `adverse-${item.id}`, tone: "urgent", title: t("Intercorrência em acompanhamento", "Adverse event under follow-up"), detail: item.patients?.preferred_name || item.patients?.full_name, due: item.followup_deadline, action: () => item.patients && openPatient(item.patients) })),
          ].sort((a, b) => new Date(a.due || 0) - new Date(b.due || 0)).slice(0, 8);
          const journey = [
            [t("Pré-cadastro", "Pre-registration"), enquiries.length],
            [t("Formulário", "Form"), masterIntakes.length],
            [t("Intake", "Intake"), masterIntakes.filter((i) => i.status === "em_revisao").length],
            [t("Consulta", "Visit"), appointments.filter((a) => a.status === "concluido").length],
            [t("Plano", "Plan"), plans.length],
            [t("Procedimento", "Procedure"), procedures.length],
            [t("Retorno", "Follow-up"), followups.length],
          ];
          const capacity = Array.from({ length: 7 }, (_, index) => { const day = shiftDay(today, index); const booked = appointments.filter((a) => validDateValue(a.starts_at) && localDay(a.starts_at) === day && !["cancelado", "reagendado"].includes(a.status)).length; return { day, booked, total: atNoon(day).getDay() === 6 ? 4 : 10 }; });
          const openBalance = (finance || []).reduce((sum, record) => sum + Math.max(0, Number(record.total_cents || 0) - (record.financial_payments || []).filter((payment) => payment.status === "recebido").reduce((paid, payment) => paid + Number(payment.amount_cents || 0), 0)), 0);
          return (
          <>
            <section className="home-hero"><div><p className="eyebrow">{t("Command center · hoje", "Command center · today")}</p><h2>{t("Seu dia, com clareza.", "Your day, at a glance.")}</h2><p>{date(today, true)} · {activeAppointments.length} {t("atendimentos ativos", "active visits")}</p></div><div className="home-hero-orbit"><strong>{checkedIn.length}</strong><span>{t("em fluxo", "in flow")}</span></div></section>
            <div className="home-metrics">
              <button onClick={() => navigate("agenda")}><span className="metric-icon metric-icon-sage"><CalendarDays size={17}/></span><strong>{activeAppointments.length}</strong><small>{t("agenda hoje", "today's schedule")}</small><i>{todayAppointments.filter((a) => a.status === "confirmado").length} {t("confirmados", "confirmed")}</i></button>
              <button onClick={() => navigate("agenda")}><span className="metric-icon metric-icon-rose"><UserCheck size={17}/></span><strong>{checkedIn.length}</strong><small>{t("aguardando / em atendimento", "waiting / in visit")}</small><i>{todayAppointments.filter((a) => a.status === "concluido").length} {t("concluídos", "completed")}</i></button>
              <button onClick={() => navigate("enquiries")}><span className="metric-icon metric-icon-gold"><ClipboardCheck size={17}/></span><strong>{enquiries.length + masterIntakes.length}</strong><small>{t("formulários e intakes", "forms and intakes")}</small><i>{enquiries.length} {t("pré-cadastros", "pre-registrations")}</i></button>
              <button onClick={() => navigate("tasks")}><span className="metric-icon metric-icon-pink"><ListChecks size={17}/></span><strong>{pendingTasks.length}</strong><small>{t("atenções abertas", "open attention")}</small><i>{pendingTasks.filter((x) => new Date(x.due_at) < now).length} {t("vencidas", "overdue")}</i></button>
              {member?.role === "proprietario" && <button onClick={() => navigate("finance")}><span className="metric-icon metric-icon-gold"><WalletCards size={17}/></span><strong>{money(openBalance / 100)}</strong><small>{t("lançamentos ativos", "active charges")}</small><i>{finance.length} {t("registros", "records")}</i></button>}
            </div>
            <div className="home-grid">
              <section className="home-panel home-agenda"><div className="section-heading"><div><p className="eyebrow">{t("Próximos passos", "Next steps")}</p><h2>{t("Agenda de hoje", "Today's schedule")}</h2></div><button className="text-action" onClick={() => navigate("agenda")}>{t("Abrir agenda", "Open schedule")} <ArrowRight size={15}/></button></div>{todayAppointments.slice(0, 6).map((a) => <AppointmentRow key={a.id} appointment={a} openPatient={openPatient} setModal={setModal} clinical={clinical}/>)}{!todayAppointments.length && <Empty icon={CalendarDays}>{t("Nenhum agendamento para hoje", "No appointments today")}</Empty>}</section>
              <section className="home-panel home-attention"><div className="section-heading"><div><p className="eyebrow">{t("Fila única", "Single queue")}</p><h2>{t("Precisa de atenção", "Needs attention")}</h2></div><span className="attention-count">{attention.length}</span></div>{attention.length ? attention.map((item) => <button className={`home-attention-row tone-${item.tone}`} key={item.id} onClick={item.action}><span className="attention-dot"/><span><strong>{item.title}</strong><small>{item.detail || t("Sem paciente vinculado", "No linked patient")} · {date(item.due, true)}</small></span><ChevronRight size={15}/></button>) : <Empty icon={CheckCircle2}>{t("Tudo em dia", "All caught up")}</Empty>}</section>
            </div>
            <section className="home-panel home-journey"><div className="section-heading"><div><p className="eyebrow">{t("Continuidade do cuidado", "Continuity of care")}</p><h2>{t("Jornada dos pacientes", "Patient journey")}</h2></div><button className="text-action" onClick={() => navigate("reports")}>{t("Ver detalhes", "View details")} <ArrowRight size={15}/></button></div><div className="journey-flow">{journey.map(([name, count], index) => <button key={name} onClick={() => navigate(index < 2 ? "enquiries" : index === 3 ? "agenda" : "tasks")}><span className={`journey-number journey-number-${index}`}>{count}</span><small>{name}</small>{index < journey.length - 1 && <ArrowRight size={14}/>}</button>)}</div></section>
            <div className="home-grid home-grid-bottom"><section className="home-panel home-capacity"><div className="section-heading"><div><p className="eyebrow">{t("Próximos 7 dias", "Next 7 days")}</p><h2>{t("Capacidade da agenda", "Schedule capacity")}</h2></div><span className="subtle">{capacity.reduce((sum, d) => sum + d.total - d.booked, 0)} {t("vagas estimadas", "estimated openings")}</span></div><div className="capacity-heatmap">{capacity.map((item) => <button key={item.day} title={`${date(item.day)} · ${item.booked}/${item.total}`} onClick={() => { navigate("agenda"); }}><small>{new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" }).format(atNoon(item.day)).replace(".", "")}</small><span style={{ "--fill": `${Math.min(100, (item.booked / item.total) * 100)}%` }}><i/></span><strong>{Math.max(0, item.total - item.booked)}</strong></button>)}</div></section><section className="home-panel home-recent"><div className="section-heading"><h2>{t("Atividade recente", "Recent activity")}</h2><History size={17}/></div>{member?.role === "proprietario" && audit.length ? audit.map((item) => <div className="home-activity" key={item.id}><span>{auditLabel(item.action, t)}</span><small>{entityLabel(item.entity_type, t)} · {date(item.created_at, true)}</small></div>) : homePatients.slice(0, 4).map((p) => <button className="home-activity home-activity-link" key={p.id} onClick={() => openPatient(p)}><Avatar person={p} size={28}/><span>{p.preferred_name || p.full_name}</span><small>{date(p.created_at, true)}</small></button>)}</section></div>
          </>
          );
        }}
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
const whatsappMessage = (phone, name = "") => {
  const base = whatsappWeb(phone);
  if (!base) return null;
  const text = `Olá${name ? `, ${name}` : ""}! Aqui é da clínica Franciele Sofiati. Podemos conversar sobre seu atendimento?`;
  return `${base}&text=${encodeURIComponent(text)}`;
};
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
    [showArchived, setShowArchived] = useState(false),
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
      .eq("status", showArchived ? "inativo" : "ativo")
      .order("full_name")
      .range(page * 20, page * 20 + 19);
    if (term)
      q = q.or(
        `full_name.ilike.%${term}%,cpf.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`,
      );
    return checked(q);
  }, [term, page, version, showArchived]);
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
        <Button
          type="button"
          icon={showArchived ? UserCheck : Archive}
          onClick={() => { setShowArchived((value) => !value); setPage(0); }}
        >
          {showArchived
            ? t("Ver pacientes ativos", "Show active patients")
            : t("Ver arquivados", "Show archived")}
        </Button>
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
                  <Avatar person={p} onReplace={() => writable && setModal({ type: "patient", patient: p })} />
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
                {showArchived
                  ? t("Nenhum paciente arquivado", "No archived patients")
                  : t("Nenhum paciente ativo encontrado", "No active patients found")}
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
function PatientLifecycleDialog({ patient, close, done, notify }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const archive = async () => {
    setBusy(true);
    try {
      await checked(db.rpc("archive_patient", { target_patient: patient.id, archived: patient.status !== "inativo" }));
      notify(patient.status === "inativo" ? t("Paciente reativado.", "Patient restored.") : t("Paciente arquivado.", "Patient archived."));
      done();
    } catch (error) { notify(error?.code === "not_authorized" ? t("Você não tem permissão para arquivar este paciente.", "You do not have permission to archive this patient.") : t("Não foi possível alterar o arquivo do paciente.", "Could not update the patient archive.")); }
    finally { setBusy(false); }
  };
  const permanentlyDelete = async () => {
    if (!confirm(t("Excluir este paciente permanentemente? Todos os registros e arquivos serão removidos.", "Permanently delete this patient? All records and files will be removed."))) return;
    setBusy(true);
    try {
      await checked(db.rpc("delete_patient", { target_patient: patient.id }));
      notify(t("Paciente excluído permanentemente.", "Patient permanently deleted."));
      done();
    } catch (error) {
      const reason = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
      console.error("delete_patient failed", error);
      notify(reason.includes("patient_has_payment")
        ? t("Este paciente tem pagamento registrado e só Franciele pode excluí-lo.", "This patient has a payment and only Franciele can delete them.")
        : reason.includes("function") || reason.includes("pgrst202")
          ? t("A exclusão ainda não está ativa no servidor. Aplique as migrações e publique novamente.", "Deletion is not active on the server yet. Apply the migrations and publish again.")
          : t(`Não foi possível excluir o paciente. ${error?.message || "Verifique sua permissão e tente novamente."}`, `Could not delete the patient. ${error?.message || "Check your permission and try again."}`));
    } finally { setBusy(false); }
  };
  return <Dialog title={t("Arquivo do paciente", "Patient record actions")} close={() => !busy && close()}>
    <p>{patient.preferred_name || patient.full_name}</p>
    <p className="notice">{t("Arquivar mantém o prontuário e permite restaurar depois. Excluir remove permanentemente os dados e arquivos.", "Archiving keeps the record and can be reversed. Deleting permanently removes data and files.")}</p>
    <footer className="form-footer">
      <Button type="button" disabled={busy} onClick={close}>{t("Cancelar", "Cancel")}</Button>
      <Button type="button" disabled={busy} icon={Archive} onClick={archive}>{patient.status === "inativo" ? t("Reativar", "Restore") : t("Arquivar", "Archive")}</Button>
      <Button type="button" disabled={busy} icon={Trash2} className="danger" onClick={permanentlyDelete}>{t("Excluir permanentemente", "Delete permanently")}</Button>
    </footer>
  </Dialog>;
}
function PatientForm({ patient, close, done, notify }) {
  const t = useT(),
    [form, setForm] = useState(patient || {}),
    [photoFile, setPhotoFile] = useState(null),
    [removePhoto, setRemovePhoto] = useState(false),
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
      const saved = await save("patients", values, patient);
      if (photoFile) await saveProfilePhoto("patients", saved.id, photoFile, undefined, patient?.avatar_path);
      else if (removePhoto && patient?.avatar_path) await removeProfilePhoto("patients", saved.id, patient.avatar_path);
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
        <div className="profile-photo-field">
          <Avatar person={form} className="avatar large" size={72} />
          <PhotoPicker value={photoFile} hasPhoto={!!form.avatar_path} onChange={(file) => { setRemovePhoto(false); setPhotoFile(file); }} onRemove={() => { setPhotoFile(null); setRemovePhoto(true); setForm((current) => ({ ...current, avatar_path: null })); }} />
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
                ["photos", t("Fotografia clínica", "Clinical photography")],
                ["plans", t("Planos", "Plans")],
                ["procedures", t("Procedimentos", "Procedures")],
                ["health", t("Saúde", "Health")],
                ["consents", t("Consentimentos", "Consents")],
                ["privacy", t("Privacidade / portal", "Privacy / portal")],
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
              <Avatar person={patient} className="avatar large" size={72} onReplace={() => writable && setModal({ type: "patient", patient })} />
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
                      href={whatsappMessage(patient.phone, patient.preferred_name || patient.full_name)}
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
                    icon={MessageCircle}
                    onClick={() => setModal({ type: "communication", patient })}
                  >
                    {t("Comunicar", "Communicate")}
                  </Button>
                )}
                {writable && (
                  <Button
                    icon={ClipboardCheck}
                    className="primary"
                    onClick={() => setModal({ type: "master-intake", patient })}
                  >
                    {t("Consulta inicial completa", "Master Intake")}
                  </Button>
                )}
                {writable && (
                  <Button
                    icon={CalendarDays}
                    onClick={() => setModal({ type: "appointment", patient })}
                  >
                    {t("Agendar", "Schedule")}
                  </Button>
                )}
                {writable && (
                  <Button
                    icon={Archive}
                    onClick={() => setModal({ type: "patient-lifecycle", patient })}
                  >
                    {t("Arquivo / excluir", "Archive / delete")}
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
                        icon={ExternalLink}
                        className="icon"
                        title={t("Abrir em nova aba", "Open in new tab")}
                        aria-label={t("Abrir em nova aba", "Open in new tab")}
                        onClick={async () => {
                          try {
                            const { data } = await checked(
                              db.storage
                                .from("patient-files")
                                .createSignedUrl(doc.path, 300),
                            );
                            if (!data?.signedUrl) throw Error("signed_url");
                            window.open(data.signedUrl, "_blank", "noopener,noreferrer");
                          } catch {
                            notify(t("Não foi possível abrir.", "Could not open."));
                          }
                        }}
                      />
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
            {tab === "plans" && clinical && <TreatmentPlans patient={patient} member={member} writable={writable} clinical={clinical} notify={notify} setModal={setModal} />}
            {tab === "photos" && clinical && <ClinicalPhotosPanel patient={patient} writable={writable} notify={notify} />}
            {tab === "procedures" && clinical && <ClinicalProcedurePanel patient={patient} member={member} writable={writable} notify={notify} />}
            {tab === "health" && clinical && <HealthHistoryPanel patient={patient} member={member} writable={writable} notify={notify} />}
            {tab === "consents" && clinical && <ConsentPanel patient={patient} member={member} writable={writable} notify={notify} />}
            {tab === "privacy" && <PrivacyPortalPanel patient={patient} member={member} writable={writable} notify={notify} />}
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
function TreatmentPlans({ patient, member, writable, clinical, notify, setModal }) {
  const t = useT();
  const blank = { title: "Plano de tratamento", objectives: "", areas: "", professional_notes: "", responsible_user: member.user_id, expected_followup: "", status: "planejado", procedure_id: "", sequence_no: 1, sessions: 1, item_area: "", item_notes: "" };
  const [form, setForm] = useState(blank), [busy, setBusy] = useState(false);
  const state = useLoad(async () => Promise.all([
    checked(db.from("treatment_plans").select("*,treatment_plan_items(*,procedures(*))").eq("patient_id", patient.id).order("created_at", { ascending: false })),
    checked(db.from("procedures").select("*").eq("active", true).order("name")),
  ]), [patient.id]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const savePlan = async (event) => { event.preventDefault(); setBusy(true); try {
    const plan = await checked(db.from("treatment_plans").insert({ organization_id: ORG, patient_id: patient.id, title: form.title, objectives: form.objectives, areas: form.areas, professional_notes: form.professional_notes, responsible_user: form.responsible_user || null, expected_followup: form.expected_followup || null, status: form.status, created_by: member.user_id }).select().single());
    if (form.procedure_id) await checked(db.from("treatment_plan_items").insert({ organization_id: ORG, plan_id: plan.id, procedure_id: form.procedure_id, sequence_no: Number(form.sequence_no), sessions: Number(form.sessions), area: form.item_area, notes: form.item_notes, created_by: member.user_id }));
    setForm(blank); state.refresh(); notify(t("Plano salvo", "Plan saved"));
  } catch { notify(t("Não foi possível salvar o plano. Verifique a migração clínica.", "Could not save the plan. Check the clinical migration.")); } finally { setBusy(false); } };
  const startProcedure = async (plan, item) => { try { await checked(db.from("clinical_procedures").insert({ organization_id: ORG, patient_id: patient.id, procedure_id: item.procedure_id, plan_id: plan.id, professional_id: member.user_id, area: item.area || "", observations: "", technique: "", post_care: "", status: "rascunho", created_by: member.user_id })); notify(t("Procedimento iniciado como rascunho; complete-o na aba Procedimentos.", "Procedure started as a draft; complete it in the Procedures tab.")); } catch { notify(t("Não foi possível iniciar o procedimento.", "Could not start the procedure.")); } };
  return <section className="detail-section"><div className="section-heading"><h2>{t("Planos de tratamento", "Treatment plans")}</h2></div>
    {writable && clinical && <form className="form-grid" onSubmit={savePlan}><Field title={t("Título", "Title")} value={form.title} onChange={(v) => set("title", v)} required wide /><Field title={t("Objetivos", "Objectives")} type="textarea" value={form.objectives} onChange={(v) => set("objectives", v)} wide /><Field title={t("Áreas de tratamento", "Treatment areas")} value={form.areas} onChange={(v) => set("areas", v)} /><Field title={t("Responsável", "Responsible professional")} value={form.responsible_user} onChange={(v) => set("responsible_user", v)} options={[{ value: member.user_id, label: member.name || member.email }]} /><Field title={t("Retorno esperado", "Expected follow-up")} type="date" value={form.expected_followup} onChange={(v) => set("expected_followup", v)} /><Field title={t("Status", "Status")} value={form.status} onChange={(v) => set("status", v)} options={["planejado", "em_andamento", "concluido", "suspenso", "cancelado"].map((v) => ({ value: v, label: label(v, t) }))} /><Field title={t("Procedimento planejado", "Planned procedure")} value={form.procedure_id} onChange={(v) => set("procedure_id", v)} options={[{ value: "", label: t("Selecionar", "Select") }, ...(state.data?.[1] || []).map((p) => ({ value: p.id, label: p.name }))]} /><Field title={t("Sequência", "Sequence")} type="number" min="1" value={form.sequence_no} onChange={(v) => set("sequence_no", v)} /><Field title={t("Sessões", "Sessions")} type="number" min="1" value={form.sessions} onChange={(v) => set("sessions", v)} /><Field title={t("Área do item", "Item area")} value={form.item_area} onChange={(v) => set("item_area", v)} /><Field title={t("Notas", "Notes")} type="textarea" value={form.item_notes} onChange={(v) => set("item_notes", v)} wide /><Field title={t("Notas profissionais", "Professional notes")} type="textarea" value={form.professional_notes} onChange={(v) => set("professional_notes", v)} wide /><Button className="primary" icon={Save} disabled={busy}>{busy ? t("Salvando...", "Saving...") : t("Criar plano", "Create plan")}</Button></form>}
    <LoadState state={state}>{([plans]) => plans.map((plan) => <article className="entry" key={plan.id}><div className="entry-head"><span><strong>{plan.title}</strong> · {date(plan.created_at)}</span><Status value={plan.status} /></div><p className="preserve">{plan.objectives || t("Sem objetivos registrados", "No objectives recorded")}</p><small>{plan.areas} · {plan.expected_followup ? `${t("Retorno", "Follow-up")}: ${date(plan.expected_followup)}` : ""}</small>{plan.treatment_plan_items?.map((item) => <div className="list-row" key={item.id}><span><strong>{item.sequence_no}. {item.procedures?.name}</strong><small>{item.area} · {item.sessions} {t("sessão(ões)", "session(s)")}</small></span>{clinical && writable && <Button icon={ArrowRight} onClick={() => startProcedure(plan, item)}>{t("Iniciar procedimento", "Start procedure")}</Button>}</div>)}</article>)}</LoadState>
  </section>;
}

function ClinicalProcedurePanel({ patient, member, writable, notify }) {
  const t = useT();
  const [form, setForm] = useState({ procedure_id: "", professional_id: member.user_id, appointment_id: "", plan_id: "", area: "", indication: "", technique: "", parameters: "{}", post_care: "", consent_status: "pendente", performed_at: localDateTime() }), [busy, setBusy] = useState(false), [usage, setUsage] = useState({ lot_id: "", quantity: "", unit: "" });
  const state = useLoad(async () => Promise.all([checked(db.from("procedures").select("*").eq("active", true).order("name")), checked(db.from("treatment_plans").select("id,title").eq("patient_id", patient.id).in("status", ["planejado", "em_andamento"])), checked(db.from("product_lots").select("*,products(name,unit,active)").order("expires_on"),), checked(db.from("devices").select("*").eq("active", true).order("name"))]), [patient.id]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selected = (state.data?.[0] || []).find((p) => p.id === form.procedure_id);
  const saveProcedure = async (event) => { event.preventDefault(); setBusy(true); try { const values = { organization_id: ORG, patient_id: patient.id, procedure_id: form.procedure_id, professional_id: form.professional_id, appointment_id: form.appointment_id || null, plan_id: form.plan_id || null, performed_at: toISO(form.performed_at), area: form.area, treatment_area: form.area, indication: form.indication, technique: form.technique, parameters: JSON.parse(form.parameters || "{}"), post_care: form.post_care, consent_status: form.consent_status, device_id: form.device_id || null, status: "finalizado", finalized_at: new Date().toISOString(), created_by: member.user_id }; const row = await checked(db.from("clinical_procedures").insert(values).select().single()); if (usage.lot_id) { const lot = (state.data?.[2] || []).find((item) => item.id === usage.lot_id); if (lot?.expires_on && lot.expires_on < localDay()) throw Error("expired"); await checked(db.from("product_usages").insert({ organization_id: ORG, clinical_procedure_id: row.id, lot_id: usage.lot_id, quantity: Number(usage.quantity) || null, unit: usage.unit, created_by: member.user_id })); } notify(t("Procedimento registrado", "Procedure recorded")); setForm((current) => ({ ...current, procedure_id: "", indication: "", technique: "", parameters: "{}", post_care: "", device_id: "" })); } catch (error) { notify(error.message === "expired" ? t("Lote expirado não pode ser usado em novo procedimento.", "An expired lot cannot be used in a new procedure.") : t("Não foi possível registrar. Verifique os campos e a migração clínica.", "Could not record. Check the fields and clinical migration.")); } finally { setBusy(false); } };
  return <section className="detail-section"><div className="section-heading"><h2>{t("Procedimentos realizados", "Performed procedures")}</h2></div>{writable && <form className="form-grid" onSubmit={saveProcedure}><Field title={t("Procedimento", "Procedure")} value={form.procedure_id} onChange={(v) => set("procedure_id", v)} options={[{ value: "", label: t("Selecionar procedimento", "Select procedure") }, ...(state.data?.[0] || []).map((p) => ({ value: p.id, label: p.name }))]} required /><Field title={t("Plano de tratamento", "Treatment plan")} value={form.plan_id} onChange={(v) => set("plan_id", v)} options={[{ value: "", label: t("Sem plano", "No plan") }, ...(state.data?.[1] || []).map((p) => ({ value: p.id, label: p.title }))]} /><Field title={t("Data e hora", "Date and time")} type="datetime-local" value={form.performed_at} onChange={(v) => set("performed_at", v)} /><Field title={t("Área", "Treatment area")} value={form.area} onChange={(v) => set("area", v)} /><Field title={t("Indicação", "Indication")} type="textarea" value={form.indication} onChange={(v) => set("indication", v)} /><Field title={t("Técnica", "Technique")} type="textarea" value={form.technique} onChange={(v) => set("technique", v)} /><Field title={t("Parâmetros do equipamento (JSON)", "Device parameters (JSON)")} type="textarea" value={form.parameters} onChange={(v) => set("parameters", v)} /><Field title={t("Consentimento", "Consent") } value={form.consent_status} onChange={(v) => set("consent_status", v)} options={["pendente", "aceito", "recusado", "nao_aplicavel"].map((v) => ({ value: v, label: v }))} /><Field title={t("Pós-cuidado", "Post-care guidance")} type="textarea" value={form.post_care || selected?.post_care || ""} onChange={(v) => set("post_care", v)} wide />{selected?.device_relevant && <Field title={t("Equipamento", "Device")} value={form.device_id || ""} onChange={(v) => set("device_id", v)} options={[{ value: "", label: t("Selecionar equipamento", "Select device") }, ...(state.data?.[3] || []).map((d) => ({ value: d.id, label: `${d.name} ${d.equipment_model || ""}` }))]} />}{(selected?.product_relevant || selected?.lot_required) && <><Field title={t("Produto/lote", "Product/lot")} value={usage.lot_id} onChange={(v) => setUsage((u) => ({ ...u, lot_id: v }))} options={[{ value: "", label: t("Selecionar lote", "Select lot") }, ...(state.data?.[2] || []).map((lot) => ({ value: lot.id, label: `${lot.products?.name || "Product"} · ${lot.lot} · ${lot.expires_on || t("sem validade", "no expiry")}` }))]} required={!!selected?.lot_required} /><Field title={t("Quantidade", "Quantity")} type="number" min="0" step="0.01" value={usage.quantity} onChange={(v) => setUsage((u) => ({ ...u, quantity: v }))} /><Field title={t("Unidade", "Unit")} value={usage.unit} onChange={(v) => setUsage((u) => ({ ...u, unit: v }))} /></>}<Button className="primary" icon={Save} disabled={busy || !form.procedure_id}>{busy ? t("Salvando...", "Saving...") : t("Finalizar procedimento", "Finalize procedure")}</Button></form>}</section>;
}

function HealthHistoryPanel({ patient, member, writable, notify }) {
  const t = useT(); const blank = { allergies: "", medications: "", conditions: "", surgeries: "", aesthetic_history: "", dermatological_history: "", healing_history: "", active_infection: "", pregnancy_breastfeeding: "", habits: "", other_notes: "" }; const [form, setForm] = useState(blank), [busy, setBusy] = useState(false); const state = useLoad(() => checked(db.from("patient_health_history").select("*").eq("patient_id", patient.id).order("created_at", { ascending: false }).limit(20)), [patient.id]); const set = (key, value) => setForm((current) => ({ ...current, [key]: value })); const saveHistory = async (e) => { e.preventDefault(); setBusy(true); try { await checked(db.from("patient_health_history").insert({ organization_id: ORG, patient_id: patient.id, ...form, created_by: member.user_id })); setForm(blank); state.refresh(); notify(t("Histórico de saúde salvo como nova versão", "Health history saved as a new version")); } catch { notify(t("Não foi possível salvar o histórico.", "Could not save health history.")); } finally { setBusy(false); } }; return <section className="detail-section"><h2>{t("Histórico de saúde", "Health history")}</h2>{writable && <form className="form-grid" onSubmit={saveHistory}>{Object.entries({ allergies: ["Alergias", "Allergies"], medications: ["Medicamentos", "Medications"], conditions: ["Condições relevantes", "Relevant conditions"], surgeries: ["Cirurgias", "Surgeries"], aesthetic_history: ["Procedimentos estéticos anteriores", "Previous aesthetic procedures"], dermatological_history: ["Histórico dermatológico", "Dermatological history"], healing_history: ["Cicatrização/queloide", "Healing/keloid history"], active_infection: ["Infecção/lesão ativa", "Active infection/lesion"], pregnancy_breastfeeding: ["Gestação/amamentação", "Pregnancy/breastfeeding"], habits: ["Hábitos/lifestyle", "Habits/lifestyle"], other_notes: ["Outras informações", "Other information"] }).map(([key, titles]) => <Field key={key} title={t(...titles)} type="textarea" value={form[key]} onChange={(v) => set(key, v)} />)}<Button className="primary" icon={Save} disabled={busy}>{t("Salvar versão", "Save version")}</Button></form>}<LoadState state={state}>{(rows) => rows.map((row) => <details key={row.id}><summary>{date(row.created_at, true)}</summary><p className="preserve">{Object.entries(row).filter(([key, value]) => value && !["id", "organization_id", "patient_id", "created_by", "created_at"].includes(key)).map(([key, value]) => `${key}: ${value}`).join("\n")}</p></details>)}</LoadState></section>;
}

function ConsentPanel({ patient, member, writable, notify }) { const t = useT(); const [form, setForm] = useState({ kind: "procedimento", template_version: "2026-09-14", language: "pt-BR", status: "pendente", method: "presencial", source: "management" }); const state = useLoad(() => checked(db.from("consents").select("*").eq("patient_id", patient.id).order("created_at", { ascending: false })), [patient.id]); const set = (key, value) => setForm((c) => ({ ...c, [key]: value })); const submit = async (e) => { e.preventDefault(); try { await checked(db.from("consents").insert({ organization_id: ORG, patient_id: patient.id, ...form, accepted_at: form.status === "aceito" ? new Date().toISOString() : null, created_by: member.user_id })); state.refresh(); notify(t("Consentimento salvo", "Consent saved")); } catch { notify(t("Não foi possível salvar o consentimento.", "Could not save consent.")); } }; return <section className="detail-section"><h2>{t("Consentimentos estruturados", "Structured consents")}</h2>{writable && <form className="form-grid" onSubmit={submit}><Field title={t("Tipo", "Type")} value={form.kind} onChange={(v) => set("kind", v)} options={["procedimento", "privacidade", "fotografia_clinica", "publicacao_marketing", "comunicacao", "reserva"].map((v) => ({ value: v, label: label(v, t) }))} /><Field title={t("Versão do termo", "Template version")} value={form.template_version} onChange={(v) => set("template_version", v)} /><Field title={t("Idioma", "Language")} value={form.language} onChange={(v) => set("language", v)} options={["pt-BR", "en"].map((v) => ({ value: v, label: v }))} /><Field title={t("Status", "Status")} value={form.status} onChange={(v) => set("status", v)} options={["pendente", "aceito", "recusado", "revogado"].map((v) => ({ value: v, label: v }))} /><Field title={t("Método", "Method")} value={form.method} onChange={(v) => set("method", v)} /><Button className="primary" icon={Save}>{t("Salvar consentimento", "Save consent")}</Button></form>}<LoadState state={state}>{(rows) => rows.map((row) => <div className="list-row" key={row.id}><span><strong>{label(row.kind, t)}</strong><small>{row.template_version} · {row.language} · {date(row.created_at, true)}</small></span><Status value={row.status} /></div>)}</LoadState></section>; }

function PrivacyPortalPanel({ patient, member, writable, notify }) { const t = useT(); const [request, setRequest] = useState({ request_type: "acesso", status: "recebida", notes: "" }); const [share, setShare] = useState({ resource_type: "post_care", resource_id: "" }); const requests = useLoad(() => checked(db.from("privacy_requests").select("*").eq("patient_id", patient.id).order("created_at", { ascending: false })), [patient.id]); const shares = useLoad(() => checked(db.from("patient_portal_shares").select("*").eq("patient_id", patient.id).order("shared_at", { ascending: false })), [patient.id]); const saveRequest = async (e) => { e.preventDefault(); try { await checked(db.from("privacy_requests").insert({ organization_id: ORG, patient_id: patient.id, ...request, responsible_user: member.user_id, created_by: member.user_id })); requests.refresh(); notify(t("Solicitação registrada", "Request recorded")); } catch { notify(t("Não foi possível registrar a solicitação.", "Could not record the request.")); } }; const createShare = async (e) => { e.preventDefault(); try { await checked(db.from("patient_portal_shares").insert({ organization_id: ORG, patient_id: patient.id, ...share, shared_by: member.user_id })); shares.refresh(); notify(t("Disponibilizado ao paciente", "Shared with patient")); } catch { notify(t("Não foi possível compartilhar.", "Could not share.")); } }; return <section className="detail-section"><h2>{t("Privacidade e Área do Paciente", "Privacy & Patient Area")}</h2>{writable && <><form className="form-grid" onSubmit={saveRequest}><Field title={t("Tipo de solicitação", "Request type")} value={request.request_type} onChange={(v) => setRequest({ ...request, request_type: v })} options={["acesso", "correcao", "exportacao", "restricao", "exclusao"].map((v) => ({ value: v, label: label(v, t) }))} /><Field title={t("Observações", "Notes")} type="textarea" value={request.notes} onChange={(v) => setRequest({ ...request, notes: v })} /><Button className="primary" icon={Save}>{t("Registrar solicitação", "Record request")}</Button></form><form className="form-grid" onSubmit={createShare}><Field title={t("Recurso a compartilhar", "Resource to share")} value={share.resource_type} onChange={(v) => setShare({ ...share, resource_type: v })} options={["document", "report", "photo", "consent", "post_care", "appointment"].map((v) => ({ value: v, label: label(v, t) }))} /><Field title={t("ID do recurso", "Resource ID")} value={share.resource_id} onChange={(v) => setShare({ ...share, resource_id: v })} /><Button className="primary" icon={LinkIcon}>{t("Disponibilizar ao paciente", "Share with patient")}</Button></form></>}<h3>{t("Solicitações", "Requests")}</h3><LoadState state={requests}>{(rows) => rows.map((row) => <div className="list-row" key={row.id}><span><strong>{label(row.request_type, t)}</strong><small>{date(row.received_on)} · {row.notes}</small></span><Status value={row.status} /></div>)}</LoadState><h3>{t("Recursos compartilhados", "Shared resources")}</h3><LoadState state={shares}>{(rows) => rows.map((row) => <div className="list-row" key={row.id}><span><strong>{label(row.resource_type, t)}</strong><small>{date(row.shared_at, true)}</small></span><Status value={row.status} />{writable && row.status === "shared" && <Button onClick={async () => { await checked(db.from("patient_portal_shares").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("id", row.id)); shares.refresh(); notify(t("Removido da Área do Paciente", "Removed from Patient Area")); }}>{t("Remover", "Revoke")}</Button>}</div>)}</LoadState></section>; }

function ClinicalPhotoThumb({ row, onOpen }) {
  const url = usePrivateImage("clinical-photos", row.path);
  return <button className="clinical-photo-thumb" type="button" onClick={onOpen}>{url ? <img src={url} alt="" /> : <Eye size={20} />}</button>;
}
function ClinicalPhotosPanel({ patient, writable, notify }) {
  const t = useT(), [file, setFile] = useState(null), [editing, setEditing] = useState(null), [form, setForm] = useState({ category: "antes", area: "", description: "" }), [busy, setBusy] = useState(false);
  const state = useLoad(() => checked(db.from("clinical_photos").select("*").eq("patient_id", patient.id).order("created_at", { ascending: false })), [patient.id]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const chooseEdit = (row) => { setEditing(row); setFile(null); setForm({ category: row.category, area: row.area || "", description: row.description || "" }); };
  const upload = async (e) => { e.preventDefault(); if (!file) return; setBusy(true); try { const body = new FormData(); body.set("file", file); body.set("patient_id", patient.id); body.set("kind", editing ? "photo_replace" : "photo"); if (editing) body.set("photo_id", editing.id); body.set("category", form.category); body.set("area", form.area); body.set("description", form.description); const result = await invoke("files", body); if (!result?.photo) throw Error("upload"); setFile(null); setEditing(null); state.refresh(); notify(editing ? t("Foto clínica substituída.", "Clinical photo replaced.") : t("Foto clínica salva.", "Clinical photo saved.")); } catch { notify(t("Não foi possível salvar a foto.", "Could not save the photo.")); } finally { setBusy(false); } };
  const photo = async (row) => { try { await openPrivateImage("clinical-photos", row.path); } catch { notify(t("Não foi possível abrir a foto. Permita pop-ups e verifique seu acesso.", "Could not open the photo. Allow pop-ups and verify your access.")); } };
  const removePhoto = async (row) => { if (!window.confirm(t("Remover esta fotografia clínica?", "Remove this clinical photograph?"))) return; setBusy(true); try { const body = new FormData(); body.set("patient_id", patient.id); body.set("photo_id", row.id); body.set("kind", "photo_delete"); await invoke("files", body); state.refresh(); notify(t("Foto clínica removida.", "Clinical photo removed.")); } catch { notify(t("Não foi possível remover a foto.", "Could not remove the photo.")); } finally { setBusy(false); } };
  return <section className="detail-section"><div className="section-heading"><h2>{t("Fotografia clínica", "Clinical photography")}</h2></div>{writable && <form className="form-grid" onSubmit={upload}><Field title={t("Categoria", "Category")} value={form.category} onChange={(v) => set("category", v)} options={["antes", "durante", "depois", "evolucao"].map((v) => ({ value: v, label: label(v, t) }))} /><Field title={t("Área", "Treatment area")} value={form.area} onChange={(v) => set("area", v)} /><Field title={t("Observação", "Note")} value={form.description} onChange={(v) => set("description", v)} /><PhotoPicker title={t("Foto clínica", "Clinical photo")} value={file} onChange={setFile} /><Button className="primary" icon={editing ? RefreshCw : Paperclip} disabled={busy || !file}>{editing ? t("Substituir foto", "Replace photo") : t("Enviar foto privada", "Upload private photo")}</Button>{editing && <Button type="button" disabled={busy} onClick={() => { setEditing(null); setFile(null); setForm({ category: "antes", area: "", description: "" }); }}>{t("Cancelar substituição", "Cancel replacement")}</Button>}</form>}<LoadState state={state}>{(rows) => <div className="document-list">{rows.map((row) => <div className="document-row" key={row.id}><ClinicalPhotoThumb row={row} onOpen={() => photo(row)} /><span><strong>{label(row.category, t)}</strong><small>{row.area} · {date(row.created_at, true)} · {row.description}</small></span><Button icon={Eye} onClick={() => photo(row)}>{t("Visualizar", "View")}</Button>{writable && <><Button icon={RefreshCw} onClick={() => chooseEdit(row)}>{t("Substituir", "Replace")}</Button><Button icon={Trash2} disabled={busy} onClick={() => removePhoto(row)}>{t("Remover", "Remove")}</Button></>}</div>)}{!rows.length && <Empty icon={Eye}>{t("Nenhuma foto clínica", "No clinical photos")}</Empty>}</div>}</LoadState></section>;
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
  return <Dialog title={t("Formulário para revisão", "Form for review")} close={close}>
    <dl className="details-grid"><div><dt>{t("Nome", "Name")}</dt><dd>{enquiry.full_name}</dd></div><div><dt>{t("Recebido em", "Received")}</dt><dd>{date(enquiry.created_at, true)}</dd></div><div><dt>{t("Status", "Status")}</dt><dd><Status value={enquiry.status} /></dd></div></dl>
    <p>{t("Abra Formulários para pesquisar duplicidade, contatar e converter com autorização.", "Open Forms to check duplicates, contact and convert with authorization.")}</p>
    <Button className="primary" onClick={close}>{t("Fechar", "Close")}</Button>
  </Dialog>;
}

const masterSections = [
  ["identity", "Dados de identificação", [["full_name", "Nome completo"], ["preferred_name", "Nome preferido"], ["birth_date", "Data de nascimento"], ["cpf", "CPF"], ["rg", "RG"]]],
  ["contact", "Contato e endereço", [["phone", "Telefone / WhatsApp"], ["email", "Email"], ["address", "Endereço"], ["emergency_contact", "Contato de emergência"]]],
  ["visit", "Consulta e administrativo", [["selected_procedure", "Interesse / procedimento"], ["occupation", "Ocupação"], ["insurance", "Convênio"], ["internal_notes", "Observações administrativas"]]],
  ["health", "Saúde", [["allergies", "Alergias"], ["medications", "Medicamentos"], ["conditions", "Condições e antecedentes"], ["pregnancy_breastfeeding", "Gestação / amamentação"], ["other_notes", "Outras informações"]]],
  ["clinical", "Avaliação profissional", [["concern", "Queixa e objetivos"], ["assessment", "Avaliação"], ["plan", "Conduta / plano"], ["recommendations", "Orientações"]]],
  ["consents", "Consentimentos", [["privacy", "Privacidade"], ["clinical_photo", "Fotografia clínica"], ["communication", "Comunicação"]]],
];
const masterFieldMap = Object.fromEntries(masterSections.flatMap(([section, , fields]) => fields.map(([key, title]) => [`${section}.${key}`, title])));

function Provenance({ value }) {
  const t = useT();
  return <span className={`provenance provenance-${value || "patient"}`}>
    {value === "professional" ? <Stethoscope size={13} /> : value === "reception" ? <UserCheck size={13} /> : <ClipboardCheck size={13} />}
    {value === "professional" ? t("Validado pelo profissional", "Validated by professional") : value === "reception" ? t("Verificado pela recepção", "Verified by reception") : t("Informado pelo paciente", "Provided by patient")}
  </span>;
}

function MasterIntake({ patient: initialPatient, sourceIntake, member, close, notify, done }) {
  const t = useT();
  const clinical = ["proprietario", "profissional"].includes(member.role);
  const [patient, setPatient] = useState(initialPatient), [form, setForm] = useState(null), [provenance, setProvenance] = useState({}), [status, setStatus] = useState("rascunho"), [missing, setMissing] = useState([]), [busy, setBusy] = useState(false), [loaded, setLoaded] = useState(false), [savedAt, setSavedAt] = useState("");
  const source = sourceIntake?.payload || {};
  const base = (p) => ({
    identity: { full_name: p.full_name || source.full_name || "", preferred_name: p.preferred_name || source.preferred_name || "", birth_date: p.birth_date || source.birth_date || "", cpf: p.cpf || source.cpf || "", rg: p.rg || source.identity_document || "" },
    contact: { phone: p.phone || source.phone || "", email: p.email || source.email || "", address: Object.values(p.address || {}).join(" · ") || source.address || "", emergency_contact: Object.values(p.emergency_contact || {}).join(" · ") || source.emergency_contact || source.guardian_details || "" },
    visit: { selected_procedure: source.selected_procedure || source.selected_procedures || "", occupation: p.occupation || "", insurance: p.insurance || "", internal_notes: "" },
    ...(clinical ? { health: { allergies: source.health_notes || "", medications: source.medications || "", conditions: source.conditions || source.health_notes || "", pregnancy_breastfeeding: source.pregnancy_breastfeeding || "", other_notes: source.other_health_notes || "" }, clinical: { concern: source.treatment_área || source.treatment_area || "" }, consents: { privacy: source.lgpd_personal_data_consent || "", clinical_photo: source.technical_image_authorisation || "", communication: source.promotional_communication || "" } } : {}),
  });
  useEffect(() => { let live = true; (async () => { try { const current = await checked(db.from("master_intakes").select("*").eq("patient_id", initialPatient.id).maybeSingle()); if (!live) return; if (current) { setForm({ ...base(initialPatient), ...(current.data || {}) }); setProvenance(current.provenance || {}); setStatus(current.status); setMissing(current.missing_fields || []); } else { const initial = base(initialPatient); setForm(initial); const p = {}; Object.entries(initial).forEach(([section, fields]) => Object.entries(fields || {}).forEach(([key, value]) => { if (value) p[`${section}.${key}`] = "patient"; })); setProvenance(p); } } catch { if (live) setForm(base(initialPatient)); } finally { if (live) { setPatient(initialPatient); setLoaded(true); } } })(); return () => { live = false; }; }, [initialPatient.id]);
  const update = (section, key, value) => { setForm((f) => ({ ...f, [section]: { ...(f?.[section] || {}), [key]: value } })); setProvenance((p) => ({ ...p, [`${section}.${key}`]: member.role === "recepcao" ? "reception" : "professional" })); };
  const saveIntake = useCallback(async (nextStatus = status, silent = false) => { if (!form || busy) return; setBusy(true); try { const required = ["identity.full_name", "identity.birth_date", "identity.cpf", "contact.phone", "contact.email"].filter((key) => !String(key.split(".").reduce((o, k) => o?.[k], form) || "").trim()); const payload = { ...(clinical ? form : { identity: form.identity, contact: form.contact, visit: form.visit }), status: nextStatus }; const id = await checked(db.rpc("save_master_intake", { p_patient_id: patient.id, p_source_intake_id: sourceIntake?.id || null, p_status: nextStatus, p_data: payload, p_provenance: provenance, p_missing_fields: required })); setMissing(required); setStatus(nextStatus); setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })); if (!silent) { notify(t("Intake salvo e seções sincronizadas.", "Intake saved and sections synchronized.")); done?.(); } return id; } catch (e) { notify(e?.message?.includes("clinical_permission") ? t("A recepção não pode alterar informações clínicas.", "Reception cannot alter clinical information.") : t("Não foi possível salvar o intake.", "Could not save intake.")); } finally { setBusy(false); } }, [form, busy, status, clinical, patient?.id, sourceIntake?.id, provenance]);
  useEffect(() => { if (!loaded || !form) return; const id = setTimeout(() => saveIntake(status, true), 1400); return () => clearTimeout(id); }, [form, provenance]);
  if (!form) return <Dialog title={t("Consulta inicial completa", "Master Intake")} close={close}><p role="status">{t("Carregando dados do paciente...", "Loading patient data...")}</p></Dialog>;
  return <Dialog title={t("Consulta inicial completa", "Master Intake")} close={() => !busy && close()} wide>
    <div className="master-intake-hero"><div><p className="eyebrow">{t("Registro único do paciente", "Unified patient record")}</p><h2>{patient.full_name}</h2><p>{t("O formulário público foi pré-carregado. Revise, marque a origem e complete apenas o que falta.", "The public form was preloaded. Review, mark the source and complete only what is missing.")}</p></div><div className="master-intake-progress"><strong>{missing.length ? missing.length : "✓"}</strong><span>{missing.length ? t("campos pendentes", "missing fields") : t("pronto para revisão", "ready for review")}</span></div></div>
    <div className="provenance-legend"><Provenance value="patient" /><Provenance value="reception" /><Provenance value="professional" /></div>
    <div className="master-intake-grid">{masterSections.filter(([section]) => clinical || !["health", "clinical", "consents"].includes(section)).map(([section, title, fields]) => <section className={`master-section ${missing.some((m) => m.startsWith(`${section}.`)) ? "has-missing" : ""}`} key={section}><div className="section-heading"><h3>{title}</h3>{missing.some((m) => m.startsWith(`${section}.`)) && <span className="missing-badge"><AlertCircle size={14} /> {t("Completar", "Complete")}</span>}</div><div className="form-grid">{fields.map(([key, labelText]) => <div className="master-field" key={key}><Field title={t(labelText, labelText)} type={key.includes("notes") || ["address", "emergency_contact", "allergies", "medications", "conditions", "pregnancy_breastfeeding", "other_notes", "concern", "assessment", "plan", "recommendations"].includes(key) ? "textarea" : key === "birth_date" ? "date" : "text"} value={form[section]?.[key] || ""} onChange={(v) => update(section, key, v)} disabled={!clinical && ["health", "clinical", "consents"].includes(section)} wide={key.includes("notes") || ["address", "emergency_contact", "allergies", "medications", "conditions", "pregnancy_breastfeeding", "other_notes", "concern", "assessment", "plan", "recommendations"].includes(key)} />{form[section]?.[key] && <Provenance value={provenance[`${section}.${key}`]} />}</div>)}</div></section>)}</div>
    <div className="master-sync"><CheckCheck size={18} /><strong>{t("Ao salvar, estas áreas são sincronizadas", "Saving synchronizes these areas")}</strong><span>{t("Resumo · Dados · Prontuário · Documentos e fotos · Fotografia clínica · Planos · Procedimentos · Saúde · Consentimentos · Privacidade/portal · Agenda e retornos · Administrativo", "Summary · Details · Clinical record · Documents & photos · Clinical photography · Plans · Procedures · Health · Consents · Privacy/portal · Schedule & follow-ups · Administrative")}</span></div>
    <footer className="form-footer"><span className="save-state">{savedAt ? `${t("Salvo automaticamente às", "Autosaved at")} ${savedAt}` : t("Rascunho não salvo", "Unsaved draft")}</span><Button type="button" onClick={close}>{t("Fechar", "Close")}</Button><Button type="button" onClick={() => saveIntake("rascunho")} disabled={busy}>{t("Salvar rascunho", "Save draft")}</Button><Button type="button" onClick={() => saveIntake("em_revisao")} disabled={busy}>{t("Enviar para revisão", "Send for review")}</Button>{clinical && <Button type="button" icon={CheckCircle2} className="primary" onClick={() => saveIntake("finalizado")} disabled={busy}>{t("Finalizar intake", "Finalize intake")}</Button>}</footer>
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
              <dd className="preserve">{displayValue(v)}</dd>
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
        <Avatar person={patient} className="avatar small" size={34} />
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
function AppointmentForm({ appointment, patient, initialStart, close, done, notify }) {
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
        : initialStart || localDateTime(),
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
const dayKey = (value) => localDay(value);
const atNoon = (key) => new Date(`${key}T12:00:00-03:00`);
const shiftDay = (key, amount) => {
  const value = atNoon(key);
  value.setDate(value.getDate() + amount);
  return localDay(value);
};
const monthStart = (key) => `${key.slice(0, 7)}-01`;
const monthLabel = (key, t) => new Intl.DateTimeFormat(t("pt-BR", "en-US"), { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(atNoon(key));
const validDateValue = (value) => {
  if (!value) return false;
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00-03:00` : value);
  return !Number.isNaN(parsed.getTime());
};
const safeDateLabel = (value, time = false) => validDateValue(value) ? date(value, time) : "—";
const timeLabel = (value) => validDateValue(value) ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const patientName = (a, t) => a.patients?.preferred_name || a.patients?.full_name || t("Paciente", "Patient");
const statusTone = (value) => ({ confirmado: "confirmed", concluido: "completed", cancelado: "cancelled", faltou: "noshow", aguardando: "waiting" }[value] || "scheduled");

function WhatsappComposer({ appointment, patient, close, notify }) {
  const t = useT();
  const [template, setTemplate] = useState("confirmacao");
  const [consents, setConsents] = useState([]);
  const first = (patient?.preferred_name || patient?.full_name || "").split(" ")[0];
  const data = { primeiro_nome: first, data: date(appointment.starts_at), hora: timeLabel(appointment.starts_at) };
  const templates = {
    confirmacao: ["Confirmação", `Olá, ${data.primeiro_nome}. Tudo bem?\n\nEstamos confirmando seu atendimento com Franciele Sofiati para ${data.data}, às ${data.hora}.\n\nCaso precise reagendar, por favor entre em contato conosco.`],
    lembrete: ["Lembrete", `Olá, ${data.primeiro_nome}.\n\nPassando para lembrar do seu atendimento com Franciele Sofiati amanhã, ${data.data}, às ${data.hora}.\n\nEsperamos você.`],
    hoje: ["Lembrete no dia", `Olá, ${data.primeiro_nome}.\n\nSeu atendimento com Franciele Sofiati está marcado para hoje às ${data.hora}.\n\nAté breve.`],
    retorno: ["Pós-atendimento / retorno", `Olá, ${data.primeiro_nome}. Tudo bem?\n\nEstamos entrando em contato para saber como você está após seu atendimento.\n\nSe precisar falar conosco ou tiver alguma dúvida, estamos à disposição.`],
    aniversario: ["Aniversário", `Feliz aniversário, ${data.primeiro_nome}! 🎂\n\nA equipe Franciele Sofiati deseja um dia muito especial para você.`],
  };
  useEffect(() => { checked(db.from("consents").select("kind,status").eq("patient_id", patient?.id)).then(setConsents).catch(() => setConsents([])); }, [patient?.id]);
  const allowedPhone = whatsapp(patient?.phone);
  const marketingAllowed = consents.some((c) => c.kind === "publicacao_marketing" && c.status === "aceito");
  const [message, setMessage] = useState(templates[template][1]);
  useEffect(() => setMessage(templates[template][1]), [template]);
  const open = () => { if (!allowedPhone) return notify(t("Telefone não disponível em formato válido.", "Phone is not available in a valid format.")); window.open(`${whatsappWeb(patient?.phone)}&text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer"); notify(t("Mensagem preparada. Abrir no WhatsApp", "Message prepared. Open in WhatsApp")); close(); };
  return <Dialog title={t("Preparar mensagem", "Prepare message")} close={close}>
    <div className="whatsapp-composer">
      <p className="subtle">{patientName(appointment, t)} · {date(appointment.starts_at, true)}</p>
      <Field title={t("Modelo", "Template")} value={template} onChange={setTemplate} options={Object.entries(templates).map(([value, labels]) => ({ value, label: labels[0] }))} />
      {!marketingAllowed && <p className="consent-note"><ShieldCheck size={15} /> {t("Modelos promocionais desativados: consentimento de marketing não confirmado.", "Promotional templates disabled: marketing consent is not confirmed.")}</p>}
      <Field title={t("Mensagem editável", "Editable message")} type="textarea" value={message} onChange={setMessage} />
      <p className="subtle">{t("A aplicação não confirma o envio. Revise a mensagem antes de abrir o WhatsApp.", "The application cannot confirm delivery. Review the message before opening WhatsApp.")}</p>
      <footer className="form-footer"><Button type="button" onClick={close}>{t("Cancelar", "Cancel")}</Button><Button className="primary" icon={MessageCircle} onClick={open} disabled={!allowedPhone}>{t("Abrir no WhatsApp", "Open WhatsApp")}</Button></footer>
    </div>
  </Dialog>;
}

const communicationCategories = [["todos", "Todos"], ["agendamento", "Agendamentos"], ["lead", "Leads"], ["feedback", "Feedback"], ["interno", "Equipe"], ["profissional", "Profissionais"]];
const senderSignature = (member) => member?.role === "proprietario" && String(member?.name || "").toLowerCase().includes("franciele") ? "Franciele Sofiati" : "Recepção da Franciele Sofiati";
const renderCommunication = (body, context, member) => {
  const values = { primeiro_nome: (context?.preferred_name || context?.full_name || "").split(" ")[0], nome_completo: context?.full_name || "", data_consulta: context?.appointment ? date(context.appointment.starts_at) : "", hora_consulta: context?.appointment ? timeLabel(context.appointment.starts_at) : "", endereco: "Londrina, PR", link_feedback: "", documento: "", assinatura_remetente: senderSignature(member) };
  return String(body || "").replace(/\{([\w]+)\}/g, (_, key) => values[key] ?? "").replace(/\n{3,}/g, "\n\n").trim();
};
function CommunicationComposer({ patient: initialPatient, appointment, template: initialTemplate, member, close, notify }) {
  const t = useT(), templates = useLoad(() => checked(db.from("communication_templates").select("*").eq("active", true).order("category,name,variant")), []), [patient] = useState(initialPatient || appointment?.patients || null), [templateId, setTemplateId] = useState(initialTemplate?.id || ""), [channel, setChannel] = useState(initialTemplate?.channel || "whatsapp"), [subject, setSubject] = useState(""), [body, setBody] = useState(""), [signature, setSignature] = useState(senderSignature(member)), [preference, setPreference] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { if (patient?.id) checked(db.from("communication_preferences").select("*").eq("patient_id", patient.id).maybeSingle()).then(setPreference).catch(() => setPreference(null)); }, [patient?.id]);
  const selected = (templates.data || []).find((x) => x.id === templateId);
  useEffect(() => { if (templateId === "__free__") return; const item = selected || (templates.data || []).find((x) => x.channel === channel); if (item) { setTemplateId(item.id); setSubject(renderCommunication(item.subject, { ...patient, appointment }, member)); setSignature(senderSignature(member)); setBody(renderCommunication(item.body, { ...patient, appointment }, member)); } }, [templates.data, templateId, channel, patient?.id, appointment?.id, member?.user_id]);
  const recipient = channel === "email" ? patient?.email : patient?.phone;
  const saveAsTemplate = async () => { const name = window.prompt(t("Nome do novo modelo", "Name for the new template")); if (!name?.trim()) return; try { await checked(db.from("communication_templates").insert({ organization_id: ORG, name: name.trim(), category: selected?.category || "administrativo", channel, variant: "standard", subject, body, sender_mode: "sender", sensitive: false, created_by: member.user_id })); templates.refresh(); notify(t("Modelo salvo para uso futuro.", "Template saved for future use.")); } catch { notify(t("Não foi possível salvar o modelo.", "Could not save the template.")); } };
  const submit = async (e) => { e.preventDefault(); if (preference?.do_not_contact) return notify(t("Este paciente pediu para não ser contatado. Revise as preferências antes de continuar.", "This patient requested no contact. Review preferences before continuing.")); if (!patient || !recipient) return notify(t("Selecione um contato com telefone ou email válido.", "Select a contact with a valid phone or email.")); const target = channel === "whatsapp" ? `${whatsappWeb(recipient)}&text=${encodeURIComponent(body)}` : channel === "telefone" ? `tel:${digits(recipient)}` : `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; const popup = window.open(target, "_blank", "noopener,noreferrer"); setBusy(true); try { const row = await checked(db.from("communications").insert({ organization_id: ORG, patient_id: patient.id, appointment_id: appointment?.id || null, channel, direction: "outbound", visibility: "external", category: selected?.category || "administrativo", subject, body, rendered_signature: signature, recipient_name: patient.full_name || patient.preferred_name || "", recipient_address: recipient, template_id: templateId === "__free__" ? null : (templateId || null), status: "rascunho", packet_sha256: "", created_by: member.user_id }).select().single()); if (!popup) window.open(target, "_blank", "noopener,noreferrer"); await checked(db.from("communications").update({ status: channel === "telefone" ? "enviado" : "nao_confirmado", sent_at: new Date().toISOString() }).eq("id", row.id)); notify(t("Contato preparado e registrado no histórico.", "Contact prepared and recorded in history.")); close(); } catch { popup?.close(); notify(t("Não foi possível registrar a comunicação.", "Could not record the communication.")); } finally { setBusy(false); } };
  return <Dialog title={t("Preparar comunicação", "Prepare communication")} close={close} wide><form className="communication-composer" onSubmit={submit}><div className="communication-recipient"><strong>{patient?.preferred_name || patient?.full_name || t("Nenhum destinatário", "No recipient")}</strong><span>{recipient || t("Sem contato neste canal", "No contact for this channel")}</span></div>{preference?.do_not_contact && <p className="notice error">{t("Não contatar: preferência registrada no cadastro.", "Do not contact: preference recorded in the patient record.")}</p>}<div className="form-grid"><Field title={t("Canal", "Channel")} value={channel} onChange={setChannel} options={[{ value: "whatsapp", label: "WhatsApp" }, { value: "email", label: "Email" }, { value: "telefone", label: t("Telefone", "Phone") }]} /><Field title={t("Modelo", "Template")} value={templateId} onChange={setTemplateId} options={[{ value: "__free__", label: t("Mensagem livre", "Free message") }, ...(templates.data || []).filter((x) => x.channel === channel).map((x) => ({ value: x.id, label: `${x.name} · ${x.variant}` }))]} /></div>{channel === "email" && <Field title={t("Assunto", "Subject")} value={subject} onChange={setSubject} />}<Field title={t("Assinatura", "Signature")} value={signature} onChange={(v) => { setSignature(v); setBody((current) => current.replace(/(Com carinho,\n)?(Recepção da Franciele Sofiati|Franciele Sofiati)$/, `$1${v}`)); }} /><Field title={t("Mensagem editável", "Editable message")} type="textarea" value={body} onChange={setBody} required /><p className="consent-note"><ShieldCheck size={15} /> {t("Revise antes de abrir o WhatsApp ou o rascunho de email. A aplicação não afirma que a mensagem foi entregue.", "Review before opening WhatsApp or the email draft. The app does not claim delivery.")}</p><footer className="form-footer"><Button type="button" onClick={saveAsTemplate} icon={Save}>{t("Salvar como modelo", "Save as template")}</Button><Button type="button" onClick={close}>{t("Cancelar", "Cancel")}</Button><Button className="primary" icon={Send} disabled={busy || !body || preference?.do_not_contact}>{t("Abrir canal e registrar", "Open channel and record")}</Button></footer></form></Dialog>;
}
function Communication({ member, setModal, openPatient, version, writable, notify }) {
  const t = useT(), [tab, setTab] = useState("prioridades"), [category, setCategory] = useState("todos"), [search, setSearch] = useState("");
  const state = useLoad(async () => { const [comms, tasks, appointments, conversations] = await Promise.all([checked(db.from("communications").select("*,patients(*)").order("created_at", { ascending: false }).limit(120)).catch(() => []), checked(db.from("tasks").select("*,patients(*)").eq("status", "pendente").order("due_at").limit(80)).catch(() => []), checked(db.from("appointments").select("*,patients(*)").gte("starts_at", new Date().toISOString()).order("starts_at").limit(30)).catch(() => []), checked(db.from("communication_conversations").select("*,patients(*)").order("updated_at", { ascending: false }).limit(40)).catch(() => [])]); return { comms, tasks, appointments, conversations }; }, [version]);
  const data = state.data || { comms: [], tasks: [], appointments: [], conversations: [] }, next = data.appointments.find((x) => !["cancelado", "reagendado"].includes(x.status)), match = (x) => !search || `${x.title || ""} ${x.recipient_name || ""} ${x.patients?.full_name || ""}`.toLowerCase().includes(search.toLowerCase()), history = data.comms.filter((x) => category === "todos" || x.category === category).filter(match), due = data.tasks.filter(match);
  return <><PageHead eyebrow={t("Presença, clareza e continuidade", "Presence, clarity and continuity")} title={t("Comunicação", "Communication")}>{writable && <Button icon={Plus} className="primary" onClick={() => setModal({ type: "communication", patient: next?.patients, appointment: next })}>{t("Nova comunicação", "New communication")}</Button>}</PageHead><section className="communication-hero"><div><p className="eyebrow">{t("Central de cuidado", "Care centre")}</p><h2>{t("O que precisa de atenção hoje?", "What needs attention today?")}</h2><p>{t("Destinatário, contexto e mensagem ficam preparados para a equipe revisar com calma.", "Recipient, context and message stay ready for the team to review calmly.")}</p></div><div className="communication-orbit"><strong>{due.length}</strong><span>{t("ações abertas", "open actions")}</span></div></section><nav className="tabs communication-tabs">{[["prioridades", "Prioridades"], ["historico", "Histórico"], ["equipe", "Equipe"]].map(([key, title]) => <button key={key} className={tab === key ? "selected" : ""} onClick={() => setTab(key)}>{title}</button>)}</nav>{tab !== "equipe" && <div className="toolbar wrap"><label className="search"><Search size={19} /><input placeholder={t("Buscar pessoa ou assunto", "Search person or subject")} value={search} onChange={(e) => setSearch(e.target.value)} /></label><div className="segmented">{communicationCategories.map(([key, title]) => <button key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{title}</button>)}</div></div>}{tab === "equipe" ? <TeamCommunication member={member} conversations={data.conversations} writable={writable} notify={notify} /> : tab === "prioridades" ? <section className="communication-panel"><div className="section-heading"><div><p className="eyebrow">{t("Fila única", "Single queue")}</p><h2>{t("Comunicações e retornos", "Communications and follow-ups")}</h2></div><span className="attention-count">{due.length}</span></div><div className="communication-list">{due.map((task) => <article className="communication-card" key={task.id}><span className="communication-card-icon"><Bell size={17} /></span><div><span className="action-kicker">{task.due_at && new Date(task.due_at) < new Date() ? t("Vencida", "Overdue") : t("Próxima ação", "Next action")}</span><strong>{task.title}</strong><small>{task.patients?.preferred_name || task.patients?.full_name || t("Clínica", "Clinic")} · {date(task.due_at, true)}</small></div><div className="communication-card-actions">{task.patients && writable && <Button icon={MessageCircle} onClick={() => setModal({ type: "communication", patient: task.patients })}>{t("Preparar", "Prepare")}</Button>}{task.patients && <Button icon={UserRound} onClick={() => openPatient(task.patients)}>{t("Contexto", "Context")}</Button>}</div></article>)}{!due.length && <Empty icon={CheckCircle2}>{t("Nenhuma comunicação pendente para estes filtros.", "No pending communication for these filters.")}</Empty>}</div></section> : <section className="communication-panel"><div className="section-heading"><div><p className="eyebrow">{t("Nada se perde", "Nothing gets lost")}</p><h2>{t("Histórico de comunicações", "Communication history")}</h2></div><span className="subtle">{history.length} {t("registros", "records")}</span></div><div className="communication-list">{history.map((row) => <article className="communication-card" key={row.id}><span className="communication-card-icon"><MessageCircle size={17} /></span><div><span className="action-kicker">{row.channel} · {row.category}</span><strong>{row.recipient_name || row.patients?.full_name || t("Contato", "Contact")}</strong><small>{date(row.created_at, true)} · {label(row.status, t)}</small><p className="preserve communication-preview">{row.body || t("Registro técnico", "Technical record")}</p></div>{row.patients && <Button icon={UserRound} onClick={() => openPatient(row.patients)}>{t("Paciente", "Patient")}</Button>}</article>)}{!history.length && <Empty icon={History}>{t("Ainda não há comunicações neste filtro.", "No communications in this filter yet.")}</Empty>}</div></section>}</>;
}

function TeamCommunication({ member, conversations, writable, notify }) {
  const t = useT(), [selected, setSelected] = useState(conversations[0] || null), [text, setText] = useState("");
  const messages = useLoad(() => selected ? checked(db.from("communication_messages").select("*,memberships(name)").eq("conversation_id", selected.id).order("created_at")) : Promise.resolve([]), [selected?.id]);
  const send = async (e) => { e.preventDefault(); if (!selected || !text.trim()) return; try { await checked(db.from("communication_messages").insert({ organization_id: ORG, conversation_id: selected.id, sender_id: member.user_id, body: text.trim() })); setText(""); messages.refresh(); } catch { notify(t("Não foi possível enviar.", "Could not send.")); } };
  const create = async () => { try { const row = await checked(db.from("communication_conversations").insert({ organization_id: ORG, title: "Equipe", kind: "equipe", created_by: member.user_id }).select("*").single()); setSelected(row); notify(t("Conversa criada.", "Conversation created.")); } catch { notify(t("Não foi possível criar a conversa.", "Could not create conversation.")); } };
  return <section className="communication-panel team-chat"><div className="section-heading"><div><p className="eyebrow">{t("Contexto interno", "Internal context")}</p><h2>{t("Conversa da equipe", "Team conversation")}</h2></div>{writable && <Button icon={Plus} onClick={create}>{t("Nova conversa", "New conversation")}</Button>}</div><div className="team-chat-layout"><div className="team-chat-list">{conversations.map((row) => <button key={row.id} className={selected?.id === row.id ? "selected" : ""} onClick={() => setSelected(row)}><strong>{row.title || "Equipe"}</strong><small>{row.patients?.full_name || t("Sem paciente vinculado", "No linked patient")}</small></button>)}</div><div className="team-chat-thread">{selected ? <><div className="team-chat-messages">{(messages.data || []).map((row) => <article key={row.id}><strong>{row.memberships?.name || t("Equipe", "Team")}</strong><p className="preserve">{row.body}</p><small>{date(row.created_at, true)}</small></article>)}</div>{writable && <form className="team-chat-compose" onSubmit={send}><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Escreva para a equipe…", "Write to the team…")} /><Button className="primary" icon={Send}>{t("Enviar", "Send")}</Button></form>}</> : <Empty icon={MessageCircle}>{t("Crie ou selecione uma conversa.", "Create or select a conversation.")}</Empty>}</div></div></section>;
}

const agendaDay = (value) => String(value || "").slice(0, 10);
const agendaTime = (value) => {
  const match = String(value || "").match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "—";
};

function AgendaEvent({ appointment, onSelect }) {
  const t = useT();
  return <button type="button" className={`agenda-simple-event agenda-simple-event--${statusTone(appointment.status)}`} onClick={() => onSelect(appointment)}>
    <time>{agendaTime(appointment.starts_at)}</time><strong>{patientName(appointment, t)}</strong><small>{appointment.label || t("Atendimento", "Appointment")}</small>
  </button>;
}

function AgendaPanel({ appointment, close, openPatient, setModal, writable }) {
  const t = useT();
  return <aside className="agenda-simple-panel" aria-label={t("Detalhes do agendamento", "Appointment details")}>
    <div className="agenda-simple-panel__top"><p className="eyebrow">{t("Agendamento", "Appointment")}</p><Button icon={X} className="icon" onClick={close} aria-label={t("Fechar", "Close")} /></div>
    <h2>{patientName(appointment, t)}</h2><p className="agenda-simple-panel__time"><Clock size={16} /> {agendaDay(appointment.starts_at)} · {agendaTime(appointment.starts_at)}</p><Status value={appointment.status} />
    <dl><div><dt>{t("Tipo", "Type")}</dt><dd>{appointment.label || t("Atendimento", "Appointment")}</dd></div><div><dt>{t("Telefone", "Phone")}</dt><dd>{appointment.patients?.phone || "—"}</dd></div></dl>
    <div className="agenda-simple-panel__actions">{appointment.patients && <Button icon={UserRound} onClick={() => { openPatient(appointment.patients); close(); }}>{t("Abrir paciente", "Open patient")}</Button>}{writable && <Button icon={Pencil} onClick={() => setModal({ type: "appointment", appointment, patient: appointment.patients })}>{t("Editar agendamento", "Edit appointment")}</Button>}{appointment.patients?.phone && <Button icon={MessageCircle} className="whatsapp-action" onClick={() => setModal({ type: "whatsapp", appointment, patient: appointment.patients })}>{t("Preparar WhatsApp", "Prepare WhatsApp")}</Button>}</div>
  </aside>;
}

function AgendaHub({ openPatient, setModal, version, writable, notify }) {
  const t = useT();
  const today = localDay();
  const [anchor, setAnchor] = useState(today);
  const [view, setView] = useState(() => window.innerWidth < 760 ? "day" : "week");
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [professional, setProfessional] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [localRows, setLocalRows] = useState(null);
  useEffect(() => {
    const onKey = (event) => {
      if (event.target.matches("input,textarea,select")) return;
      if (event.key.toLowerCase() === "n" && writable) setModal({ type: "appointment" });
      if (event.key.toLowerCase() === "t") setAnchor(today);
      if (event.key === "Escape") { setSelected(null); setShowInsights(false); setShowFilters(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [today, writable, setModal]);
  const start = view === "month" ? monthStart(anchor) : view === "week" ? shiftDay(anchor, -((atNoon(anchor).getDay() + 6) % 7)) : anchor;
  const end = view === "month" ? shiftDay(start, 42) : view === "week" ? shiftDay(start, 7) : shiftDay(anchor, 1);
  const state = useLoad(() => checked(db.from("appointments").select("id,patient_id,professional_id,starts_at,ends_at,status,label,version,patients(id,full_name,preferred_name,phone,email,cpf,birth_date)").gte("starts_at", `${start}T00:00:00-03:00`).lt("starts_at", `${end}T23:59:59-03:00`).order("starts_at").limit(300)), [start, end, version]);
  useEffect(() => { if (state.data) setLocalRows(state.data); }, [state.data]);
  const rows = (localRows || state.data || []).filter((a) => validDateValue(a.starts_at));
  const professionals = [...new Map(rows.filter((a) => a.professional_id).map((a) => [a.professional_id, a.professional_id])).entries()].map(([value]) => ({ value, label: value.slice(0, 8) }));
  const appointments = rows.filter((a) => status === "all" || a.status === status).filter((a) => professional === "all" || a.professional_id === professional).filter((a) => !query || [patientName(a, t), a.label, a.patients?.phone].join(" ").toLowerCase().includes(query.toLowerCase()));
  const weekStart = shiftDay(anchor, -((atNoon(anchor).getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => shiftDay(weekStart, i));
  const monthDays = Array.from({ length: 42 }, (_, i) => shiftDay(monthStart(anchor), i - ((atNoon(monthStart(anchor)).getDay() + 6) % 7)));
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  const onDay = (day) => appointments.filter((a) => agendaDay(a.starts_at) === day);
  const active = appointments.filter((a) => !["cancelado", "concluido"].includes(a.status));
  const confirmed = appointments.filter((a) => a.status === "confirmado").length;
  const waiting = appointments.filter((a) => a.status === "aguardando").length;
  const conflicts = appointments.filter((a, i) => appointments.some((b, j) => i !== j && a.professional_id && a.professional_id === b.professional_id && new Date(a.starts_at) < new Date(b.ends_at) && new Date(b.starts_at) < new Date(a.ends_at))).length;
  const freeSlots = Math.max(0, (view === "day" ? 10 : view === "week" ? 50 : 180) - active.length);
  const moveAppointment = async (a, day, hour = agendaTime(a.starts_at)) => {
    const next = `${day}T${hour}`;
    const duration = new Date(a.ends_at) - new Date(a.starts_at);
    const moved = { ...a, starts_at: toISO(next), ends_at: new Date(new Date(toISO(next)).getTime() + duration).toISOString() };
    setLocalRows((current) => (current || []).map((row) => row.id === a.id ? moved : row));
    try { await checked(db.from("appointments").update({ starts_at: moved.starts_at, ends_at: moved.ends_at }).eq("id", a.id)); notify(t("Horário atualizado.", "Time updated.")); } catch { notify(t("Não foi possível mover o agendamento.", "Could not move the appointment.")); state.refresh(); }
  };
  const navigate = (direction) => setAnchor(view === "month" ? localDay(new Date(atNoon(anchor).getFullYear(), atNoon(anchor).getMonth() + direction, 1, 12)) : shiftDay(anchor, (view === "week" ? 7 : 1) * direction));
  const exportCalendar = () => { const ics = appointments.map((a) => `BEGIN:VEVENT\nUID:${a.id}\nDTSTART:${new Date(a.starts_at).toISOString().replaceAll("-", "").replaceAll(":", "").replace(".000", "")}\nSUMMARY:${a.label || "Atendimento"} · ${patientName(a, t)}\nEND:VEVENT`).join("\n"); download(new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\n${ics}\nEND:VCALENDAR`], { type: "text/calendar" }), "agenda.ics"); notify(t("Arquivo ICS exportado.", "ICS file exported.")); };
  const exportCsv = () => { const csv = ["Data;Hora;Paciente;Tipo;Status", ...appointments.map((a) => `${safeDateLabel(a.starts_at)};${timeLabel(a.starts_at)};${patientName(a, t)};${a.label || "Atendimento"};${label(a.status, t)}`)].join("\n"); download(new Blob([csv], { type: "text/csv;charset=utf-8" }), "agenda.csv"); notify(t("Arquivo CSV exportado.", "CSV file exported.")); };
  const event = (a) => <AgendaEvent key={a.id} appointment={a} onSelect={setSelected} />;
  const dropProps = (day, hour) => ({ onDragOver: (e) => e.preventDefault(), onDrop: () => { if (dragging) moveAppointment(dragging, day, hour); setDragging(null); } });
  const draggableEvent = (a) => <div key={a.id} draggable onDragStart={() => setDragging(a)} onDragEnd={() => setDragging(null)}>{event(a)}</div>;
  return <div className="agenda-hub">
    <PageHead eyebrow={t("Operação clínica · agenda inteligente", "Clinical operations · smart schedule")} title={t("Agenda", "Schedule")}><div className="agenda-hub-head-actions"><span className="agenda-live"><i /> {t("Atualizada agora", "Updated now")}</span>{writable && <Button icon={Plus} className="primary" onClick={() => setModal({ type: "appointment" })}>{t("Agendamento rápido", "Quick booking")}</Button>}</div></PageHead>
    <section className="agenda-kpis" aria-label={t("Resumo da agenda", "Schedule summary")}><button onClick={() => setStatus("all")}><span>{t("Hoje", "Today")}</span><strong>{active.filter((a) => agendaDay(a.starts_at) === today).length}</strong><small>{t("atendimentos", "appointments")}</small></button><button onClick={() => setStatus("confirmado")}><span>{t("Confirmados", "Confirmed")}</span><strong>{confirmed}</strong><small>{t("nesta visão", "in this view")}</small></button><button onClick={() => setStatus("aguardando")}><span>{t("Em espera", "Waiting")}</span><strong>{waiting}</strong><small>{t("check-in pendente", "check-in pending")}</small></button><button className={conflicts ? "has-alert" : ""} onClick={() => setShowInsights(true)}><span>{t("Ocupação", "Occupancy")}</span><strong>{Math.round((active.length / Math.max(1, active.length + freeSlots)) * 100)}%</strong><small>{conflicts ? `${conflicts} ${t("conflitos", "conflicts")}` : t("sem conflitos", "no conflicts")}</small></button></section>
    <div className="agenda-hub-toolbar"><div className="agenda-simple-nav"><Button onClick={() => setAnchor(today)}>{t("Hoje", "Today")}</Button><Button icon={ChevronLeft} className="icon" onClick={() => navigate(-1)} aria-label={t("Anterior", "Previous")} /><Button icon={ChevronRight} className="icon" onClick={() => navigate(1)} aria-label={t("Próximo", "Next")} /><h2>{view === "month" ? monthLabel(anchor, t) : `${safeDateLabel(view === "week" ? weekStart : anchor)}${view === "week" ? ` — ${safeDateLabel(shiftDay(weekStart, 6))}` : ""}`}</h2></div><div className="agenda-hub-tools"><label className="agenda-simple-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Buscar paciente, telefone ou procedimento", "Search patient, phone or procedure")} /></label><Button icon={SlidersHorizontal} className={showFilters ? "active" : ""} onClick={() => setShowFilters(!showFilters)}>{t("Filtros", "Filters")}</Button><div className="segmented" aria-label={t("Visualização", "View")}><button aria-pressed={view === "day"} onClick={() => setView("day")}>{t("Dia", "Day")}</button><button aria-pressed={view === "week"} onClick={() => setView("week")}>{t("Semana", "Week")}</button><button aria-pressed={view === "month"} onClick={() => setView("month")}>{t("Mês", "Month")}</button><button aria-pressed={view === "list"} onClick={() => setView("list")}><List size={15} /> {t("Lista", "List")}</button></div><Button icon={MoreHorizontal} className="icon" title={t("Mais ações", "More actions")} onClick={() => setShowInsights(!showInsights)} /></div></div>
    {showFilters && <div className="agenda-filter-drawer"><Field title={t("Status", "Status")} value={status} onChange={setStatus} options={[{ value: "all", label: t("Todos os status", "All statuses") }, ...["agendado", "confirmado", "aguardando", "em_atendimento", "concluido", "cancelado", "faltou"].map((v) => ({ value: v, label: label(v, t) }))]} /><Field title={t("Profissional", "Professional")} value={professional} onChange={setProfessional} options={[{ value: "all", label: t("Todos", "Everyone") }, ...professionals]} /><Button icon={EyeOff} onClick={() => { setQuery(""); setStatus("all"); setProfessional("all"); }}>{t("Limpar filtros", "Clear filters")}</Button></div>}
    <div className="agenda-hub-body"><div className={`agenda-hub-calendar agenda-hub-calendar--${view}`}>
      {state.loading && <p className="loading">{t("Carregando agenda...", "Loading schedule...")}</p>}
      {view === "month" && <><div className="agenda-simple-weekdays">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => <span key={d}>{t(d, d)}</span>)}</div><div className="agenda-simple-month">{monthDays.map((day) => <div key={day} className={`agenda-simple-day ${day.slice(0, 7) === anchor.slice(0, 7) ? "" : "outside"} ${day === today ? "today" : ""}`} {...dropProps(day)} onDoubleClick={() => writable && setModal({ type: "appointment", initialStart: `${day}T09:00` })}><button type="button" className="agenda-simple-day-number" onClick={() => { setAnchor(day); setView("day"); }}>{Number(day.slice(8))}</button><div className="agenda-simple-events">{onDay(day).slice(0, 4).map(draggableEvent)}{onDay(day).length > 4 && <button type="button" className="agenda-simple-more" onClick={() => { setAnchor(day); setView("day"); }}>+{onDay(day).length - 4}</button>}</div></div>)}</div></>}
      {view === "week" && <div className="agenda-simple-week"><div className="agenda-simple-corner" />{weekDays.map((day) => <div className="agenda-simple-head" key={day}>{day.slice(5)}{day === today && <i>{t("hoje", "today")}</i>}</div>)}{hours.flatMap((hour) => [<div className="agenda-simple-hour" key={`h${hour}`}>{String(hour).padStart(2, "0")}:00</div>, ...weekDays.map((day) => <div className="agenda-simple-slot" key={`${day}-${hour}`} {...dropProps(day, `${String(hour).padStart(2, "0")}:00`)} onDoubleClick={() => writable && setModal({ type: "appointment", initialStart: `${day}T${String(hour).padStart(2, "0")}:00` })}>{onDay(day).filter((a) => Number(agendaTime(a.starts_at).slice(0, 2)) === hour).map(draggableEvent)}</div>)])}</div>}
      {view === "day" && <div className="agenda-simple-day-timeline">{hours.map((hour) => <div className="agenda-simple-time-row" key={hour}><time>{String(hour).padStart(2, "0")}:00</time><div {...dropProps(anchor, `${String(hour).padStart(2, "0")}:00`)} onDoubleClick={() => writable && setModal({ type: "appointment", initialStart: `${anchor}T${String(hour).padStart(2, "0")}:00` })}>{onDay(anchor).filter((a) => Number(agendaTime(a.starts_at).slice(0, 2)) === hour).map(draggableEvent)}</div></div>)}</div>}
      {view === "list" && <div className="agenda-list-view">{appointments.map((a) => <article key={a.id} className="agenda-list-row" onClick={() => setSelected(a)}><time><strong>{timeLabel(a.starts_at)}</strong><small>{safeDateLabel(a.starts_at)}</small></time><Avatar person={a.patients} size={36} /><div><strong>{patientName(a, t)}</strong><small>{a.label || t("Atendimento", "Appointment")} · {a.professional_id ? t("profissional atribuído", "professional assigned") : t("sem profissional", "unassigned")}</small></div><Status value={a.status} /><Button icon={MoreHorizontal} className="icon" aria-label={t("Ações", "Actions")} /></article>)}{!appointments.length && <Empty icon={CalendarDays}>{t("Nenhum agendamento nesta visão", "No appointments in this view")}</Empty>}</div>}
    </div>{showInsights && <aside className="agenda-insights"><div className="agenda-insights-head"><div><p className="eyebrow">{t("Central da agenda", "Schedule centre")}</p><h2>{t("Organizar o dia", "Organize the day")}</h2></div><Button icon={X} className="icon" onClick={() => setShowInsights(false)} aria-label={t("Fechar", "Close")} /></div><div className="insight-card"><ClipboardCheck size={18} /><div><strong>{freeSlots} {t("horários livres", "free slots")}</strong><span>{t("Capacidade estimada no período", "Estimated capacity in this period")}</span></div></div><div className={`insight-card ${conflicts ? "warning" : ""}`}><ShieldAlert size={18} /><div><strong>{conflicts ? `${conflicts} ${t("possíveis conflitos", "possible conflicts")}` : t("Agenda sem conflitos", "No schedule conflicts")}</strong><span>{t("Profissional, sala e recurso considerados", "Professional, room and resource considered")}</span></div></div><details open><summary><Bell size={16} /> {t("Alertas e retornos", "Alerts & follow-ups")}</summary><p>{waiting ? t("Há pacientes aguardando check-in.", "Patients are waiting for check-in.") : t("Nenhum alerta operacional pendente.", "No operational alerts pending.")}</p><p>{t("A lista de espera pode receber encaixes quando um cancelamento abrir espaço.", "The waitlist can receive matches when a cancellation opens a slot.")}</p></details><details><summary><Keyboard size={16} /> {t("Atalhos", "Keyboard shortcuts")}</summary><p><kbd>N</kbd> {t("novo agendamento", "new appointment")} · <kbd>T</kbd> {t("ir para hoje", "go to today")} · <kbd>Esc</kbd> {t("fechar painel", "close panel")}</p></details><div className="agenda-export-actions"><Button icon={FileDown} onClick={exportCsv}>{t("CSV", "CSV")}</Button><Button icon={CalendarDays} onClick={exportCalendar}>{t("ICS", "ICS")}</Button><Button icon={Printer} onClick={() => window.print()}>{t("Imprimir", "Print")}</Button></div></aside>}</div>
    {selected && <AgendaPanel appointment={selected} close={() => setSelected(null)} openPatient={openPatient} setModal={setModal} writable={writable} />}
  </div>;
}

function Agenda({ openPatient, setModal, version, writable }) {
  const t = useT();
  const today = localDay();
  const [anchor, setAnchor] = useState(today), [mode, setMode] = useState(() => window.innerWidth <= 700 ? "day" : "month"), [selected, setSelected] = useState(null), [query, setQuery] = useState(""), [statusFilter, setStatusFilter] = useState("all");
  const start = mode === "month" ? monthStart(anchor) : mode === "week" ? shiftDay(anchor, -((atNoon(anchor).getDay() + 6) % 7)) : anchor;
  const end = mode === "month" ? shiftDay(start, 42) : mode === "week" ? shiftDay(start, 7) : mode === "range" ? shiftDay(anchor, 31) : shiftDay(anchor, 1);
  const state = useLoad(() => checked(db.from("appointments").select("id,patient_id,professional_id,starts_at,ends_at,status,label,version,patients(id,full_name,preferred_name,phone,email,cpf,birth_date)").gte("starts_at", `${start}T00:00:00-03:00`).lt("starts_at", `${end}T23:59:59-03:00`).order("starts_at").limit(300)), [start, end, version]);
  const appointments = (state.data || []).filter((a) => validDateValue(a.starts_at)).filter((a) => statusFilter === "all" || a.status === statusFilter).filter((a) => !query || [patientName(a, t), a.label, a.patients?.phone].join(" ").toLowerCase().includes(query.toLowerCase()));
  const monthDays = Array.from({ length: 42 }, (_, i) => shiftDay(monthStart(anchor), i - ((atNoon(monthStart(anchor)).getDay() + 6) % 7)));
  const weekStart = shiftDay(anchor, -((atNoon(anchor).getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => shiftDay(weekStart, i));
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);
  const onDay = (day) => appointments.filter((a) => agendaDay(a.starts_at) === day);
  const navigate = (direction) => setAnchor(mode === "month" ? localDay(new Date(atNoon(anchor).getFullYear(), atNoon(anchor).getMonth() + direction, 1, 12)) : shiftDay(anchor, (mode === "week" ? 7 : mode === "range" ? 31 : 1) * direction));
  const newAppointment = (day, hour = "09:00") => writable && setModal({ type: "appointment", initialStart: `${day}T${hour}` });
  const event = (a) => <AgendaEvent key={a.id} appointment={a} onSelect={setSelected} />;
  return <div className="agenda-simple"><PageHead title={t("Agenda", "Schedule")} eyebrow={t("Operação clínica", "Clinical operations")}><span className="agenda-simple-count"><strong>{appointments.length}</strong> {t("agendamentos", "appointments")}</span></PageHead>
    <div className="agenda-simple-toolbar"><div className="agenda-simple-nav"><Button onClick={() => setAnchor(today)}>{t("Hoje", "Today")}</Button><Button icon={ChevronLeft} className="icon" onClick={() => navigate(-1)} aria-label={t("Anterior", "Previous")} /><Button icon={ChevronRight} className="icon" onClick={() => navigate(1)} aria-label={t("Próximo", "Next")} /><h2>{anchor.slice(0, 7)}</h2></div><div className="agenda-simple-controls"><label className="agenda-simple-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Buscar paciente ou procedimento", "Search patient or procedure")} /></label><Field title={t("Status", "Status")} value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: t("Todos os status", "All statuses") }, ...["agendado", "confirmado", "aguardando", "em_atendimento", "concluido", "cancelado", "faltou"].map((v) => ({ value: v, label: label(v, t) }))]} /><div className="segmented">{[["day", t("Dia", "Day")], ["week", t("Semana", "Week")], ["month", t("Mês", "Month")], ["range", t("31 dias", "31 days")]].map(([key, title]) => <button key={key} aria-pressed={mode === key} onClick={() => setMode(key)}>{title}</button>)}</div>{writable && <Button icon={Plus} className="primary" onClick={() => setModal({ type: "appointment" })}>{t("Novo agendamento", "New appointment")}</Button>}</div></div>
    <div className="agenda-simple-mobile-strip">{Array.from({ length: 7 }, (_, i) => shiftDay(today, i - 2)).map((day) => <button key={day} className={day === anchor ? "selected" : ""} onClick={() => { setAnchor(day); setMode("day"); }}><small>{day.slice(5)}</small><strong>{day.slice(8)}</strong></button>)}</div>
    {state.loading && <p className="loading">{t("Carregando agenda...", "Loading schedule...")}</p>}{state.error && <div className="notice error">{t("Não foi possível carregar os agendamentos.", "Could not load appointments.")}</div>}
    <div className="agenda-simple-shell">{mode === "month" && <><div className="agenda-simple-weekdays">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => <span key={d}>{t(d, d)}</span>)}</div><div className="agenda-simple-month">{monthDays.map((day) => <div key={day} className={`agenda-simple-day ${day.slice(0, 7) === anchor.slice(0, 7) ? "" : "outside"} ${day === today ? "today" : ""}`} onDoubleClick={() => newAppointment(day)}><button type="button" className="agenda-simple-day-number" onClick={() => { setAnchor(day); setMode("day"); }}>{Number(day.slice(8))}</button><div className="agenda-simple-events">{onDay(day).slice(0, 4).map(event)}{onDay(day).length > 4 && <button type="button" className="agenda-simple-more" onClick={() => { setAnchor(day); setMode("day"); }}>+{onDay(day).length - 4}</button>}</div></div>)}</div></>}{mode === "week" && <div className="agenda-simple-week"><div className="agenda-simple-corner" />{weekDays.map((day) => <div className="agenda-simple-head" key={day}>{day.slice(5)}</div>)}{hours.flatMap((hour) => [<div className="agenda-simple-hour" key={`h${hour}`}>{String(hour).padStart(2, "0")}:00</div>, ...weekDays.map((day) => <div className="agenda-simple-slot" role="button" tabIndex="0" key={`${day}-${hour}`} onClick={() => newAppointment(day, `${String(hour).padStart(2, "0")}:00`)}>{onDay(day).filter((a) => Number(agendaTime(a.starts_at).slice(0, 2)) === hour).map(event)}</div>)])}</div>}{mode === "day" && <div className="agenda-simple-day-timeline">{hours.map((hour) => <div className="agenda-simple-time-row" key={hour}><time>{String(hour).padStart(2, "0")}:00</time><div onClick={() => newAppointment(anchor, `${String(hour).padStart(2, "0")}:00`)}>{onDay(anchor).filter((a) => Number(agendaTime(a.starts_at).slice(0, 2)) === hour).map(event)}</div></div>)}</div>}{mode === "range" && <div className="agenda-simple-range">{Array.from({ length: 31 }, (_, i) => shiftDay(anchor, i)).map((day) => <section key={day}><h3>{day}</h3>{onDay(day).map(event)}{!onDay(day).length && <p>{t("Livre", "Available")}</p>}</section>)}</div>}{!appointments.length && !state.loading && <Empty icon={CalendarDays}>{t("Nenhum agendamento neste período", "No appointments in this period")}</Empty>}</div>
    {selected && <AgendaPanel appointment={selected} close={() => setSelected(null)} openPatient={openPatient} setModal={setModal} writable={writable} />}</div>;
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
  const t = useT(), today = localDay(), now = new Date(),
    [status, setStatus] = useState("pendente"), [group, setGroup] = useState("all"),
    [page, setPage] = useState(0), [creating, setCreating] = useState(false);
  const state = useLoad(async () => {
    // The database function is idempotent and keeps automation consistent for
    // every client opening the centre, including reception workstations.
    await db.rpc("generate_action_centre_tasks").catch(() => null);
    const [taskRows, appointments, followups, adverse, clinicalProcedures] = await Promise.all([
      checked(db.from("tasks").select("*,patients(*)").order("due_at").range(0, 119)),
      checked(db.from("appointments").select("id,patient_id,starts_at,ends_at,status,label,patients(*)").gte("starts_at", new Date(Date.now() - 45 * 86400000).toISOString()).order("starts_at").limit(120)).catch(() => []),
      checked(db.from("follow_ups").select("id,patient_id,expected_on,status,notes,patients(*)").in("status", ["aguardando_agendamento", "vencido"]).order("expected_on").limit(60)).catch(() => []),
      checked(db.from("adverse_events").select("id,patient_id,followup_deadline,status,description,patients(*)").eq("status", "em_acompanhamento").order("followup_deadline").limit(30)).catch(() => []),
      checked(db.from("clinical_procedures").select("id,patient_id,performed_at,followup_due,status,patients(*),procedures(name)").eq("status", "finalizado").not("followup_due", "is", null).order("followup_due").limit(60)).catch(() => []),
    ]);
    return { tasks: taskRows.filter((task) => task.status === status).slice(page * 30, page * 30 + 30), allTasks: taskRows, appointments, followups, adverse, clinicalProcedures };
  }, [status, page, version]);
  const data = state.data || { tasks: [], allTasks: [], appointments: [], followups: [], adverse: [], clinicalProcedures: [] };
  const overdue = data.tasks.filter((r) => r.status === "pendente" && new Date(r.due_at) < now);
  const todayAppointments = data.appointments.filter((r) => validDateValue(r.starts_at) && localDay(new Date(r.starts_at)) === today && !["cancelado", "concluido"].includes(r.status));
  const attention = [
    ...data.tasks.map((task) => ({ ...task, kind: task.title?.toLowerCase().includes("retorno") ? "clinical" : "operational", source: "task", due: task.due_at })),
    ...data.followups.map((item) => ({ ...item, kind: "clinical", source: "followup", due: item.expected_on, title: t("Retorno clínico pendente", "Pending clinical follow-up") })),
    ...data.adverse.map((item) => ({ ...item, kind: "clinical", source: "adverse", due: item.followup_deadline, title: t("Acompanhar intercorrência", "Follow up adverse event") })),
    ...data.clinicalProcedures.filter((item) => item.followup_due && new Date(`${item.followup_due}T23:59:59-03:00`) <= now).map((item) => ({ ...item, kind: "clinical", source: "procedure", due: item.followup_due, title: `${t("Retorno de procedimento", "Procedure follow-up")} · ${item.procedures?.name || t("avaliação", "review")}` })),
  ].filter((item) => group === "all" || item.kind === group).sort((a, b) => new Date(a.due || 0) - new Date(b.due || 0));
  const suggestions = [...data.appointments.filter((a) => a.status === "concluido").map((a) => ({ ...a, suggestionTitle: `${t("Pós-atendimento", "Post-visit")} · ${a.label || t("verificar evolução", "check progress")}`, suggestionDue: new Date(new Date(a.starts_at).getTime() + 2 * 86400000) })), ...data.clinicalProcedures.filter((p) => p.followup_due).map((p) => ({ ...p, suggestionTitle: `${t("Retorno de procedimento", "Procedure follow-up")} · ${p.procedures?.name || t("avaliação", "review")}`, suggestionDue: new Date(`${p.followup_due}T09:00:00-03:00`) }))].filter((item) => !data.allTasks.some((task) => task.patient_id === item.patient_id && /pós-atendimento|retorno de procedimento/i.test(task.title || ""))).slice(0, 8);
  const createSuggestions = async () => {
    if (!suggestions.length) return notify(t("Nenhuma sugestão nova por enquanto.", "No new suggestions for now."));
    setCreating(true);
    try {
      await checked(db.from("tasks").insert(suggestions.map((item) => ({ organization_id: ORG, patient_id: item.patient_id, title: item.suggestionTitle, priority: "normal", status: "pendente", due_at: item.suggestionDue.toISOString() }))));
      notify(t(`${suggestions.length} tarefa(s) criada(s) a partir da agenda.`, `${suggestions.length} task(s) created from the schedule.`));
    } catch { notify(t("Não foi possível criar as sugestões.", "Could not create suggestions.")); }
    finally { setCreating(false); }
  };
  const quickWhatsApp = (patient) => { const link = whatsappMessage(patient?.phone, patient?.preferred_name || patient?.full_name); if (link) window.open(link, "_blank", "noopener,noreferrer"); else notify(t("Telefone não disponível.", "Phone not available.")); };
  const complete = async (task) => { try { await save("tasks", { status: "concluida" }, task); state.refresh(); notify(t("Tarefa concluída.", "Task completed.")); } catch { notify(t("Não foi possível salvar.", "Could not save.")); } };
  const title = t("Tarefas e retornos", "Tasks & follow-ups");
  return <>
    <PageHead eyebrow={t("Central de ação clínica", "Clinical action centre")} title={title}>
      <div className="task-head-actions"><Button icon={CalendarPlus} onClick={() => setModal({ type: "appointment" })}>{t("Agendar", "Schedule")}</Button>{writable && <Button icon={Plus} className="primary" onClick={() => setModal({ type: "task" })}>{t("Nova tarefa", "New task")}</Button>}</div>
    </PageHead>
    <section className="task-centre-hero"><div><p className="eyebrow">{t("Visão de hoje", "Today at a glance")}</p><h2>{overdue.length ? t(`${overdue.length} item(ns) pedem atenção agora`, `${overdue.length} item(s) need attention now`) : t("Tudo sob controle por aqui", "Everything is under control here")}</h2><p>{t("O centro reúne tarefas, retornos e sinais clínicos usando apenas os registros da clínica.", "This centre brings together tasks, follow-ups, and clinical signals using only clinic records.")}</p></div><div className="task-ring" style={{ "--ring": `${Math.min(100, Math.round((todayAppointments.length / Math.max(1, data.appointments.length)) * 100))}%` }}><strong>{todayAppointments.length}</strong><span>{t("hoje", "today")}</span></div></section>
    <div className="task-metrics"><button className={group === "all" ? "active" : ""} onClick={() => setGroup("all")}><span className="metric-icon metric-icon-sage"><ListChecks size={17} /></span><b>{data.tasks.length}</b><small>{t("tarefas abertas", "open tasks")}</small></button><button className={group === "clinical" ? "active" : ""} onClick={() => setGroup("clinical")}><span className="metric-icon metric-icon-rose"><Stethoscope size={17} /></span><b>{data.followups.length + data.adverse.length}</b><small>{t("atenções clínicas", "clinical attention")}</small></button><button className="metric-action" onClick={createSuggestions} disabled={!writable || creating || !suggestions.length}><span className="metric-icon metric-icon-gold"><Sparkles size={17} /></span><b>{suggestions.length}</b><small>{creating ? t("criando...", "creating...") : t("sugestões da agenda", "schedule suggestions")}</small></button></div>
    <div className="task-centre-toolbar"><div className="segmented">{[["all", t("Tudo", "All")], ["clinical", t("Clínico", "Clinical")], ["operational", t("Operacional", "Operational")]].map(([key, text]) => <button key={key} aria-pressed={group === key} onClick={() => setGroup(key)}>{text}</button>)}</div><div className="segmented">{["pendente", "concluida", "cancelado"].map((s) => <button key={s} aria-pressed={status === s} onClick={() => { setStatus(s); setPage(0); }}>{label(s, t)}</button>)}</div></div>
    {todayAppointments.length > 0 && <section className="task-today-panel"><div className="section-heading"><div><p className="eyebrow">{t("Próximos atendimentos", "Next appointments")}</p><h2>{t("A agenda que move o dia", "The schedule moving your day")}</h2></div><span className="task-count-pill">{todayAppointments.length} {t("hoje", "today")}</span></div><div className="task-appointment-grid">{todayAppointments.slice(0, 4).map((a) => <article className="task-appointment-card" key={a.id}><time>{timeLabel(a.starts_at)}</time><strong>{patientName(a, t)}</strong><small>{a.label || t("Atendimento", "Appointment")}</small><div><button onClick={() => a.patients && openPatient(a.patients)} title={t("Abrir paciente", "Open patient")}><UserRound size={15} /></button>{a.patients && <button onClick={() => quickWhatsApp(a.patients)} title="WhatsApp"><MessageCircle size={15} /></button>}<button onClick={() => setModal({ type: "appointment", appointment: a, patient: a.patients })} title={t("Editar agenda", "Edit schedule")}><Pencil size={15} /></button></div></article>)}</div></section>}
    <section className="task-list-centre">
      <div className="section-heading"><div><p className="eyebrow">{t("Fila priorizada", "Prioritized queue")}</p><h2>{t("O que precisa acontecer", "What needs to happen")}</h2></div><span className="subtle">{attention.length} {t("itens", "items")}</span></div>
      {state.loading && <p className="loading">{t("Carregando...", "Loading...")}</p>}
      {state.error && <div className="notice error">{t("Não foi possível carregar.", "Could not load.")}</div>}
      {!state.loading && !state.error && <div className="action-list">{attention.map((item) => <article className={`action-card action-card-${item.kind} ${item.due && new Date(item.due) < now ? "is-overdue" : ""}`} key={`${item.source}-${item.id}`}><button className="action-check" onClick={() => item.source === "task" ? complete(item) : item.patients && openPatient(item.patients)} title={item.source === "task" ? t("Concluir", "Complete") : t("Abrir paciente", "Open patient")}>{item.source === "task" ? <Check size={16} /> : <ChevronRight size={16} />}</button><div className="action-main"><div><span className="action-kicker">{item.kind === "clinical" ? t("Cuidado clínico", "Clinical care") : t("Operação", "Operations")}</span><strong>{item.title || t("Tarefa", "Task")}</strong><small>{item.patients?.preferred_name || item.patients?.full_name || t("Clínica", "Clinic")}{item.due ? ` · ${date(item.due, item.source === "task")}` : ""}</small></div>{item.source === "task" && <Status value={item.priority} />}</div><div className="action-tools">{item.patients && <><button onClick={() => openPatient(item.patients)} title={t("Paciente", "Patient")}><UserRound size={15} /></button><button onClick={() => quickWhatsApp(item.patients)} title="WhatsApp"><MessageCircle size={15} /></button><button onClick={() => setModal({ type: "appointment", patient: item.patients })} title={t("Agendar retorno", "Schedule follow-up")}><CalendarPlus size={15} /></button></>}{item.source === "task" && writable && <button onClick={() => setModal({ type: "task", task: item, patient: item.patients })} title={t("Editar", "Edit")}><Pencil size={15} /></button>}</div></article>)}{!attention.length && <Empty icon={CheckCircle2}>{t("Nenhuma atenção nesta combinação de filtros.", "No attention items match these filters.")}</Empty>}</div>}
      <Pager page={page} count={data.tasks.length} setPage={setPage} />
    </section>
  </>;
}

function Enquiries({ openPatient, version, writable, notify, member }) {
  const t = useT(),
    [page, setPage] = useState(0),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [selected, setSelected] = useState(null),
    [notes, setNotes] = useState(""),
    [duplicates, setDuplicates] = useState([]),
    [files, setFiles] = useState([]),
    [busy, setBusy] = useState(false);
  const loadRows = async () => {
    let q = db.from("public_intakes").select("*").order("submitted_at", { ascending: false });
    if (status !== "all") q = q.eq("status", status);
    if (search.trim()) {
      const term = safeSearch(search);
      q = q.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,cpf.ilike.%${digits(term)}%`);
    }
    return checked(q.range(page * 20, page * 20 + 19));
  };
  const state = useLoad(loadRows, [page, status, search, version]);
  const saveIntake = async (values) => {
    const row = await checked(
      db
        .from("public_intakes")
        .update(values)
        .eq("id", selected.id)
        .select("id,status,patient_id,internal_notes,retention_hold")
        .single(),
    );
    state.refresh();
    return row;
  };
  const review = async (row) => {
    setSelected(row);
    setNotes(row.internal_notes);
    setDuplicates([]);
    setFiles([]);
    checked(db.from("public_intake_files").select("id,kind,path,original_name,field_name").eq("intake_id", row.id))
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
      if (!id) throw new Error("conversion_no_patient");
      const p = await checked(
        db.from("patients").select("*").eq("id", id).single(),
      );
      notify(t("Formulário convertido em paciente.", "Form converted to patient."));
      setSelected(null);
      openPatient(p);
    } catch (error) {
      console.error("PUBLIC_INTAKE_CONVERSION_FAILED", error);
      const message = error?.code === "23505"
        ? t("Já existe um paciente com este CPF. Abra o formulário novamente e use Vincular.", "A patient with this CPF already exists. Reopen the form and use Link.")
        : error?.message === "conversion_no_patient"
          ? t("A conversão não retornou um paciente. Tente novamente.", "Conversion did not return a patient. Try again.")
          : t("Não foi possível converter. Verifique a mensagem no console e tente novamente.", "Could not convert. Check the console message and try again.");
      notify(message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHead
        title={t("Formulários", "Forms")}
        eyebrow={t("Primeiro contato", "First contact")}
      >
        <a
          className="button primary forms-launch-button"
          href="https://francielesofiati.com/formulario"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileText className="forms-launch-icon" size={18} />
          {t("Formulário do paciente", "Patient form")}
        </a>
      </PageHead>
      <div className="toolbar wrap">
        <label className="search">
          <Search size={19} />
          <input aria-label={t("Buscar formulários", "Search forms")} placeholder={t("Nome, CPF, telefone ou email", "Name, CPF, phone or email")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </label>
        <div className="segmented">
          {["all", "novo", "em_analise", "contatado", "aguardando", "convertido", "arquivado"].map((s) => <button key={s} aria-pressed={status === s} onClick={() => { setStatus(s); setPage(0); }}>{s === "all" ? t("Todos", "All") : label(s, t)}</button>)}
        </div>
      </div>
      <LoadState state={state}>
        {(rows) => (
          <>
            {rows.map((row) => (
              <button
                className="patient-row"
                key={row.id}
                onClick={() => review(row)}
              >
                <Avatar person={row} />
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
              href={whatsappMessage(selected.phone, selected.full_name)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          )}
          <p className="subtle">
            {t("Autorização de contato", "Contact permission")}:{" "}
            {date(selected.submitted_at || selected.created_at, true)}
          </p>
          <p className="subtle">{t("Versão", "Version")}: {selected.form_version} · {t("Retenção até", "Retention until")}: {date(selected.retention_expires_at)}</p>
          <div className="actions wrap">
            {selected.phone && <a className="button" href={`tel:${digits(selected.phone)}`}>{t("Ligar", "Call")}</a>}
            {selected.email && <a className="button" href={`mailto:${selected.email}`}>{t("Email", "Email")}</a>}
            {selected.patient_id && (
              <Button
                icon={ClipboardCheck}
                className="primary"
                onClick={async () => {
                  try {
                    const patient = await checked(db.from("patients").select("*").eq("id", selected.patient_id).single());
                    setSelected(null);
                    setModal({ type: "master-intake", patient, sourceIntake: selected });
                  } catch { notify(t("Não foi possível abrir o intake.", "Could not open intake.")); }
                }}
              >
                {t("Consulta inicial completa", "Master Intake")}
              </Button>
            )}
            {selected.patient_id && (
              <Button
                className="primary"
                onClick={async () => {
                  setBusy(true);
                  try {
                    const patient = await checked(
                      db.from("patients").select("*").eq("id", selected.patient_id).single(),
                    );
                    setSelected(null);
                    openPatient(patient);
                  } catch {
                    notify(t("Não foi possível abrir o paciente vinculado.", "Could not open the linked patient."));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t("Abrir paciente", "Open patient")}
              </Button>
            )}
          </div>
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
                    {file.original_name || (file.kind === "identity" ? t("Documento de identidade", "Identity document") : file.kind === "payment" ? t("Comprovante de pagamento", "Payment proof") : t("Anexo", "Attachment"))}
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
          {writable && <div className="form-grid">
            <Field title={t("Status", "Status")} value={selected.status} onChange={(value) => setSelected((current) => ({ ...current, status: value }))} options={["novo", "em_analise", "contatado", "aguardando", "convertido", "arquivado"].map((value) => ({ value, label: label(value, t) }))} />
            <label className="field"><span>{t("Retenção legal", "Legal hold")}</span><input type="checkbox" checked={selected.retention_hold === true} onChange={(event) => setSelected((current) => ({ ...current, retention_hold: event.target.checked }))} /><small>{t("Impede a limpeza automática de 60 dias.", "Prevents automatic 60-day cleanup.")}</small></label>
          </div>}
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
                  if (selected.status === "convertido" && !selected.patient_id) {
                    await convert(null);
                    return;
                  }
                  setBusy(true);
                  try {
                    await saveIntake({
                      internal_notes: notes,
                      status: selected.status === "novo" ? "em_analise" : selected.status,
                      retention_hold: selected.retention_hold === true,
                      reviewed_by: member?.user_id,
                      reviewed_at: new Date().toISOString(),
                    });
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
              <Button
                disabled={busy || selected.status === "convertido"}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await saveIntake({
                      status: "arquivado",
                      internal_notes: notes,
                      reviewed_by: member?.user_id,
                      reviewed_at: new Date().toISOString(),
                    });
                    setSelected(null);
                    notify(t("Formulário arquivado.", "Form archived."));
                  } catch (error) {
                    console.error("PUBLIC_INTAKE_ARCHIVE_FAILED", error);
                    notify(t("Não foi possível arquivar.", "Could not archive."));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t("Arquivar", "Archive")}
              </Button>
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
    [description, setDescription] = useState(""),
    [documentDate, setDocumentDate] = useState(localDay()),
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
              body.set("description", description);
              body.set("document_date", documentDate);
              const result = await invoke("files", body);
              doc = result.document;
              setUploaded(doc);
            }
            if (doc?.id) await checked(db.from("documents").update({ description, document_date: documentDate || null }).eq("id", doc.id));
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
          options={["documento", "exame", "laudo", "encaminhamento", "consentimento", "receita", "atestado", "imagem", "outro"].map((s) => ({
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
        <Field title={t("Descrição", "Description")} value={description} onChange={setDescription} wide />
        <Field title={t("Data do documento", "Document date")} type="date" value={documentDate} onChange={setDocumentDate} />
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
async function collectFullBackup() {
  if (!(await checked(db.rpc("authorize_full_backup")))) throw Error("not_authorized");
  const tables = ["organizations", "memberships", "patients", "entries", "entry_versions", "admin_notes", "appointments", "tasks", "enquiries", "documents", "document_links", "communications", "audit_events", "procedures", "products", "product_lots", "devices", "treatment_plans", "treatment_plan_items", "clinical_procedures", "product_usages", "clinical_photos", "consents", "follow_ups", "adverse_events", "privacy_requests", "patient_health_history", "procedure_devices", "patient_portal_shares", "financial_records", "financial_payments", "staff_permissions"];
  const data = { format: "sofiati-full-backup-v1", exported_at: new Date().toISOString(), organization_id: ORG, tables: {}, files: [] };
  data.tables.organizations = await checked(db.from("organizations").select("*").eq("id", ORG));
  for (const table of tables.filter((name) => name !== "organizations")) data.tables[table] = await allRows(table);
  const fileRows = [...(data.tables.documents || []).filter((row) => row.status === "pronto"), ...(data.tables.clinical_photos || [])];
  for (const row of fileRows) {
    const bucket = row.path?.startsWith(`${ORG}/`) ? (data.tables.documents?.some((d) => d.id === row.id) ? "patient-files" : "clinical-photos") : null;
    if (!bucket) continue;
    const blob = await checked(db.storage.from(bucket).download(row.path));
    const raw = new Uint8Array(await blob.arrayBuffer());
    const sha256 = [...new Uint8Array(await crypto.subtle.digest("SHA-256", raw))].map((b) => b.toString(16).padStart(2, "0")).join("");
    data.files.push({ id: row.id, path: row.path, bucket, sha256, mime_type: row.mime_type || blob.type, base64: await fileBase64(blob) });
  }
  return data;
}
function FullBackupExport({ member, notify }) {
  const t = useT(), [pass, setPass] = useState(""), [confirmPass, setConfirm] = useState(""), [packets, setPackets] = useState(null), [busy, setBusy] = useState(false);
  if (member.email?.toLowerCase() !== "suportesofiati@gmail.com") return <section className="detail-section"><h2>{t("Exportar todos os dados", "Export all data")}</h2><p className="notice"><ShieldCheck size={18} /> {t("Disponível somente para suportesofiati@gmail.com.", "Available only to suportesofiati@gmail.com.")}</p></section>;
  const prepare = async () => { if (pass.length < 16 || pass !== confirmPass) return notify(t("Use e confirme uma frase com pelo menos 16 caracteres.", "Use and confirm a passphrase of at least 16 characters.")); setBusy(true); try { setPackets(await encryptPackets(await collectFullBackup(), pass)); setPass(""); setConfirm(""); notify(t("Backup completo criptografado pronto para download.", "Complete encrypted backup ready for download.")); } catch { notify(t("Não foi possível criar o backup completo.", "Could not create the complete backup.")); } finally { setBusy(false); } };
  return <section className="detail-section"><div className="section-heading"><div><h2>{t("Exportar todos os dados", "Export all data")}</h2><p className="subtle">{t("Inclui banco, arquivos, pacientes, profissionais e informações do sistema. O backup é criptografado no navegador.", "Includes database, files, patients, professionals, and system information. The backup is encrypted in your browser.")}</p></div><LockKeyhole size={22} /></div>{!packets ? <><div className="form-grid"><Field title={t("Frase de recuperação", "Recovery passphrase")} type="password" minLength={16} value={pass} onChange={setPass} /><Field title={t("Confirmar frase", "Confirm passphrase")} type="password" value={confirmPass} onChange={setConfirm} /></div><Button className="primary" icon={Download} disabled={busy} onClick={prepare}>{busy ? t("Preparando...", "Preparing...") : t("Exportar todos os dados", "Export all data")}</Button></> : <div className="actions wrap">{packets.map((part, index) => <Button key={index} icon={Download} onClick={() => download(new Blob([JSON.stringify(part)], { type: "application/json" }), `backup-completo-${index + 1}-de-${packets.length}.encrypted.json`)}>{t("Baixar parte", "Download part")} {index + 1}/{packets.length}</Button>)}</div>}</section>;
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
  const patient = data.tables.patients[0] || {};
  const body = (data.tables.entries || []).map((e, index) => `<section class="document-section"><div class="document-section-heading"><span class="document-section-number">${String(index + 1).padStart(2, "0")}</span><h2>${documentEscape(e.title || label(e.kind, t))}</h2></div><article class="document-record"><div class="document-record-top"><span class="document-record-kind">${documentEscape(label(e.kind, t))}</span><time>${documentEscape(date(e.clinical_at, true))}</time></div><p>${documentEscape(e.content)}</p><p class="document-muted">${documentEscape(label(e.status, t))} · ${documentEscape(t("versão", "version"))} ${documentEscape(e.version)}</p></article></section>`).join("") || `<p class="document-muted">${documentEscape(t("Nenhum registro disponível.", "No records available."))}</p>`;
  const shared = reportDocumentHTML({ title: t("Registro recuperado", "Recovered record"), patient, body, warning: t("Registro restaurado a partir de um backup criptografado.", "Record restored from an encrypted backup."), documentId: `BACKUP-${Date.now().toString(36).toUpperCase()}`, generated: date(new Date().toISOString(), true), mode: "integral", t });
  if (openDocument(shared)) return;
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

const paymentMethods = [
  ["pix", "PIX"], ["cartao_credito", "Cartão de crédito"],
  ["cartao_debito", "Cartão de débito"], ["dinheiro", "Dinheiro"],
  ["transferencia", "Transferência"], ["boleto", "Boleto"], ["outro", "Outro"],
];
const cents = (value) => Math.round(Number(String(value).replace(",", ".") || 0) * 100);
function printReceipt(record, patient, payments, t) {
  const shared = receiptDocumentHTML({ record, patient, payments, paymentMethodLabel: (method, translate) => paymentMethods.find(([key]) => key === method)?.[1] || method, money, date, t });
  if (openDocument(shared)) return;
  const received = payments.reduce((sum, payment) => sum + Number(payment.amount_cents || 0), 0);
  const total = Number(record.total_cents || 0), balance = Math.max(0, total - received);
  const paymentWording = balance ? t("Pagamento parcial", "Partial payment") : t("Pagamento integral", "Payment in full");
  const win = window.open("", "_blank");
  if (!win) return;
  const rows = payments.map((p) => `<div class="line"><span>${escapeHTML(date(p.paid_on))} · ${escapeHTML(paymentMethods.find(([key]) => key === p.method)?.[1] || p.method)}</span><strong>${escapeHTML(money(p.amount_cents / 100))}</strong></div>`).join("");
  win.document.open("text/html", "replace");
  win.document.write(`<!doctype html><html lang="${t("pt-BR", "en-US")}"><head><meta charset="utf-8"><title>${escapeHTML(t("Recibo de pagamento", "Payment receipt"))}</title><style>
  :root{color:#1d3026;background:#f2eee6}*{box-sizing:border-box}body{margin:0;padding:16mm;font:12px/1.5 Inter,"Avenir Next",Arial,sans-serif}.receipt{max-width:720px;min-height:250mm;margin:auto;background:#fffdf8;border:1px solid #d8cdbb;box-shadow:0 12px 34px #39251b14;padding:30px 38px;position:relative;overflow:hidden}.receipt:before,.receipt:after{content:"";position:absolute;width:180px;height:180px;border:1px solid #d9b979;border-radius:50%;opacity:.22;pointer-events:none}.receipt:before{right:-100px;top:-90px}.receipt:after{left:-120px;bottom:-100px}header{display:flex;align-items:center;gap:16px;border-bottom:2px solid #3f5039;padding-bottom:16px;margin-bottom:22px;position:relative;z-index:1}.logo{width:74px;height:74px;object-fit:contain;display:block}.brand{font:400 21px Georgia,serif}.brand span{display:block;font:800 9px Inter,Arial,sans-serif;letter-spacing:.11em;color:#9f5b55;margin-top:6px}.meta{color:#52634b;font-size:11px}.header-meta{margin:0 0 0 auto;max-width:145px;text-align:right}.header-meta strong{display:block;color:#1d3026;font-size:11px}.receipt-title{display:flex;align-items:end;justify-content:space-between;gap:16px;margin:20px 0 24px}.receipt-title h2{text-align:left;letter-spacing:.06em;font:400 21px Georgia,serif;margin:0}.receipt-title .meta{margin:0;text-align:right}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin-bottom:20px}.label{display:block;color:#52634b;font-size:10px;margin-bottom:3px}.line{display:flex;justify-content:space-between;border-bottom:1px solid #e8e1d7;padding:8px 0}.summary{background:#edf1e8;border:1px solid #d8e0d2;border-radius:4px;padding:12px 14px;margin-top:18px}.summary div{display:flex;justify-content:space-between;margin:5px 0}.balance{color:#9f5b55;font-size:15px;font-weight:700}.footer{border-top:1px solid #d8cdbb;margin-top:26px;padding-top:13px;display:flex;justify-content:space-between;gap:12px;font-size:9px;color:#52634b;letter-spacing:.04em}.footer strong{color:#1d3026}button{padding:10px 16px;border:1px solid #dce2d7;background:white;color:#3f5039;cursor:pointer}@media print{body{padding:0;background:white}.receipt{box-shadow:none;border:0;max-width:none;min-height:0}button{display:none}@page{size:A4;margin:10mm}}</style></head><body><button id="print">${escapeHTML(t("Imprimir / salvar PDF", "Print / save PDF"))}</button><article class="receipt"><header><img class="logo" src="${LOGO}" alt="Franciele Sofiati"/><div class="brand">Franciele Sofiati<span>Biomédica | Esteticista | Cosmetóloga · CRBM 6277 PR</span></div><p class="meta header-meta"><strong>${escapeHTML(t("Recibo de pagamento", "Payment receipt"))}</strong>${escapeHTML(t("Não é Nota Fiscal", "Not a fiscal invoice"))}</p></header><div class="receipt-title"><h2>${escapeHTML(t("RECIBO DE PAGAMENTO", "PAYMENT RECEIPT"))}</h2><p class="meta">${escapeHTML(t("Emitido em", "Issued on"))}<br>${escapeHTML(date(new Date().toISOString()))}</p></div><div class="grid"><div><span class="label">${escapeHTML(t("Recebemos de", "Received from"))}</span><strong>${escapeHTML(patient?.preferred_name || patient?.full_name || "—")}</strong></div><div><span class="label">CPF</span>${escapeHTML(patient?.cpf || "—")}</div><div><span class="label">${escapeHTML(t("Procedimento", "Treatment"))}</span>${escapeHTML(record.procedure_name || "—")}</div><div><span class="label">${escapeHTML(t("Recibo nº", "Receipt no."))}</span>${escapeHTML(record.receipt_number || record.id.slice(0, 8).toUpperCase())}</div></div><p class="meta"><strong>${escapeHTML(paymentWording)}</strong></p><h3>${escapeHTML(t("Pagamentos recebidos", "Payments received"))}</h3>${rows || `<p class="meta">${escapeHTML(t("Nenhum pagamento registrado", "No payments recorded"))}</p>`}<div class="summary"><div><span>${escapeHTML(t("Valor total do tratamento", "Total treatment amount"))}</span><strong>${escapeHTML(money(total / 100))}</strong></div><div><span>${escapeHTML(t("Valor recebido", "Amount received"))}</span><strong>${escapeHTML(money(received / 100))}</strong></div><div class="balance"><span>${escapeHTML(t("Saldo pendente", "Remaining balance"))}</span><strong>${escapeHTML(money(balance / 100))}</strong></div></div><p>${escapeHTML(t("Recebemos a importância acima referente ao procedimento descrito.", "We received the amount above for the treatment described."))}</p><footer class="footer"><span>Biomédica | Esteticista | Cosmetóloga · CRBM 6277 PR</span><strong>${escapeHTML(t("Documento financeiro · uso confidencial", "Financial document · confidential use"))}</strong></footer></article></body></html>`);
  win.document.close(); win.focus(); win.document.getElementById("print").onclick = () => win.print();
}
function Financeiro({ notify, version }) {
  const t = useT(), [showForm, setShowForm] = useState(false), [selected, setSelected] = useState(null), [busy, setBusy] = useState(false);
  const blank = { patient_id: "", procedure_name: "", total: "", due_on: localDay(), nota_fiscal_issued: false, nota_fiscal_url: "", notes: "" };
  const [form, setForm] = useState(blank), [payment, setPayment] = useState({ amount: "", paid_on: localDay(), method: "pix", notes: "" });
  const patients = useLoad(() => checked(db.from("patients").select("id,full_name,preferred_name").eq("status", "ativo").order("full_name")), []);
  const state = useLoad(async () => {
    const records = await checked(db.from("financial_records").select("*,patients(id,full_name,preferred_name)").order("created_at", { ascending: false }));
    const payments = records.length ? await checked(db.from("financial_payments").select("*").in("record_id", records.map((r) => r.id)).order("paid_on", { ascending: false })) : [];
    return records.map((r) => ({ ...r, payments: payments.filter((p) => p.record_id === r.id) }));
  }, [version]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const saveRecord = async (e) => { e.preventDefault(); setBusy(true); try { const record = await checked(db.from("financial_records").insert({ organization_id: ORG, patient_id: form.patient_id, procedure_name: form.procedure_name, total_cents: cents(form.total), due_on: form.due_on || null, nota_fiscal_issued: form.nota_fiscal_issued, nota_fiscal_url: form.nota_fiscal_url.trim(), notes: form.notes }).select().single()); const file = e.currentTarget.nota_fiscal_file.files[0]; let fileWarning = false; if (file) { const allowed = ["application/pdf", "image/jpeg", "image/png"].includes(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name); if (file.size > 8388608 || !allowed) fileWarning = true; else { const path = `${ORG}/${record.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`; try { await checked(db.storage.from("finance-private").upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" })); await checked(db.from("financial_records").update({ nota_fiscal_path: path }).eq("id", record.id)); } catch { fileWarning = true; } } } setForm(blank); setShowForm(false); state.refresh(); notify(fileWarning ? t("Cobrança salva. Não foi possível anexar a NF; use o link oficial ou tente o upload novamente.", "Record saved. The invoice could not be attached; use the official link or try uploading again.") : t("Cobrança salva com trilha de auditoria.", "Record saved with an audit trail.")); } catch (error) { notify(error?.code === "42501" ? t("Acesso financeiro negado pelo banco. Confirme a conta suportesofiati@gmail.com.", "Database denied finance access. Confirm the suportesofiati@gmail.com account.") : t("Não foi possível salvar. Confira paciente, valor e tente novamente.", "Could not save. Check the patient, amount and try again.")); } finally { setBusy(false); } };
  const addPayment = async (record) => { if (cents(payment.amount) <= 0) return; setBusy(true); try { await checked(db.from("financial_payments").insert({ organization_id: ORG, record_id: record.id, patient_id: record.patient_id, amount_cents: cents(payment.amount), paid_on: payment.paid_on, method: payment.method, notes: payment.notes })); setPayment({ amount: "", paid_on: localDay(), method: "pix", notes: "" }); state.refresh(); notify(t("Pagamento registrado.", "Payment recorded.")); } catch { notify(t("Não foi possível registrar o pagamento.", "Could not record the payment.")); } finally { setBusy(false); } };
  return <><PageHead title={t("Financeiro", "Finance")} eyebrow={t("Área exclusiva · suportesofiati@gmail.com", "Exclusive area · suportesofiati@gmail.com")}><Button icon={Plus} className="primary" onClick={() => setShowForm(true)}>{t("Nova cobrança", "New charge")}</Button></PageHead><div className="notice finance-lock"><ShieldCheck size={18}/><span>{t("Somente a conta autenticada suportesofiati@gmail.com pode acessar estes dados. Cada alteração fica registrada.", "Only the authenticated suportesofiati@gmail.com account can access these records. Every change is logged.")}</span></div>{state.data && <div className="finance-overview"><div><span>{t("Em aberto", "Open")}</span><strong>{state.data.filter((r) => r.status !== "cancelado").length}</strong></div><div><span>{t("A receber", "To receive")}</span><strong>{money(state.data.reduce((sum, r) => sum + Math.max(0, Number(r.total_cents || 0) - r.payments.filter((p) => p.status === "recebido").reduce((s, p) => s + Number(p.amount_cents || 0), 0)), 0) / 100)}</strong></div><div><span>{t("Recebido", "Received")}</span><strong>{money(state.data.reduce((sum, r) => sum + r.payments.filter((p) => p.status === "recebido").reduce((s, p) => s + Number(p.amount_cents || 0), 0), 0) / 100)}</strong></div></div>}{showForm && <section className="detail-section finance-form"><div className="toolbar"><div><h2>{t("Registrar cobrança", "Record a charge")}</h2><p className="subtle">{t("Cadastre o valor total e, depois, os pagamentos parciais recebidos.", "Add the total first, then record partial payments as they arrive.")}</p></div><Button onClick={() => setShowForm(false)}>{t("Fechar", "Close")}</Button></div><form className="form-grid" onSubmit={saveRecord}><Field title={t("Paciente", "Patient")} value={form.patient_id} onChange={(v) => set("patient_id", v)} options={[{value:"",label:t("Selecionar paciente", "Select patient")}, ...(patients.data || []).map((p) => ({value:p.id,label:p.preferred_name || p.full_name}))]} required/><Field title={t("Procedimento / referência", "Treatment / reference")} value={form.procedure_name} onChange={(v) => set("procedure_name", v)} required/><Field title={t("Valor total (R$)", "Total amount") } type="number" min="0" step="0.01" value={form.total} onChange={(v) => set("total", v)} required/><Field title={t("Vencimento", "Due date")} type="date" value={form.due_on} onChange={(v) => set("due_on", v)}/><label className="field"><span>{t("Nota Fiscal emitida", "Invoice issued")}</span><input type="checkbox" checked={form.nota_fiscal_issued} onChange={(e) => set("nota_fiscal_issued", e.target.checked)}/></label><Field title={t("Link oficial da Nota Fiscal", "Official invoice link")} type="url" value={form.nota_fiscal_url} onChange={(v) => set("nota_fiscal_url", v)} placeholder="https://..."/><label className="field wide"><span>{t("Upload da Nota Fiscal (PDF ou imagem)", "Upload invoice (PDF or image)")}</span><input name="nota_fiscal_file" type="file" accept="application/pdf,image/jpeg,image/png"/><small>{t("Máximo de 8 MB. Arquivo privado.", "Maximum 8 MB. Private file.")}</small></label><Field title={t("Observações", "Notes")} type="textarea" value={form.notes} onChange={(v) => set("notes", v)} wide/><footer className="form-footer"><Button className="primary" icon={Save} disabled={busy}>{busy ? t("Salvando...", "Saving...") : t("Salvar cobrança", "Save charge")}</Button></footer></form></section>}<LoadState state={state}>{(records) => <div className="finance-list">{records.map((record) => { const paid = record.payments.filter((p) => p.status === "recebido").reduce((s, p) => s + Number(p.amount_cents || 0), 0), balance = Math.max(0, Number(record.total_cents || 0) - paid), patient = record.patients; return <article className="finance-card ledger-row" key={record.id}><div className="finance-card-head"><div><p className="eyebrow finance-nf-status">{record.nota_fiscal_issued ? t("Nota Fiscal emitida", "Invoice issued") : t("Nota Fiscal pendente", "Invoice pending")}</p><h2>{patient?.preferred_name || patient?.full_name || t("Paciente", "Patient")}</h2><p className="subtle">{record.procedure_name || t("Sem referência", "No reference")} · {record.due_on ? `${t("vence", "due")} ${date(record.due_on)}` : t("sem vencimento", "no due date")}</p></div><div className="finance-total"><strong>{money(record.total_cents / 100)}</strong><span>{t("valor total", "total")}</span></div></div><div className="finance-summary" aria-label={t("Resumo financeiro", "Financial summary")}><div><span>{t("Recebido", "Received")}</span><strong>{money(paid / 100)}</strong></div><div><span>{t("Saldo", "Balance")}</span><strong className={balance ? "open-balance" : "paid-balance"}>{money(balance / 100)}</strong></div></div>{record.payments.length > 0 && <div className="payment-history"><strong>{t("Histórico de pagamentos", "Payment history")}</strong>{record.payments.map((p) => <div className="payment-row" key={p.id}><span>{date(p.paid_on)} · {paymentMethods.find(([key]) => key === p.method)?.[1] || p.method}</span><strong>{money(p.amount_cents / 100)}</strong></div>)}</div>}<div className="finance-actions"><Button icon={Receipt} onClick={() => printReceipt(record, patient, record.payments, t)}>{t("Recibo / PDF", "Receipt / PDF")}</Button>{record.nota_fiscal_url && <a className="button" href={record.nota_fiscal_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={17}/>{t("Abrir NF", "Open invoice")}</a>}{record.nota_fiscal_path && <Button icon={Download} onClick={async () => { const { data } = await db.storage.from("finance-private").createSignedUrl(record.nota_fiscal_path, 60); if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer"); }}>{t("Ver arquivo NF", "View invoice file")}</Button>}<Button icon={selected === record.id ? X : Plus} onClick={() => setSelected(selected === record.id ? null : record.id)}>{selected === record.id ? t("Fechar", "Close") : t("Adicionar pagamento", "Add payment")}</Button></div>{selected === record.id && <div className="payment-entry"><Field title={t("Valor recebido (R$)", "Amount received")} type="number" min="0.01" step="0.01" value={payment.amount} onChange={(v) => setPayment({...payment, amount:v})}/><Field title={t("Data", "Date")} type="date" value={payment.paid_on} onChange={(v) => setPayment({...payment, paid_on:v})}/><Field title={t("Forma de pagamento", "Payment method")} value={payment.method} onChange={(v) => setPayment({...payment, method:v})} options={paymentMethods.map(([value,label]) => ({value,label:t(label,label)}))}/><Button className="primary" icon={Check} disabled={busy} onClick={() => addPayment(record)}>{t("Confirmar recebimento", "Confirm payment")}</Button></div>}</article>})}{!records.length && <Empty icon={WalletCards}>{t("Ainda não há cobranças. Comece com o primeiro lançamento.", "No charges yet. Start with the first record.")}</Empty>}</div>}</LoadState></>;
}
function reportPrint(data, type, mode, t, warning) {
  const win = window.open("", "_blank");
  if (!win) return;
  const generated = new Date().toISOString(), patient = data.patient;
  const title = type === "complete" || type === "Pacote completo" ? t("Prontuário completo do paciente", "Complete patient record") : type;
  const rows = (items, render) => items?.length ? items.map(render).join("") : `<p class="muted">${escapeHTML(t("Nenhum registro no escopo selecionado.", "No record in the selected scope."))}</p>`;
  const entryRows = rows(data.entries, (e) => `<article><h3>${escapeHTML(label(e.kind, t))}: ${escapeHTML(e.title)}</h3><p class="meta">${escapeHTML(date(e.clinical_at, true))} · ${escapeHTML(e.status || "")} · v${escapeHTML(e.version)}</p><p>${escapeHTML(e.content)}</p></article>`);
  const sections = type === "complete" || type === "Pacote completo" || type === "Prontuário completo do paciente" ? [
    [t("1. Identificação", "1. Identification"), `<p><strong>${escapeHTML(patient?.full_name)}</strong></p><p>CPF: ${escapeHTML(patient?.cpf || "—")} · ${escapeHTML(date(patient?.birth_date))}</p><p>${escapeHTML(patient?.phone || "—")} · ${escapeHTML(patient?.email || "—")}</p>`],
    [t("2. Registros clínicos e histórico cronológico", "2. Clinical records and chronological history"), entryRows],
    [t("3. Procedimentos realizados", "3. Procedures performed"), rows(data.procedures, (p) => `<p>${escapeHTML(date(p.performed_at, true))} · ${escapeHTML(p.status)} · ${escapeHTML(p.area || p.treatment_area || "—")}</p>`)],
    [t("4. Documentos, consentimentos e fotografias", "4. Documents, consents and photographs"), rows(data.documents, (d) => `<p>${escapeHTML(d.name)} · ${escapeHTML(date(d.created_at))}<br><span class="meta">SHA-256: ${escapeHTML(d.sha256 || "—")}</span></p>`)],
    [t("5. Histórico de atendimentos", "5. Appointment history"), rows(data.appointments, (a) => `<p>${escapeHTML(date(a.starts_at, true))} · ${escapeHTML(label(a.status, t))} · ${escapeHTML(a.label || "")}</p>`)],
  ] : [[title, entryRows]];
  win.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHTML(title)}</title><style>@page{size:A4;margin:18mm 16mm}*{box-sizing:border-box}body{font:12px/1.55 Arial,sans-serif;color:#24372d;margin:0}header{border-bottom:2px solid #52674d;padding-bottom:14px;margin-bottom:25px}.logo{width:170px}.kicker,.meta,.muted{color:#687960;font-size:10px}.title{text-align:center;margin:35px 0}.title h1{font:400 25px Georgia,serif;letter-spacing:.07em}.patient{font:18px Georgia,serif}h2{font:18px Georgia,serif;border-bottom:1px solid #d8cdbb;padding-bottom:7px;margin-top:28px}h3{font:15px Georgia,serif;margin-bottom:3px}p{white-space:pre-wrap;overflow-wrap:anywhere}article{border-bottom:1px solid #e7dfd2;padding:8px 0;break-inside:avoid}.warning{padding:10px 12px;background:#f5e2da;color:#70463f;border-left:3px solid #8b554a}.footer{border-top:1px solid #d8cdbb;margin-top:28px;padding-top:9px;text-align:center;font-size:10px;color:#687960}.page::after{content:' · Página ' counter(page) ' de ' counter(pages)}button{padding:10px 16px;margin-bottom:15px}@media print{button{display:none}}</style></head><body><button id="print">${escapeHTML(t("Imprimir / salvar PDF", "Print / save PDF"))}</button><header><img class="logo" src="${LOGO}" alt="Franciele Sofiati"><div class="kicker">BIOMÉDICA ESTETA · CRBM 6277 PR</div></header><div class="title"><p class="kicker">${escapeHTML(mode === "integral" ? t("Registro completo / integral", "Complete / integral record") : t("Resumo profissional", "Professional summary"))}</p><h1>${escapeHTML(title).toUpperCase()}</h1><p class="patient">${escapeHTML(patient?.full_name || t("Paciente não selecionado", "No patient selected"))}</p><p class="kicker">${escapeHTML(t("Gerado em", "Generated on"))} ${escapeHTML(date(generated, true))}</p></div>${warning ? `<p class="warning">${escapeHTML(warning)}</p>` : ""}${sections.map(([heading, content]) => `<section><h2>${escapeHTML(heading)}</h2>${content}</section>`).join("")}<footer class="footer page">Franciele Sofiati · Biomédica Esteta · CRBM 6277 PR · ${escapeHTML(t("Documento confidencial", "Confidential document"))}<br>${escapeHTML(t("Gerado pelo sistema · usuário autenticado · paciente", "Generated by system · authenticated user · patient"))} ${escapeHTML(patient?.id || "—")}</footer></body></html>`);
  win.document.close(); win.document.getElementById("print").onclick = () => win.print();
}
function reportPrintShared(data, type, mode, t, warning, targetWindow = null) {
  const title = type === "complete" || type === "Pacote completo" ? t("Prontuário completo do paciente", "Complete patient record") : type;
  const esc = documentEscape;
  const empty = `<p class="document-muted">${esc(t("Nenhum registro disponível neste escopo.", "No records available in this scope."))}</p>`;
  const section = (number, heading, content) => `<section class="document-section"><div class="document-section-heading"><span class="document-section-number">${number}</span><h2>${esc(heading)}</h2></div>${content}</section>`;
  const list = (items, render) => items?.length ? items.map(render).join("") : empty;
  const body = [
    section("01", t("Identificação da paciente", "Patient identification"), `<div class="document-grid"><div><span class="document-label">Nome completo</span><strong class="document-value">${esc(data.patient?.full_name)}</strong></div><div><span class="document-label">CPF</span><strong class="document-value">${esc(data.patient?.cpf)}</strong></div><div><span class="document-label">Nascimento</span><strong class="document-value">${esc(date(data.patient?.birth_date))}</strong></div><div><span class="document-label">Contato</span><strong class="document-value">${esc(data.patient?.phone || data.patient?.email)}</strong></div></div>`),
    section("02", t("Registros clínicos e linha do tempo", "Clinical records and timeline"), list(data.entries, (e) => `<article class="document-record"><div class="document-record-top"><span class="document-record-kind">${esc(label(e.kind, t))}</span><time>${esc(date(e.clinical_at, true))}</time></div><h3>${esc(e.title || t("Registro clínico", "Clinical record"))}</h3><p>${esc(e.content)}</p><p class="document-muted">${esc(label(e.status, t))} · ${esc(t("versão", "version"))} ${esc(e.version)}</p></article>`)),
    section("03", t("Procedimentos realizados", "Procedures performed"), list(data.procedures, (p) => `<article class="document-record"><div class="document-record-top"><span class="document-record-kind">${esc(t("Procedimento", "Procedure"))}</span><time>${esc(date(p.performed_at, true))}</time></div><h3>${esc(p.name || p.title || t("Procedimento realizado", "Procedure performed"))}</h3><p>${esc(p.area || p.treatment_area || p.observations)}</p></article>`)),
    section("04", t("Documentos e consentimentos", "Documents and consents"), list(data.documents, (d) => `<article class="document-record"><h3>${esc(d.name || t("Documento sem nome", "Unnamed document"))}</h3><p class="document-muted">${esc(date(d.created_at))} · ${esc(d.sha256 ? `SHA-256: ${d.sha256}` : t("Arquivo anexado ao prontuário", "File attached to record"))}</p></article>`)),
    section("05", t("Histórico de atendimentos", "Appointment history"), `<table class="document-table"><thead><tr><th>${esc(t("Data", "Date"))}</th><th>${esc(t("Atendimento", "Appointment"))}</th><th>${esc(t("Status", "Status"))}</th></tr></thead><tbody>${data.appointments?.length ? data.appointments.map((a) => `<tr><td>${esc(date(a.starts_at, true))}</td><td>${esc(a.label || t("Atendimento", "Appointment"))}</td><td>${esc(label(a.status, t))}</td></tr>`).join("") : `<tr><td colspan="3">${empty}</td></tr>`}</tbody></table>`),
    data.finance?.length ? section("06", t("Resumo financeiro", "Financial summary"), `<div class="document-alert">${esc(t("Informações financeiras incluídas sob permissão específica.", "Financial information included under specific permission."))}</div><table class="document-table"><thead><tr><th>${esc(t("Data", "Date"))}</th><th>${esc(t("Procedimento", "Treatment"))}</th><th>${esc(t("Valor total", "Total amount"))}</th></tr></thead><tbody>${data.finance.map((r) => `<tr><td>${esc(date(r.created_at))}</td><td>${esc(r.procedure_name)}</td><td>${esc(money(Number(r.total_cents || 0) / 100))}</td></tr>`).join("")}</tbody></table>`) : "",
  ].join("");
  const html = reportDocumentHTML({ title, patient: data.patient, body, warning, documentId: `FS-${Date.now().toString(36).toUpperCase()}`, generated: date(new Date().toISOString(), true), mode, t });
  if (targetWindow) { targetWindow.document.open("text/html", "replace"); targetWindow.document.write(html); targetWindow.document.close(); targetWindow.focus(); return; }
  openDocument(html);
}

function reportPrintA4(data, type, mode, t, warning, targetWindow = null) {
  const win = targetWindow || window.open("", "_blank");
  if (!win) return;
  const patient = data.patient || {}, generated = new Date().toISOString(), brandLogo = LOGO;
  const documentId = `REP-${generated.slice(0, 10).replace(/-/g, "")}-${String(patient.id || "").slice(0, 6).toUpperCase()}`;
  const title = type === "complete" || type === "Pacote completo" ? t("Prontuário completo do paciente", "Complete patient record") : type;
  const esc = escapeHTML;
  const empty = `<p class="pdf-empty">${esc(t("Nenhum registro disponível neste escopo.", "No records available in this scope."))}</p>`;
  const list = (items, render) => items?.length ? items.map(render).join("") : empty;
  const dateMeta = (value) => value ? esc(date(value, true)) : "—";
  const section = (number, kicker, heading, content, extra = "") => `<section class="pdf-section ${extra}"><div class="pdf-section-heading"><span class="pdf-section-number">${number}</span><div><p class="pdf-kicker">${esc(kicker)}</p><h2>${esc(heading)}</h2></div></div>${content}</section>`;
  const entryContent = list(data.entries, (e) => `<article class="pdf-record"><div class="pdf-record-top"><span class="pdf-record-kind">${esc(label(e.kind, t))}</span><time>${dateMeta(e.clinical_at)}</time></div><h3>${esc(e.title || t("Registro clínico", "Clinical record"))}</h3><p>${esc(e.content || "—")}</p><p class="pdf-meta">${esc(label(e.status, t))} · ${esc(t("versão", "version"))} ${esc(e.version || "—")}</p></article>`);
  const procedureContent = list(data.procedures, (p) => `<article class="pdf-record"><div class="pdf-record-top"><span class="pdf-record-kind">${esc(t("Procedimento", "Procedure"))}</span><time>${dateMeta(p.performed_at)}</time></div><h3>${esc(p.name || p.title || t("Procedimento realizado", "Procedure performed"))}</h3><p>${esc(p.area || p.treatment_area || p.observations || "—")}</p><p class="pdf-meta">${esc(p.status || "—")}</p></article>`);
  const docsContent = list(data.documents, (d) => `<div class="pdf-attachment"><strong>${esc(d.name || t("Documento sem nome", "Unnamed document"))}</strong><span>${dateMeta(d.created_at)}</span><small>${esc(d.sha256 ? `SHA-256: ${d.sha256}` : t("Arquivo anexado ao prontuário", "File attached to record"))}</small></div>`);
  const appointmentsContent = list(data.appointments, (a) => `<div class="pdf-table-row"><span>${dateMeta(a.starts_at)}</span><strong>${esc(a.label || t("Atendimento", "Appointment"))}</strong><span>${esc(label(a.status, t))}</span></div>`);
  const controlRows = `<div class="pdf-control-grid"><div><span>Paciente</span><strong>${esc(patient.full_name || "—")}</strong></div><div><span>ID do paciente</span><strong>${esc(patient.id || "—")}</strong></div><div><span>Tipo</span><strong>${esc(title)}</strong></div><div><span>Modo</span><strong>${esc(mode === "integral" ? t("Registro completo / integral", "Complete / integral record") : t("Resumo profissional", "Professional summary"))}</strong></div><div><span>Período</span><strong>${esc(`${dateMeta(data.range?.start)} — ${dateMeta(data.range?.end)}`)}</strong></div><div><span>Documento</span><strong>${esc(documentId)}</strong></div></div>`;
  const toc = [["01", t("Identificação", "Identification")], ["02", t("Histórico clínico e cronologia", "Clinical history and chronology")], ["03", t("Procedimentos realizados", "Procedures performed")], ["04", t("Documentos e consentimentos", "Documents and consents")], ["05", t("Histórico de atendimentos", "Appointment history")], ...(data.finance?.length ? [["06", t("Resumo financeiro", "Financial summary")]] : [])].map(([n, labelText]) => `<div><span>${n}</span><strong>${esc(labelText)}</strong><i></i><small>—</small></div>`).join("");
  const body = [section("01", t("Identificação", "Identification"), t("Identificação da paciente", "Patient identification"), `<div class="pdf-identity"><div><span>Nome completo</span><strong>${esc(patient.full_name || "—")}</strong></div><div><span>CPF</span><strong>${esc(patient.cpf || "—")}</strong></div><div><span>Data de nascimento</span><strong>${esc(date(patient.birth_date) || "—")}</strong></div><div><span>Contato</span><strong>${esc(patient.phone || "—")}</strong></div><div><span>E-mail</span><strong>${esc(patient.email || "—")}</strong></div></div>`), section("02", t("Histórico", "History"), t("Registros clínicos e linha do tempo", "Clinical records and timeline"), entryContent), section("03", t("Procedimentos", "Procedures"), t("Procedimentos realizados", "Procedures performed"), procedureContent), section("04", t("Documentos", "Documents"), t("Documentos, consentimentos e anexos", "Documents, consents and attachments"), docsContent), section("05", t("Atendimentos", "Appointments"), t("Histórico de atendimentos", "Appointment history"), `<div class="pdf-table"><div class="pdf-table-head"><span>${esc(t("Data", "Date"))}</span><span>${esc(t("Atendimento", "Appointment"))}</span><span>${esc(t("Status", "Status"))}</span></div>${appointmentsContent}</div>`)].join("");
  const financial = data.finance?.length ? section("06", t("Financeiro", "Finance"), t("Resumo financeiro", "Financial summary"), `<div class="pdf-warning">${esc(t("Informações financeiras incluídas sob permissão específica.", "Financial information included under specific permission."))}</div><div class="pdf-table"><div class="pdf-table-head"><span>${esc(t("Data", "Date"))}</span><span>${esc(t("Procedimento", "Treatment"))}</span><span>${esc(t("Valor total", "Total amount"))}</span></div>${list(data.finance, (r) => `<div class="pdf-table-row"><span>${dateMeta(r.created_at)}</span><strong>${esc(r.procedure_name || "—")}</strong><span>${esc(money(Number(r.total_cents || 0) / 100))}</span></div>`)}</div>`) : "";
  win.document.open("text/html", "replace");
  win.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)} · ${esc(patient.full_name)}</title><style>
@page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0;background:#ded8cc}body{color:#1d3026;font:9.5pt/1.55 Inter,"Avenir Next","Segoe UI",Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pdf-document{width:210mm;margin:0 auto;background:#fffdf8;counter-reset:page}.pdf-page{position:relative;min-height:297mm;padding:15mm 16mm 15mm;break-after:page}.pdf-page:last-child{break-after:auto}.pdf-cover{display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;background:radial-gradient(circle at 86% 8%,#e1e7d866,transparent 29%),#fffdf8}.pdf-cover:before{content:"";position:absolute;width:110mm;height:110mm;right:-55mm;top:-45mm;border:1px solid #d9b97966;border-radius:50%;box-shadow:0 0 0 15mm #e1e7d822,0 0 0 30mm #f2dfd833}.pdf-cover>*{position:relative;z-index:1}.pdf-brand{display:flex;align-items:center;gap:5mm;padding-bottom:5mm;border-bottom:.4mm solid #3f5039}.pdf-brand img{width:22mm;height:22mm;object-fit:contain}.pdf-brand-name{color:#1d3026;font:16pt Georgia,serif}.pdf-brand-sub,.pdf-kicker{color:#9f5b55;font-size:7pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.pdf-cover-main{align-self:center;max-width:150mm;padding-block:8mm}.pdf-cover-main .pdf-kicker{display:flex;align-items:center;gap:3mm}.pdf-cover-main .pdf-kicker:before{content:"";width:10mm;height:.3mm;background:linear-gradient(90deg,#9f5b55,#d9b979)}.pdf-cover h1{max-width:145mm;margin:5mm 0 4mm;color:#1d3026;font:400 28pt/.96 Georgia,serif;letter-spacing:-.045em}.pdf-cover h1 em{color:#9f5b55}.pdf-cover-lede{max-width:100mm;color:#687960;font:11.5pt/1.35 Georgia,serif}.pdf-cover-patient{margin-top:9mm;padding:4mm 5mm;border-top:.3mm solid #d8cdbb;border-bottom:.3mm solid #d8cdbb}.pdf-cover-patient span,.pdf-identity span,.pdf-control-grid span{display:block;color:#687960;font-size:7pt;letter-spacing:.1em;text-transform:uppercase}.pdf-cover-patient strong{display:block;margin-top:2mm;font:19pt Georgia,serif}.pdf-cover-foot{color:#687960;font-size:8pt}.pdf-running-header{display:flex;justify-content:space-between;align-items:end;margin-bottom:6mm;padding-bottom:3mm;border-bottom:.3mm solid #d8cdbb;color:#687960;font-size:7pt;letter-spacing:.08em;text-transform:uppercase}.pdf-running-header strong{color:#1d3026;font-weight:700}.pdf-running-footer{position:absolute;left:18mm;right:18mm;bottom:8mm;display:flex;justify-content:space-between;padding-top:3mm;border-top:.3mm solid #d8cdbb;color:#687960;font-size:7pt}.pdf-running-footer .page-number:after{content:"Página " counter(page)}.pdf-control h1{margin:6mm 0 3mm;font:400 24pt Georgia,serif}.pdf-control-lede{max-width:120mm;color:#687960;font:12pt/1.45 Georgia,serif}.pdf-control-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:12mm;border-top:.3mm solid #d8cdbb}.pdf-control-grid>div{min-height:14mm;padding:3mm 4mm 3mm 0;border-bottom:.3mm solid #d8cdbb}.pdf-control-grid strong{display:block;margin-top:1mm;font-size:9pt;font-weight:600}.pdf-toc{margin-top:8mm}.pdf-toc h2{margin:0 0 5mm;font:400 18pt Georgia,serif}.pdf-toc>div{display:grid;grid-template-columns:12mm auto 1fr 8mm;gap:3mm;align-items:end;padding:2.3mm 0;border-bottom:.25mm solid #d8cdbb}.pdf-toc span{color:#9f5b55;font:18pt Georgia,serif}.pdf-toc strong{font:10pt Georgia,serif}.pdf-toc i{border-bottom:.25mm dotted #b7ad9e;margin-bottom:1.5mm}.pdf-toc small{color:#687960}.pdf-warning{margin:5mm 0;padding:4mm 5mm;border-left:1mm solid #9f5b55;background:#f2dfd8;color:#70463f;font-size:8.5pt}.pdf-section{margin-bottom:5mm}.pdf-section-heading{display:grid;grid-template-columns:16mm 1fr;gap:4mm;align-items:end;margin-bottom:3mm;break-after:avoid}.pdf-section-number{color:#9f5b55;font:30pt/.78 Georgia,serif;letter-spacing:-.07em}.pdf-section-heading h2{margin:0;color:#1d3026;font:400 19pt/1 Georgia,serif;letter-spacing:-.04em}.pdf-kicker{margin:0 0 1.5mm}.pdf-identity{display:grid;grid-template-columns:1fr 1fr;gap:0 10mm;border-top:.3mm solid #d8cdbb}.pdf-identity>div{padding:2.5mm 0;border-bottom:.3mm solid #d8cdbb}.pdf-identity strong{display:block;margin-top:1mm;font-size:10pt}.pdf-record{padding:2.5mm 0;border-bottom:.25mm solid #d8cdbb;break-inside:avoid}.pdf-record-top{display:flex;justify-content:space-between;gap:8mm;color:#687960;font-size:7.5pt}.pdf-record-kind{color:#9f5b55;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.pdf-record h3{margin:2mm 0 1.5mm;color:#1d3026;font:400 13pt Georgia,serif}.pdf-record p{margin:1.5mm 0;white-space:pre-wrap;overflow-wrap:anywhere}.pdf-meta{color:#687960;font-size:7.5pt}.pdf-attachment{display:grid;grid-template-columns:1fr auto;gap:1mm 8mm;padding:2.5mm 0;border-bottom:.25mm solid #d8cdbb;break-inside:avoid}.pdf-attachment strong{font:11pt Georgia,serif}.pdf-attachment span,.pdf-attachment small{color:#687960;font-size:7.5pt}.pdf-attachment small{grid-column:1 / -1}.pdf-table{border-top:.3mm solid #d8cdbb}.pdf-table-head,.pdf-table-row{display:grid;grid-template-columns:1.1fr 2fr 1fr;gap:5mm;padding:2.3mm 0;border-bottom:.25mm solid #d8cdbb;break-inside:avoid}.pdf-table-head{color:#687960;background:#edf1e8;font-size:7pt;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding-inline:3mm}.pdf-table-row{padding-inline:3mm}.pdf-table-row strong{font-weight:600}.pdf-empty{padding:9mm 0;color:#687960;font-family:Georgia,serif;font-style:italic}.pdf-signature{margin-top:18mm;padding-top:4mm;border-top:.3mm solid #789078;max-width:65mm;color:#687960;text-align:center;font-size:8pt}@media print{body{background:#fffdf8}.pdf-document{width:210mm}.no-print{display:none!important}}@media screen{.pdf-document{box-shadow:0 1rem 4rem #1d302622}.pdf-page{margin:12mm 0;background:#fffdf8}}
  </style></head><body><main class="pdf-document"><section class="pdf-page pdf-cover"><div class="pdf-brand"><img src="${brandLogo}" alt="Franciele Sofiati"><div><div class="pdf-brand-name">Franciele Sofiati</div><div class="pdf-brand-sub">Biomédica | Esteticista | Cosmetóloga · CRBM 6277 PR</div></div></div><div class="pdf-cover-main"><p class="pdf-kicker">Documento clínico · registro confidencial</p><h1><em>${esc(title.split(" ").slice(0, 2).join(" "))}</em><br>${esc(title.split(" ").slice(2).join(" "))}</h1><p class="pdf-cover-lede">Um registro claro, completo e cuidadosamente organizado para preservar a história do cuidado.</p><div class="pdf-cover-patient"><span>Paciente</span><strong>${esc(patient.full_name || "—")}</strong><span style="margin-top:3mm">${esc(mode === "integral" ? "Registro completo / integral" : "Resumo profissional")}</span></div></div><div class="pdf-cover-foot">Gerado em ${esc(date(generated, true))}<br>Franciele Sofiati · Londrina · Paraná</div></section><section class="pdf-page pdf-control"><div class="pdf-running-header"><strong>Franciele Sofiati</strong><span>Biomédica | Esteticista | Cosmetóloga · Controle documental · ${esc(documentId)}</span></div><p class="pdf-kicker">Leitura do documento</p><h1>${esc(t("Controle e sumário", "Control and contents"))}</h1><p class="pdf-control-lede">Este documento reúne somente as informações autorizadas no escopo selecionado, preservando contexto, cronologia e rastreabilidade.</p>${controlRows}${warning ? `<div class="pdf-warning">${esc(warning)}</div>` : ""}<div class="pdf-toc"><h2>${esc(t("Sumário", "Contents"))}</h2>${toc}</div><div class="pdf-running-footer"><span>Biomédica | Esteticista | Cosmetóloga · Documento confidencial</span><span class="page-number"></span></div></section><section class="pdf-page"><div class="pdf-running-header"><strong>Franciele Sofiati</strong><span>Biomédica | Esteticista | Cosmetóloga · ${esc(patient.full_name || "—")} · ${esc(documentId)}</span></div>${body}${financial}<div class="pdf-running-footer"><span>Biomédica | Esteticista | Cosmetóloga · Gerado pelo sistema</span><span class="page-number"></span></div></section></main><script>document.getElementById('print')?.addEventListener('click',()=>print());window.onload=()=>setTimeout(()=>window.print(),180)</script></body></html>`);
  win.document.close(); win.focus();
}

const reportStatusOrder = ["agendado", "confirmado", "concluido", "cancelado", "faltou"];
const reportStatusColors = {
  agendado: "var(--report-sage)",
  confirmado: "var(--report-champagne)",
  concluido: "var(--report-pink)",
  cancelado: "var(--report-neutral)",
  faltou: "var(--report-neutral-dark)",
};
function ReportDonut({ stats, total, active, onSelect, t }) {
  const radius = 42, circumference = 2 * Math.PI * radius;
  let offset = 0;
  return <div className="report-donut-wrap">
    <svg className="report-donut" viewBox="0 0 108 108" role="img" aria-label={t("Distribuição dos atendimentos por status", "Appointments by status")}>
      <circle className="report-donut-track" cx="54" cy="54" r={radius} />
      {reportStatusOrder.map((status) => {
        const value = stats?.[status] || 0, length = total ? (value / total) * circumference : 0, segmentOffset = offset;
        offset += length;
        if (!length) return null;
        return <circle key={status} className={`report-donut-segment ${active === status ? "active" : ""}`} cx="54" cy="54" r={radius} pathLength={circumference} stroke={reportStatusColors[status]} strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-segmentOffset} tabIndex="0" role="button" aria-label={`${label(status, t)}: ${value}`} onClick={() => onSelect(status)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(status); } }}><title>{label(status, t)}: {value} · {t("Clique para ver os registros", "Click to view records")}</title></circle>;
      })}
    </svg>
    <div className="report-donut-center"><strong>{total}</strong><span>{t("atendimentos", "appointments")}</span></div>
  </div>;
}
function Reports({ financeAllowed }) {
  const t = useT(), [start, setStart] = useState(localDay().slice(0, 7) + "-01"), [end, setEnd] = useState(localDay()), [patientId, setPatientId] = useState(""), [type, setType] = useState("complete"), [mode, setMode] = useState("summary"), [scope, setScope] = useState({ cadastro: true, saude: true, anamnesis: true, avaliacoes: true, planos: true, procedimentos: true, evolucoes: true, intercorrencias: true, consentimentos: true, documentos: true, fotografias: true, agenda: true, financeiro: false }), [generated, setGenerated] = useState([]), [busy, setBusy] = useState(false), [filterStatus, setFilterStatus] = useState("");
  const state = useLoad(async () => {
    const from = `${start}T00:00:00-03:00`, to = `${end}T23:59:59-03:00`;
    const [patients, appointments, procedures, followups, adverse, forms] = await Promise.all([
      checked(db.from("patients").select("id,full_name,preferred_name,cpf,birth_date,phone,email,created_at").order("full_name")),
      checked(db.from("appointments").select("id,status,starts_at,label").gte("starts_at", from).lte("starts_at", to)),
      checked(db.from("clinical_procedures").select("id,patient_id,performed_at,status,area,treatment_area,patients(full_name,preferred_name)").gte("performed_at", from).lte("performed_at", to)),
      checked(db.from("follow_ups").select("id,patient_id,expected_on,status,patients(full_name,preferred_name)").lte("expected_on", end).neq("status", "concluido")),
      checked(db.from("adverse_events").select("id,patient_id,event_at,description,status,patients(full_name,preferred_name)").eq("status", "em_acompanhamento")),
      checked(db.from("public_intakes").select("id").gte("submitted_at", from).lte("submitted_at", to)),
    ]);
    const stats = Object.fromEntries(["agendado", "confirmado", "concluido", "cancelado", "faltou"].map((s) => [s, appointments.filter((a) => a.status === s).length]));
    return { patients, appointments, procedures, followups, adverse, forms, stats };
  }, [start, end]);
  const generate = async () => {
    if (!patientId) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    setBusy(true);
    try {
      const tables = ["entries", "documents", "appointments", "clinical_procedures"];
      const queries = await Promise.all(tables.map((table) => checked(db.from(table).select("*").eq("patient_id", patientId).order(table === "appointments" ? "starts_at" : "created_at", { ascending: true }))));
      const [entries, documents, appointments, procedures] = queries;
      const finance = financeAllowed && scope.financeiro ? await checked(db.from("financial_records").select("*,financial_payments(*)").eq("patient_id", patientId)) : [];
      const warnings = finance.flatMap((r) => { const total = Number(r.total_cents || 0), paid = (r.financial_payments || []).filter((p) => p.status === "recebido").reduce((s, p) => s + Number(p.amount_cents || 0), 0); return paid > total ? [t("Inconsistência financeira: pagamentos acima do valor cobrado.", "Financial inconsistency: payments exceed the charged amount.")] : total - paid < 0 ? [t("Saldo financeiro negativo detectado.", "Negative financial balance detected.")] : []; });
      const patient = state.data.patients.find((p) => p.id === patientId), reportData = { patient, entries, documents, appointments, procedures, finance, range: { start, end } };
      const reportType = type === "complete" ? t("Prontuário completo do paciente", "Complete patient record") : type;
      reportPrintShared(reportData, type, mode === "integral" ? "integral" : "summary", t, warnings[0], printWindow);
      setGenerated((current) => [{ type: reportType, patient: patient.full_name, at: new Date().toISOString(), mode }, ...current].slice(0, 5));
    } catch { printWindow.close(); /* handled by the visible state and notification-less print flow */ } finally { setBusy(false); }
  };
  const reportTypes = ["Histórico clínico", "Histórico de procedimentos", "Anamnese e avaliação", "Plano de tratamento", "Evoluções", "Intercorrências", "Documentos e consentimentos", "Fotografias clínicas", "Agenda / atendimentos", ...(financeAllowed ? ["Financeiro", "Relatório financeiro consolidado"] : []), "Auditoria", "Ficha cadastral", "Pacote completo"];
  const newPatients = state.data?.patients.filter((p) => p.created_at?.slice(0, 10) >= start && p.created_at?.slice(0, 10) <= end) || [];
  const metricConfig = [{ key: "novos", label: t("Novos pacientes", "New patients"), icon: UserRoundPlus, records: newPatients, detail: (row) => `${row.preferred_name || row.full_name} · ${t("cadastro", "registered")} ${date(row.created_at, true)}` }, { key: "procedimentos", label: t("Procedimentos", "Procedures"), icon: Syringe, records: state.data?.procedures || [], detail: (row) => `${row.patients?.preferred_name || row.patients?.full_name || t("Paciente", "Patient")} · ${date(row.performed_at, true)}` }, { key: "retornos", label: t("Retornos pendentes", "Pending follow-ups"), icon: RotateCcw, records: state.data?.followups || [], detail: (row) => `${row.patients?.preferred_name || row.patients?.full_name || t("Paciente", "Patient")} · ${t("previsto", "due")} ${date(row.expected_on)}` }, { key: "intercorrencias", label: t("Intercorrências", "Adverse events"), icon: TriangleAlert, records: state.data?.adverse || [], detail: (row) => `${row.patients?.preferred_name || row.patients?.full_name || t("Paciente", "Patient")} · ${row.description || label(row.status, t)}` }];
  const selectedMetric = metricConfig.find((metric) => metric.key === filterStatus), selectedStatus = reportStatusOrder.includes(filterStatus) ? filterStatus : null, selectedRecords = selectedStatus ? (state.data?.appointments || []).filter((a) => a.status === selectedStatus) : selectedMetric?.records || [];
  const selectFilter = (value) => setFilterStatus(filterStatus === value ? "" : value);
  return <><PageHead title={t("Relatórios", "Reports")} eyebrow={t("Centro de documentos e relatórios", "Documents & reports centre")}><Button icon={Printer} className="primary" onClick={generate} disabled={!patientId || busy}>{t("Gerar relatório", "Generate report")}</Button></PageHead><section className="report-analytics" aria-label={t("Resumo dos atendimentos", "Appointments summary")}><div className="report-analytics-status"><div className="report-analytics-heading"><div><p className="eyebrow">{t("Atendimentos", "Appointments")}</p><h2>{t("Resumo do período", "Period summary")}</h2></div><span className="report-period">{start} → {end}</span></div><div className="report-chart-row"><ReportDonut stats={state.data?.stats} total={state.data?.appointments.length || 0} active={filterStatus} onSelect={selectFilter} t={t} /><div className="report-legend">{reportStatusOrder.map((status) => <button type="button" key={status} className={filterStatus === status ? "active" : ""} title={t(`Filtrar registros ${label(status, t).toLowerCase()}`, `Filter ${label(status, t).toLowerCase()} records`)} onClick={() => selectFilter(status)}><i className={`dot dot-${status}`} style={{ background: reportStatusColors[status] }} />{label(status, t)} <strong>{state.data?.stats?.[status] ?? 0}</strong></button>)}</div></div></div><div className="report-metrics">{metricConfig.map(({ key, label: metricLabel, icon: Icon, records }) => <button type="button" key={key} className={filterStatus === key ? "active" : ""} title={t(`Ver detalhes de ${metricLabel.toLowerCase()}`, `View ${metricLabel.toLowerCase()} details`)} onClick={() => selectFilter(key)}><span className="report-metric-icon"><Icon size={16} aria-hidden="true" /></span><span>{metricLabel}</span><strong>{state.data ? records.length : "—"}</strong></button>)}</div></section><div className="report-filters"><Field title={t("De", "From")} type="date" value={start} onChange={setStart} /><Field title={t("Até", "To")} type="date" value={end} onChange={setEnd} /><Field title={t("Paciente", "Patient")} value={patientId} onChange={setPatientId} options={[{value:"",label:t("Selecionar paciente", "Select patient")}, ...(state.data?.patients || []).map((p) => ({value:p.id,label:p.preferred_name || p.full_name}))]} /><Field title={t("Tipo de documento", "Document type")} value={type} onChange={setType} options={[{value:"complete",label:t("Prontuário completo do paciente", "Complete patient record")}, ...reportTypes.map((v) => ({value:v,label:v}))]} /></div><section className="report-builder"><div className="report-builder-head"><div><p className="eyebrow">{t("Documentos e relatórios", "Documents & reports")}</p><h2>{t("Monte um documento formal a partir dos dados já registrados", "Build a formal document from the data already stored")}</h2></div><div className="segmented"><button type="button" aria-pressed={mode === "summary"} onClick={() => setMode("summary")}>{t("Resumo profissional", "Professional summary")}</button><button type="button" aria-pressed={mode === "integral"} onClick={() => setMode("integral")}>{t("Registro completo / integral", "Complete / integral record")}</button></div></div><div className="report-scope"><p className="eyebrow">{t("Escopo do pacote", "Package scope")}</p>{Object.entries(scope).map(([key, checkedScope]) => <label key={key}><input type="checkbox" checked={checkedScope} disabled={key === "financeiro" && !financeAllowed} onChange={(e) => setScope((s) => ({ ...s, [key]: e.target.checked }))} />{label(key, t)}</label>)}</div><div className="report-builder-actions"><Button icon={Eye} onClick={generate} disabled={!patientId}>{t("Visualizar", "Preview")}</Button><Button icon={Printer} className="primary" onClick={generate} disabled={!patientId || busy}>{t("Gerar PDF", "Generate PDF")}</Button><span className="subtle">{patientId ? t("A impressão abre em uma nova janela, com rodapé, paginação e data de geração.", "Print opens in a new window with footer, pagination and generation date.") : t("Selecione um paciente para habilitar a geração.", "Select a patient to enable generation.")}</span></div></section>{filterStatus && selectedRecords.length > 0 && <section className="report-underlying"><div className="report-underlying-heading"><div><p className="eyebrow">{t("Detalhes rápidos", "Quick details")}</p><h2>{selectedStatus ? label(selectedStatus, t) : selectedMetric.label}</h2></div><button type="button" className="report-clear" onClick={() => setFilterStatus("")}>{t("Limpar", "Clear")}</button></div>{selectedRecords.map((row) => <div className="report-underlying-row" key={row.id}><span>{selectedStatus ? date(row.starts_at, true) : selectedMetric.detail(row)}</span>{selectedStatus && <strong>{row.label || t("Atendimento", "Appointment")}</strong>}{!selectedStatus && <strong>{row.description || label(row.status, t)}</strong>}</div>)}</section>}{generated.length > 0 && <section className="report-history"><h2>{t("Relatórios gerados nesta sessão", "Reports generated this session")}</h2>{generated.map((item, index) => <div key={`${item.at}-${index}`}><span>{item.patient} · {item.type}</span><small>{date(item.at, true)} · {item.mode === "integral" ? t("integral", "integral") : t("resumo", "summary")}</small></div>)}</section>}</>;
}
function ProcedureCatalog({ notify }) {
  const t = useT();
  const blank = { name: "", category: "outro", default_duration: 60, followup_days: 30, product_relevant: false, lot_required: false, device_relevant: false, photos_expected: false, treatment_areas: "", consent_template: "", consent_template_version: "", post_care: "", relevant_fields: "{}", device_parameters: "[]" };
  const [form, setForm] = useState(blank), [editing, setEditing] = useState(null), [busy, setBusy] = useState(false);
  const state = useLoad(() => checked(db.from("procedures").select("*").order("active", { ascending: false }).order("name")), [editing]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const saveProcedure = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const values = { ...form, default_duration: Number(form.default_duration), followup_days: form.followup_days === "" ? null : Number(form.followup_days), relevant_fields: JSON.parse(form.relevant_fields || "{}"), device_parameters: JSON.parse(form.device_parameters || "[]") };
      const result = editing ? await checked(db.from("procedures").update(values).eq("id", editing.id).select().single()) : await checked(db.from("procedures").insert({ organization_id: ORG, ...values }).select().single());
      setForm(blank); setEditing(null); state.refresh(); notify(t("Procedimento salvo", "Procedure saved")); return result;
    } catch { notify(t("Não foi possível salvar. Verifique os campos JSON.", "Could not save. Check the JSON fields.")); } finally { setBusy(false); }
  };
  const edit = (row) => { setEditing(row); setForm({ ...blank, ...row, relevant_fields: JSON.stringify(row.relevant_fields || {}, null, 2), device_parameters: JSON.stringify(row.device_parameters || [], null, 2) }); };
  return <section className="detail-section">
    <div className="toolbar"><div><h2>{t("Catálogo de procedimentos", "Procedure catalogue")}</h2><p className="subtle">{t("Procedimentos da Franciele Sofiati; o proprietário controla a configuração e a disponibilidade.", "Franciele Sofiati procedures; the owner controls configuration and availability.")}</p></div><Button icon={Plus} className="primary" onClick={() => { setEditing({}); setForm(blank); }}>{t("Novo procedimento", "New procedure")}</Button></div>
    {!!editing && <form className="form-grid" onSubmit={saveProcedure}>
      <Field title={t("Nome", "Name")} value={form.name} onChange={(v) => set("name", v)} required wide />
      <Field title={t("Categoria", "Category")} value={form.category} onChange={(v) => set("category", v)} options={["laser", "injetavel", "higiene", "outro"].map((v) => ({ value: v, label: label(v, t) }))} />
      <Field title={t("Duração (min)", "Duration (min)")} type="number" min="5" max="720" value={form.default_duration} onChange={(v) => set("default_duration", v)} />
      <Field title={t("Retorno após (dias)", "Follow-up after (days)")} type="number" min="0" max="3650" value={form.followup_days ?? ""} onChange={(v) => set("followup_days", v)} />
      <Field title={t("Áreas de tratamento", "Treatment areas")} value={form.treatment_areas} onChange={(v) => set("treatment_areas", v)} wide />
      {[['product_relevant', t("Usa produto", "Product relevant")], ['lot_required', t("Exige lote", "Lot required")], ['device_relevant', t("Usa equipamento", "Device relevant")], ['photos_expected', t("Espera fotos", "Photos expected")]].map(([key, title]) => <label className="field" key={key}><span>{title}</span><input type="checkbox" checked={!!form[key]} onChange={(e) => set(key, e.target.checked)} /></label>)}
      <Field title={t("Versão do consentimento", "Consent template version")} value={form.consent_template_version} onChange={(v) => set("consent_template_version", v)} />
      <Field title={t("Template de consentimento", "Consent template")} type="textarea" value={form.consent_template} onChange={(v) => set("consent_template", v)} wide />
      <Field title={t("Orientações pós-cuidado", "Post-care guidance")} type="textarea" value={form.post_care} onChange={(v) => set("post_care", v)} wide />
      <Field title={t("Campos relevantes (JSON)", "Relevant fields (JSON)")} type="textarea" value={form.relevant_fields} onChange={(v) => set("relevant_fields", v)} />
      <Field title={t("Parâmetros do equipamento (JSON)", "Device parameters (JSON)")} type="textarea" value={form.device_parameters} onChange={(v) => set("device_parameters", v)} />
      <footer className="form-footer"><Button type="button" onClick={() => { setEditing(null); setForm(blank); }}>{t("Cancelar", "Cancel")}</Button><Button className="primary" icon={Save} disabled={busy}>{busy ? t("Salvando...", "Saving...") : t("Salvar", "Save")}</Button></footer>
    </form>}
    <LoadState state={state}>{(rows) => <div className="rows">{rows.map((procedure) => <div className="list-row" key={procedure.id}><span><strong>{procedure.name}</strong><small>{label(procedure.category, t)} · {procedure.default_duration} min · {procedure.followup_days ? `${procedure.followup_days} ${t("dias", "days")}` : t("sem retorno padrão", "no default follow-up")} · {procedure.treatment_areas || t("áreas não definidas", "areas not defined")}</small></span><Status value={procedure.active ? "ativo" : "inativo"} /><Button onClick={() => edit(procedure)}>{t("Editar", "Edit")}</Button><Button onClick={async () => { await checked(db.from("procedures").update({ active: !procedure.active }).eq("id", procedure.id)); state.refresh(); }}>{procedure.active ? t("Desativar", "Deactivate") : t("Reativar", "Reactivate")}</Button></div>)}{!rows.length && <Empty icon={ClipboardList}>{t("Nenhum procedimento configurado.", "No procedures configured.")}</Empty>}</div>}</LoadState>
  </section>;
}
function TraceabilityCatalog({ notify }) {
  const t = useT();
  const [product, setProduct] = useState({ name: "", category: "", manufacturer: "", unit: "", active: true });
  const [lot, setLot] = useState({ product_id: "", lot: "", expires_on: "", unit: "", active: true });
  const [device, setDevice] = useState({ name: "", equipment_model: "", serial_number: "", notes: "", active: true });
  const state = useLoad(() => Promise.all([checked(db.from("products").select("*").order("name")), checked(db.from("product_lots").select("*,products(name)").order("expires_on")), checked(db.from("devices").select("*").order("name"))]), []);
  const save = async (table, values, reset) => { try { await checked(db.from(table).insert({ organization_id: ORG, ...values })); reset(); state.refresh(); notify(t("Salvo", "Saved")); } catch { notify(t("Não foi possível salvar.", "Could not save.")); } };
  return <section className="detail-section"><h2>{t("Produtos, lotes e equipamentos", "Products, lots & equipment")}</h2><p className="subtle">{t("Rastreabilidade clínica, não controle de estoque.", "Clinical traceability, not inventory management.")}</p><div className="form-grid"><Field title={t("Produto", "Product")} value={product.name} onChange={(v) => setProduct({ ...product, name: v })} /><Field title={t("Categoria/tipo", "Category/type")} value={product.category} onChange={(v) => setProduct({ ...product, category: v })} /><Field title={t("Fabricante", "Manufacturer")} value={product.manufacturer} onChange={(v) => setProduct({ ...product, manufacturer: v })} /><Field title={t("Unidade", "Unit")} value={product.unit} onChange={(v) => setProduct({ ...product, unit: v })} /><Button className="primary" onClick={() => save("products", product, () => setProduct({ name: "", category: "", manufacturer: "", unit: "", active: true }))}>{t("Novo produto", "New product")}</Button></div><div className="form-grid"><Field title={t("Produto do lote", "Lot product")} value={lot.product_id} onChange={(v) => setLot({ ...lot, product_id: v })} options={[{ value: "", label: t("Selecionar", "Select") }, ...(state.data?.[0] || []).map((p) => ({ value: p.id, label: p.name }))]} /><Field title={t("Número do lote", "Lot number")} value={lot.lot} onChange={(v) => setLot({ ...lot, lot: v })} /><Field title={t("Validade", "Expiry") } type="date" value={lot.expires_on} onChange={(v) => setLot({ ...lot, expires_on: v })} /><Field title={t("Unidade", "Unit")} value={lot.unit} onChange={(v) => setLot({ ...lot, unit: v })} /><Button className="primary" onClick={() => save("product_lots", lot, () => setLot({ product_id: "", lot: "", expires_on: "", unit: "", active: true }))}>{t("Novo lote", "New lot")}</Button></div><div className="form-grid"><Field title={t("Nome do equipamento", "Device name")} value={device.name} onChange={(v) => setDevice({ ...device, name: v })} /><Field title={t("Modelo/equipamento", "Equipment/model")} value={device.equipment_model} onChange={(v) => setDevice({ ...device, equipment_model: v })} /><Field title={t("Número de série", "Serial number")} value={device.serial_number} onChange={(v) => setDevice({ ...device, serial_number: v })} /><Field title={t("Notas", "Notes")} value={device.notes} onChange={(v) => setDevice({ ...device, notes: v })} /><Button className="primary" onClick={() => save("devices", device, () => setDevice({ name: "", equipment_model: "", serial_number: "", notes: "", active: true }))}>{t("Novo equipamento", "New device")}</Button></div><LoadState state={state}>{([products, lots, devices]) => <div><h3>{t("Produtos", "Products")}</h3>{products.map((row) => <div className="list-row" key={row.id}><span><strong>{row.name}</strong><small>{row.category} · {row.manufacturer} · {row.unit}</small></span><Status value={row.active ? "ativo" : "inativo"} /></div>)}<h3>{t("Lotes", "Lots")}</h3>{lots.map((row) => <div className="list-row" key={row.id}><span><strong>{row.products?.name} · {row.lot}</strong><small>{row.expires_on ? `${t("Validade", "Expiry")}: ${date(row.expires_on)}` : t("Sem validade", "No expiry")}</small></span><Status value={row.expires_on && row.expires_on < localDay() ? "expirado" : row.active ? "ativo" : "inativo"} /></div>)}<h3>{t("Equipamentos", "Devices")}</h3>{devices.map((row) => <div className="list-row" key={row.id}><span><strong>{row.name}</strong><small>{row.equipment_model} · {row.serial_number}</small></span><Status value={row.active ? "ativo" : "inativo"} /></div>)}</div>}</LoadState></section>;
}

function PermissionMatrix({ notify }) { const t = useT(); const [selected, setSelected] = useState(""); const [area, setArea] = useState("patient_identity"); const [permissions, setPermissions] = useState({ can_view: false, can_create: false, can_edit: false, can_finalize: false, can_export: false, can_share: false, can_delete: false, can_manage: false, can_administer: false }); const users = useLoad(() => checked(db.from("memberships").select("user_id,name,email,role").order("name")), []); const areas = ["patient_identity", "appointments", "intake_forms", "assessments", "anamnesis", "treatment_plans", "procedures", "evolutions", "adverse_events", "photos", "documents", "consents", "reports", "exports", "patient_portal", "settings", "users", "audit"]; useEffect(() => { if (!selected) return; checked(db.from("staff_permissions").select("*").eq("user_id", selected).eq("area", area).maybeSingle()).then((row) => setPermissions((p) => Object.fromEntries(Object.keys(p).map((key) => [key, !!row?.[key]])))).catch(() => {}); }, [selected, area]); const save = async () => { try { await checked(db.from("staff_permissions").upsert({ organization_id: ORG, user_id: selected, area, ...permissions }, { onConflict: "organization_id,user_id,area" })); notify(t("Permissões salvas", "Permissions saved")); } catch { notify(t("Não foi possível salvar permissões.", "Could not save permissions.")); } }; return <section className="detail-section"><h2>{t("Matriz completa de permissões", "Complete permissions matrix")}</h2><p className="subtle">{t("Defina por usuário/papel e área o que pode ver, criar, editar, excluir, exportar, gerenciar ou administrar. Proprietários mantêm acesso total.", "Set view, create, edit, delete, export, manage, and administer access by user/role and area. Owners retain full access.")}</p><div className="form-grid"><Field title={t("Usuário / papel", "User / role")} value={selected} onChange={setSelected} options={[{ value: "", label: t("Selecionar", "Select") }, ...(users.data || []).map((u) => ({ value: u.user_id, label: `${u.name || u.email} · ${label(u.role, t)}` }))]} /><Field title={t("Área", "Area")} value={area} onChange={setArea} options={areas.map((v) => ({ value: v, label: label(v, t) }))} /></div><div className="permission-grid">{Object.keys(permissions).map((key) => <label className="permission-cell" key={key}><input type="checkbox" checked={permissions[key]} onChange={(e) => setPermissions((p) => ({ ...p, [key]: e.target.checked }))} /><span>{label(key, t)}</span></label>)}</div><Button className="primary" icon={Save} disabled={!selected} onClick={save}>{t("Salvar permissões", "Save permissions")}</Button></section>; }

function SettingsView({ member, updateMember, notify }) {
  const t = useT(),
    [profile, setProfile] = useState(member),
    [profilePhoto, setProfilePhoto] = useState(null),
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
                ["permissions", t("Permissões", "Permissions")],
                [
                  "storage",
                  t("Armazenamento e recuperação", "Storage & recovery"),
                ],
                ["procedures", t("Procedimentos", "Procedures")],
                ["traceability", t("Produtos e equipamentos", "Products & equipment")],
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
          <div className="profile-hero"><Avatar person={profile} className="avatar large" size={88} /><div><h2>{profile.name || profile.email}</h2><p>{profile.email}</p><p>{label(profile.role, t)}</p></div></div>
          <p>
            {profile.profession} · {profile.council} {profile.registration} {profile.state}
          </p>
          <Status value={profile.status} />
          <PhotoPicker value={profilePhoto} hasPhoto={!!profile.avatar_path} onChange={setProfilePhoto} onRemove={async () => { setBusy(true); try { await removeProfilePhoto("memberships", profile.id, profile.avatar_path); const next = { ...profile, avatar_path: null }; setProfile(next); updateMember?.(next); notify(t("Foto removida.", "Photo removed.")); } catch { notify(t("Não foi possível remover a foto.", "Could not remove the photo.")); } finally { setBusy(false); } }} />
          <Button className="primary" icon={Save} disabled={!profilePhoto || busy} onClick={async () => { setBusy(true); try { const path = await saveProfilePhoto("memberships", profile.id, profilePhoto, profile.user_id); const next = { ...profile, avatar_path: path }; setProfile(next); updateMember?.(next); setProfilePhoto(null); notify(t("Foto do perfil atualizada.", "Profile photo updated.")); } catch { notify(t("Não foi possível salvar a foto. Verifique se a migração de fotos foi aplicada.", "Could not save the photo. Check that the photo migration was applied.")); } finally { setBusy(false); } }}>{t("Salvar foto do perfil", "Save profile photo")}</Button>
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
                    <Avatar person={user} />
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
      {tab === "permissions" && <PermissionMatrix notify={notify} />}
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
          <FullBackupExport member={member} notify={notify} />
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
      {tab === "traceability" && <TraceabilityCatalog notify={notify} />}
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
    enquiries: t("Formulário", "Form"),
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
          options={["proprietario", "profissional", "recepcao", "leitura"].map((s) => ({
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
    [error, setError] = useState("");
  return (
    <div className="auth-screen">
      <header className="auth-top">
        <a href="https://francielesofiati.com" target="_blank" rel="noopener noreferrer">Franciele Sofiati</a>
        {languageControl}
      </header>
      <main className="preregister">
        <img className="auth-logo" src={LOGO} alt="Franciele Sofiati" />
        <p className="eyebrow">{t("Primeiro contato", "First contact")}</p>
        <h1>{t("Formulário", "Form")}</h1>
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
            <a href="https://francielesofiati.com" target="_blank" rel="noopener noreferrer">
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
            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}
            <Button
              icon={ArrowRight}
              className="primary full"
              disabled={busy}
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

createRoot(document.getElementById("root")).render(<AppErrorBoundary t={(pt, en) => (localStorage.getItem("sofiati-language") === "en" ? en : pt)}><App /></AppErrorBoundary>);
