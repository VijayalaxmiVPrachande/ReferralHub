export function Badge({
  children,
  variant = "default",
  status,
  size = "default",
  style = {},
  className = "",
}) {
  const isSm = size === "sm";

  // If status is provided, format automatically
  const activeStatus = status || variant;

  let bg = "var(--surface-2)";
  let color = "var(--text)";
  let dotColor = null;
  let label = children;

  switch (activeStatus) {
    case "REFERRED":
      bg = "var(--status-referred-soft)";
      color = "var(--status-referred-text)";
      dotColor = "var(--status-referred-solid)";
      label = label || "Referred";
      break;
    case "IN_REVIEW":
      bg = "var(--status-in_review-soft)";
      color = "var(--status-in_review-text)";
      dotColor = "var(--status-in_review-solid)";
      label = label || "In Review";
      break;
    case "NEXT_ROUND":
      bg = "var(--status-next_round-soft)";
      color = "var(--status-next_round-text)";
      dotColor = "var(--status-next_round-solid)";
      label = label || "Next Round";
      break;
    case "SELECTED":
      bg = "var(--status-selected-soft)";
      color = "var(--status-selected-text)";
      dotColor = "var(--status-selected-solid)";
      label = label || "Selected";
      break;
    case "REJECTED":
      bg = "var(--status-rejected-soft)";
      color = "var(--status-rejected-text)";
      dotColor = "var(--status-rejected-solid)";
      label = label || "Rejected";
      break;
    case "RECRUITER":
      bg = "rgba(20, 184, 166, 0.15)";
      color = "var(--brand-700)";
      label = label || "Recruiter";
      break;
    case "EMPLOYEE":
      bg = "var(--surface-2)";
      color = "var(--text-muted)";
      label = label || "Employee";
      break;
    case "SENT":
      bg = "var(--status-selected-soft)";
      color = "var(--status-selected-text)";
      label = label || "Sent";
      break;
    case "FAILED":
      bg = "var(--status-rejected-soft)";
      color = "var(--status-rejected-text)";
      label = label || "Failed";
      break;
    default:
      break;
  }

  return (
    <span
      className={`rh-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: isSm ? "2px 8px" : "4px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: isSm ? 11 : 12,
        fontWeight: 600,
        lineHeight: 1,
        backgroundColor: bg,
        color: color,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dotColor && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
}
