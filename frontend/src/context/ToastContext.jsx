import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => {
      const next = [...prev, { id, message, type, duration, paused: false, createdAt: Date.now() }];
      if (next.length > 3) {
        return next.slice(next.length - 3);
      }
      return next;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <aside
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 380,
          width: "calc(100vw - 40px)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const remainingRef = useRef(toast.duration);
  const startRef = useRef(0);

  const isError = toast.type === "error";
  const isInfo = toast.type === "info";

  const borderColor = isError
    ? "var(--status-rejected-solid)"
    : isInfo
    ? "var(--status-referred-solid)"
    : "var(--brand-500)";

  const iconColor = borderColor;

  const handleMouseEnter = () => {
    setPaused(true);
    clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startRef.current;
  };

  const handleMouseLeave = () => {
    setPaused(false);
    startRef.current = Date.now();
    timerRef.current = setTimeout(onRemove, Math.max(remainingRef.current, 1000));
  };

  useEffect(() => {
    timerRef.current = setTimeout(onRemove, toast.duration);
    return () => clearTimeout(timerRef.current);
  }, [onRemove, toast.duration]);

  return (
    <div
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        pointerEvents: "auto",
        background: "var(--surface)",
        color: "var(--text)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--border)",
        borderLeft: `4px solid ${borderColor}`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        animation: "slideInRight 200ms var(--ease)",
      }}
    >
      <div style={{ color: iconColor, marginTop: 2, flexShrink: 0 }}>
        {isError ? (
          <AlertCircle size={18} />
        ) : isInfo ? (
          <Info size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}
      </div>
      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.45, fontWeight: 500, wordBreak: "break-word" }}>
        {toast.message}
      </div>
      <button
        onClick={onRemove}
        aria-label="Close notification"
        style={{
          color: "var(--text-faint)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "var(--radius-sm)",
          flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: borderColor,
          opacity: 0.8,
          animation: `shimmer ${toast.duration}ms linear forwards`,
          animationPlayState: paused ? "paused" : "running",
          transformOrigin: "left",
        }}
      />
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
