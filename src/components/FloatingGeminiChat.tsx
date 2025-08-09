import React, { useState, lazy, Suspense } from "react";
// Lazy load GeminiChat component
const GeminiChat = lazy(() => import("./GeminiChat"));

interface FloatingGeminiChatProps {
  darkMode: boolean;
}

const FloatingGeminiChat: React.FC<FloatingGeminiChatProps> = ({
  darkMode,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Gemini Icon Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 9999,
          background: darkMode ? "#232d2b" : "#fff",
          border: darkMode ? "2.5px solid #EEE" : "2.5px solid #9CAF88",
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: darkMode
            ? "0 2px 12px rgba(30,30,30,0.18)"
            : "0 2px 12px rgba(156,175,136,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "box-shadow 0.2s",
          animation: "floatGemini 2.5s ease-in-out infinite alternate",
        }}
        aria-label="Buka chat Gemini"
      >
        {/* Gemini Icon SVG */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#9CAF88" />
          <ellipse
            cx="16"
            cy="16"
            rx="10"
            ry="6"
            fill={darkMode ? "#232d2b" : "#fff"}
            fillOpacity="0.85"
          />
          <ellipse
            cx="16"
            cy="16"
            rx="6"
            ry="10"
            fill={darkMode ? "#232d2b" : "#fff"}
            fillOpacity="0.7"
          />
          <circle cx="16" cy="16" r="4.5" fill="#9CAF88" />
        </svg>
      </button>
      {/* Bubble Chat */}
      {open && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 90,
            zIndex: 10000,
            animation: "fadeInGemini 0.3s",
          }}
        >
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: -12,
                right: -12,
                background: darkMode ? "#232d2b" : "#fff",
                border: darkMode ? "1.5px solid #EEE" : "1.5px solid #9CAF88",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: darkMode
                  ? "0 1px 4px rgba(30,30,30,0.13)"
                  : "0 1px 4px rgba(156,175,136,0.13)",
                fontWeight: 700,
                color: "#9CAF88",
                fontSize: 18,
              }}
              aria-label="Tutup chat"
            >
              ×
            </button>
            <Suspense
              fallback={
                <div
                  style={{
                    width: 300,
                    height: 200,
                    background: darkMode ? "#232d2b" : "#fff",
                    borderRadius: 16,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: darkMode
                      ? "0 4px 24px rgba(30,30,30,0.18)"
                      : "0 4px 24px rgba(0,0,0,0.13)",
                    color: darkMode ? "#EEE" : "#333",
                  }}
                >
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              }
            >
              <GeminiChat darkMode={darkMode} />
            </Suspense>
          </div>
        </div>
      )}
      {/* Animations */}
      <style>{`
        @keyframes floatGemini {
          0% { transform: translateY(0); }
          100% { transform: translateY(-16px); }
        }
        @keyframes fadeInGemini {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default FloatingGeminiChat;
