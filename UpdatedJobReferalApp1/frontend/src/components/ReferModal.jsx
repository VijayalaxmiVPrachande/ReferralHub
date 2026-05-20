import { useState } from "react";
import Modal from "../components/Modal";
import { inputStyle, btnStyle } from "../utils/styles";
import { API, getToken } from "../utils/api";

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

export default function ReferModal({ job, onClose, showToast, onSaved }) {
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
  });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setResume(file);
  };

  const submit = async () => {
    if (!form.candidateName.trim() || !form.candidateEmail.trim())
      return showToast("Name and email are required", "error");
    if (!resume)
      return showToast("Please attach the candidate's resume", "error");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append(
        "data",
        new Blob(
          [JSON.stringify({
            jobId: job.id,
            candidate: {
              name: form.candidateName,
              email: form.candidateEmail,
              phone: form.candidatePhone,
            },
          })],
          { type: "application/json" }
        )
      );
      fd.append("resume", resume);

      const res = await fetch(`${API}/referrals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }

      showToast("Referral submitted!");
      onSaved();
    } catch (e) {
      showToast(e.message || "Failed to submit referral", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Refer for: ${job.title}`} onClose={onClose}>
      {/* Job context pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "linear-gradient(135deg, #EEF2FF, #FAF5FF)",
        border: "1px solid #C7D2FE",
        borderRadius: 10, padding: "10px 14px",
        marginBottom: 20,
      }}>

        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4338CA" }}>{job.title}</span>
          <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 8 }}>
            {job.location || "Location not specified"}
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div>
          <label style={labelStyle}>Candidate Name *</label>
          <input style={inputStyle} placeholder="Full name" value={form.candidateName} onChange={set("candidateName")} />
        </div>
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input style={inputStyle} placeholder="candidate@email.com" type="email" value={form.candidateEmail} onChange={set("candidateEmail")} />
        </div>
        <div>
          <label style={labelStyle}>Phone Number <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional)</span></label>
          <input style={inputStyle} placeholder="+91 98765 43210" value={form.candidatePhone} onChange={set("candidatePhone")} />
        </div>
      </div>

      {/* File upload */}
      <div>
        <label style={labelStyle}>Resume *</label>
        <div
          style={{
            padding: "20px 16px",
            border: dragOver
              ? "2px dashed #2563EB"
              : resume
              ? "2px solid #10B981"
              : "2px dashed #CBD5E1",
            borderRadius: 12,
            textAlign: "center",
            background: dragOver
              ? "#EFF6FF"
              : resume
              ? "#F0FDF4"
              : "#FAFBFF",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <label style={{ cursor: "pointer", display: "block" }}>

            <span style={{
              fontSize: 14, fontWeight: 700,
              color: resume ? "#065F46" : "#374151",
              display: "block",
            }}>
              {resume ? resume.name : "Click or drag & drop resume"}
            </span>
            <span style={{ fontSize: 12, color: "#94A3B8", marginTop: 4, display: "block" }}>
              {resume ? `${(resume.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOC, or DOCX · Max 5 MB"}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files[0] ?? null)}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button
          style={btnStyle("secondary")}
          onClick={onClose}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#E2E8F0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
        >
          Cancel
        </button>
        <button
          style={{ ...btnStyle("primary"), minWidth: 140 }}
          onClick={submit}
          disabled={loading}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.35)"; }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{
                display: "inline-block", width: 14, height: 14,
                border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                borderRadius: "50%", animation: "spin 0.7s linear infinite",
              }} />
              Submitting…
            </span>
          ) : "Submit Referral"}
        </button>
      </div>
    </Modal>
  );
}