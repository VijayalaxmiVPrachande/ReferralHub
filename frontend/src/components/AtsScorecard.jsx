import { Check, AlertCircle, Sparkles } from "lucide-react";
import { ScoreRing } from "./ui/ScoreRing";
import { Badge } from "./ui/Badge";
import { Chip } from "./ui/Chip";

export default function AtsScorecard({ atsScore, matchedSkills, missingSkills, atsLabel }) {
  if (atsScore === null || atsScore === undefined) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: "var(--radius-md)",
          border: "1px dashed var(--border)",
          backgroundColor: "var(--surface-2)",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        No ATS analysis available for this referral.
      </div>
    );
  }

  const matched = Array.isArray(matchedSkills)
    ? matchedSkills
    : typeof matchedSkills === "string"
    ? matchedSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const missing = Array.isArray(missingSkills)
    ? missingSkills
    : typeof missingSkills === "string"
    ? missingSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const badgeVariant = atsScore >= 80 ? "success" : atsScore >= 50 ? "warning" : "danger";
  const labelText = atsLabel || (atsScore >= 80 ? "Highly Recommended" : atsScore >= 50 ? "Recommended" : "Low Match");

  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        padding: 20,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} style={{ color: "var(--primary-600)" }} />
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            ATS Resume Match Analysis
          </h4>
        </div>
        <Badge variant={badgeVariant}>{labelText}</Badge>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Score Ring Display */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "var(--surface-2)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            minWidth: 140,
          }}
        >
          <ScoreRing score={atsScore} size={72} strokeWidth={6} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              marginTop: 10,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Match Score
          </span>
        </div>

        {/* Skills Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* Matched Skills */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 700,
                color: "#10B981",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <Check size={14} />
              <span>Matched Job Requirements ({matched.length})</span>
            </div>
            {matched.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {matched.map((skill) => (
                  <Chip key={skill} variant="matched" style={{ cursor: "default" }}>
                    {skill}
                  </Chip>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>
                No required skills matched from job description.
              </p>
            )}
          </div>

          {/* Missing Skills */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 700,
                color: "#EF4444",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <AlertCircle size={14} />
              <span>Missing Skill Signals ({missing.length})</span>
            </div>
            {missing.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {missing.map((skill) => (
                  <Chip key={skill} variant="missing" style={{ cursor: "default" }}>
                    {skill}
                  </Chip>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>
                No missing skills detected!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
