export function Skeleton({
  variant = "rect",
  width,
  height,
  borderRadius,
  style = {},
  className = "",
}) {
  const baseStyle = {
    background: "linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.8s infinite linear",
    display: "block",
  };

  let computedRadius = borderRadius || "var(--radius-sm)";
  let defaultHeight = height || 16;
  let defaultWidth = width || "100%";

  if (variant === "circle") {
    computedRadius = "50%";
    defaultHeight = height || 40;
    defaultWidth = width || 40;
  } else if (variant === "card") {
    computedRadius = "var(--radius-md)";
    defaultHeight = height || 180;
  }

  return (
    <span
      className={`rh-skeleton ${className}`}
      style={{
        ...baseStyle,
        width: defaultWidth,
        height: defaultHeight,
        borderRadius: computedRadius,
        ...style,
      }}
    />
  );
}
