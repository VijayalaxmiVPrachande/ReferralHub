import { useState } from "react";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import AtsScorecard from "../components/AtsScorecard";
import Modal from "../components/Modal";
import { btnStyle } from "../utils/styles";
import { API, getToken } from "../utils/api";

const STATUS_OPTIONS = ["REFERRED", "IN_REVIEW", "SELECTED", "REJECTED"];

const statusColor = {
  REFERRED:  { bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6" },
  IN_REVIEW: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B" },
  SELECTED:  { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  REJECTED:  { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444" },
};

const statusIcon = {
  REFERRED: "📩",
  IN_REVIEW: "🔍",
  SELECTED: "✅",
  REJECTED: "❌",
};

export default function ReferralsTab({
  referrals, loading, page, setPage, onRefresh, showToast, userRole,
}) {
  const isRecruiter = userRole === "RECRUITER";
  const [updating, setUpdating] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedAts, setExpandedAts] = useState(null);
  const [sortBy, setSortBy] = useState("NEWEST");

  const changeStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch(
        `${API}/referrals/${id}/status?status=${status}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (!res.ok) throw new Error(await res.text());
      showToast("Status updated");
      onRefresh();
    } catch (e) {
      showToast(e.message || "Failed to update status", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleDownload = (id, resumeUrl) => {
    if (resumeUrl && resumeUrl.includes("cloudinary.com")) {
      window.open(resumeUrl, "_blank");
      showToast("Opening original resume link");
    } else {
      window.open(`${API}/referrals/${id}/download?token=${getToken()}`, "_blank");
      showToast("Download started");
    }
  };

  const togglePreview = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const sortedReferrals = [...referrals].sort((a, b) => {
    if (sortBy === "ATS_HIGH") return (b.atsScore || 0) - (a.atsScore || 0);
    return new Date(b.createdTime) - new Date(a.createdTime);
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "1.75rem",
        flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            Referrals
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748B" }}>
            {isRecruiter ? "🎯 Review candidates & update status" : "📊 Track your referral status"}
          </p>
        </div>
        <button
          onClick={onRefresh}
          style={{
            ...btnStyle("secondary"),
            display: "flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#E2E8F0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats Bar */}
      {referrals.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 12, marginBottom: "1.5rem",
        }}>
          {Object.entries(statusColor).map(([status, colors]) => {
            const count = referrals.filter(r => r.status === status).length;
            return (
              <div key={status} style={{
                background: colors.bg,
                borderRadius: 12, padding: "12px 14px",
                display: "flex", flexDirection: "column", gap: 4,
                border: `1px solid ${colors.dot}30`,
              }}>
                <span style={{ fontSize: 18 }}>{statusIcon[status]}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>{count}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: colors.text, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {status.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "#0F172A" }}>
          {isRecruiter ? "All Referrals" : "My Referrals"}
        </h3>
        {isRecruiter && referrals.length > 0 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid #E2E8F0",
              fontSize: 13, fontWeight: 600, color: "#334155", background: "#fff",
              outline: "none", cursor: "pointer",
            }}
          >
            <option value="NEWEST">Newest First</option>
            <option value="ATS_HIGH">Highest ATS Score</option>
          </select>
        )}
      </div>

      {/* List */}
      {loading ? (
        <Spinner />
      ) : referrals.length === 0 ? (
        <EmptyState icon="👥" title="No referrals yet"
          sub="Refer a candidate from the Job Openings tab" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sortedReferrals.map((r, index) => {
            const cName     = r.candidate?.name ?? r.candidateName ?? "Candidate";
            const cEmail    = r.candidate?.email ?? r.candidateEmail ?? "";
            const cPhone    = r.candidate?.phone ?? r.candidatePhone ?? "";
            const resumeUrl = r.candidate?.resumeUrl ?? null;
            const jobTitle  = r.job?.title ?? r.jobTitle ?? "Position";
            const colors    = statusColor[r.status] ?? { bg: "#F1F5F9", text: "#374151", dot: "#94A3B8" };
            const isExpanded = expandedId === r.id;
            const initials  = cName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

            return (
              <div
                key={r.id}
                className="card"
                style={{
                  padding: "1.25rem 1.5rem",
                  animation: `slideUp 0.3s cubic-bezier(0.4,0,0.2,1) ${index * 0.05}s both`,
                  borderLeft: `4px solid ${colors.dot}`,
                }}
              >
                {/* Top row */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", flexWrap: "wrap", gap: 12,
                }}>
                  {/* Candidate Info */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}cc)`,
                      border: `2px solid ${colors.dot}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 800, color: colors.text,
                    }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#0F172A", letterSpacing: "-0.2px" }}>
                        {cName}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748B" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#F1F5F9", borderRadius: 6, padding: "1px 8px",
                          fontSize: 12, fontWeight: 600, color: "#475569",
                          marginRight: 6,
                        }}>
                          {jobTitle}
                        </span>
                        {cEmail}
                        {isRecruiter && cPhone && <span style={{ color: "#94A3B8" }}> · 📞 {cPhone}</span>}
                      </p>
                      
                      {/* ATS Row Mini */}
                      {r.atsScore !== null && r.atsScore !== undefined && (
                        <div style={{ marginTop: 8 }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            background: r.atsScore >= 80 ? "#D1FAE5" : r.atsScore >= 50 ? "#FEF3C7" : "#FEE2E2",
                            color: r.atsScore >= 80 ? "#065F46" : r.atsScore >= 50 ? "#B45309" : "#B91C1C",
                            padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                            border: `1px solid ${r.atsScore >= 80 ? "#34D399" : r.atsScore >= 50 ? "#FBBF24" : "#F87171"}50`
                          }}>
                            ATS Match: {r.atsScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status badge / dropdown */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {updating === r.id && (
                      <span style={{
                        fontSize: 12, color: "#2563EB", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <span style={{
                          display: "inline-block", width: 12, height: 12,
                          border: "2px solid #BFDBFE", borderTopColor: "#2563EB",
                          borderRadius: "50%", animation: "spin 0.7s linear infinite",
                        }} />
                        Updating…
                      </span>
                    )}

                    {r.atsScore !== null && r.atsScore !== undefined && (
                      <button
                        onClick={() => setExpandedAts(expandedAts === r.id ? null : r.id)}
                        style={{
                          background: expandedAts === r.id ? "#EFF6FF" : "#F8FAFF", 
                          border: `1px solid ${expandedAts === r.id ? "#BFDBFE" : "#E2E8F0"}`,
                          padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          color: "#2563EB", cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        {expandedAts === r.id ? "Hide Analysis" : "View ATS"}
                      </button>
                    )}

                    {isRecruiter ? (
                      <select
                        value={r.status}
                        disabled={updating === r.id}
                        onChange={(e) => changeStatus(r.id, e.target.value)}
                        style={{
                          fontSize: 13, fontWeight: 700, padding: "7px 14px",
                          borderRadius: 20, border: `2px solid ${colors.dot}30`,
                          cursor: "pointer",
                          background: colors.bg, color: colors.text,
                          fontFamily: "inherit",
                          appearance: "auto",
                          outline: "none",
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{statusIcon[s]} {s.replace("_", " ")}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge status={r.status} />
                    )}
                  </div>
                </div>

                {/* Resume + date row */}
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 10, marginTop: 14, flexWrap: "wrap",
                  paddingTop: 14,
                  borderTop: "1px solid #F1F5F9",
                }}>
                  {resumeUrl && (
                    <>
                      <button
                        onClick={() => togglePreview(r.id)}
                        style={{
                          fontSize: 13, fontWeight: 600,
                          color: isExpanded ? "#fff" : "#2563EB",
                          background: isExpanded
                            ? "linear-gradient(135deg, #2563EB, #7C3AED)"
                            : "#EEF2FF",
                          padding: "7px 16px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                          transition: "all 0.2s",
                          boxShadow: isExpanded ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
                        }}
                      >
                        {isExpanded ? "✕ Close Preview" : "📄 View Resume"}
                      </button>
                      <button
                        onClick={() => handleDownload(r.id, resumeUrl)}
                        style={{
                          fontSize: 13, fontWeight: 600,
                          color: "#065F46",
                          background: "#D1FAE5",
                          padding: "7px 16px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#A7F3D0"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#D1FAE5"; }}
                      >
                        ⬇️ Download
                      </button>
                    </>
                  )}
                  {r.createdTime && (
                    <span style={{
                      fontSize: 12, color: "#94A3B8", fontWeight: 500,
                      marginLeft: "auto",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      🕐 {new Date(r.createdTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>

                {/* Inline Preview */}
                {isExpanded && resumeUrl && (
                  <div style={{
                    marginTop: 16,
                    borderTop: "1px solid #F1F5F9",
                    paddingTop: 16,
                    animation: "slideUp 0.2s ease",
                  }}>
                    <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: "#374151",
                        background: "#F1F5F9", padding: "4px 12px", borderRadius: 6,
                      }}>
                        {resumeUrl.includes("cloudinary.com") ? "Resume Preview (Pages 1–3)" : "Resume Preview"}
                      </span>
                    </div>

                    <div style={{
                      width: "100%",
                      maxHeight: "650px",
                      overflowY: "auto",
                      background: "#F8FAFF",
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)",
                    }}>
                      {resumeUrl.includes("/api/files/preview") && !resumeUrl.toLowerCase().endsWith(".doc") && !resumeUrl.toLowerCase().endsWith(".docx") ? (
                        <iframe
                          src={`${API}${resumeUrl}`}
                          style={{ width: "100%", height: "600px", border: "none", borderRadius: "8px" }}
                          title="Resume Preview"
                        />
                      ) : resumeUrl.includes("cloudinary.com") ? (
                        [1, 2, 3].map(pg => (
                          <div key={pg} style={{ position: "relative" }}>
                            <img
                              src={resumeUrl.replace("/upload/", `/upload/pg_${pg},w_1000,c_limit,q_auto,f_auto/`).replace(/\.[^/.]+$/, "") + ".jpg"}
                              alt={`Page ${pg}`}
                              style={{
                                width: "100%", height: "auto", borderRadius: 8,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", background: "#fff",
                              }}
                              onError={(e) => e.target.style.display = "none"}
                            />
                            <div style={{
                              position: "absolute", top: 10, right: 10,
                              background: "rgba(15,23,42,0.7)", color: "#fff",
                              fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                            }}>
                              Page {pg}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 16 }}>
                            Preview not available for this link.
                          </p>
                          <a href={resumeUrl} target="_blank" rel="noreferrer" style={{
                            ...btnStyle("secondary"),
                            display: "inline-flex", alignItems: "center", gap: 6,
                            textDecoration: "none",
                          }}>
                            🔗 Open in New Tab
                          </a>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 10, textAlign: "center" }}>
                      High-quality preview. Use <b>Download</b> for the original document.
                    </p>
                  </div>
                )}

                {/* Expandable ATS Scorecard */}
                {expandedAts === r.id && (
                  <AtsScorecard 
                    atsScore={r.atsScore}
                    matchedSkills={r.matchedSkills}
                    missingSkills={r.missingSkills}
                    atsLabel={r.atsLabel}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div style={{
        display: "flex", gap: 8, marginTop: 28,
        justifyContent: "center", alignItems: "center",
      }}>
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          style={{
            ...btnStyle("secondary"),
            display: "flex", alignItems: "center", gap: 4,
            opacity: page === 0 ? 0.4 : 1,
          }}
          onMouseEnter={(e) => { if (page !== 0) e.currentTarget.style.background = "#E2E8F0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
        >
          ← Prev
        </button>
        <div style={{
          background: "linear-gradient(135deg, #DBEAFE, #EDE9FE)",
          borderRadius: 8, padding: "8px 16px",
          fontSize: 14, fontWeight: 700, color: "#2563EB",
          border: "1px solid #BFDBFE",
        }}>
          Page {page + 1}
        </div>
        <button
          disabled={referrals.length < 10}
          onClick={() => setPage(page + 1)}
          style={{
            ...btnStyle("secondary"),
            display: "flex", alignItems: "center", gap: 4,
            opacity: referrals.length < 10 ? 0.4 : 1,
          }}
          onMouseEnter={(e) => { if (referrals.length >= 10) e.currentTarget.style.background = "#E2E8F0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}