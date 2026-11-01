import { useState } from "react";
import Modal from "../components/Modal";
import { inputStyle, btnStyle } from "../utils/styles";
import { apiFetch, authHeaders } from "../utils/api";

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

const JOB_TEMPLATES = {
  "java": "Required Skills: Java, Spring Boot, Hibernate, REST APIs, Microservices, SQL, Git, JUnit.",
  "frontend": "Required Skills: React.js, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, Git.",
  "react": "Required Skills: React.js, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, Git.",
  "backend": "Required Skills: Node.js, Express, MongoDB, REST APIs, Docker, SQL/NoSQL.",
  "python": "Required Skills: Python, Django/Flask, REST APIs, PostgreSQL, Docker.",
  "devops": "Required Skills: AWS/Azure, Docker, Kubernetes, Jenkins, CI/CD, Terraform, Linux.",
  "data": "Required Skills: Python, Machine Learning, SQL, Pandas, TensorFlow."
};

export default function AddJobModal({ onClose, showToast, onSaved }) {
  const [form, setForm] = useState({ title: "", description: "", location: "" });
  const [loading, setLoading] = useState(false);
  const suggestedTemplate = (() => {
    const t = form.title.toLowerCase();
    for (const [key, template] of Object.entries(JOB_TEMPLATES)) {
      if (t.includes(key)) return template;
    }
    return null;
  })();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return showToast("Title is required", "error");
    setLoading(true);
    try {
      await apiFetch("/jobs/add", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      showToast("Job added successfully");
      onSaved();
      onClose();
    } catch (e) {
      showToast(e.message || "Failed to add job", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Job Opening" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div>
          <label style={labelStyle}>Job Title *</label>
          <input
            style={inputStyle}
            placeholder="e.g. Senior Frontend Engineer"
            value={form.title}
            onChange={set("title")}
          />
          {suggestedTemplate && !form.description && (
            <button
              onClick={() => setForm(f => ({ ...f, description: suggestedTemplate }))}
              style={{
                marginTop: 10, padding: "6px 12px", borderRadius: 20,
                background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#DBEAFE"; e.currentTarget.style.borderColor = "#93C5FD"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
            >
              Auto-fill recommended skills
            </button>
          )}
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input
            style={inputStyle}
            placeholder="e.g. Bangalore, India (Remote OK)"
            value={form.location}
            onChange={set("location")}
          />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 96, lineHeight: 1.6 }}
            placeholder="Describe the role, requirements, and responsibilities…"
            value={form.description}
            onChange={set("description")}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button
          style={btnStyle("secondary")}
          onClick={onClose}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#E2E8F0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
        >
          Cancel
        </button>
        <button
          style={{ ...btnStyle("primary"), minWidth: 100 }}
          onClick={save}
          disabled={loading}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.35)"; }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                display: "inline-block", width: 14, height: 14,
                border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                borderRadius: "50%", animation: "spin 0.7s linear infinite",
              }} />
              Saving…
            </span>
          ) : "Add Job"}
        </button>
      </div>
    </Modal>
  );
}