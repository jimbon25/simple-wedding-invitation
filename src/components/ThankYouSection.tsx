import React from "react";
import StoryItem from "./StoryItem";
import InViewTransition from "../utils/InViewTransition";
import SectionCard from "./SectionCard";
import { TransText } from "../utils/TransitionComponents";

const ThankYouSection: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() =>
    document.body.classList.contains("dark-mode"),
  );
  React.useEffect(() => {
    const checkDarkMode = () =>
      setIsDarkMode(document.body.classList.contains("dark-mode"));
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
    observer.observe(document.body, { attributes: true });
    checkDarkMode();
    return () => observer.disconnect();
  }, []);
  return (
    <div className="container py-4 px-3 px-md-4">
      <SectionCard
        darkMode={isDarkMode}
        style={{
          textAlign: "center",
          minHeight: 180,
        }}
      >
        <StoryItem>
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "Playfair Display, serif",
              color: isDarkMode ? "#EEE" : "#7a8c6a",
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <span
              className="bi bi-heart-fill"
              style={{ fontSize: "2rem", color: "#9CAF88" }}
            ></span>
            <InViewTransition animationType="slide-down">
              <TransText textKey="thank_you_title" animationType="fade" />
            </InViewTransition>
          </h2>
        </StoryItem>
        <StoryItem delay="0.2s">
          <p
            style={{
              fontSize: "1.08rem",
              color: isDarkMode ? "#EEE" : "#444",
              fontFamily: "Playfair Display, serif",
              fontWeight: 500,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            <InViewTransition animationType="fade">
              <TransText textKey="thank_you_message" animationType="fade" />
            </InViewTransition>
          </p>
        </StoryItem>
      </SectionCard>
    </div>
  );
};

export default ThankYouSection;
