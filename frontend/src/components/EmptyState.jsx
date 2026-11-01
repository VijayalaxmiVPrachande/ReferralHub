export default function EmptyState({ icon, title, sub }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "5rem 1.5rem",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: "linear-gradient(135deg, #EEF2FF, #FAF5FF)",
        border: "1px solid #E2E8F0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, margin: "0 auto 20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}>
        {icon}
      </div>
      <p style={{
        margin: 0, fontWeight: 800, fontSize: 17,
        color: "#0F172A", letterSpacing: "-0.3px",
      }}>
        {title}
      </p>
      <p style={{
        fontSize: 14,
        color: "#94A3B8", maxWidth: 300, margin: "8px auto 0",
        lineHeight: 1.6,
      }}>
        {sub}
      </p>
    </div>
  );
}