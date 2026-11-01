import { useState } from "react";
import { Mail, Lock, User, KeyRound, Eye, EyeOff, Sparkles, Zap, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiRequest, ApiError } from "../utils/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ScoreRing } from "../components/ui/ScoreRing";
import { Badge } from "../components/ui/Badge";
import { Chip } from "../components/ui/Chip";

export default function AuthPage({ mode = "login", setMode }) {
  const isLogin = mode === "login";
  const { login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setInviteCode("");
    setShowInvite(false);
    setFieldErrors({});
    setGeneralError("");
  };

  const handleToggleMode = () => {
    resetForm();
    if (setMode) {
      setMode(isLogin ? "register" : "login");
    }
  };

  const validate = () => {
    const errors = {};
    if (!isLogin && !name.trim()) {
      errors.name = "Full name is required";
    }
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiRequest("/auth/login", {
          method: "POST",
          body: {
            email: email.trim().toLowerCase(),
            password,
          },
        });

        login(data.accessToken, {
          name: data.name,
          email: data.email,
          role: data.role,
        });

        showToast(`Welcome back, ${data.name || "there"}!`);
      } else {
        await apiRequest("/auth/register", {
          method: "POST",
          body: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            inviteCode: showInvite && inviteCode.trim() ? inviteCode.trim() : undefined,
          },
        });

        showToast("Account created successfully. Please sign in.");
        resetForm();
        if (setMode) setMode("login");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        }
        setGeneralError(err.message || "An error occurred. Please try again.");
      } else {
        setGeneralError(err.message || "Unable to connect to server. Please try again.");
      }
      showToast(err.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Hero Panel (Hidden < 900px) */}
      <section className="auth-hero-panel" aria-label="ReferralHub overview">
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--brand-500) 0%, var(--brand-700) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(13, 148, 136, 0.4)",
            }}
          >
            <Sparkles size={20} />
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              letterSpacing: "-0.02em",
              color: "#F8FAFC",
            }}
          >
            ReferralHub
          </span>
        </div>

        {/* Center Content */}
        <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 28, margin: "auto 0" }}>
          <div>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "#F8FAFC",
                margin: "0 0 16px 0",
              }}
            >
              Great people know great people.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-200)", margin: 0 }}>
              The modern hiring platform connecting trusted employee referrals directly to hiring managers with instant ATS intelligence.
            </p>
          </div>

          {/* 3 Value Points */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(13, 148, 136, 0.2)",
                  color: "var(--brand-400)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Zap size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "#F8FAFC", display: "block" }}>Instant ATS Scoring</strong>
                <span style={{ fontSize: 13, color: "var(--ink-300)" }}>
                  Automated resume matching extracts key technical skills against job requirements.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#FBBF24",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "#F8FAFC", display: "block" }}>Transparent Tracking</strong>
                <span style={{ fontSize: 13, color: "var(--ink-300)" }}>
                  Real-time pipeline stages from initial referral to final interview and offer.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34D399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "#F8FAFC", display: "block" }}>Direct Recruiter Outreach</strong>
                <span style={{ fontSize: 13, color: "var(--ink-300)" }}>
                  Pre-drafted interview invites sent directly to candidates with one click.
                </span>
              </div>
            </div>
          </div>

          {/* Decorative ATS Preview Card */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "var(--radius-md)",
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#F8FAFC" }}>Sarah Jenkins</span>
                <Badge variant="emerald" dot>Next Round</Badge>
              </div>
              <span style={{ fontSize: 13, color: "var(--ink-300)" }}>Senior Full-Stack Engineer</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                <Chip size="sm" variant="brand">React</Chip>
                <Chip size="sm" variant="brand">Spring Boot</Chip>
                <Chip size="sm" variant="neutral">PostgreSQL</Chip>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <ScoreRing score={86} size={58} strokeWidth={5} />
              <span style={{ fontSize: 11, color: "var(--ink-300)", fontWeight: 600 }}>ATS Match</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-300)" }}>
          <CheckCircle2 size={15} color="var(--brand-400)" />
          <span>Enterprise-grade security · Role-based access control</span>
        </div>
      </section>

      {/* Right Form Panel */}
      <main className="auth-form-panel">
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            padding: 36,
            animation: "scaleUp 200ms var(--ease)",
          }}
        >
          {/* Card Header */}
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                color: "var(--text)",
                margin: "0 0 8px 0",
                letterSpacing: "-0.02em",
              }}
            >
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              {isLogin
                ? "Sign in to track your referrals and discover internal opportunities."
                : "Join ReferralHub to refer great talent and collaborate with recruiters."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {!isLogin && (
              <Input
                id="name"
                label="Full Name"
                placeholder="e.g. Alex Morgan"
                icon={User}
                required
                autoFocus
                value={name}
                error={fieldErrors.name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <Input
              id="email"
              type="email"
              label="Work Email"
              placeholder="alex@company.com"
              icon={Mail}
              required
              autoFocus={isLogin}
              value={email}
              error={fieldErrors.email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="At least 8 characters"
              icon={Lock}
              required
              value={password}
              error={fieldErrors.password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--text-muted)",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {!isLogin && (
              <div>
                {!showInvite ? (
                  <button
                    type="button"
                    onClick={() => setShowInvite(true)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--brand-600)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <KeyRound size={14} />
                    <span>Have a recruiter invite code?</span>
                  </button>
                ) : (
                  <Input
                    id="invite-code"
                    label="Recruiter Invite Code"
                    hint="Optional"
                    placeholder="Enter invite code"
                    icon={KeyRound}
                    value={inviteCode}
                    error={fieldErrors.inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                )}
              </div>
            )}

            {generalError && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--status-rejected-soft)",
                  color: "var(--status-rejected-text)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{generalError}</span>
              </div>
            )}

            <Button
              id="auth-submit"
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: "100%", marginTop: 8 }}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Toggle mode */}
          <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
            <span>{isLogin ? "Don't have an account yet?" : "Already have an account?"}</span>{" "}
            <button
              id="toggle-mode-btn"
              type="button"
              onClick={handleToggleMode}
              style={{
                background: "none",
                border: "none",
                color: "var(--brand-600)",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}