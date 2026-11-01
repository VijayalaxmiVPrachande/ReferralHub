import { useState, useMemo } from "react";
import { Search, MapPin, Briefcase, Plus, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Chip } from "../components/ui/Chip";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Drawer } from "../components/ui/Drawer";
import AddJobModal from "../components/AddJobModal";
import ReferModal from "../components/ReferModal";
import { extractSkills } from "../utils/skills";

export default function JobsTab({
  jobs = [],
  loading = false,
  onRefresh,
  showToast,
  showAddJob,
  setShowAddJob,
  onRefer,
  selectedJob,
  showRefer,
  setShowRefer,
}) {
  const { isRecruiter } = useAuth();
  const [search, setSearch] = useState("");
  const [activeDrawerJob, setActiveDrawerJob] = useState(null);

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase().trim();
    return jobs.filter((j) => {
      const matchTitle = j.title?.toLowerCase().includes(q);
      const matchLoc = j.location?.toLowerCase().includes(q);
      const matchDesc = j.description?.toLowerCase().includes(q);
      const skills = extractSkills(j.description || "");
      const matchSkill = skills.some((s) => s.toLowerCase().includes(q));
      return matchTitle || matchLoc || matchDesc || matchSkill;
    });
  }, [jobs, search]);

  const handleOpenRefer = (job) => {
    setActiveDrawerJob(null);
    if (onRefer) onRefer(job);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Search & Filter Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260, maxWidth: 440 }}>
          <Input
            id="search-jobs-input"
            placeholder="Search by job title, location, or skill..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isRecruiter && (
            <Button
              id="add-job-button"
              variant="primary"
              icon={Plus}
              onClick={() => setShowAddJob(true)}
            >
              Add Job
            </Button>
          )}
          <Button variant="secondary" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={14} />
              <div style={{ display: "flex", gap: 6, margin: "8px 0" }}>
                <Skeleton width={60} height={22} />
                <Skeleton width={80} height={22} />
                <Skeleton width={50} height={22} />
              </div>
              <Skeleton width="100%" height={36} />
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={search ? "No matching jobs" : "No open positions"}
          description={
            search
              ? `No jobs match your search "${search}". Try adjusting your query.`
              : isRecruiter
              ? "No job openings have been posted yet. Click 'Add Job' to create one."
              : "Check back later for new openings to refer candidates."
          }
          actionLabel={isRecruiter && !search ? "Post First Job" : undefined}
          onAction={isRecruiter && !search ? () => setShowAddJob(true) : undefined}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {filteredJobs.map((job) => {
            const skills = extractSkills(job.description || "");
            const displaySkills = skills.slice(0, 4);
            const remainingCount = skills.length - displaySkills.length;

            return (
              <article
                key={job.id}
                className="rh-job-card"
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all var(--duration-hover) var(--ease)",
                  position: "relative",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Card Title & Location */}
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text)",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        lineHeight: 1.3,
                      }}
                    >
                      {job.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13,
                        color: "var(--text-muted)",
                        marginTop: 4,
                      }}
                    >
                      <MapPin size={13} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {job.location || "Remote"}
                      </span>
                    </div>
                  </div>

                  {/* Skills preview */}
                  {displaySkills.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {displaySkills.map((sk) => (
                        <Chip key={sk} size="sm" variant="brand">
                          {sk}
                        </Chip>
                      ))}
                      {remainingCount > 0 && (
                        <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600 }}>
                          +{remainingCount} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Short snippet */}
                  {job.description && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveDrawerJob(job)}
                  >
                    View Details
                  </Button>

                  <Button
                    id={`refer-btn-${job.id}`}
                    size="sm"
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => handleOpenRefer(job)}
                  >
                    Refer
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Job Detail Drawer */}
      <Drawer
        isOpen={!!activeDrawerJob}
        onClose={() => setActiveDrawerJob(null)}
        title={activeDrawerJob?.title || "Job Details"}
        subtitle={activeDrawerJob?.location || "Remote"}
        width={560}
      >
        {activeDrawerJob && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Header badges */}
            <div
              style={{
                background: "var(--surface-2)",
                padding: "16px",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                <MapPin size={15} color="var(--brand-600)" />
                <span style={{ fontWeight: 600 }}>Location:</span>
                <span>{activeDrawerJob.location || "Remote"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                <Briefcase size={15} color="var(--brand-600)" />
                <span style={{ fontWeight: 600 }}>Job ID:</span>
                <span>#{activeDrawerJob.id}</span>
              </div>
            </div>

            {/* Required Skills Section */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 10px 0" }}>
                Target ATS Skills
              </h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {extractSkills(activeDrawerJob.description || "").length > 0 ? (
                  extractSkills(activeDrawerJob.description || "").map((skill) => (
                    <Chip key={skill} size="sm" variant="brand">
                      {skill}
                    </Chip>
                  ))
                ) : (
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    No specific skills detected in description
                  </span>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 10px 0" }}>
                Job Description
              </h4>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--text)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: "var(--surface)",
                  padding: 16,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                {activeDrawerJob.description || "No detailed description provided."}
              </div>
            </div>

            {/* Action CTA */}
            <div style={{ marginTop: 8 }}>
              <Button
                variant="primary"
                icon={UserPlus}
                style={{ width: "100%" }}
                onClick={() => handleOpenRefer(activeDrawerJob)}
              >
                Refer Candidate to this Role
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Job Modal */}
      {showAddJob && (
        <AddJobModal
          onClose={() => setShowAddJob(false)}
          showToast={showToast}
          onSaved={onRefresh}
        />
      )}

      {/* Refer Modal */}
      {showRefer && selectedJob && (
        <ReferModal
          job={selectedJob}
          onClose={() => setShowRefer(false)}
          showToast={showToast}
          onSaved={() => {
            setShowRefer(false);
            if (showToast) showToast("Referral submitted successfully!");
          }}
        />
      )}
    </div>
  );
}