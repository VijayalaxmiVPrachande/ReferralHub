import { useState } from "react";
import { Sparkles, MapPin, Briefcase } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { apiRequest, ApiError } from "../utils/api";

const QUICK_SKILLS = [
  "Java", "Spring Boot", "React", "Node.js", "Python",
  "AWS", "Docker", "SQL", "TypeScript", "Kubernetes", "Microservices"
];

const JOB_TEMPLATES = {
  java: "Required Skills: Java, Spring Boot, Hibernate, REST APIs, Microservices, SQL, Git, JUnit.",
  frontend: "Required Skills: React, JavaScript, TypeScript, HTML, CSS, REST APIs, Git.",
  react: "Required Skills: React, JavaScript, TypeScript, HTML, CSS, REST APIs, Git.",
  backend: "Required Skills: Node.js, Express, MongoDB, REST APIs, Docker, SQL, Git.",
  python: "Required Skills: Python, Django, REST APIs, PostgreSQL, Docker, Git.",
  devops: "Required Skills: AWS, Docker, Kubernetes, Jenkins, CI/CD, Terraform, Linux.",
};

export default function AddJobModal({ onClose, showToast, onSaved }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const suggestedTemplate = (() => {
    const t = title.toLowerCase();
    for (const [key, template] of Object.entries(JOB_TEMPLATES)) {
      if (t.includes(key)) return template;
    }
    return null;
  })();

  const handleAddSkill = (skill) => {
    if (!description.includes(skill)) {
      setDescription((prev) => {
        if (!prev.trim()) return `Required Skills: ${skill}`;
        if (!prev.includes("Required Skills:")) return `${prev.trim()}\n\nRequired Skills: ${skill}`;
        return `${prev.trim()}, ${skill}`;
      });
    }
  };

  const handleApplyTemplate = () => {
    if (suggestedTemplate) {
      setDescription(suggestedTemplate);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFieldErrors({});

    if (!title.trim()) {
      setFieldErrors({ title: "Job title is required" });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/jobs", {
        method: "POST",
        body: {
          title: title.trim(),
          location: location.trim() || undefined,
          description: description.trim() || undefined,
        },
      });

      if (showToast) showToast("Job opening posted successfully");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(err.fieldErrors);
      }
      if (showToast) showToast(err.message || "Failed to create job", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Create Job Opening"
      description="Post a new position for employees to refer trusted colleagues."
      size="lg"
      footer={
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", width: "100%" }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            id="submit-job-btn"
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            Post Job
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input
          id="job-title"
          label="Job Title"
          placeholder="e.g. Senior Backend Engineer"
          icon={Briefcase}
          required
          autoFocus
          maxLength={150}
          hint={`${title.length}/150`}
          value={title}
          error={fieldErrors.title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          id="job-location"
          label="Location"
          placeholder="e.g. Bengaluru, India (Hybrid) or Remote"
          icon={MapPin}
          maxLength={150}
          hint={`${location.length}/150`}
          value={location}
          error={fieldErrors.location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {suggestedTemplate && !description && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={handleApplyTemplate}
              style={{
                background: "var(--brand-50)",
                color: "var(--brand-700)",
                border: "1px solid var(--brand-200)",
                borderRadius: "var(--radius-full)",
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all var(--duration-hover) var(--ease)",
              }}
            >
              <Sparkles size={13} color="var(--brand-600)" />
              <span>Auto-fill recommended skills template</span>
            </button>
          </div>
        )}

        <Textarea
          id="job-description"
          label="Job Description & Requirements"
          placeholder="Detailed role responsibilities and required candidate skills..."
          rows={5}
          maxLength={5000}
          value={description}
          error={fieldErrors.description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Quick Skill Tags */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
            Quick-add required skills:
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK_SKILLS.map((skill) => {
              const isAdded = description.includes(skill);
              return (
                <Chip
                  key={skill}
                  size="sm"
                  variant={isAdded ? "brand" : "neutral"}
                  onClick={() => handleAddSkill(skill)}
                  style={{ cursor: "pointer", opacity: isAdded ? 0.7 : 1 }}
                >
                  {isAdded ? `✓ ${skill}` : `+ ${skill}`}
                </Chip>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}