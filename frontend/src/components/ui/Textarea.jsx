import { forwardRef } from "react";

export const Textarea = forwardRef(function Textarea(
  {
    label,
    hint,
    error,
    id,
    rows = 4,
    maxLength,
    value,
    required = false,
    className = "",
    style = {},
    ...props
  },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {label && (
          <label
            htmlFor={textareaId}
            style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}
          >
            {label} {required && <span style={{ color: "var(--status-rejected-solid)" }}>*</span>}
          </label>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {hint && <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 400 }}>{hint}</span>}
          {maxLength && (
            <span
              style={{
                fontSize: 12,
                color: currentLength > maxLength * 0.9 ? "var(--amber-solid)" : "var(--text-faint)",
                fontWeight: 500,
              }}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--surface)",
          color: "var(--text)",
          border: `1px solid ${error ? "var(--status-rejected-solid)" : "var(--border)"}`,
          fontSize: 14,
          lineHeight: 1.5,
          resize: "vertical",
        }}
        className={`rh-textarea ${className}`}
        {...props}
      />

      {error && (
        <p id={`${textareaId}-error`} role="alert" style={{ fontSize: 12, color: "var(--status-rejected-solid)", margin: 0, fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
});
