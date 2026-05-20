import { useEffect } from "react";

export default function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError   = type === "error";
  const isSuccess = !isError;

  return (
    <div style={{
      position: "fixed",
      bottom: 28,
      right: 28,
      zIndex: 1000,
      background: isError
        ? "linear-gradient(135deg, #FEF2F2, #FFF)"
        : "linear-gradient(135deg, #F0FDF4, #FFF)",
      color: isError ? "#B91C1C" : "#065F46",
      border: `1.5px solid ${isError ? "#FECACA" : "#A7F3D0"}`,
      borderRadius: 14,
      padding: "14px 20px",
      fontSize: 14,
      fontWeight: 600,
      boxShadow: isError
        ? "0 8px 32px rgba(220,38,38,0.15)"
        : "0 8px 32px rgba(16,185,129,0.15)",
      maxWidth: 360,
      animation: "slideIn 0.3s cubic-bezier(0.4,0,0.2,1)",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>
        {isError ? "❌" : "✅"}
      </span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{
          background: "none", border: "none",
          color: "inherit", cursor: "pointer",
          fontSize: 16, opacity: 0.5, padding: "0 2px",
          fontFamily: "inherit", flexShrink: 0,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
      >
        ×
      </button>
    </div>
  );
}