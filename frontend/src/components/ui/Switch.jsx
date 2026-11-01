export function Switch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  id,
  style = {},
}) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label
      htmlFor={switchId}
      style={{
        display: "inline-flex",
        alignItems: "flex-start",
        gap: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        userSelect: "none",
        ...style,
      }}
    >
      <div style={{ position: "relative", paddingTop: 2 }}>
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        />
        <div
          style={{
            width: 38,
            height: 22,
            borderRadius: "var(--radius-full)",
            backgroundColor: checked ? "var(--brand-600)" : "var(--surface-2)",
            border: `1px solid ${checked ? "var(--brand-700)" : "var(--border)"}`,
            transition: "all var(--duration-hover) var(--ease)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              position: "absolute",
              top: 2,
              left: checked ? 18 : 2,
              transition: "left var(--duration-hover) var(--ease)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      </div>

      {(label || description) && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {label && (
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {label}
            </span>
          )}
          {description && (
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
