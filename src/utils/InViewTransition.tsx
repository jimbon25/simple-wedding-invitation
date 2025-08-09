import React, { ElementType, useRef, useEffect, useState } from "react";

export type AnimationType =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "slide-diagonal";

interface InViewTransitionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: ElementType;
  animationType?: AnimationType;
  threshold?: number;
}

/**
 * InViewTransition: animation every time an element enters/exits the viewport (not just once)

 */
const InViewTransition: React.FC<InViewTransitionProps> = ({
  children,
  className = "",
  style = {},
  as = "div",
  animationType = "fade",
  threshold = 0.18,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf: number | null = null;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(() => setVisible(true));
        } else {
          raf = requestAnimationFrame(() => setVisible(false));
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);

  const getAnimationClass = () => {
    if (animationType === "fade") {
      return visible ? "lang-fade-in" : "lang-fade-out";
    } else if (animationType === "slide-up") {
      return visible ? "lang-slide-up-in" : "lang-slide-up-out";
    } else if (animationType === "slide-down") {
      return visible ? "lang-slide-down-in" : "lang-slide-down-out";
    } else if (animationType === "slide-left") {
      return visible ? "lang-slide-left-in" : "lang-slide-left-out";
    } else if (animationType === "slide-right") {
      return visible ? "lang-slide-right-in" : "lang-slide-right-out";
    } else if (animationType === "slide-diagonal") {
      return visible ? "lang-slide-diagonal-in" : "lang-slide-diagonal-out";
    }
    return "";
  };

  return React.createElement(
    as,
    {
      ref,
      className: `lang-transition ${className} ${getAnimationClass()}`,
      style,
    },
    children,
  );
};

export default InViewTransition;
