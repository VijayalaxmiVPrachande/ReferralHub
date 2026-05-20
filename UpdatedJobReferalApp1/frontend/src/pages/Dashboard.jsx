import { useState, useCallback, useEffect } from "react";
import Header      from "../components/Header";
import Footer      from "../components/Footer";
import JobsTab     from "./JobsTab";
import ReferralsTab from "./ReferralsTab";
import { apiFetch, authHeaders } from "../utils/api";

export default function Dashboard({ user, showToast, onLogout }) {
  const [tab, setTab]             = useState("jobs");
  const [jobs, setJobs]           = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [showAddJob, setShowAddJob]   = useState(false);
  const [showRefer, setShowRefer]     = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refPage, setRefPage]         = useState(0);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await apiFetch("/jobs", { headers: authHeaders() });
      setJobs(data || []);
    } catch {
      showToast("Failed to load jobs", "error");
    } finally {
      setLoadingJobs(false);
    }
  }, [showToast]);

  const loadReferrals = useCallback(async (p = 0) => {
    setLoadingRefs(true);
    try {
      const data = await apiFetch(`/referrals?page=${p}&size=10`, { headers: authHeaders() });
      setReferrals(Array.isArray(data) ? data : (data?.content ?? []));
    } catch {
      showToast("Failed to load referrals", "error");
    } finally {
      setLoadingRefs(false);
    }
  }, [showToast]);

  useEffect(() => { loadJobs(); }, [loadJobs]);
  useEffect(() => {
    if (tab === "referrals") loadReferrals(refPage);
  }, [tab, refPage, loadReferrals]);

  const handleRefer = (job) => {
    setSelectedJob(job);
    setShowRefer(true);
  };

  const handleRefPage = (p) => {
    setRefPage(p);
    loadReferrals(p);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header tab={tab} setTab={setTab} user={user} onLogout={onLogout} />

      <main style={{
        flex: 1,
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
        padding: "2rem 24px",
        animation: "fadeIn 0.3s ease",
      }}>
        {tab === "jobs" && (
          <JobsTab
            jobs={jobs}
            loading={loadingJobs}
            onRefresh={loadJobs}
            showToast={showToast}
            showAddJob={showAddJob}
            setShowAddJob={setShowAddJob}
            onRefer={handleRefer}
            selectedJob={selectedJob}
            showRefer={showRefer}
            setShowRefer={setShowRefer}
            onJobAdded={loadJobs}
          />
        )}
        {tab === "referrals" && (
          <ReferralsTab
            referrals={referrals}
            loading={loadingRefs}
            page={refPage}
            setPage={handleRefPage}
            onRefresh={() => loadReferrals(refPage)}
            showToast={showToast}
            userRole={user?.role}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}