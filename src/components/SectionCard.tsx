import React, { useRef, useEffect, useState } from "react";
import "./SectionCard.css";

interface SectionCardProps {
  children: React.ReactNode;
  darkMode?: boolean;
  fullWidth?: boolean;
  maxWidth?: string;
  delay?: number;
  style?: React.CSSProperties;
}

const SectionCard: React.FC<SectionCardProps> = ({
  children,
  darkMode,
  fullWidth,
  maxWidth,
  delay = 0,
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [disableAnim, setDisableAnim] = useState(false);

  useEffect(() => {
    // Disable animation on small screens (≤600px)
    if (window.innerWidth <= 600) {
      setVisible(true);
      setDisableAnim(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf: number | null = null;
    let delayTimeout: NodeJS.Timeout | null = null;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          delayTimeout = setTimeout(() => {
            setVisible(true);
            setHasAnimated(true);
          }, delay);
        }
      },
      { threshold: 0.32 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (delayTimeout) clearTimeout(delayTimeout);
    };
  }, [delay, hasAnimated]);

  return (
    <div
      ref={ref}
      className={
        disableAnim ? "" : `section-card-animate${visible ? " visible" : ""}`
      }
      style={{
        maxWidth: fullWidth ? "100%" : maxWidth || 960,
        minHeight: fullWidth ? undefined : 420,
        margin: fullWidth ? "24px 0" : "40px auto 24px auto",
        borderRadius: fullWidth ? 0 : 24,
        border: darkMode
          ? "1.2px solid rgba(255,255,255,0.13)"
          : "1.8px solid #7a8c6a",
        background: darkMode ? "rgba(24,26,27,0.98)" : "rgba(230,234,227,0.7)",
        boxShadow: darkMode
          ? "0 4px 32px rgba(24,26,27,0.18)"
          : "0 4px 32px rgba(156,175,136,0.08)",
        color: darkMode ? "#EEE" : undefined,
        padding: fullWidth ? 0 : "32px 18px 24px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        width: "100%",
        transition:
          "box-shadow 0.22s, border 0.22s, background 0.22s, color 0.22s, height 0.22s",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default SectionCard;
