export default function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff",
        borderRadius: 18,
        padding: "2rem",
        width: "100%",
        maxWidth: 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        animation: "scaleIn 0.25s cubic-bezier(0.4,0,0.2,1) both",
        border: "1px solid #E2E8F0",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #F1F5F9",
        }}>
          <h2 style={{
            margin: 0, fontSize: 18, fontWeight: 800,
            color: "#0F172A", letterSpacing: "-0.3px",
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#64748B",
              lineHeight: 1,
              width: 32, height: 32,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEE2E2";
              e.currentTarget.style.color = "#DC2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F1F5F9";
              e.currentTarget.style.color = "#64748B";
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}