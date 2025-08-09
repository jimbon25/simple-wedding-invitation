import React, { lazy, Suspense } from "react";
import Footer from "./Footer";
import ScrollToTopButton from "./ScrollToTopButton";
import SectionSeparator from "./SectionSeparator";
import SectionCard from "./SectionCard";
import "./MainContentBg.css";

// Loading fallback component for inner routes
const PageLoading: React.FC = () => (
  <div
    style={{
      minHeight: "50vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "15px",
    }}
  >
    <div className="spinner-border text-success" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div>Loading content...</div>
  </div>
);

const Home = lazy(() => import("./Home"));
const OurStory = lazy(() => import("./OurStory"));
const EventDetails = lazy(() => import("./EventDetails"));
const Gallery = lazy(() => import("./Gallery"));
const RSVPAndGuestBook = lazy(() => import("./RSVPAndGuestBook"));
const GiftInfo = lazy(() => import("./GiftInfo"));
const AccommodationInfo = lazy(() => import("./AccommodationInfo"));
const GiftRegistry = lazy(() => import("./GiftRegistry"));

interface MainContentWrapperProps {
  darkMode?: boolean;
}
const MainContentWrapper: React.FC<MainContentWrapperProps> = ({
  darkMode,
}) => {
  return (
    <div
      className={`main-content-bg`}
      style={{
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <Suspense fallback={<PageLoading />}>
        <div id="section-home">
          <Home />
        </div>
        <div
          style={{
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
          }}
        >
          <SectionSeparator />
        </div>
        <div id="section-our-story" className="container py-2 px-3 px-md-4">
          <SectionCard darkMode={darkMode} delay={80}>
            <OurStory />
          </SectionCard>
        </div>
        <div id="section-event-details" className="container py-2 px-3 px-md-4">
          <SectionCard darkMode={darkMode} delay={160}>
            <EventDetails />
          </SectionCard>
        </div>
        <div id="section-gallery" className="container py-2 px-3 px-md-4">
          <SectionCard darkMode={darkMode} delay={240}>
            <div style={{ overflow: "visible", width: "100%" }}>
              <Gallery />
            </div>
          </SectionCard>
        </div>
        <div
          id="section-rsvp-guestbook"
          className="container py-2 px-3 px-md-4"
        >
          <SectionCard darkMode={darkMode} delay={320}>
            <RSVPAndGuestBook />
          </SectionCard>
        </div>
        <div id="section-gift-info" className="container py-2 px-3 px-md-4">
          <SectionCard darkMode={darkMode} delay={400}>
            <GiftInfo />
          </SectionCard>
        </div>
        <div
          id="section-accommodation-info"
          className="container py-2 px-3 px-md-4"
        >
          <SectionCard darkMode={darkMode} delay={480}>
            <AccommodationInfo />
          </SectionCard>
        </div>
        <div id="section-gift-registry" className="container py-2 px-3 px-md-4">
          <SectionCard darkMode={darkMode} delay={560}>
            <GiftRegistry />
          </SectionCard>
        </div>

        {/* Thank You Section */}
        <div id="section-thank-you">
          {/* New section, not using SectionCard */}
          <React.Suspense fallback={null}>
            {React.createElement(require("./ThankYouSection").default)}
          </React.Suspense>
        </div>
        {/* ScrollToTopButton below ThankYouSection */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            margin: "32px 0 0 0",
          }}
        >
          <ScrollToTopButton />
        </div>
        {/* Footer */}
        <Footer />
      </Suspense>
    </div>
  );
};
export default MainContentWrapper;
