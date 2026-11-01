import { useState, useEffect, useCallback } from "react";
import { Mail, Send, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Switch } from "./ui/Switch";
import { apiRequest } from "../utils/api";
import { useToast } from "../context/ToastContext";

const TEMPLATES = [
  { type: "NEXT_ROUND", label: "Next Round", targetStatus: "NEXT_ROUND" },
  { type: "SELECTED", label: "Job Offer", targetStatus: "SELECTED" },
  { type: "REJECTED", label: "Rejection", targetStatus: "REJECTED" },
  { type: "CUSTOM", label: "Custom Note", targetStatus: null },
];

export default function EmailModal({
  isOpen,
  onClose,
  referral,
  onEmailSent,
}) {
  const { showToast } = useToast();

  const [selectedType, setSelectedType] = useState("NEXT_ROUND");
  const [toEmail, setToEmail] = useState(referral?.candidate?.email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ccMe, setCcMe] = useState(true);
  const [notifyReferrer, setNotifyReferrer] = useState(Boolean(referral?.referredBy));
  const [updateStatus, setUpdateStatus] = useState(true);

  const [loadingDraft, setLoadingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");

  const candidateName = referral?.candidate?.name || "Candidate";
  const candidateEmail = referral?.candidate?.email || "";
  const referrer = referral?.referredBy;

  // Fetch draft when modal opens or template changes
  const loadDraft = useCallback(
    async (type) => {
      if (!referral?.id) return;
      setLoadingDraft(true);
      setErrorBanner("");
      try {
        const draft = await apiRequest(`/referrals/${referral.id}/email-draft?type=${type}`);
        if (draft) {
          setToEmail(draft.to || candidateEmail);
          setSubject(draft.subject || "");
          setBody(draft.body || "");
        }
      } catch (err) {
        showToast(err.message || "Failed to load draft template", "error");
      } finally {
        setLoadingDraft(false);
      }
    },
    [referral, candidateEmail, showToast]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDraft("NEXT_ROUND");
  }, [loadDraft]);

  const handleTemplateChange = (type) => {
    setSelectedType(type);
    if (type === "CUSTOM") {
      setUpdateStatus(false);
    } else {
      setUpdateStatus(true);
    }
    loadDraft(type);
  };

  const handleSubjectChange = (e) => {
    // Prevent line breaks in subject
    const val = e.target.value.replace(/[\r\n]/g, "");
    setSubject(val);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!subject.trim()) {
      setErrorBanner("Subject line is required");
      return;
    }
    if (!body.trim()) {
      setErrorBanner("Email body is required");
      return;
    }

    setSending(true);
    setErrorBanner("");

    try {
      const payload = {
        type: selectedType,
        subject: subject.trim(),
        body: body.trim(),
        ccMe,
        notifyReferrer: Boolean(referrer && notifyReferrer),
        updateStatus: selectedType !== "CUSTOM" && updateStatus,
      };

      const result = await apiRequest(`/referrals/${referral.id}/emails`, {
        method: "POST",
        body: payload,
      });

      showToast(`Email successfully sent to ${toEmail}`);
      if (onEmailSent) {
        onEmailSent(result);
      }
      onClose();
    } catch (err) {
      const msg = err.message || "Failed to send candidate email";
      setErrorBanner(msg);
      showToast(msg, "error");
    } finally {
      setSending(false);
    }
  };

  const currentTemplate = TEMPLATES.find((t) => t.type === selectedType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Email Candidate: ${candidateName}`}
      subtitle={`Outreach regarding application for ${referral?.job?.title || "the role"}`}
      maxWidth={620}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, width: "100%" }}>
          <Button variant="secondary" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Send}
            loading={sending}
            disabled={loadingDraft || sending || !subject.trim() || !body.trim()}
            onClick={handleSend}
          >
            Send Email
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Error Alert if any */}
        {errorBanner && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--status-rejected-subtle)",
              color: "var(--status-rejected-solid)",
              border: "1px solid var(--status-rejected-border)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontSize: 13,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Delivery Error: </strong>
              {errorBanner}
            </div>
          </div>
        )}

        {/* Template Selector Pills */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 8 }}>
            Outreach Template
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TEMPLATES.map((tmpl) => {
              const active = selectedType === tmpl.type;
              return (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => handleTemplateChange(tmpl.type)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "var(--radius-full)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all var(--duration-hover) var(--ease)",
                    border: active ? "1px solid var(--brand-600)" : "1px solid var(--border)",
                    backgroundColor: active ? "var(--brand-600)" : "var(--surface)",
                    color: active ? "#FFFFFF" : "var(--text)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {active && <CheckCircle2 size={14} />}
                  {tmpl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tip for Next Round */}
        {selectedType === "NEXT_ROUND" && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--brand-50)",
              border: "1px solid var(--brand-100)",
              color: "var(--brand-900)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
            }}
          >
            <Sparkles size={16} style={{ color: "var(--brand-600)", flexShrink: 0 }} />
            <span>
              Fill in the bracketed placeholders like <strong>[Date and Time]</strong> and <strong>[Link/Location]</strong> before sending.
            </span>
          </div>
        )}

        {/* Recipient Field (Read-only) */}
        <div>
          <label
            htmlFor="email-to-input"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}
          >
            To Candidate
          </label>
          <div
            id="email-to-input"
            style={{
              padding: "9px 14px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Mail size={16} style={{ color: "var(--text-muted)" }} />
            <span>
              <strong>{candidateName}</strong> &lt;{toEmail || candidateEmail}&gt;
            </span>
          </div>
        </div>

        {/* Subject Input */}
        <Input
          id="email-subject-input"
          label="Subject"
          required
          maxLength={150}
          value={subject}
          onChange={handleSubjectChange}
          placeholder="e.g. Next Steps with ReferralHub"
          disabled={loadingDraft}
        />

        {/* Body Textarea */}
        <Textarea
          id="email-body-input"
          label="Message Body"
          required
          rows={8}
          maxLength={5000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Compose email message to candidate..."
          disabled={loadingDraft}
        />

        {/* Delivery Options & Switches */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Delivery & Status Options
          </div>

          <Switch
            id="switch-cc-me"
            checked={ccMe}
            onChange={setCcMe}
            label="CC my recruiter email"
            description="Receive a copy of this correspondence in your recruiter inbox"
          />

          {referrer && (
            <Switch
              id="switch-notify-referrer"
              checked={notifyReferrer}
              onChange={setNotifyReferrer}
              label={`Notify referrer (${referrer.name})`}
              description={`Sends a copy to the referring employee at ${referrer.email}`}
            />
          )}

          {currentTemplate?.targetStatus && (
            <Switch
              id="switch-update-status"
              checked={updateStatus}
              onChange={setUpdateStatus}
              label={`Update status to ${currentTemplate.label}`}
              description={`Automatically transition referral status to ${currentTemplate.targetStatus.replace(/_/g, " ")} on delivery`}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
