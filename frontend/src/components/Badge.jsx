import { STATUS_COLORS } from "../utils/styles";

const statusIcon = {
  REFERRED:  "📩",
  IN_REVIEW: "🔍",
  SELECTED:  "✅",
  REJECTED:  "❌",
};

export default function Badge({ status }) {
  const s = STATUS_COLORS[status] || { bg: "#F1F5F9", color: "#475569", label: status };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 12,
      fontWeight: 700,
      padding: "5px 12px",
      borderRadius: 20,
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      letterSpacing: "0.1px",
    }}>
      {statusIcon[status] && <span style={{ fontSize: 11 }}>{statusIcon[status]}</span>}
      {s.label}
    </span>
  );
}