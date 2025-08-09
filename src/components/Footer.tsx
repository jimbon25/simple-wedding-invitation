import React from "react";

const Footer: React.FC = () => {
  return (
    <>
      <div
        style={{
          position: "relative",
          top: 0,
          left: 0,
          width: "100%",
          marginBottom: "-2px",
          zIndex: 1,
        }}
      >
        {/* Wave SVG */}
        <svg
          viewBox="0 0 1440 120"
          width="100%"
          height="80"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <path
            fill="#9CAF88"
            fillOpacity="0.45"
            d="M0,32 C360,120 1080,0 1440,80 L1440,120 L0,120 Z"
          ></path>
          <path
            fill="#9CAF88"
            fillOpacity="0.7"
            d="M0,64 C480,0 960,160 1440,32 L1440,120 L0,120 Z"
          ></path>
        </svg>
        {/* Top left leaf ornament */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 40C8 24 24 8 40 8C40 24 24 40 8 40Z"
            fill="#9CAF88"
            fillOpacity="0.7"
          />
          <path
            d="M16 32C16 22 22 16 32 16C32 22 22 32 16 32Z"
            fill="#E6EAE3"
            fillOpacity="0.7"
          />
        </svg>
        {/* Top right leaf ornament */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 2,
            transform: "scaleX(-1)",
          }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 40C8 24 24 8 40 8C40 24 24 40 8 40Z"
            fill="#9CAF88"
            fillOpacity="0.7"
          />
          <path
            d="M16 32C16 22 22 16 32 16C32 22 22 32 16 32Z"
            fill="#E6EAE3"
            fillOpacity="0.7"
          />
        </svg>
      </div>
      <footer
        className="text-center text-lg-start mt-0"
        style={{
          background: "linear-gradient(135deg, #E6EAE3 0%, #9CAF88 100%)",
          borderTop: "none",
          boxShadow: "0 -2px 16px rgba(156,175,136,0.10)",
        }}
      >
        <div className="container p-4">
          <div className="text-center">
            {/* Social Media Icons */}
            <div className="social-icons mb-3">
              <a
                href="https://www.instagram.com/dimasladty"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-2"
              >
                <i className="bi bi-instagram" style={{ color: "#9CAF88" }}></i>
              </a>
              <a
                href="https://www.facebook.com/iv.dimas"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-2"
              >
                <i className="bi bi-facebook" style={{ color: "#9CAF88" }}></i>
              </a>
            </div>
            <p
              className="text-muted mb-0"
              style={{
                fontSize: "0.82rem",
                color: "var(--light-text-color)",
                fontFamily: "Playfair Display, serif",
                fontWeight: 500,
              }}
            >
              &copy; {new Date().getFullYear()} Dimas & Niken Wedding.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
