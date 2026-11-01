import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef(function Select(
  {
    label,
    hint,
    error,
    id,
    options = [],
    children,
    required = false,
    className = "",
    style = {},
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", ...style }}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          style={{
            width: "100%",
            height: 42,
            paddingLeft: 14,
            paddingRight: 36,
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--surface)",
            color: "var(--text)",
            border: `1px solid ${error ? "var(--status-rejected-solid)" : "var(--border)"}`,
            fontSize: 14,
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
          }}
          className={`rh-select ${className}`}
          {...props}
        >
          {children ? (
            children
          ) : (
            options.map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </option>
            ))
          )}
        </select>
        <ChevronDown
          size={16}
          style={{
            position: "absolute",
            right: 12,
            pointerEvents: "none",
            color: "var(--text-faint)",
          }}
        />
      </div>

      {error && (
        <p id={`${selectId}-error`} role="alert" style={{ fontSize: 12, color: "var(--status-rejected-solid)", margin: 0, fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
});
