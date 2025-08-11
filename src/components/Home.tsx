import React, { useState, useEffect } from "react";
import ProgressiveImage from "./ProgressiveImage";

import StoryItem from "./StoryItem";

const Home: React.FC = () => {
  const weddingDate = new Date(2026, 6, 25, 10, 0, 0).getTime(); // July 25, 2026, 10:00:00

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [weddingDate]);

  return (
    <>
      <div
        className="hero-section text-center d-flex flex-column justify-content-center align-items-center"
        style={{ position: "relative", minHeight: "60vh", width: "100%" }}
      >
        <ProgressiveImage
          src="/images/g10.webp"
          placeholderSrc="/images/thumbnails/g10-thumb.webp"
          alt="Wedding background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            filter: "brightness(0.5)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <StoryItem>
            <h1 className="display-3 text-white">Dimas & Niken</h1>
          </StoryItem>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "20px 0 0 0",
            }}
          >
            <button
              type="button"
              className="btn"
              style={{
                fontWeight: 600,
                fontSize: "0.8rem",
                borderRadius: "8px",
                padding: "6px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "#fff",
                backdropFilter: "blur(5px)",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                letterSpacing: "1px",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={() => {
                const el = document.getElementById("section-rsvp-guestbook");
                if (el) {
                  const navbar = document.querySelector(
                    ".navbar.fixed-top",
                  ) as HTMLElement;
                  const offset = navbar ? navbar.offsetHeight : 0;
                  const rect = el.getBoundingClientRect();
                  const scrollTop =
                    window.pageYOffset || document.documentElement.scrollTop;
                  const top = rect.top + scrollTop - offset - 4;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
            >
              RSVP & GUESTBOOK
            </button>
          </div>
          {/* <StoryItem delay="0.4s"><p className="lead text-white">Join our celebration</p></StoryItem> */}
          <StoryItem delay="0.7s">
            <h4 className="text-white mt-4 mb-2">Countdown</h4>
          </StoryItem>
          <StoryItem delay="0.9s">
            <div
              className="countdown-container"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "10px",
                padding: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(5px)",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                maxWidth: "320px",
                margin: "0 auto",
              }}
            >
              <div
                className="countdown-item"
                style={{
                  textAlign: "center",
                  flex: "1",
                  minWidth: "50px",
                  padding: "5px 2px",
                }}
              >
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    margin: "0",
                    color: "white",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {countdown.days}
                </div>
                <div
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.7rem",
                    color: "white",
                    opacity: "0.9",
                  }}
                >
                  DAYS
                </div>
              </div>
              <div
                className="countdown-divider"
                style={{
                  alignSelf: "center",
                  fontSize: "1.25rem",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                :
              </div>
              <div
                className="countdown-item"
                style={{
                  textAlign: "center",
                  flex: "1",
                  minWidth: "50px",
                  padding: "5px 2px",
                }}
              >
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    margin: "0",
                    color: "white",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {countdown.hours}
                </div>
                <div
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.7rem",
                    color: "white",
                    opacity: "0.9",
                  }}
                >
                  HOURS
                </div>
              </div>
              <div
                className="countdown-divider"
                style={{
                  alignSelf: "center",
                  fontSize: "1.25rem",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                :
              </div>
              <div
                className="countdown-item"
                style={{
                  textAlign: "center",
                  flex: "1",
                  minWidth: "50px",
                  padding: "5px 2px",
                }}
              >
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    margin: "0",
                    color: "white",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {countdown.minutes}
                </div>
                <div
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.7rem",
                    color: "white",
                    opacity: "0.9",
                  }}
                >
                  MINS
                </div>
              </div>
              <div
                className="countdown-divider"
                style={{
                  alignSelf: "center",
                  fontSize: "1.25rem",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                :
              </div>
              <div
                className="countdown-item"
                style={{
                  textAlign: "center",
                  flex: "1",
                  minWidth: "50px",
                  padding: "5px 2px",
                }}
              >
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    margin: "0",
                    color: "white",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {countdown.seconds}
                </div>
                <div
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.7rem",
                    color: "white",
                    opacity: "0.9",
                  }}
                >
                  SECS
                </div>
              </div>
            </div>
          </StoryItem>
        </div>
      </div>
    </>
  );
};

export default Home;
