export const STATUS_COLORS = {
  REFERRED:  { bg: "#DBEAFE", color: "#1D4ED8", label: "Referred"  },
  IN_REVIEW: { bg: "#FEF3C7", color: "#B45309", label: "In Review" },
  SELECTED:  { bg: "#D1FAE5", color: "#065F46", label: "Selected"  },
  REJECTED:  { bg: "#FEE2E2", color: "#B91C1C", label: "Rejected"  },
};

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "inherit",
  color: "#0F172A",
  background: "#FAFBFF",
  outline: "none",
  marginBottom: 14,
  transition: "all 0.2s ease",
};

export const btnStyle = (variant = "primary") => ({
  padding: "10px 20px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  fontFamily: "inherit",
  letterSpacing: "-0.01em",
  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
  ...(variant === "primary"
    ? {
        background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
      }
    : {
        background: "#F1F5F9",
        color: "#475569",
        border: "1.5px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }
  ),
});