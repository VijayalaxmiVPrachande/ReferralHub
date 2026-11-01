import { useState } from "react";
import { Briefcase, Users, Sun, Moon, LogOut, Menu, X, Link as LinkIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

export function AppShell({ activeTab, onTabChange, pageTitle, pageSubtitle, pageAction, children }) {
  const { user, logout, isRecruiter } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "referrals", label: isRecruiter ? "All Referrals" : "My Referrals", icon: Users },
  ];

  const handleNavClick = (id) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg)" }}>
      {/* Desktop Sidebar (>= 1024px) */}
      <aside
        className="rh-desktop-sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 248,
          backgroundColor: "var(--ink-900)",
          color: "#FFFFFF",
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--ink-800)",
          padding: "20px 16px",
        }}
      >
        {/* Brand Logo & Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 8px 24px 8px" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(20, 184, 166, 0.4)",
              flexShrink: 0,
            }}
          >
            <LinkIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                lineHeight: 1.1,
              }}
            >
              ReferralHub
            </span>
            <span style={{ fontSize: 11, color: "var(--brand-200)", fontWeight: 500 }}>
              Hiring Platform
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, marginTop: 8 }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  height: 44,
                  padding: "0 14px",
                  borderRadius: "var(--radius-sm)",
                  color: isActive ? "#FFFFFF" : "var(--text-faint)",
                  backgroundColor: isActive ? "rgba(20, 184, 166, 0.15)" : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  position: "relative",
                  transition: "all var(--duration-hover) var(--ease)",
                  textAlign: "left",
                }}
              >
                {/* 3px Left Indicator */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      bottom: 6,
                      width: 3,
                      borderRadius: "0 2px 2px 0",
                      backgroundColor: "var(--brand-500)",
                    }}
                  />
                )}
                <Icon size={18} color={isActive ? "var(--brand-500)" : "currentColor"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: User Card & Utilities */}
        <div
          style={{
            borderTop: "1px solid var(--ink-800)",
            paddingTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--ink-800)",
              }}
            >
              <Avatar name={user.name || user.email} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name || "User"}
                </p>
                <div style={{ marginTop: 2 }}>
                  <Badge variant={user.role} size="sm" />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 36,
                padding: "0 10px",
                gap: 6,
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--ink-800)",
                color: "var(--text-faint)",
                fontSize: 12,
                fontWeight: 500,
                flex: 1,
              }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 36,
                width: 36,
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--ink-800)",
                color: "var(--status-rejected-solid)",
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile / Tablet Header (< 1024px) */}
      <header
        className="rh-mobile-header"
        style={{
          display: "none",
          height: 60,
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              color: "var(--text)",
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-sm)",
                background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LinkIcon size={16} color="#FFFFFF" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, fontFamily: "Plus Jakarta Sans" }}>
              ReferralHub
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && (
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm)",
                color: "var(--status-rejected-solid)",
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu (< 1024px) */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 95,
            display: "flex",
          }}
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(7, 12, 24, 0.6)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 96,
              width: 260,
              height: "100%",
              backgroundColor: "var(--ink-900)",
              color: "#FFFFFF",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 17, color: "#FFFFFF" }}>ReferralHub</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#FFFFFF" }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      height: 44,
                      padding: "0 14px",
                      borderRadius: "var(--radius-sm)",
                      color: isActive ? "#FFFFFF" : "var(--text-faint)",
                      backgroundColor: isActive ? "rgba(20, 184, 166, 0.2)" : "transparent",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 14,
                      textAlign: "left",
                    }}
                  >
                    <Icon size={18} color={isActive ? "var(--brand-500)" : "currentColor"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {user && (
              <div style={{ borderTop: "1px solid var(--ink-800)", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Avatar name={user.name || user.email} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{user.name || "User"}</p>
                    <Badge variant={user.role} size="sm" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--status-rejected-solid)",
                    fontSize: 13,
                    fontWeight: 600,
                    width: "100%",
                    padding: "8px 0",
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className="rh-main-content"
        style={{
          flex: 1,
          marginLeft: 248,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px 24px 64px 24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Page Header */}
          {(pageTitle || pageAction) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 28,
              }}
            >
              <div>
                {pageTitle && (
                  <h1
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      color: "var(--text)",
                    }}
                  >
                    {pageTitle}
                  </h1>
                )}
                {pageSubtitle && (
                  <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                    {pageSubtitle}
                  </p>
                )}
              </div>
              {pageAction && <div>{pageAction}</div>}
            </div>
          )}

          {/* Page Body */}
          <div style={{ flex: 1 }}>{children}</div>
        </div>
      </main>

      {/* Mobile Bottom Tab Bar (< 640px) */}
      <nav
        className="rh-mobile-bottom-tabs"
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          backgroundColor: "var(--surface)",
          borderTop: "1px solid var(--border)",
          zIndex: 80,
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                flex: 1,
                height: "100%",
                color: isActive ? "var(--brand-700)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 500,
                fontSize: 11,
              }}
            >
              <Icon size={18} color={isActive ? "var(--brand-600)" : "currentColor"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 1023px) {
          .rh-desktop-sidebar { display: none !important; }
          .rh-mobile-header { display: flex !important; }
          .rh-main-content { margin-left: 0 !important; }
        }
        @media (max-width: 639px) {
          .rh-mobile-bottom-tabs { display: flex !important; }
          .rh-main-content { padding-bottom: 64px !important; }
        }
      `}</style>
    </div>
  );
}
