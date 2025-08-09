import React, { useState } from "react";
import RSVPForm from "./RSVPForm";
import GuestBook from "./GuestBook";
import StoryItem from "./StoryItem";
import { useLanguage } from "../utils/LanguageContext";
import InViewTransition from "../utils/InViewTransition";

// Style for animation
const modalStyle = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .modal.fade.show {
    animation: fadeIn 0.15s ease-in-out;
  }
  
  .modal-dialog {
    animation: slideIn 0.2s ease-out;
  }
`;

const RSVPAndGuestBook: React.FC = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Use value from localStorage for consistency with App.tsx
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  // Detect mode changes from global state
  React.useEffect(() => {
    // Check body class for synchronization with App.tsx
    const checkDarkMode = () => {
      const isDark = document.body.classList.contains("dark-mode");
      setIsDarkMode(isDark);
    };

    // Observer to detect class changes on body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          checkDarkMode();
        }
      });
    });

    // Start observing
    observer.observe(document.body, { attributes: true });

    // Initial check
    checkDarkMode();

    // Listen for toggle dark mode event from FloatingMenu
    const handleToggleDarkMode = (e: CustomEvent) => {
      setIsDarkMode(e.detail);
    };

    window.addEventListener(
      "toggleDarkMode",
      handleToggleDarkMode as EventListener,
    );

    return () => {
      observer.disconnect();
      window.removeEventListener(
        "toggleDarkMode",
        handleToggleDarkMode as EventListener,
      );
    };
  }, []);

  // Handler for external links
  const handleExternalLink = (
    e: React.MouseEvent<HTMLAnchorElement>,
    url: string,
  ) => {
    e.preventDefault();
    setPendingUrl(url);
    setShowModal(true);
  };

  // Confirmation for opening external links
  const confirmNavigation = () => {
    window.open(pendingUrl, "_blank", "noopener,noreferrer");
    setShowModal(false);
  };
  // Apply style
  React.useEffect(() => {
    // Check if style already exists
    const existingStyle = document.getElementById("modal-animation-style");
    if (!existingStyle && showModal) {
      const styleEl = document.createElement("style");
      styleEl.id = "modal-animation-style";
      styleEl.innerHTML = modalStyle;
      document.head.appendChild(styleEl);

      // Cleanup style when component unmounts
      return () => {
        const styleToRemove = document.getElementById("modal-animation-style");
        if (styleToRemove) {
          styleToRemove.remove();
        }
      };
    }
  }, [showModal]);

  return (
    <div id="rsvp-guestbook">
      <StoryItem>
        <h1>
          <InViewTransition animationType="slide-down">
            {`${t("rsvp_title")} & ${t("guestbook_title")}`}
          </InViewTransition>
        </h1>
      </StoryItem>
      <StoryItem delay="0.2s">
        <div className="social-community-container text-center mb-3">
          <p className="mb-2" style={{ fontSize: "0.95rem" }}>
            <InViewTransition animationType="fade">
              {t("stay_connected")}
            </InViewTransition>
          </p>
          <div className="d-flex justify-content-center gap-2 gap-md-3">
            <a
              href="https://t.me/formbottest"
              onClick={(e) => handleExternalLink(e, "https://t.me/formbottest")}
              className="btn"
              style={{
                background: "transparent",
                color: "#9CAF88",
                borderRadius: "30px",
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "0.75rem",
                border: "0.5px solid #9CAF88",
                lineHeight: "1",
                transition: "all 0.3s ease",
              }}
            >
              <i className="bi bi-telegram" style={{ fontSize: "0.9rem" }}></i>
              Telegram
            </a>
            <a
              href="https://discord.gg/vHB9wP3pjF"
              onClick={(e) =>
                handleExternalLink(e, "https://discord.gg/vHB9wP3pjF")
              }
              className="btn"
              style={{
                background: "transparent",
                color: "#9CAF88",
                borderRadius: "30px",
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "0.75rem",
                border: "0.5px solid #9CAF88",
                lineHeight: "1",
                transition: "all 0.3s ease",
              }}
            >
              <i className="bi bi-discord" style={{ fontSize: "0.9rem" }}></i>
              Discord
            </a>
          </div>
        </div>
      </StoryItem>
      <div className="row g-4 mt-3 align-items-stretch">
        <div className="col-12 col-lg-6 d-flex flex-column">
          <RSVPForm />
        </div>
        {/* SVG divider animation */}
        <div className="d-none d-lg-flex col-lg-1 justify-content-center align-items-stretch p-0">
          <svg
            width="2"
            height="100%"
            style={{ minHeight: "320px", height: "100%" }}
            viewBox="0 0 2 320"
          >
            <rect x="0" y="0" width="2" height="320" rx="1" fill="#e0e0e0">
              <animate
                attributeName="height"
                from="0"
                to="320"
                dur="1.1s"
                fill="freeze"
              />
            </rect>
          </svg>
        </div>
        <div
          className="d-block d-lg-none col-12"
          style={{ textAlign: "center" }}
        >
          <svg
            width="120"
            height="12"
            viewBox="0 0 120 12"
            style={{ overflow: "visible", margin: "32px 0" }}
          >
            <rect x="0" y="5" width="120" height="2" rx="1" fill="#e0e0e0">
              <animate
                attributeName="width"
                from="0"
                to="120"
                dur="1.1s"
                fill="freeze"
              />
            </rect>
          </svg>
        </div>
        <div className="col-12 col-lg-5 d-flex flex-column">
          <GuestBook />
        </div>
      </div>

      {/* Modal Dialog for external link confirmation */}
      {showModal && (
        <div
          className={`modal fade show`}
          tabIndex={-1}
          role="dialog"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
            overflow: "hidden",
            animation: "fadeIn 0.15s ease-in-out",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{
              maxWidth: "250px",
              margin: "1.75rem auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100% - 3.5rem)",
              animation: "slideIn 0.2s ease-out",
            }}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333" : "#fff",
                color: isDarkMode ? "#fff" : "#212529",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                border: isDarkMode
                  ? "1px solid #444"
                  : "1px solid rgba(0,0,0,0.1)",
                animation: "fadeIn 0.2s ease-in-out",
              }}
            >
              <div
                className="modal-header py-2"
                style={{
                  borderBottom: isDarkMode
                    ? "1px solid #444"
                    : "1px solid rgba(0,0,0,0.1)",
                  backgroundColor: "transparent",
                }}
              >
                <h6
                  className="modal-title"
                  style={{
                    fontSize: "0.85rem",
                    color: isDarkMode ? "#fff" : "inherit",
                  }}
                >
                  {t("external_link")}
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  style={{
                    fontSize: "0.75rem",
                    filter: isDarkMode ? "invert(1)" : "none",
                  }}
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div
                className="modal-body py-2"
                style={{
                  backgroundColor: "transparent",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    margin: "0",
                    color: isDarkMode ? "#ddd" : "inherit",
                  }}
                >
                  {t("external_link_warning")}
                </p>
              </div>
              <div
                className="modal-footer py-1"
                style={{
                  borderTop: isDarkMode
                    ? "1px solid #444"
                    : "1px solid rgba(0,0,0,0.1)",
                  backgroundColor: "transparent",
                }}
              >
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    color: isDarkMode ? "#ddd" : "#6c757d",
                    borderColor: isDarkMode ? "#555" : "#6c757d",
                    backgroundColor: "transparent",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    backgroundColor: "#9CAF88",
                    borderColor: "#9CAF88",
                    color: "white",
                  }}
                  onClick={confirmNavigation}
                >
                  {t("continue")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RSVPAndGuestBook;
