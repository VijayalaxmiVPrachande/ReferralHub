import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import JobsTab from "./JobsTab";
import ReferralsTab from "./ReferralsTab";
import { apiRequest } from "../utils/api";

export default function Dashboard() {
  const { isRecruiter } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showRefer, setShowRefer] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refPage, setRefPage] = useState(0);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await apiRequest("/jobs");
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load jobs", "error");
    } finally {
      setLoadingJobs(false);
    }
  }, [showToast]);

  const loadReferrals = useCallback(
    async (p = 0) => {
      setLoadingRefs(true);
      try {
        const data = await apiRequest(`/referrals?page=${p}&size=10`);
        setReferrals(Array.isArray(data) ? data : data?.content ?? []);
      } catch {
        showToast("Failed to load referrals", "error");
      } finally {
        setLoadingRefs(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJobs();
  }, [loadJobs]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "referrals" && referrals.length === 0) {
      loadReferrals(refPage);
    }
  };

  const handleRefer = (job) => {
    setSelectedJob(job);
    setShowRefer(true);
  };

  const handleRefPage = (p) => {
    setRefPage(p);
    loadReferrals(p);
  };

  return (
    <AppShell
      activeTab={tab}
      onTabChange={handleTabChange}
      pageTitle={tab === "jobs" ? "Job Openings" : isRecruiter ? "All Candidate Referrals" : "My Referrals"}
      pageSubtitle={
        tab === "jobs"
          ? "Explore active openings and submit qualified candidate referrals."
          : "Review referral application statuses, ATS match scorecards, and resumes."
      }
      pageAction={
        tab === "jobs" && isRecruiter ? (
          <Button icon={Plus} onClick={() => setShowAddJob(true)}>
            Post Job
          </Button>
        ) : null
      }
    >
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
          userRole={isRecruiter ? "RECRUITER" : "EMPLOYEE"}
        />
      )}
    </AppShell>
  );
}