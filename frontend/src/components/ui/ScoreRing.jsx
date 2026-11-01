export function ScoreRing({
  score,
  size = 56,
  strokeWidth = 5,
  showLabel = true,
  style = {},
}) {
  const isAvailable = typeof score === "number" && !isNaN(score);
  const targetScore = isAvailable ? Math.min(100, Math.max(0, Math.round(score))) : null;

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = isAvailable
    ? circumference - (targetScore / 100) * circumference
    : circumference;

  let strokeColor = "var(--text-faint)";
  if (isAvailable) {
    if (targetScore >= 80) strokeColor = "#10B981"; // Emerald
    else if (targetScore >= 50) strokeColor = "#F59E0B"; // Amber
    else strokeColor = "#EF4444"; // Rose
  }

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      title={isAvailable ? `Match Score: ${targetScore}%` : "Not Analyzed"}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        {/* Animated value arc */}
        {isAvailable && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 800ms var(--ease)",
            }}
          />
        )}
      </svg>

      {showLabel && (
        <span
          style={{
            position: "absolute",
            fontSize: Math.max(10, Math.floor(size * 0.28)),
            fontWeight: 800,
            color: isAvailable ? "var(--text)" : "var(--text-faint)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {isAvailable ? targetScore : "—"}
        </span>
      )}
    </div>
  );
}
