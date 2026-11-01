import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import { Skeleton } from "./components/ui/Skeleton";
import "./index.css";

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState("login");

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg)",
          gap: 16,
        }}
      >
        <Skeleton variant="circle" width={48} height={48} />
        <Skeleton width={160} height={18} />
      </div>
    );
  }

  if (!user) {
    return <AuthPage mode={authMode} setMode={setAuthMode} />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}