export function EmptyState({
  title = "No items found",
  description = "Get started by adding your first entry.",
  action,
  icon,
  style = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        backgroundColor: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border)",
        maxWidth: 500,
        margin: "24px auto",
        ...style,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "var(--brand-50)",
          color: "var(--brand-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon ? (
          icon
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        )}
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 360, lineHeight: 1.5, marginBottom: action ? 20 : 0 }}>
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}
