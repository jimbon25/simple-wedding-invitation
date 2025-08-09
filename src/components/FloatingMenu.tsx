import React, { useRef, useState } from "react";
// import { useNavigate } from 'react-router-dom';
import { useLanguage } from "../utils/LanguageContext";

interface FloatingMenuProps {
  darkMode: boolean;
  isInvitationOpened?: boolean;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({
  darkMode,
  isInvitationOpened,
}) => {
  // Auto-open menu then close after 2 seconds
  React.useEffect(() => {
    if (isInvitationOpened) {
      setOpen(true);
      setQuickActionsOpen(true);
      const timer = setTimeout(() => {
        setOpen(false);
        setQuickActionsOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInvitationOpened]);
  const { language, setLanguage } = useLanguage();
  const menuItems = [
    {
      label: language === "en" ? "Home" : "Beranda",
      sectionId: "section-home",
      icon: "bi-house-door-fill",
    },
    {
      label: "RSVP",
      sectionId: "section-rsvp-guestbook",
      icon: "bi-check-circle-fill",
    },
    {
      label: language === "en" ? "Gallery" : "Galeri",
      sectionId: "section-gallery",
      icon: "bi-image-fill",
    },
    {
      label: language === "en" ? "Story" : "Cerita",
      sectionId: "section-our-story",
      icon: "bi-book-fill",
    },
    {
      label: language === "en" ? "Gifts" : "Hadiah",
      sectionId: "section-gift-info",
      icon: "bi-gift-fill",
    },
    {
      label: language === "en" ? "Accommodation" : "Akomodasi",
      sectionId: "section-accommodation-info",
      icon: "bi-car-front-fill",
    },
  ];

  const [open, setOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [mini, setMini] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to section function (copied from App)
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Hitung offset navbar (fixed-top)
      const navbar = document.querySelector(".navbar.fixed-top") as HTMLElement;
      const offset = navbar ? navbar.offsetHeight : 0;
      const rect = el.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - offset - 4;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Drag logic (mouse)
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    document.body.style.userSelect = "none";
  };

  // Drag logic (touch/mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(true);
    const touch = e.touches[0];
    offset.current = {
      x: touch.clientX - pos.x,
      y: touch.clientY - pos.y,
    };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!dragging) return;
    const touch = e.touches[0];
    setPos({
      x: touch.clientX - offset.current.x,
      y: touch.clientY - offset.current.y,
    });
  };
  const onTouchEnd = () => {
    setDragging(false);
  };
  const onMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      setPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    },
    [dragging],
  );
  const onMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = "";
  };
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, onMouseMove]);

  // Find audio element on the page
  React.useEffect(() => {
    const audio = document.querySelector("audio");
    if (audio) {
      audioRef.current = audio;
      setIsPlaying(!audio.paused);

      // Add event listeners to keep track of audio state
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));

      return () => {
        audio.removeEventListener("play", () => setIsPlaying(true));
        audio.removeEventListener("pause", () => setIsPlaying(false));
      };
    }
  }, []);

  // Toggle audio playback
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current
          .play()
          .catch((e) => console.error("Error playing audio:", e));
      }
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "id" ? "en" : "id");
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    // Use custom event to change dark mode state in App
    const newDarkMode = !darkMode;
    localStorage.setItem("darkMode", newDarkMode ? "true" : "false");

    // Dispatch event to change dark mode without refreshing the page
    const event = new CustomEvent("toggleDarkMode", { detail: newDarkMode });
    window.dispatchEvent(event);

    // Add or remove dark-mode class on body
    if (newDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  // Mini mode: auto shrink if idle
  React.useEffect(() => {
    if (open || dragging) {
      setMini(false);
      return;
    }
    const timer = setTimeout(() => setMini(true), 5000); // 5 detik idle
    return () => clearTimeout(timer);
  }, [open, dragging]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        userSelect: "none",
        transition: dragging
          ? "none"
          : "box-shadow 0.2s, left 0.22s, top 0.22s",
      }}
    >
      {/* Quick Actions will always be with the main menu */}

      {/* Floating button */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => {
          // Click will open/close the main menu and quick action simultaneously
          setOpen(!open);
          setQuickActionsOpen(!open);
        }}
        onMouseEnter={() => setMini(false)}
        style={{
          width: mini ? 38 : 48,
          height: mini ? 38 : 48,
          borderRadius: "50%",
          background: darkMode
            ? "linear-gradient(135deg, #232d2b 0%, #181A1B 100%)"
            : "linear-gradient(135deg, #7ed957 0%, #556B2F 100%)",
          boxShadow:
            open || quickActionsOpen
              ? darkMode
                ? "0 4px 16px rgba(30,30,30,0.28)"
                : "0 4px 16px rgba(85,107,47,0.18)"
              : darkMode
                ? "0 2px 8px rgba(30,30,30,0.18)"
                : "0 2px 8px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          border: darkMode ? "2.5px solid #EEE" : "2.5px solid #fff",
          color: darkMode ? "#EEE" : "#fff",
          fontSize: mini ? 22 : 28,
          fontWeight: 700,
          transition:
            "background 0.2s, box-shadow 0.2s, width 0.22s, height 0.22s, font-size 0.22s",
          backdropFilter: "blur(2px)",
          position: "relative",
          touchAction: "none",
        }}
      >
        <i
          className={`bi bi-grid-3x3-gap-fill${open ? " floating-menu-rotate" : ""}`}
          style={{
            fontSize: mini ? 20 : 24,
            fontWeight: 700,
            userSelect: "none",
            transition:
              "transform 0.32s cubic-bezier(.42,1.6,.58,1), font-size 0.22s",
          }}
        ></i>
      </div>
      {/* Menu pop-up */}
      {open && (
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 0,
            minWidth: 110,
            background: darkMode
              ? "rgba(24,26,27,0.96)"
              : "rgba(255,255,255,0.82)",
            color: darkMode ? "#EEE" : "#556B2F",
            backdropFilter: "blur(8px)",
            borderRadius: 12,
            boxShadow: darkMode
              ? "0 4px 24px rgba(30,30,30,0.18)"
              : "0 4px 24px rgba(85,107,47,0.13)",
            padding: "8px 0",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            border: darkMode ? "1px solid #333" : "1px solid #e0e0e0",
            animation: "scaleFadeInMenu 0.22s cubic-bezier(.42,1.6,.58,1) both",
            transformOrigin: "left top",
            fontSize: "0.92rem",
          }}
        >
          {/* Quick Action Buttons */}
          <div
            className="quick-actions-container"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "6px",
              padding: "6px",
              borderBottom: darkMode ? "1px solid #333" : "1px solid #e0e0e0",
              marginBottom: "4px",
            }}
          >
            {/* Music Button */}
            <button
              className="menu-action-button"
              onClick={togglePlay}
              title={
                isPlaying
                  ? language === "en"
                    ? "Pause Music"
                    : "Jeda Musik"
                  : language === "en"
                    ? "Play Music"
                    : "Putar Musik"
              }
              style={{
                background: isPlaying
                  ? darkMode
                    ? "#3a5a40"
                    : "#7ed957"
                  : darkMode
                    ? "#232d2b"
                    : "#f8f9fa",
              }}
            >
              <i
                className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}
                style={{ fontSize: "12px" }}
              ></i>
            </button>

            {/* Language Toggle Button */}
            <button
              className="menu-action-button"
              onClick={toggleLanguage}
              title={
                language === "id"
                  ? "Switch to English"
                  : "Ganti ke Bahasa Indonesia"
              }
              style={{
                background: darkMode ? "#232d2b" : "#f8f9fa",
              }}
            >
              <span style={{ fontSize: "0.65rem", fontWeight: "bold" }}>
                {language === "id" ? "EN" : "ID"}
              </span>
            </button>

            {/* Dark/Light Mode Button */}
            <button
              className="menu-action-button"
              onClick={toggleDarkMode}
              title={
                darkMode
                  ? language === "en"
                    ? "Light Mode"
                    : "Mode Terang"
                  : language === "en"
                    ? "Dark Mode"
                    : "Mode Gelap"
              }
              style={{
                background: darkMode ? "#232d2b" : "#f8f9fa",
              }}
            >
              <i
                className={`bi ${darkMode ? "bi-brightness-high-fill" : "bi-moon-stars-fill"}`}
                style={{ fontSize: "12px" }}
              ></i>
            </button>
          </div>

          {menuItems.map((item) => (
            <button
              key={item.sectionId}
              onClick={(e) => {
                // Ripple effect
                const btn = e.currentTarget;
                const ripple = document.createElement("span");
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.className = "floating-menu-ripple";
                ripple.style.width = ripple.style.height = size + "px";
                ripple.style.left = e.nativeEvent.offsetX - size / 2 + "px";
                ripple.style.top = e.nativeEvent.offsetY - size / 2 + "px";
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 500);
                setOpen(false);
                scrollToSection(item.sectionId);
              }}
              className="floating-menu-item-btn"
              style={{
                background: "none",
                border: "none",
                color: darkMode ? "#EEE" : "#556B2F",
                fontWeight: 600,
                fontSize: 14,
                padding: "7px 14px",
                textAlign: "left",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.18s, box-shadow 0.18s",
                display: "flex",
                alignItems: "center",
                gap: 8,
                position: "relative",
                overflow: "hidden",
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <i
                className={`bi ${item.icon}`}
                style={{ fontSize: 16, marginRight: 5, minWidth: 16 }}
              ></i>
              {item.label}
            </button>
          ))}
        </div>
      )}
      {/* Keyframes for fadeInMenu */}
      <style>{`
        @keyframes scaleFadeInMenu {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.85);
          }
          60% {
            opacity: 1;
            transform: translateY(-4px) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .floating-menu-item-btn:hover, .floating-menu-item-btn:focus {
          background: ${darkMode ? "rgba(80,80,80,0.18)" : "rgba(85,107,47,0.08)"};
          box-shadow: 0 2px 12px 0 rgba(85,107,47,0.18), 0 0 0 2px #d0e6c1;
          outline: none;
        }
        .floating-menu-rotate {
          transform: rotate(90deg) scale(1.08);
        }
        .floating-menu-ripple {
          position: absolute;
          border-radius: 50%;
          background: ${darkMode ? "rgba(80,80,80,0.28)" : "rgba(85,107,47,0.18)"};
          transform: scale(0);
          animation: floatingMenuRipple 0.5s linear;
          pointer-events: none;
          z-index: 2;
        }
        @keyframes floatingMenuRipple {
          to {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        
        /* Quick Action Buttons Styles */
        .menu-action-button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1.5px solid ${darkMode ? "#444" : "#fff"};
          color: ${darkMode ? "#EEE" : "#556B2F"};
          font-size: 14px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          transition: all 0.3s;
          animation: scaleInQuickAction 0.3s ease-out both;
        }
        
        .menu-action-button:hover, .menu-action-button:focus {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        @keyframes scaleInQuickAction {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingMenu;
