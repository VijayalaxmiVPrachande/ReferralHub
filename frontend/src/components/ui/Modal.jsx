import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

export function Modal({
  isOpen,
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 540,
  triggerRef,
  footer,
}) {
  const modalRef = useRef(null);
  const show = open !== undefined ? open : (isOpen !== undefined ? isOpen : true);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Simple focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!show) return;

    // Focus first element or modal container
    const prevActiveElement = document.activeElement;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // Auto focus
    setTimeout(() => {
      if (modalRef.current) {
        const firstInput = modalRef.current.querySelector("input, textarea, select, button:not([aria-label='Close'])");
        if (firstInput) firstInput.focus();
        else modalRef.current.focus();
      }
    }, 50);

    const triggerElement = triggerRef?.current;
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (triggerElement && triggerElement.focus) {
        triggerElement.focus();
      } else if (prevActiveElement && prevActiveElement.focus) {
        prevActiveElement.focus();
      }
    };
  }, [show, handleKeyDown, triggerRef]);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(7, 12, 24, 0.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          animation: "fadeIn 150ms var(--ease)",
        }}
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          position: "relative",
          zIndex: 1001,
          width: "100%",
          maxWidth,
          maxHeight: "calc(100vh - 40px)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--surface)",
          color: "var(--text)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          animation: "scaleUp 200ms var(--ease)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <h2 id="modal-title" style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
              transition: "background var(--duration-hover) var(--ease)",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              backgroundColor: "var(--surface-2)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
