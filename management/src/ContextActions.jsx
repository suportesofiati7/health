import React, { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

/**
 * Shared direct-manipulation affordance for every record-like object.
 * The visible trigger and the native right-click gesture intentionally open
 * the same menu so users never need to learn two action systems.
 */
export default function ContextActions({ label, actions = [], children, className = "" }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const dismiss = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", dismiss); document.removeEventListener("keydown", escape); };
  }, [open]);
  const show = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    setPosition(event ? { x: Math.min(event.clientX, window.innerWidth - 250), y: Math.min(event.clientY, window.innerHeight - Math.min(330, actions.length * 43 + 54)) } : null);
    setOpen(true);
  };
  const run = (action) => { setOpen(false); setPosition(null); action.onClick?.(); };
  return <div ref={ref} className={`context-actions ${className}`} onContextMenu={show}>
    {children}
    <button type="button" className="context-actions-trigger" aria-label={`${label}: ações`} title="Ações" onClick={(event) => { event.stopPropagation(); show(); }}><MoreHorizontal size={17} /></button>
    {open && <div className={`context-actions-menu ${position ? "context-actions-menu-floating" : ""}`} role="menu" style={position || undefined}>
      <strong>{label}</strong>
      {actions.filter(Boolean).map((action) => <button type="button" role="menuitem" key={action.label} className={action.danger ? "danger" : ""} onClick={() => run(action)}>{action.icon && <action.icon size={16} />}{action.label}</button>)}
    </div>}
  </div>;
}
