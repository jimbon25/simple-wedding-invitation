import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import Lottie from "lottie-react";
import errorAnimation from "./assets/error.json";
import { BrowserRouter as Router } from "react-router-dom";
import MainContentWrapper from "./components/MainContentWrapper";
import LoadingScreen from "./components/LoadingScreen";
import { SecurityUtils } from "./utils/security";
import { useLanguage } from "./utils/LanguageContext";
import { TransText, TransElement } from "./utils/TransitionComponents";
import { checkGuestBlock } from "./utils/guestBlocker";
import "./language-transition.css";

// Will load AOS CSS dynamically when initializing AOS

// Lazy load components with prefetching for better user experience
const FloatingMenu = lazy(() => import("./components/FloatingMenu"));
const FloatingGeminiChat = lazy(
  () => import("./components/FloatingGeminiChat"),
);
const CoverScreen = lazy(() => import("./components/CoverScreen"));

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    // Hitung offset navbar (fixed-top)
    const navbar = document.querySelector(".navbar.fixed-top") as HTMLElement;
    const offset = navbar ? navbar.offsetHeight : 0;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const top = rect.top + scrollTop - offset - 4; // -4px agar ada jarak kecil
    window.scrollTo({ top, behavior: "smooth" });
  }
};

const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true); // State untuk loading screen
  const [isInvitationOpened, setIsInvitationOpened] = useState(false); // New state for cover screen

  // Section IDs urut sesuai urutan di MainContentWrapper
  const sectionIds = React.useMemo(
    () => [
      "section-home",
      "section-our-story",
      "section-event-details",
      "section-gallery",
      "section-rsvp-guestbook",
      "section-gift-info",
      "section-accommodation-info",
      "section-gift-registry",
    ],
    [],
  );

  const [activeSection, setActiveSection] = useState("section-home");

  // Scrollspy: update activeSection saat scroll
  useEffect(() => {
    if (!isInvitationOpened || isLoading) return;
    const handleScrollSpy = () => {
      const navbar = document.querySelector(".navbar.fixed-top") as HTMLElement;
      const offset = navbar ? navbar.offsetHeight + 8 : 8;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top - offset <= 0) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    handleScrollSpy(); // initial
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [isInvitationOpened, isLoading, sectionIds]);

  // Environment validation on startup
  useEffect(() => {
    const envValidation = SecurityUtils.validateEnvVars();
    if (!envValidation.isValid) {
      console.warn("Missing environment variables:", envValidation.missing);
    }
  }, []);

  // Guest visitor tracking & VPN/proxy/rate limit detection (refactor ke util)
  const [isBlocked, setIsBlocked] = useState(false);
  const [vpnMessage, setVpnMessage] = useState("");
  const [isCheckingBlock, setIsCheckingBlock] = useState(true); // State untuk menunggu hasil deteksi blokir
  useEffect(() => {
    setIsCheckingBlock(true);
    checkGuestBlock(language)
      .then((result) => {
        if (result.blocked) {
          setIsBlocked(true);
          setVpnMessage(result.message);
        }
        setIsCheckingBlock(false);
      })
      .catch(() => {
        setIsCheckingBlock(false);
      });
  }, [language]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isScrolled, setIsScrolled] = useState(false); // New state for scroll detection

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleOpenInvitation = () => {
    setIsInvitationOpened(true);
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((e) => console.error("Error playing audio:", e));
      setIsPlaying(true);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isOtherDropdownOpen, setIsOtherDropdownOpen] = useState(false); // State for 'Others' dropdown
  const menuRef = useRef<HTMLDivElement>(null); // Ref for the mobile menu
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchCurrentX, setTouchCurrentX] = useState(0);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    // Check user preference in localStorage
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });
  // Add or remove dark-mode class on body when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    // Simpan preferensi ke localStorage
    localStorage.setItem("darkMode", darkMode ? "true" : "false");

    // Listen untuk event toggle dark mode dari FloatingMenu
    const handleToggleDarkMode = (e: CustomEvent) => {
      setDarkMode(e.detail);
    };

    window.addEventListener(
      "toggleDarkMode",
      handleToggleDarkMode as EventListener,
    );
    return () => {
      window.removeEventListener(
        "toggleDarkMode",
        handleToggleDarkMode as EventListener,
      );
    };
  }, [darkMode]);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
    // Close 'Lainnya' dropdown if main navbar is closing
    if (isOpen) {
      setIsOtherDropdownOpen(false);
    }
  };

  const toggleOtherDropdown = () => {
    setIsOtherDropdownOpen(!isOtherDropdownOpen);
  };

  const handleShare = async () => {
    const shareData = {
      title: t("share_invitation"),
      text: t("share_message"),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(t("link_copied"));
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Touch event handlers for swipe-to-close
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    setTouchCurrentX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchCurrentX - touchStartX;
    // Define a threshold for closing the menu (e.g., 50 pixels to the right)
    const swipeThreshold = 50;

    if (swipeDistance > swipeThreshold && isOpen) {
      setIsOpen(false); // Close the menu
    }
    // Reset touch positions
    setTouchStartX(0);
    setTouchCurrentX(0);
  }, [touchCurrentX, touchStartX, isOpen]);

  // Optimized scroll handler for improved performance - removed in favor of debounced scroll handler below

  useEffect(() => {
    // Initialize AOS only if it has been loaded and only when needed
    const initAOS = async () => {
      // Only initialize AOS if invitation is opened to prevent unnecessary work
      if (!isInvitationOpened) return;

      try {
        // Initialize AOS (CSS should be included in the public/index.html file)
        const aosModule = await import("aos");
        aosModule.default.init({
          duration: 1000, // values from 0 to 3000, with step 50ms
          once: true, // whether animation should happen only once - while scrolling down
          startEvent: "DOMContentLoaded", // name of the event dispatched on the document, that AOS should initialize on
          offset: 120, // offset (in px) from the original trigger point
          delay: 0, // values from 0 to 3000, with step 50ms
          easing: "ease", // default easing for AOS animations
          throttleDelay: 99, // the delay on throttle used while scrolling (helps performance)
          disable: window.innerWidth < 768 ? "mobile" : false, // disable animations on mobile for better performance
        });
      } catch (error) {
        console.warn("AOS could not be initialized", error);
      }
    };

    // Delay AOS initialization until after main content is loaded
    if (!isLoading && isInvitationOpened) {
      initAOS();
    }

    // Add/remove no-scroll class to body based on menu open state
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    // Handle scroll for navbar transparency with debounce for better performance
    const handleScroll = debounce(() => {
      if (window.scrollY > 50) {
        // Adjust this value as needed
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }, 10); // 10ms debounce time

    window.addEventListener("scroll", handleScroll, { passive: true }); // passive: true improves scrolling performance

    // Clean up the class and event listener when component unmounts
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, isLoading, isInvitationOpened]);

  // Simple debounce function
  function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Attach touch event listeners to the menu when it's open
  useEffect(() => {
    const menuElement = menuRef.current;
    if (menuElement && isOpen) {
      menuElement.addEventListener("touchstart", handleTouchStart);
      menuElement.addEventListener("touchmove", handleTouchMove);
      menuElement.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (menuElement) {
        menuElement.removeEventListener(
          "touchstart",
          handleTouchStart as EventListener,
        );
        menuElement.removeEventListener(
          "touchmove",
          handleTouchMove as EventListener,
        );
        menuElement.removeEventListener(
          "touchend",
          handleTouchEnd as EventListener,
        );
      }
    };
  }, [isOpen, handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (isCheckingBlock) {
    // Tampilkan loading screen sampai hasil deteksi blokir diterima
    return (
      <LoadingScreen
        onLoadComplete={() => {}}
        minDisplayTime={1000} // opsional, agar animasi tetap smooth
      />
    );
  }

  if (isBlocked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          color: "#333",
          zIndex: 99999,
        }}
      >
        {/* Lottie Animation */}
        <div style={{ width: 180, marginBottom: 16 }}>
          <Lottie animationData={errorAnimation} loop={true} />
        </div>
        <img
          src="/images/saweria.png"
          alt="Blocked"
          style={{ width: 120, marginBottom: 24, opacity: 0.7 }}
        />
        <h2 style={{ color: "#b71c1c", marginBottom: 16, textAlign: "center" }}>
          Akses Diblokir
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            textAlign: "center",
            maxWidth: 340,
            marginBottom: 24,
          }}
        >
          {vpnMessage}
        </p>
      </div>
    );
  }

  return (
    <Router>
      {isLoading && (
        <LoadingScreen
          onLoadComplete={() => setIsLoading(false)}
          minDisplayTime={3000}
        />
      )}
      {!isLoading && !isInvitationOpened && (
        <Suspense
          fallback={
            <div
              style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          }
        >
          <CoverScreen onOpenInvitation={handleOpenInvitation} />
        </Suspense>
      )}
      <div
        style={{
          display: isLoading ? "none" : isInvitationOpened ? "block" : "none",
        }}
      >
        {isOpen && <div className="menu-overlay" onClick={toggleNavbar}></div>}
        {/* ...existing code for navbar and content... */}
        <nav
          className={`navbar navbar-expand-lg fixed-top ${darkMode ? "navbar-dark" : "navbar-light"} ${isScrolled ? "scrolled" : ""} ${darkMode ? "bg-dark" : "bg-light"}`}
          style={
            darkMode
              ? {
                  background: "var(--navbar-bg-dark, #233d2b)",
                  paddingTop: 0,
                  marginTop: 0,
                }
              : {
                  background: "var(--navbar-bg-light, #f8f9fa)",
                  paddingTop: 0,
                  marginTop: 0,
                }
          }
        >
          <div
            className="container-fluid d-flex align-items-center"
            style={{ paddingTop: 0, marginTop: 0 }}
          >
            <button
              className="navbar-brand btn btn-link p-0 m-0"
              style={{ background: "none", border: "none" }}
              onClick={() => scrollToSection("section-home")}
            >
              <TransElement as="span" animationType="slide-diagonal">
                Dimas & Niken
              </TransElement>
            </button>
            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleNavbar}
              aria-expanded={isOpen}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              ref={menuRef}
              className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
              style={{
                transform:
                  isOpen && touchStartX !== 0
                    ? `translateX(${Math.max(0, touchCurrentX - touchStartX)}px)`
                    : "none",
                background: darkMode
                  ? "var(--navbar-bg-dark, #233d2b)"
                  : "var(--navbar-bg-light, #f8f9fa)",
                paddingTop: 0,
                marginTop: 0,
              }}
            >
              {/* ...navbar content remains unchanged... */}
              <div
                className="w-100 d-flex justify-content-center align-items-center gap-3 mb-2"
                style={{ marginTop: "12px", marginBottom: "12px" }}
              >
                {/* Play Music Icon */}
                <button
                  className={`btn btn-xs d-flex align-items-center justify-content-center ${isPlaying ? "btn-primary spinning" : "btn-outline-primary"}`}
                  onClick={togglePlay}
                  title={isPlaying ? "Pause Music" : "Play Music"}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "0.18rem",
                    padding: 0,
                  }}
                >
                  <i
                    className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}
                    style={{ fontSize: "1rem", margin: 0 }}
                  ></i>
                </button>
                {/* Bagikan Icon */}
                <button
                  className="btn btn-xs d-flex align-items-center justify-content-center btn-outline-secondary"
                  onClick={handleShare}
                  title="Bagikan Undangan"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "0.18rem",
                    padding: 0,
                  }}
                >
                  <i
                    className="bi bi-share-fill"
                    style={{ fontSize: "1rem", margin: 0 }}
                  ></i>
                </button>
                {/* Language Toggle Button */}
                <button
                  className={`btn btn-xs d-flex align-items-center justify-content-center btn-outline-secondary language-switch`}
                  onClick={() => setLanguage(language === "id" ? "en" : "id")}
                  title={
                    language === "id"
                      ? "Switch to English"
                      : "Ganti ke Bahasa Indonesia"
                  }
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "0.18rem",
                    padding: 0,
                  }}
                >
                  <TransElement
                    as="span"
                    animationType="slide-up"
                    style={{ fontSize: "0.7rem", fontWeight: "bold" }}
                  >
                    {language === "id" ? "EN" : "ID"}
                  </TransElement>
                </button>
                {/* Dark Mode Icon */}
                <button
                  className={`btn btn-xs d-flex align-items-center justify-content-center ${darkMode ? "btn-dark" : "btn-light"}`}
                  onClick={toggleDarkMode}
                  title={
                    darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "0.18rem",
                    padding: 0,
                    marginLeft: "6px",
                  }}
                >
                  <i
                    className={`bi ${darkMode ? "bi-moon-stars-fill" : "bi-brightness-high-fill"}`}
                    style={{ fontSize: "1rem", margin: 0 }}
                  ></i>
                </button>
              </div>
              {/* ...rest of navbar and menu code remains unchanged... */}
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <img
                  src="/navbar-gif.gif"
                  alt="Cute Anime Girl"
                  className="navbar-gif"
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  style={{
                    height: "48px",
                    margin: "0 8px 0 0",
                    borderRadius: "8px",
                    objectFit: "contain",
                    display: "block",
                    verticalAlign: "top",
                  }}
                />
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link p-0 m-0${activeSection === "section-home" ? " active fw-bold" : ""}`}
                    style={{
                      background:
                        activeSection === "section-home" && !darkMode
                          ? "rgba(126, 217, 87, 0.15)"
                          : "none",
                      border: "none",
                      color:
                        activeSection === "section-home"
                          ? "#7ed957"
                          : undefined,
                      borderRadius:
                        activeSection === "section-home" ? "8px" : undefined,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onClick={() => {
                      setIsOpen(false);
                      scrollToSection("section-home");
                    }}
                    aria-current={
                      activeSection === "section-home" ? "page" : undefined
                    }
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-house-door-fill me-2"></i>
                      <TransText textKey="home" />
                    </div>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link p-0 m-0${activeSection === "section-our-story" ? " active fw-bold" : ""}`}
                    style={{
                      background:
                        activeSection === "section-our-story" && !darkMode
                          ? "rgba(126, 217, 87, 0.15)"
                          : "none",
                      border: "none",
                      color:
                        activeSection === "section-our-story"
                          ? "#7ed957"
                          : undefined,
                      borderRadius:
                        activeSection === "section-our-story"
                          ? "8px"
                          : undefined,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onClick={() => {
                      setIsOpen(false);
                      scrollToSection("section-our-story");
                    }}
                    aria-current={
                      activeSection === "section-our-story" ? "page" : undefined
                    }
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-book-fill me-2"></i>
                      <TransText textKey="our_story" />
                    </div>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link p-0 m-0${activeSection === "section-event-details" ? " active fw-bold" : ""}`}
                    style={{
                      background:
                        activeSection === "section-event-details" && !darkMode
                          ? "rgba(126, 217, 87, 0.15)"
                          : "none",
                      border: "none",
                      color:
                        activeSection === "section-event-details"
                          ? "#7ed957"
                          : undefined,
                      borderRadius:
                        activeSection === "section-event-details"
                          ? "8px"
                          : undefined,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onClick={() => {
                      setIsOpen(false);
                      scrollToSection("section-event-details");
                    }}
                    aria-current={
                      activeSection === "section-event-details"
                        ? "page"
                        : undefined
                    }
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar-event-fill me-2"></i>
                      <TransText textKey="event_details" />
                    </div>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link p-0 m-0${activeSection === "section-gallery" ? " active fw-bold" : ""}`}
                    style={{
                      background:
                        activeSection === "section-gallery" && !darkMode
                          ? "rgba(126, 217, 87, 0.15)"
                          : "none",
                      border: "none",
                      color:
                        activeSection === "section-gallery"
                          ? "#7ed957"
                          : undefined,
                      borderRadius:
                        activeSection === "section-gallery" ? "8px" : undefined,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onClick={() => {
                      setIsOpen(false);
                      scrollToSection("section-gallery");
                    }}
                    aria-current={
                      activeSection === "section-gallery" ? "page" : undefined
                    }
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-image-fill me-2"></i>
                      <TransText textKey="gallery" />
                    </div>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link p-0 m-0${activeSection === "section-rsvp-guestbook" ? " active fw-bold" : ""}`}
                    style={{
                      background:
                        activeSection === "section-rsvp-guestbook" && !darkMode
                          ? "rgba(126, 217, 87, 0.15)"
                          : "none",
                      border: "none",
                      color:
                        activeSection === "section-rsvp-guestbook"
                          ? "#7ed957"
                          : undefined,
                      borderRadius:
                        activeSection === "section-rsvp-guestbook"
                          ? "8px"
                          : undefined,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onClick={() => {
                      setIsOpen(false);
                      scrollToSection("section-rsvp-guestbook");
                    }}
                    aria-current={
                      activeSection === "section-rsvp-guestbook"
                        ? "page"
                        : undefined
                    }
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <TransText textKey="rsvp_guestbook" />
                    </div>
                  </button>
                </li>
                <li className="nav-item dropdown">
                  <button
                    className={`nav-link dropdown-toggle ${isOtherDropdownOpen ? "active" : ""} ${darkMode ? "text-light" : ""}`}
                    type="button"
                    id="navbarDropdown"
                    onClick={toggleOtherDropdown}
                    aria-expanded={isOtherDropdownOpen}
                    style={
                      darkMode
                        ? {
                            background: "var(--navbar-bg-dark, #233d2b)",
                            color: "var(--navbar-text-dark, #fff)",
                          }
                        : {}
                    }
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-three-dots me-2"></i>
                      <TransText textKey="others" />
                    </div>
                  </button>
                  {isOtherDropdownOpen && (
                    <ul
                      className={`dropdown-menu show ${darkMode ? "dropdown-menu-dark" : ""}`}
                      aria-labelledby="navbarDropdown"
                      style={
                        darkMode
                          ? {
                              background: "var(--navbar-bg-dark, #233d2b)",
                              color: "var(--navbar-text-dark, #fff)",
                            }
                          : {}
                      }
                    >
                      <li>
                        <button
                          className={`dropdown-item${darkMode ? " text-light" : ""}`}
                          style={{ background: "none", border: "none" }}
                          onClick={() => {
                            setIsOpen(false);
                            setIsOtherDropdownOpen(false);
                            scrollToSection("section-gift-info");
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <i className="bi bi-gift me-2"></i>
                            <TransText textKey="gift_info" />
                          </div>
                        </button>
                      </li>
                      <li>
                        <button
                          className={`dropdown-item${darkMode ? " text-light" : ""}`}
                          style={{ background: "none", border: "none" }}
                          onClick={() => {
                            setIsOpen(false);
                            setIsOtherDropdownOpen(false);
                            scrollToSection("section-accommodation-info");
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <i className="bi bi-car-front-fill me-2"></i>
                            <TransText textKey="accommodation_info" />
                          </div>
                        </button>
                      </li>
                      <li>
                        <button
                          className={`dropdown-item${darkMode ? " text-light" : ""}`}
                          style={{ background: "none", border: "none" }}
                          onClick={() => {
                            setIsOpen(false);
                            setIsOtherDropdownOpen(false);
                            scrollToSection("section-gift-registry");
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <i className="bi bi-gift-fill me-2"></i>
                            <TransText textKey="gift_registry" />
                          </div>
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
              <div className="d-flex ms-auto align-items-center">{/*  */}</div>
            </div>
          </div>
        </nav>

        {/* Overlay for closing navbar when clicking outside */}
        {isOpen && (
          <div
            className="navbar-menu-overlay"
            onClick={() => setIsOpen(false)}
          />
        )}

        <div style={{ minHeight: "100vh" }}>
          <MainContentWrapper darkMode={darkMode} />
          <audio ref={audioRef} loop>
            {/* Replace with your actual music file URL */}
            <source src="/music/wedding-music.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          {/* Floating Gemini Chat Icon & Bubble */}
          <FloatingGeminiChat darkMode={darkMode} />
          {/* Floating AssistiveTouch-style Menu */}
          <FloatingMenu
            darkMode={darkMode}
            isInvitationOpened={isInvitationOpened}
          />
        </div>
      </div>
    </Router>
  );
};

export default App;
