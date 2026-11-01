// Palette for avatar initials
const AVATAR_PALETTE = [
  { bg: "#CCFBF1", text: "#0F766E" }, // Teal
  { bg: "#EDE9FE", text: "#5B21B6" }, // Violet
  { bg: "#DBEAFE", text: "#1E40AF" }, // Blue
  { bg: "#FEF3C7", text: "#92400E" }, // Amber
  { bg: "#DCFCE7", text: "#166534" }, // Green
  { bg: "#FFE4E6", text: "#9F1239" }, // Rose
  { bg: "#E0E7FF", text: "#3730A3" }, // Indigo
];

function hashName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function Avatar({
  name = "User",
  size = "default",
  style = {},
  className = "",
}) {
  const sizeMap = {
    sm: 28,
    default: 36,
    lg: 48,
    xl: 64,
  };

  const px = sizeMap[size] || 36;
  const fontSize = Math.floor(px * 0.4);

  // Compute initials
  const cleanName = (name || "").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials;
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1) {
    initials = parts[0].slice(0, 2).toUpperCase();
  } else {
    initials = "U";
  }

  // Deterministic color
  const palette = AVATAR_PALETTE[hashName(cleanName) % AVATAR_PALETTE.length];

  return (
    <div
      aria-label={name}
      title={name}
      className={`rh-avatar ${className}`}
      style={{
        width: px,
        height: px,
        borderRadius: "50%",
        backgroundColor: palette.bg,
        color: palette.text,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: fontSize,
        fontWeight: 700,
        letterSpacing: "0.02em",
        flexShrink: 0,
        userSelect: "none",
        border: "1.5px solid rgba(255, 255, 255, 0.4)",
        ...style,
      }}
    >
      {initials}
    </div>
  );
}
