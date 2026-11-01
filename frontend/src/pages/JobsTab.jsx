import Spinner    from "../components/Spinner";
import EmptyState  from "../components/EmptyState";
import AddJobModal from "../components/AddJobModal";
import ReferModal  from "../components/ReferModal";
import { btnStyle } from "../utils/styles";

export default function JobsTab({
  jobs, loading,
  onRefresh, showToast,
  showAddJob, setShowAddJob,
  onRefer, selectedJob, showRefer, setShowRefer,
  onJobAdded,
}) {
  const role = localStorage.getItem("user_role");

  return (
    <div>
      {/* Tab Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1.75rem",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            Job Openings
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #DBEAFE, #EDE9FE)",
              color: "#2563EB", fontWeight: 700, fontSize: 13,
              width: 24, height: 24, borderRadius: 6,
            }}>
              {jobs.length}
            </span>
            positions available
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
          {role === "RECRUITER" && (
            <button
              onClick={() => setShowAddJob(true)}
              style={{
                ...btnStyle("primary"),
                display: "flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.35)";
              }}
            >
              + Add Job
            </button>
          )}
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <Spinner />
      ) : jobs.length === 0 ? (
        <EmptyState icon="💼" title="No jobs yet" sub="Add the first job opening to get started" />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {jobs.map((job, index) => (
            <JobCard key={job.id} job={job} onRefer={onRefer} index={index} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddJob && (
        <AddJobModal
          onClose={() => setShowAddJob(false)}
          showToast={showToast}
          onSaved={onJobAdded}
        />
      )}
      {showRefer && selectedJob && (
        <ReferModal
          job={selectedJob}
          onClose={() => setShowRefer(false)}
          showToast={showToast}
          onSaved={() => setShowRefer(false)}
        />
      )}
    </div>
  );
}

function JobCard({ job, onRefer, index }) {
  return (
    <div
      className="card"
      style={{
        padding: "1.25rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        animation: `slideUp 0.3s cubic-bezier(0.4,0,0.2,1) ${index * 0.05}s both`,
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #EEF2FF, #FAF5FF)",
            border: "1px solid #E2E8F0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>
            {job.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#0F172A", letterSpacing: "-0.2px" }}>
              {job.title}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <span style={{ color: "#94A3B8" }}>Location: </span>
              {job.location || "Location not specified"}
            </p>
          </div>
        </div>
        {job.description && (
          <p style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: "#94A3B8",
            lineHeight: 1.6,
            paddingLeft: 48,
          }}>
            {job.description?.slice(0, 100)}{job.description?.length > 100 ? "…" : ""}
          </p>
        )}
      </div>

      <button
        onClick={() => onRefer(job)}
        style={{
          ...btnStyle("primary"),
          whiteSpace: "nowrap",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.35)";
        }}
      >
        Refer Someone
      </button>
    </div>
  );
}