import React from "react";
import useIntersectionObserver from "../hooks/useIntersectionObserver";

const StoryItem: React.FC<{ children: React.ReactNode; delay?: string }> = ({
  children,
  delay = "0s",
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });
  return (
    <div
      ref={ref}
      className={`reveal-item ${isIntersecting ? "visible" : ""}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

export default StoryItem;
