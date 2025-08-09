import React, { createElement, ElementType, useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";

type AnimationType =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "slide-diagonal";

interface TransProps {
  textKey: string;
  className?: string;
  style?: React.CSSProperties;
  as?: ElementType;
  animationType?: AnimationType;
}

/**
 * TransText Component - Translates text with transition effect
 * Use this instead of directly calling t() for a smoother language transition
 */
export const TransText: React.FC<TransProps> = ({
  textKey,
  className = "",
  style = {},
  as = "span",
  animationType = "fade",
}) => {
  const { language, t } = useLanguage();
  const [visible, setVisible] = useState(true);

  // Handle transition when language changes
  useEffect(() => {
    setVisible(false); // Start animation out

    const timer = setTimeout(() => {
      setVisible(true); // Animation in with new content
    }, 300);

    return () => clearTimeout(timer);
  }, [language]);

  // Add another effect to ensure initial state is visible
  useEffect(() => {
    setVisible(true);
  }, []);

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

  return createElement(
    as,
    { className: `lang-transition ${className} ${getAnimationClass()}`, style },
    t(textKey),
  );
};

/**
 * TransElement Component - Wraps children with transition effect
 * Use this when you need to wrap more complex content with transition
 */
interface TransElementProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: ElementType;
  animationType?: AnimationType;
}

export const TransElement: React.FC<TransElementProps> = ({
  children,
  className = "",
  style = {},
  as = "div",
  animationType = "fade",
}) => {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(true);

  // Handle transition when language changes
  useEffect(() => {
    setVisible(false); // Start animation out

    const timer = setTimeout(() => {
      setVisible(true); // Animation in with new content
    }, 300);

    return () => clearTimeout(timer);
  }, [language]);

  // Add another effect to ensure initial state is visible
  useEffect(() => {
    setVisible(true);
  }, []);

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

  return createElement(
    as,
    { className: `lang-transition ${className} ${getAnimationClass()}`, style },
    children,
  );
};
