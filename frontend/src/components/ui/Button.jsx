import { forwardRef, isValidElement } from "react";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "default",
    icon: Icon,
    loading = false,
    disabled = false,
    type = "button",
    className = "",
    style = {},
    onClick,
    ...props
  },
  ref
) {
  const isSm = size === "sm";

  // Base styles
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: "var(--radius-sm)",
    fontWeight: 600,
    fontSize: isSm ? 13 : 14,
    height: isSm ? 36 : 42,
    minWidth: isSm ? 36 : 42,
    padding: isSm ? "0 12px" : "0 18px",
    transition: "all var(--duration-hover) var(--ease)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    position: "relative",
    userSelect: "none",
    whiteSpace: "nowrap",
    textDecoration: "none",
    ...style,
  };

  const variantStyles = {
    primary: {
      backgroundColor: "var(--btn-primary-bg)",
      color: "var(--btn-primary-text)",
      border: "1px solid transparent",
      boxShadow: "var(--shadow-sm)",
    },
    secondary: {
      backgroundColor: "var(--surface)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--text-muted)",
      border: "1px solid transparent",
    },
    danger: {
      backgroundColor: "var(--status-rejected-soft)",
      color: "var(--status-rejected-text)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
    },
  };

  const computedStyle = {
    ...baseStyle,
    ...variantStyles[variant],
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={computedStyle}
      className={`rh-button rh-button-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={isSm ? 14 : 16} className="rh-spin" style={{ animation: "spin 1s linear infinite" }} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && (isValidElement(Icon) ? Icon : <Icon size={isSm ? 14 : 16} />)}
          {children}
        </>
      )}
    </button>
  );
});
