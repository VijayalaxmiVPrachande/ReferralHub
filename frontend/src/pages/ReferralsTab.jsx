import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  FileText,
  Download,
  ExternalLink,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  List as ListIcon,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  User,
  Mail,
  Phone,
  Calendar,
  RotateCw,
  Send,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Avatar } from "../components/ui/Avatar";
import { ScoreRing } from "../components/ui/ScoreRing";
import { Drawer } from "../components/ui/Drawer";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import AtsScorecard from "../components/AtsScorecard";
import EmailModal from "../components/EmailModal";
import { apiRequest } from "../utils/api";

const STATUSES = ["REFERRED", "IN_REVIEW", "NEXT_ROUND", "SELECTED", "REJECTED"];

export default function ReferralsTab({
  referrals: initialReferrals,
  loading: initialLoading,
  onRefresh: parentRefresh,
}) {
  const { isRecruiter } = useAuth();
  const { showToast } = useToast();

  const [referrals, setReferrals] = useState(initialReferrals || []);
  const [stats, setStats] = useState({
    REFERRED: 0,
    IN_REVIEW: 0,
    NEXT_ROUND: 0,
    SELECTED: 0,
    REJECTED: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(initialLoading ?? false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'kanban'

  // Drawer state
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [previewingResume, setPreviewingResume] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const data = await apiRequest("/referrals/stats");
      if (data) {
        setStats(data);
      }
    } catch {
      // stats error handled silently or fallback
    }
  }, []);

  // Fetch referrals with query parameters
  const fetchReferrals = useCallback(
    async (p = 0, currentFilter = statusFilter, currentSort = sortBy, currentSearch = search) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          size: "10",
          sort: currentSort,
        });
        if (currentFilter && currentFilter !== "ALL") {
          params.set("status", currentFilter);
        }
        if (currentSearch && currentSearch.trim()) {
          params.set("q", currentSearch.trim());
        }

        const data = await apiRequest(`/referrals?${params.toString()}`);
        if (data) {
          const content = Array.isArray(data) ? data : data.content || [];
          setReferrals(content);
          setPage(data.page ?? p);
          setTotalPages(data.totalPages ?? 1);
          setTotalElements(data.totalElements ?? content.length);
        }
      } catch (err) {
        showToast(err.message || "Failed to load referrals", "error");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, sortBy, search, showToast]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReferrals(page, statusFilter, sortBy, search);
    loadStats();
  }, [fetchReferrals, loadStats, page, statusFilter, sortBy, search]);

  const handleRefreshAll = () => {
    fetchReferrals(page, statusFilter, sortBy, search);
    loadStats();
    if (parentRefresh) parentRefresh();
    showToast("Referrals refreshed");
  };

  const handleStatusFilterChange = (st) => {
    setStatusFilter(st);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const fetchEmailHistory = useCallback(
    async (refId) => {
      if (!isRecruiter || !refId) return;
      setLoadingEmails(true);
      try {
        const data = await apiRequest(`/referrals/${refId}/emails`);
        setEmailHistory(Array.isArray(data) ? data : []);
      } catch {
        setEmailHistory([]);
      } finally {
        setLoadingEmails(false);
      }
    },
    [isRecruiter]
  );

  const openDrawer = (ref) => {
    setSelectedReferral(ref);
    setIsDrawerOpen(true);
    fetchEmailHistory(ref.id);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedReferral(null);
    setEmailHistory([]);
  };

  const handleEmailSent = (sentEmail) => {
    if (selectedReferral?.id) {
      fetchEmailHistory(selectedReferral.id);
    }
    fetchReferrals(page, statusFilter, sortBy, search);
    loadStats();
    if (parentRefresh) parentRefresh();
    if (sentEmail?.type && sentEmail.type !== "CUSTOM" && sentEmail.status === "SENT") {
      setSelectedReferral((prev) => (prev ? { ...prev, status: sentEmail.type } : null));
    }
  };

  // Status transition handler for recruiters
  const handleUpdateStatus = async (refId, nextStatus) => {
    setStatusUpdating(true);
    try {
      await apiRequest(`/referrals/${refId}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });

      // Update state locally
      setReferrals((prev) =>
        prev.map((r) => (r.id === refId ? { ...r, status: nextStatus } : r))
      );
      if (selectedReferral && selectedReferral.id === refId) {
        setSelectedReferral({ ...selectedReferral, status: nextStatus });
      }

      showToast(`Candidate status updated to ${nextStatus.replace(/_/g, " ")}`);
      loadStats();
      if (parentRefresh) parentRefresh();
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Resume Download Handler
  const handleDownloadResume = async (ref) => {
    if (!ref.hasResume) {
      showToast("No resume available for this candidate", "error");
      return;
    }

    setDownloadingResume(true);
    try {
      const { blob, filename } = await apiRequest(`/referrals/${ref.id}/resume?download=true`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || `${ref.candidate?.name || "candidate"}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      showToast("Resume download started");
    } catch (err) {
      showToast(err.message || "Failed to download resume", "error");
    } finally {
      setDownloadingResume(false);
    }
  };

  // Resume Preview Handler
  const handlePreviewResume = async (ref) => {
    if (!ref.hasResume) {
      showToast("No resume available for this candidate", "error");
      return;
    }

    setPreviewingResume(true);
    try {
      const { blob } = await apiRequest(`/referrals/${ref.id}/resume?download=false`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      showToast(err.message || "Failed to preview resume", "error");
    } finally {
      setPreviewingResume(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Stat Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard
          label="Total Referrals"
          value={stats.total}
          icon={Users}
          isActive={statusFilter === "ALL"}
          onClick={() => handleStatusFilterChange("ALL")}
        />
        <StatCard
          label="Referred"
          value={stats.REFERRED}
          status="REFERRED"
          icon={Clock}
          isActive={statusFilter === "REFERRED"}
          onClick={() => handleStatusFilterChange("REFERRED")}
        />
        <StatCard
          label="In Review"
          value={stats.IN_REVIEW}
          status="IN_REVIEW"
          icon={Search}
          isActive={statusFilter === "IN_REVIEW"}
          onClick={() => handleStatusFilterChange("IN_REVIEW")}
        />
        <StatCard
          label="Next Round"
          value={stats.NEXT_ROUND}
          status="NEXT_ROUND"
          icon={Award}
          isActive={statusFilter === "NEXT_ROUND"}
          onClick={() => handleStatusFilterChange("NEXT_ROUND")}
        />
        <StatCard
          label="Selected"
          value={stats.SELECTED}
          status="SELECTED"
          icon={CheckCircle2}
          isActive={statusFilter === "SELECTED"}
          onClick={() => handleStatusFilterChange("SELECTED")}
        />
        <StatCard
          label="Rejected"
          value={stats.REJECTED}
          status="REJECTED"
          icon={XCircle}
          isActive={statusFilter === "REJECTED"}
          onClick={() => handleStatusFilterChange("REJECTED")}
        />
      </div>

      {/* 2. Filter & Controls Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          padding: "16px 20px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: 240, maxWidth: 380 }}>
          <Input
            id="referrals-search-input"
            icon={Search}
            placeholder="Search candidate, email, or role..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflowX: "auto",
            maxWidth: "100%",
            paddingBottom: 4,
          }}
        >
          <button
            type="button"
            onClick={() => handleStatusFilterChange("ALL")}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: statusFilter === "ALL" ? "var(--primary-600)" : "var(--surface-2)",
              color: statusFilter === "ALL" ? "#fff" : "var(--text-muted)",
              transition: "all var(--duration-fast) var(--ease)",
            }}
          >
            All
          </button>
          {STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => handleStatusFilterChange(st)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: statusFilter === st ? "var(--primary-600)" : "var(--surface-2)",
                color: statusFilter === st ? "#fff" : "var(--text-muted)",
                transition: "all var(--duration-fast) var(--ease)",
              }}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Sort & View Mode Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Select
            aria-label="Sort referrals"
            value={sortBy}
            onChange={handleSortChange}
            style={{ width: 160 }}
            options={[
              { value: "newest", label: "Newest First" },
              { value: "ats", label: "Highest ATS Match" },
            ]}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--surface-2)",
              padding: 3,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              aria-label="Table view"
              onClick={() => setViewMode("table")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: viewMode === "table" ? "var(--surface)" : "transparent",
                color: viewMode === "table" ? "var(--text)" : "var(--text-muted)",
                boxShadow: viewMode === "table" ? "var(--shadow-xs)" : "none",
              }}
            >
              <ListIcon size={16} />
            </button>
            <button
              type="button"
              aria-label="Kanban board view"
              onClick={() => setViewMode("kanban")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: viewMode === "kanban" ? "var(--surface)" : "transparent",
                color: viewMode === "kanban" ? "var(--text)" : "var(--text-muted)",
                boxShadow: viewMode === "kanban" ? "var(--shadow-xs)" : "none",
              }}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={RotateCw}
            aria-label="Refresh referrals list"
            title="Refresh referrals list"
            onClick={handleRefreshAll}
          />
        </div>
      </div>

      {/* 3. Main Referrals Content Area */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={60} />
        </div>
      ) : referrals.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No referrals found"
          description={
            search || statusFilter !== "ALL"
              ? "No candidate referrals match your active filters. Try adjusting your search query or status filter."
              : isRecruiter
              ? "No candidates have been referred yet across active job listings."
              : "You haven't referred any candidates yet. Browse open jobs to refer qualified candidates!"
          }
          actionLabel={search || statusFilter !== "ALL" ? "Clear Filters" : undefined}
          onAction={() => {
            setSearch("");
            setStatusFilter("ALL");
            setPage(0);
          }}
        />
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    backgroundColor: "var(--surface-2)",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)",
                  }}
                >
                  <th style={{ padding: "14px 20px" }}>Candidate</th>
                  <th style={{ padding: "14px 16px" }}>Position</th>
                  <th style={{ padding: "14px 16px" }}>ATS Match</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  {isRecruiter && <th style={{ padding: "14px 16px" }}>Referred By</th>}
                  <th style={{ padding: "14px 16px" }}>Submitted</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => {
                  const createdDate = ref.createdTime
                    ? new Date(ref.createdTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={ref.id}
                      onClick={() => openDrawer(ref)}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        transition: "background-color var(--duration-fast) var(--ease)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--surface-2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {/* Candidate Name & Contact */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar name={ref.candidate?.name || "Candidate"} size="md" />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                              {ref.candidate?.name || "Unknown Candidate"}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              {ref.candidate?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Position Applied */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Briefcase size={14} style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                            {ref.job?.title || "Position"}
                          </span>
                        </div>
                      </td>

                      {/* ATS Score */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <ScoreRing score={ref.atsScore} size={36} strokeWidth={4} />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color:
                                (ref.atsScore || 0) >= 80
                                  ? "#10B981"
                                  : (ref.atsScore || 0) >= 50
                                  ? "#F59E0B"
                                  : "#EF4444",
                            }}
                          >
                            {ref.atsLabel || `${ref.atsScore ?? 0}%`}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <Badge status={ref.status} />
                      </td>

                      {/* Referred By (for Recruiter) */}
                      {isRecruiter && (
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                            {ref.referredBy?.name || "Staff"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                            {ref.referredBy?.email}
                          </div>
                        </td>
                      )}

                      {/* Date */}
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                        {createdDate}
                      </td>

                      {/* Actions */}
                      <td
                        style={{ padding: "14px 20px", textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          {ref.hasResume && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Download}
                              aria-label="Download candidate resume"
                              title="Download resume"
                              onClick={() => handleDownloadResume(ref)}
                            />
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openDrawer(ref)}
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 20px",
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              <span>
                Showing page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total)
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ChevronLeft}
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ChevronRight}
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
          {STATUSES.map((colStatus) => {
            const colReferrals = referrals.filter((r) => r.status === colStatus);

            return (
              <div
                key={colStatus}
                style={{
                  backgroundColor: "var(--surface-2)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge status={colStatus} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      backgroundColor: "var(--surface-2)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {colReferrals.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div
                  style={{
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    minHeight: 180,
                  }}
                >
                  {colReferrals.length === 0 ? (
                    <div
                      style={{
                        padding: "24px 12px",
                        textAlign: "center",
                        fontSize: 12,
                        color: "var(--text-faint)",
                        border: "1px dashed var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      No candidates in this stage
                    </div>
                  ) : (
                    colReferrals.map((ref) => (
                      <div
                        key={ref.id}
                        onClick={() => openDrawer(ref)}
                        style={{
                          backgroundColor: "var(--surface)",
                          borderRadius: "var(--radius-md)",
                          padding: 14,
                          border: "1px solid var(--border)",
                          boxShadow: "var(--shadow-xs)",
                          cursor: "pointer",
                          transition: "all var(--duration-fast) var(--ease)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar name={ref.candidate?.name || "Candidate"} size="sm" />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                                {ref.candidate?.name}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {ref.job?.title}
                              </div>
                            </div>
                          </div>
                          <ScoreRing score={ref.atsScore} size={32} strokeWidth={3} />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: 11,
                            color: "var(--text-faint)",
                            paddingTop: 8,
                            borderTop: "1px solid var(--border-subtle)",
                          }}
                        >
                          <span>{ref.candidate?.email}</span>
                          {ref.hasResume && (
                            <span style={{ color: "#10B981", fontWeight: 600 }}>Resume ✓</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Referral Detail Drawer (560px) */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={selectedReferral?.candidate?.name || "Candidate Details"}
        subtitle={`Application for ${selectedReferral?.job?.title || "Position"}`}
        width={560}
      >
        {selectedReferral && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Status & Quick Transition */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                backgroundColor: "var(--surface-2)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                  Current Application Status
                </div>
                <Badge status={selectedReferral.status} />
              </div>

              {isRecruiter && (
                <div style={{ width: 180 }}>
                  <Select
                    aria-label="Change candidate status"
                    value={selectedReferral.status}
                    disabled={statusUpdating}
                    onChange={(e) => handleUpdateStatus(selectedReferral.id, e.target.value)}
                    options={STATUSES.map((st) => ({
                      value: st,
                      label: st.replace(/_/g, " "),
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Candidate Information Card */}
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                padding: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  Candidate Information
                </h4>
                {isRecruiter && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Mail}
                    onClick={() => setIsEmailModalOpen(true)}
                  >
                    Email Candidate
                  </Button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <User size={16} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                    {selectedReferral.candidate?.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Mail size={16} style={{ color: "var(--text-muted)" }} />
                  <a
                    href={`mailto:${selectedReferral.candidate?.email}`}
                    style={{ fontSize: 13, color: "var(--primary-600)" }}
                  >
                    {selectedReferral.candidate?.email}
                  </a>
                </div>
                {selectedReferral.candidate?.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Phone size={16} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 13, color: "var(--text)" }}>
                      {selectedReferral.candidate?.phone}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Calendar size={16} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Referred on {new Date(selectedReferral.createdTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Referrer Information (Visible only for recruiter) */}
            {isRecruiter && selectedReferral.referredBy && (
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  padding: 16,
                }}
              >
                <h4 style={{ margin: "0 0 10px 0", fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
                  Referred by Staff Member
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={selectedReferral.referredBy.name} size="sm" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                      {selectedReferral.referredBy.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {selectedReferral.referredBy.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ATS Scorecard */}
            <AtsScorecard
              atsScore={selectedReferral.atsScore}
              matchedSkills={selectedReferral.matchedSkills}
              missingSkills={selectedReferral.missingSkills}
              atsLabel={selectedReferral.atsLabel}
            />

            {/* Resume Documents Action */}
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={18} style={{ color: "var(--primary-600)" }} />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    Resume Attachment
                  </h4>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>PDF / DOCX</span>
              </div>

              {selectedReferral.hasResume ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    variant="primary"
                    icon={ExternalLink}
                    loading={previewingResume}
                    onClick={() => handlePreviewResume(selectedReferral)}
                  >
                    Preview Resume
                  </Button>
                  <Button
                    variant="secondary"
                    icon={Download}
                    loading={downloadingResume}
                    onClick={() => handleDownloadResume(selectedReferral)}
                  >
                    Download Resume
                  </Button>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-faint)" }}>
                  No resume file attached to this referral.
                </p>
              )}
            </div>

            {/* Recruiter Candidate Email Outreach History */}
            {isRecruiter && (
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={18} style={{ color: "var(--brand-600)" }} />
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                      Outreach History ({emailHistory.length})
                    </h4>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    onClick={() => setIsEmailModalOpen(true)}
                  >
                    Compose Email
                  </Button>
                </div>

                {loadingEmails ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                  </div>
                ) : emailHistory.length === 0 ? (
                  <div
                    style={{
                      padding: "24px 16px",
                      textAlign: "center",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--surface-2)",
                      border: "1px dashed var(--border)",
                    }}
                  >
                    <Mail size={24} style={{ color: "var(--text-faint)", margin: "0 auto 8px" }} />
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                      No outreach emails sent to this candidate yet.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {emailHistory.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: 14,
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              data-testid="email-type-badge"
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "var(--radius-full)",
                                backgroundColor: "var(--surface-3)",
                                color: "var(--text)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {item.type.replace(/_/g, " ")}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "var(--radius-full)",
                                backgroundColor: item.status === "SENT" ? "var(--status-selected-subtle)" : "var(--status-rejected-subtle)",
                                color: item.status === "SENT" ? "var(--status-selected-solid)" : "var(--status-rejected-solid)",
                                border: `1px solid ${item.status === "SENT" ? "var(--status-selected-border)" : "var(--status-rejected-border)"}`,
                              }}
                            >
                              {item.status}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                            {item.sentAt ? new Date(item.sentAt).toLocaleString() : ""}
                          </span>
                        </div>

                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                          {item.subject}
                        </div>

                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          Sent by {item.sentBy?.name || "Recruiter"} &lt;{item.sentBy?.email}&gt; to {item.toEmail}
                        </div>

                        {item.errorMessage && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--status-rejected-solid)",
                              backgroundColor: "var(--status-rejected-subtle)",
                              padding: "6px 10px",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--status-rejected-border)",
                            }}
                          >
                            Error: {item.errorMessage}
                          </div>
                        )}

                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text)",
                            backgroundColor: "var(--surface)",
                            padding: "8px 12px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border)",
                            whiteSpace: "pre-wrap",
                            maxHeight: 120,
                            overflowY: "auto",
                          }}
                        >
                          {item.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 5. Recruiter Email Outreach Modal */}
      {isRecruiter && isEmailModalOpen && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          referral={selectedReferral}
          onEmailSent={handleEmailSent}
        />
      )}
    </div>
  );
}