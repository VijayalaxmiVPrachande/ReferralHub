export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  style = {},
  className = "",
}) {
  return (
    <div
      role="tablist"
      className={`rh-tabs ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        borderBottom: "1px solid var(--border)",
        width: "100%",
        paddingBottom: 0,
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--brand-700)" : "var(--text-muted)",
              position: "relative",
              borderBottom: isActive ? "2px solid var(--brand-600)" : "2px solid transparent",
              marginBottom: -1,
              transition: "all var(--duration-hover) var(--ease)",
              background: "transparent",
            }}
          >
            {Icon && (typeof Icon === "function" ? <Icon size={16} /> : Icon)}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 6px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: isActive ? "var(--brand-100)" : "var(--surface-2)",
                  color: isActive ? "var(--brand-800)" : "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
