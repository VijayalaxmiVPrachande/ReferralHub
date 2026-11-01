import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "3rem",
        gap: 12,
      }}
    >
      <Loader2
        size={32}
        style={{
          color: "var(--brand-600)",
          animation: "spin 1s linear infinite",
        }}
      />
      {label && <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>}
    </div>
  );
}