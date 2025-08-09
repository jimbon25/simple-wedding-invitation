import React from "react";

interface ToastNotificationProps {
  show: boolean;
  message: string;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  show,
  message,
}) => {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 40,
        transform: "translateX(-50%)",
        zIndex: 20000,
        background: "#556B2F",
        color: "#fff",
        padding: "10px 22px",
        borderRadius: 20,
        fontSize: "1rem",
        fontWeight: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
        animation: "fadeInToast 0.2s",
        pointerEvents: "none",
        minWidth: 0,
        maxWidth: "90vw",
        textAlign: "center",
      }}
      role="alert"
      aria-live="assertive"
    >
      {message}
      <style>{`
        @keyframes fadeInToast {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;
