import { X } from "lucide-react";

export function Chip({
  children,
  variant = "default",
  onRemove,
  onClick,
  style = {},
  className = "",
}) {
  const isClickable = !!onClick;

  const variantStyles = {
    default: {
      backgroundColor: "var(--surface-2)",
      color: "var(--text-muted)",
      border: "1px solid var(--border)",
    },
    matched: {
      backgroundColor: "var(--status-selected-soft)",
      color: "var(--status-selected-text)",
      border: "1px solid rgba(22, 163, 74, 0.25)",
    },
    missing: {
      backgroundColor: "var(--status-rejected-soft)",
      color: "var(--status-rejected-text)",
      border: "1px solid rgba(239, 68, 68, 0.25)",
    },
    active: {
      backgroundColor: "var(--brand-100)",
      color: "var(--brand-900)",
      border: "1px solid var(--brand-500)",
    },
  };

  return (
    <span
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`rh-chip ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: "var(--radius-sm)",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.2,
        cursor: isClickable ? "pointer" : "default",
        userSelect: "none",
        transition: "all var(--duration-hover) var(--ease)",
        ...variantStyles[variant],
        ...style,
      }}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 14,
            height: 14,
            borderRadius: "50%",
            color: "currentColor",
            opacity: 0.7,
            cursor: "pointer",
          }}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
