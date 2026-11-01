import { useState } from "react";
import { apiFetch, setToken } from "../utils/api";
import { inputStyle, btnStyle } from "../utils/styles";

const saveRole  = (role)  => localStorage.setItem("user_role", role);
const saveEmail = (email) => localStorage.setItem("user_email", email);

export default function AuthPage({ mode, setPage, setUser, showToast, onSuccess }) {
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "EMPLOYEE" });
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });

        const jwt = data?.token || data?.jwt || data?.accessToken;
        if (!jwt || typeof jwt !== "string") {
          console.error("Login response was:", data);
          throw new Error("Server did not return a token — check your AuthResponse DTO field name.");
        }

        const role = data?.role || data?.userRole || "EMPLOYEE";
        setToken(jwt);
        saveEmail(form.email);
        saveRole(role);
        setUser({ email: form.email, role });
        showToast("Logged in successfully");
        onSuccess();
      } else {
        await apiFetch("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        showToast("Account created — please log in");
        onSuccess();
      }
    } catch (e) {
      showToast(e.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      background: "linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 50%, #FAF5FF 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", left: "-10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 20,
        padding: "2.5rem 2.25rem",
        width: "100%",
        maxWidth: 420,
        border: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 8px 40px rgba(37,99,235,0.1), 0 1px 3px rgba(0,0,0,0.05)",
        animation: "scaleIn 0.3s cubic-bezier(0.4,0,0.2,1) both",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo & Heading */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 26,
            boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
          }}>
            🤝
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748B", fontWeight: 400 }}>
            {isLogin ? "Sign in to the referral platform" : "Join the hiring platform today"}
          </p>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {!isLogin && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                style={inputStyle}
                placeholder="John Doe"
                value={form.name}
                onChange={set("name")}
              />
            </div>
          )}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              style={inputStyle}
              placeholder="you@company.com"
              type="email"
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={set("password")}
            />
          </div>
          {!isLogin && (
            <div>
              <label style={labelStyle}>I am a</label>
              <select style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }} value={form.role} onChange={set("role")}>
                <option value="EMPLOYEE">👤 Employee</option>
                <option value="RECRUITER">🎯 Recruiter</option>
              </select>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          style={{
            ...btnStyle("primary"),
            width: "100%",
            marginTop: 8,
            padding: "13px",
            fontSize: 15,
            borderRadius: 12,
            boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.4)",
          }}
          onClick={handle}
          disabled={loading}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{
                display: "inline-block", width: 16, height: 16,
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              Please wait…
            </span>
          ) : (
            isLogin ? "Sign in →" : "Create account →"
          )}
        </button>

        {/* Toggle link */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748B" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setPage(isLogin ? "register" : "login")}
            style={{
              background: "none", border: "none", color: "#2563EB",
              cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 0,
              textDecoration: "underline", textUnderlineOffset: 2,
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      {/* Bottom tag */}
      <p style={{ marginTop: 24, fontSize: 12, color: "#94A3B8", textAlign: "center", position: "relative", zIndex: 1 }}>
        Secure · Private · Professional
      </p>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};