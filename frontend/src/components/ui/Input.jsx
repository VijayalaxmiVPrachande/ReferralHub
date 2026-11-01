import { forwardRef, isValidElement } from "react";

export const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    id,
    type = "text",
    icon: Icon,
    rightElement,
    required = false,
    className = "",
    style = {},
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            {label} {required && <span style={{ color: "var(--status-rejected-solid)" }}>*</span>}
          </span>
          {hint && <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 400 }}>{hint}</span>}
        </label>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {Icon && (
          <div
            style={{
              position: "absolute",
              left: 12,
              pointerEvents: "none",
              color: error ? "var(--status-rejected-solid)" : "var(--text-faint)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {isValidElement(Icon) ? Icon : <Icon size={16} />}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          style={{
            width: "100%",
            height: 42,
            paddingLeft: Icon ? 38 : 14,
            paddingRight: rightElement ? 40 : 14,
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--surface)",
            color: "var(--text)",
            border: `1px solid ${error ? "var(--status-rejected-solid)" : "var(--border)"}`,
            fontSize: 14,
            transition: "border-color var(--duration-hover) var(--ease), box-shadow var(--duration-hover) var(--ease)",
          }}
          className={`rh-input ${className}`}
          {...props}
        />

        {rightElement && (
          <div
            style={{
              position: "absolute",
              right: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" style={{ fontSize: 12, color: "var(--status-rejected-solid)", margin: 0, fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
});
