import { useState } from "react";

export default function Header({ tab, setTab, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "jobs",      label: "Job Openings", icon: "" },
    { id: "referrals", label: "Referrals",    icon: "" },
  ];

  return (
    <header style={{
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(226,232,240,0.8)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
          }}>
            🤝
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", letterSpacing: "-0.5px" }}>
              ReferralHub
            </span>
            <span style={{
              display: "block", fontSize: 10, color: "#94A3B8",
              fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1,
            }}>
              Hiring Platform
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", gap: 4, flex: 1, justifyContent: "center" }}>
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: tab === n.id ? 700 : 500,
                background: tab === n.id
                  ? "linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 100%)"
                  : "transparent",
                color: tab === n.id ? "#2563EB" : "#64748B",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (tab !== n.id) {
                  e.currentTarget.style.background = "#F1F5F9";
                  e.currentTarget.style.color = "#0F172A";
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== n.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                }
              }}
            >
              <span style={{ fontSize: 15 }}>{n.icon}</span>
              {n.label}
              {tab === n.id && (
                <span style={{
                  position: "absolute", bottom: -2, left: "50%",
                  transform: "translateX(-50%)",
                  width: 20, height: 2, borderRadius: 2,
                  background: "linear-gradient(90deg, #2563EB, #7C3AED)",
                }} />
              )}
            </button>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {user?.email && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#F8FAFF", border: "1px solid #E2E8F0",
              borderRadius: 10, padding: "6px 12px",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
                flexShrink: 0,
              }}>
                {user.email[0].toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{
                  fontSize: 12, color: "#0F172A", fontWeight: 600,
                  maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {user.email}
                </span>
                {user?.role && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.6px",
                    textTransform: "uppercase",
                    color: user.role === "RECRUITER" ? "#7C3AED" : "#2563EB",
                  }}>
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "1.5px solid #E2E8F0",
              borderRadius: 9,
              padding: "7px 14px",
              fontSize: 13,
              cursor: "pointer",
              color: "#64748B",
              fontFamily: "inherit",
              fontWeight: 600,
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEE2E2";
              e.currentTarget.style.color = "#DC2626";
              e.currentTarget.style.borderColor = "#FECACA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#64748B";
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          >
            <span>↩</span> Sign out
          </button>
        </div>
      </div>
    </header>
  );
}