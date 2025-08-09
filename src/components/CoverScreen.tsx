import React from "react";
import "./CoverScreen.css";
import { useLanguage } from "../utils/LanguageContext";
import ProgressiveImage from "./ProgressiveImage";

interface CoverScreenProps {
  onOpenInvitation: () => void;
}

const CoverScreen: React.FC<CoverScreenProps> = ({ onOpenInvitation }) => {
  const { t } = useLanguage();
  const [fadeOut, setFadeOut] = React.useState(false);

  // Get guest name from 'to' URL parameter
  const searchParams = new URLSearchParams(window.location.search);
  let guestName = searchParams.get("to");
  // Blacklist forbidden words (profanity/spam filter)
  const guestBlacklist = [
    "babi",
    "anjing",
    "asu",
    "kontol",
    "memek",
    "tolol",
    "goblok",
    "bangsat",
    "judi",
    "casino",
    "sex",
    "porno",
    "spammer",
    "admin",
    "bot",
    "test",
    "http",
    "https",
    "www",
    ".com",
    ".xyz",
    ".net",
    ".org",
  ];
  if (guestName) {
    const guestLower = guestName.toLowerCase();
    if (guestBlacklist.some((word) => guestLower.includes(word))) {
      guestName = null;
    }
  }

  const handleOpen = () => {
    setFadeOut(true);
    setTimeout(() => {
      onOpenInvitation();
    }, 600); // fadeOut duration
  };

  return (
    <div className={`cover-screen${fadeOut ? " fade-out" : ""}`}>
      <div
        className="background-image-wrapper"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        <ProgressiveImage
          src="/images/background.webp"
          placeholderSrc="/images/thumbnails/background-thumb.webp"
          alt="Wedding background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            filter: "brightness(0.5)", // Darken the background
          }}
        />
      </div>
      <div className="cover-content text-center">
        <p className="cover-subtitle animated-subtitle">The Wedding Of</p>
        <h1 className="cover-title animated-title">D & N</h1>
        {guestName && (
          <div className="guest-info mt-4">
            <p className="mb-0">{t("to_guest")}</p>
            <h2 className="guest-name">{guestName.replace(/\+/g, " ")}</h2>
          </div>
        )}
        <button className="cover-button-estetik mt-5" onClick={handleOpen}>
          <span className="cover-button-text">{t("open_invitation")}</span>
        </button>
      </div>
      {/* Social Media Icons at the very bottom of CoverScreen */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 24,
          display: "flex",
          justifyContent: "center",
          gap: 18,
          zIndex: 10,
        }}
      >
        <a
          href="https://www.instagram.com/dimasladty"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="text-white"
          style={{ fontSize: 24 }}
        >
          <i className="bi bi-instagram"></i>
        </a>
        <a
          href="https://www.facebook.com/iv.dimas"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="text-white"
          style={{ fontSize: 24 }}
        >
          <i className="bi bi-facebook"></i>
        </a>
      </div>
    </div>
  );
};

export default CoverScreen;
