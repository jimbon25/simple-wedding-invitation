import React from "react";
import { TransText } from "../utils/TransitionComponents";

const ScrollToTopButton: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="btn btn-success d-flex align-items-center gap-2 px-4 py-2 shadow"
      style={{
        borderRadius: 24,
        fontWeight: 600,
        fontSize: "1.08rem",
        boxShadow: "0 2px 12px rgba(156,175,136,0.13)",
      }}
      aria-label="Back to Top"
    >
      <i className="bi bi-chevron-up" style={{ fontSize: "1.3rem" }}></i>
      <TransText textKey="back_to_top" animationType="fade" />
    </button>
  );
};

export default ScrollToTopButton;
