import { isValidElement } from "react";

export function StatCard({
  label,
  value,
  status,
  icon: Icon,
  isActive = false,
  onClick,
  style = {},
}) {
  const isClickable = !!onClick;

  let accentColor = "var(--brand-600)";
  let bgSoft = "var(--surface)";

  if (status === "REFERRED") {
    accentColor = "var(--status-referred-solid)";
  } else if (status === "IN_REVIEW") {
    accentColor = "var(--status-in_review-solid)";
  } else if (status === "NEXT_ROUND") {
    accentColor = "var(--status-next_round-solid)";
  } else if (status === "SELECTED") {
    accentColor = "var(--status-selected-solid)";
  } else if (status === "REJECTED") {
    accentColor = "var(--status-rejected-solid)";
  }

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        flex: 1,
        minWidth: 140,
        backgroundColor: bgSoft,
        borderRadius: "var(--radius-md)",
        padding: "16px 18px",
        boxShadow: isActive ? "var(--shadow-md)" : "var(--shadow-sm)",
        border: `1.5px solid ${isActive ? accentColor : "var(--border)"}`,
        borderLeft: `4px solid ${accentColor}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: isClickable ? "pointer" : "default",
        transition: "all var(--duration-hover) var(--ease)",
        position: "relative",
        userSelect: "none",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
          {label}
        </span>
        {Icon && (
          <div style={{ color: accentColor, opacity: 0.85 }}>
            {isValidElement(Icon) ? Icon : <Icon size={16} />}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            color: "var(--text)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {value !== undefined ? value : "0"}
        </span>
      </div>
    </div>
  );
}
