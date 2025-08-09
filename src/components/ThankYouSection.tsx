import React from "react";
import InViewTransition from "../utils/InViewTransition";
import SectionCard from "./SectionCard";
import { TransText } from "../utils/TransitionComponents";

const ThankYouSection: React.FC = () => (
  <div className="container py-4 px-3 px-md-4">
    <SectionCard
      style={{
        background: "rgba(230,234,227,0.7)",
        textAlign: "center",
        minHeight: 180,
        border: "1.8px solid #7a8c6a",
      }}
    >
      <InViewTransition animationType="fade">
        <h2
          style={{
            fontFamily: "Playfair Display, serif",
            color: "#7a8c6a",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <TransText textKey="thank_you_title" animationType="fade" />
        </h2>
        <p
          style={{
            fontSize: "1.08rem",
            color: "#444",
            fontFamily: "Playfair Display, serif",
            fontWeight: 500,
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          <TransText textKey="thank_you_message" animationType="fade" />
        </p>
      </InViewTransition>
    </SectionCard>
  </div>
);

export default ThankYouSection;
