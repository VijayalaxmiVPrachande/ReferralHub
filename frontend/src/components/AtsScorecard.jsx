export default function AtsScorecard({ atsScore, matchedSkills, missingSkills, atsLabel }) {
  if (atsScore === null || atsScore === undefined) return null;

  const isHigh = atsScore >= 80;
  const isMed = atsScore >= 50 && atsScore < 80;
  
  const color = isHigh ? "#059669" : isMed ? "#D97706" : "#DC2626";
  const bg = isHigh ? "#D1FAE5" : isMed ? "#FEF3C7" : "#FEE2E2";

  const matched = matchedSkills ? matchedSkills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const missing = missingSkills ? missingSkills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div style={{ 
      padding: "24px", 
      background: "linear-gradient(to bottom, #FAFBFF, #F8FAFC)", 
      borderTop: "1px solid #E2E8F0",
      animation: "slideIn 0.2s ease-out"
    }}>
      <h4 style={{ margin: "0 0 20px 0", fontSize: 15, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
        ATS Resume Analysis
      </h4>
      
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Score Block */}
        <div style={{ 
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "#fff", padding: "20px 30px", borderRadius: 16, 
          border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          minWidth: 160
        }}>
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>Match Score</div>
          <div style={{ fontSize: 42, fontWeight: 800, color, lineHeight: 1 }}>{atsScore}%</div>
          <div style={{ 
            fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20, 
            background: bg, color, marginTop: 12, letterSpacing: "0.2px"
          }}>
            {atsLabel}
          </div>
        </div>

        {/* Skills Analysis */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#065F46", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              Matched Required Skills <span style={{ background: "#D1FAE5", padding: "2px 6px", borderRadius: 10, fontSize: 11 }}>{matched.length}</span>
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {matched.length > 0 ? matched.map(s => (
                <span key={s} style={{ 
                  background: "#ECFDF5", color: "#047857", padding: "5px 12px", 
                  borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid #A7F3D0" 
                }}>
                  {s}
                </span>
              )) : <span style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>No specific skills matched.</span>}
            </div>
          </div>
          
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#B91C1C", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              Missing Required Skills <span style={{ background: "#FEE2E2", padding: "2px 6px", borderRadius: 10, fontSize: 11 }}>{missing.length}</span>
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {missing.length > 0 ? missing.map(s => (
                <span key={s} style={{ 
                  background: "#FEF2F2", color: "#B91C1C", padding: "5px 12px", 
                  borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid #FECACA", opacity: 0.85 
                }}>
                  {s}
                </span>
              )) : <span style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}>No missing skills detected!</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
