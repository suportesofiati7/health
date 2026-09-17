import React, { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

/**
 * Shared direct-manipulation affordance for every record-like object.
 * The visible trigger and the native right-click gesture intentionally open
 * the same menu so users never need to learn two action systems.
 */
const LONG_PRESS_MS = 560;

export default function ContextActions({ label, actions = [], children, className = "", actionLabel = "Ações / Actions", hint = "Clique com o botão direito ou use o botão de ações / Right-click or use the actions button", showTrigger = true, ...props }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const actionRefs = useRef([]);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const availableActions = actions.filter(Boolean);

  const close = ({ returnFocus = false } = {}) => {
    setOpen(false);
    setPosition(null);
    if (returnFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return undefined;
    const dismiss = (event) => {
      if (!ref.current?.contains(event.target)) close();
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close({ returnFocus: true });
      }
    };
    const reposition = () => position && close();
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, position]);
  useEffect(() => {
    if (open) window.requestAnimationFrame(() => actionRefs.current[activeIndex]?.focus());
  }, [open, activeIndex]);
  useEffect(() => () => window.clearTimeout(longPressTimer.current), []);

  const show = (event, fromPointer = false) => {
    event?.preventDefault();
    event?.stopPropagation();
    setActiveIndex(0);
    setPosition(fromPointer && event ? {
      x: Math.max(10, Math.min(event.clientX, window.innerWidth - 270)),
      y: Math.max(10, Math.min(event.clientY, window.innerHeight - Math.min(390, availableActions.length * 42 + 72))),
    } : null);
    setOpen(true);
  };
  const startLongPress = (event) => {
    if (event.touches.length !== 1) return;
    if (event.target.closest("input, textarea, select, a")) return;
    longPressTriggered.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      const touch = event.touches[0];
      show({ preventDefault() {}, stopPropagation() {}, clientX: touch.clientX, clientY: touch.clientY }, true);
    }, LONG_PRESS_MS);
  };
  const cancelLongPress = () => window.clearTimeout(longPressTimer.current);
  const handleClick = (event) => {
    if (longPressTriggered.current) {
      event.preventDefault();
      event.stopPropagation();
      longPressTriggered.current = false;
    }
  };
  const run = (action) => {
    if (action.disabled) return;
    close({ returnFocus: true });
    action.onClick?.();
  };
  const move = (event, direction) => {
    if (!availableActions.length) return;
    event.preventDefault();
    setActiveIndex((current) => (current + direction + availableActions.length) % availableActions.length);
  };
  return <div ref={ref} {...props} className={`context-actions ${open ? "is-open" : ""} ${className}`} onContextMenu={(event) => show(event, true)} onTouchStart={startLongPress} onTouchMove={cancelLongPress} onTouchEnd={cancelLongPress} onClick={handleClick}>
    {children}
    {showTrigger && <button ref={triggerRef} type="button" className="context-actions-trigger" aria-label={`${label}: ${actionLabel}`} aria-haspopup="menu" aria-expanded={open} title={`${actionLabel} · ${hint}`} onClick={(event) => { event.stopPropagation(); show(event); }}><MoreHorizontal size={17} aria-hidden="true" /><span className="sr-only">{actionLabel}</span></button>}
    {open && <div className={`context-actions-menu ${position ? "context-actions-menu-floating" : ""}`} role="menu" aria-label={`${actionLabel}: ${label}`} style={position ? { left: position.x, top: position.y } : undefined} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") move(event, 1);
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") move(event, -1);
      if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
      if (event.key === "End") { event.preventDefault(); setActiveIndex(availableActions.length - 1); }
    }}>
      <strong title={label}>{label}</strong>
      <small>{hint}</small>
      {availableActions.map((action, index) => <button ref={(node) => { actionRefs.current[index] = node; }} type="button" role="menuitem" key={`${action.id || action.label}-${index}`} className={`${action.danger ? "danger" : ""} ${activeIndex === index ? "is-active" : ""}`} disabled={action.disabled} title={action.description} onMouseEnter={() => setActiveIndex(index)} onClick={() => run(action)}>{action.icon && <action.icon size={16} aria-hidden="true" />}<span>{action.label}</span>{action.shortcut && <kbd>{action.shortcut}</kbd>}</button>)}
    </div>}
  </div>;
}
