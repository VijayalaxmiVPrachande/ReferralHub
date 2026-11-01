export default function Spinner() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      padding: "3rem",
      gap: 14,
    }}>
      <div style={{
        width: 36, height: 36,
        border: "3px solid #E2E8F0",
        borderTopColor: "#2563EB",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        boxShadow: "0 0 12px rgba(37,99,235,0.15)",
      }} />
      <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>Loading…</span>
    </div>
  );
}