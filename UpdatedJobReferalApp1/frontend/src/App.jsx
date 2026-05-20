import { useState } from "react";
import AuthPage  from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Toast     from "./components/Toast";
import { getToken, clearToken } from "./utils/api";
import "./index.css";

// Restore user from localStorage so refresh doesn't lose state
const getSavedUser = () => ({
  email: localStorage.getItem("user_email") || "",
  role:  localStorage.getItem("user_role")  || "",
});

export default function App() {
  const [page, setPage]   = useState(getToken() ? "dashboard" : "login");
  const [toast, setToast] = useState(null);
  const [user, setUser]   = useState(getSavedUser);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    setPage("login");
    setUser({ email: "", role: "" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {(page === "login" || page === "register") && (
        <AuthPage
          mode={page}
          setPage={setPage}
          setUser={setUser}
          showToast={showToast}
          onSuccess={() => setPage(page === "login" ? "dashboard" : "login")}
        />
      )}

      {page === "dashboard" && (
        <Dashboard user={user} showToast={showToast} onLogout={handleLogout} />
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}