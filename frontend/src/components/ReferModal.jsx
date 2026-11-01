import { useState, useRef } from "react";
import { UploadCloud, FileText, X, Briefcase, Mail, User, Phone } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { apiRequest } from "../utils/api";

export default function ReferModal({
  job,
  jobs = [],
  isOpen = true,
  onClose,
  showToast,
  onSaved,
}) {
  const [selectedJobId, setSelectedJobId] = useState(job?.id || (jobs[0]?.id ? String(jobs[0].id) : ""));
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
  });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);


  const handleFile = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      showToast("Only PDF and DOCX files are allowed", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must not exceed 5 MB", "error");
      return;
    }
    setResume(file);
    setErrors((prev) => ({ ...prev, resume: null }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const newErrors = {};
    const targetJobId = job?.id || selectedJobId;
    if (!targetJobId) {
      newErrors.jobId = "Please select a job";
    }
    if (!form.candidateName.trim()) {
      newErrors.candidateName = "Candidate name is required";
    }
    if (!form.candidateEmail.trim()) {
      newErrors.candidateEmail = "Candidate email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.candidateEmail.trim())) {
      newErrors.candidateEmail = "Please enter a valid email address";
    }
    if (!resume) {
      newErrors.resume = "Resume file (.pdf or .docx) is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const targetJobId = Number(job?.id || selectedJobId);
      const fd = new FormData();
      const payload = {
        jobId: targetJobId,
        candidate: {
          name: form.candidateName.trim(),
          email: form.candidateEmail.trim(),
          phone: form.candidatePhone.trim() || undefined,
        },
      };

      fd.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      fd.append("resume", resume);

      await apiRequest("/referrals", {
        method: "POST",
        body: fd,
      });

      showToast("Candidate referred successfully! ATS analysis completed.");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showToast(err.message || "Failed to submit referral", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job ? `Refer for ${job.title}` : "Refer a Candidate"}
      subtitle="Submit candidate profile and resume for automated ATS screening."
      maxWidth={520}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, width: "100%" }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            loading={loading}
            id="submit-referral-btn"
          >
            Submit Referral
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Job selection or display */}
        {job ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary-100)",
                color: "var(--primary-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Briefcase size={18} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                {job.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {job.location || "Remote"}
              </div>
            </div>
          </div>
        ) : (
          <Select
            label="Target Job Position"
            required
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            error={errors.jobId}
            options={[
              { value: "", label: "Select job position..." },
              ...jobs.map((j) => ({ value: String(j.id), label: `${j.title} (${j.location || "Remote"})` })),
            ]}
          />
        )}

        {/* Candidate Info Fields */}
        <Input
          label="Candidate Name"
          required
          id="candidate-name"
          placeholder="e.g. Alexandra Vance"
          icon={User}
          value={form.candidateName}
          error={errors.candidateName}
          onChange={(e) => setForm((f) => ({ ...f, candidateName: e.target.value }))}
        />

        <Input
          label="Candidate Email"
          required
          type="email"
          id="candidate-email"
          placeholder="alexandra@example.com"
          icon={Mail}
          value={form.candidateEmail}
          error={errors.candidateEmail}
          onChange={(e) => setForm((f) => ({ ...f, candidateEmail: e.target.value }))}
        />

        <Input
          label="Phone Number"
          type="tel"
          id="candidate-phone"
          placeholder="+1 555-0199 (optional)"
          icon={Phone}
          value={form.candidatePhone}
          onChange={(e) => setForm((f) => ({ ...f, candidatePhone: e.target.value }))}
        />

        {/* Resume Dropzone */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 6,
            }}
          >
            Candidate Resume <span style={{ color: "var(--status-rejected-solid)" }}>*</span>
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "24px 16px",
              borderRadius: "var(--radius-lg)",
              border: dragOver
                ? "2px dashed var(--primary-600)"
                : resume
                ? "2px solid #10B981"
                : "2px dashed var(--border)",
              backgroundColor: dragOver
                ? "var(--primary-50)"
                : resume
                ? "rgba(16, 185, 129, 0.05)"
                : "var(--surface-2)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all var(--duration-fast) var(--ease)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="resume-file-input"
              accept=".pdf,.docx"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {resume ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      color: "#10B981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                      {resume.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {(resume.size / 1024 / 1024).toFixed(2)} MB · Ready for ATS parsing
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResume(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    color: "var(--text-muted)",
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary-600)",
                  }}
                >
                  <UploadCloud size={24} />
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    Click to upload
                  </span>{" "}
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>or drag & drop</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-faint)" }}>
                  PDF or DOCX documents up to 5 MB
                </div>
              </div>
            )}
          </div>
          {errors.resume && (
            <div style={{ fontSize: 12, color: "var(--status-rejected-solid)", marginTop: 6 }}>
              {errors.resume}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}