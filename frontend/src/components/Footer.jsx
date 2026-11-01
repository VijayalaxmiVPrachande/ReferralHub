export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Documentation", href: "#" },
    { label: "Support",       href: "#" },
    { label: "Privacy",       href: "#" },
    { label: "Terms",         href: "#" },
  ];

  return (
    <footer style={{
      borderTop: "1px solid #E2E8F0",
      background: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(8px)",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        {/* Brand + copyright */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}>
            🤝
          </div>
          <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
            <strong style={{ color: "#64748B" }}>ReferralHub</strong> © {year}. All rights reserved.
          </span>
        </div>

        {/* Links */}
        <nav style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontSize: 13,
                color: "#94A3B8",
                textDecoration: "none",
                fontWeight: 500,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#2563EB")}
              onMouseLeave={(e) => (e.target.style.color = "#94A3B8")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Status pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#10B981",
            boxShadow: "0 0 6px #10B981",
            animation: "pulse-dot 2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}