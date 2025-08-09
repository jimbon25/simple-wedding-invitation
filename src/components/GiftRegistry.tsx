import React, { useState } from "react";
import StoryItem from "./StoryItem";
import { useLanguage } from "../utils/LanguageContext";

const GiftRegistry: React.FC = () => {
  const { language } = useLanguage();
  // ...existing code...
  const [showSaweria, setShowSaweria] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("123456789");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      {/* Toast notification for copy to clipboard */}
      {copied && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: "32px",
            transform: "translateX(-50%)",
            background: "#556B2F",
            color: "#fff",
            padding: "6px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            fontSize: "0.92em",
            zIndex: 9999,
            animation: "fadeInOut 1.5s",
            border: "2px solid #556B2F",
          }}
        >
          {language === "en" ? "Copied!" : "Tersalin!"}
        </div>
      )}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      <StoryItem>
        <h2>{language === "en" ? "Gift Registry" : "Daftar Hadiah"}</h2>
      </StoryItem>
      <StoryItem delay="0.2s">
        <p>
          {language === "en"
            ? "Your presence at our wedding is the biggest gift. However, if you wish to give a gift, we have prepared some options:"
            : "Kehadiran Anda di pernikahan kami adalah hadiah terbesar. Namun, jika Anda ingin memberikan hadiah, kami telah menyiapkan beberapa opsi:"}
        </p>
      </StoryItem>

      <StoryItem delay="0.4s">
        <h3>{language === "en" ? "Monetary Gifts:" : "Hadiah Moneter:"}</h3>
      </StoryItem>
      {/* ...existing code... */}
      <StoryItem delay="0.6s">
        <p>
          {language === "en"
            ? "Monetary gifts will be greatly appreciated as we start our new life together. You can send gifts via bank transfer:"
            : "Hadiah moneter akan sangat kami hargai saat kami memulai kehidupan baru bersama. Anda dapat mengirimkan hadiah melalui transfer bank:"}
        </p>
      </StoryItem>
      <StoryItem delay="0.8s">
        <ul className="gift-list" style={{ paddingLeft: "18px" }}>
          <li>
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              <strong>Saweria:</strong>
              <button
                style={{
                  background: "none",
                  border: "2px solid #556B2F",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.98em",
                  color: "#556B2F",
                  outline: "none",
                  marginLeft: "8px",
                  marginBottom: "2px",
                  verticalAlign: "middle",
                }}
                onClick={() => setShowSaweria((v) => !v)}
                aria-expanded={showSaweria}
                aria-controls="saweria-barcode"
              >
                {showSaweria ? (
                  language === "en" ? (
                    "Close Saweria Barcode"
                  ) : (
                    "Tutup Barcode Saweria"
                  )
                ) : (
                  <span
                    style={{
                      fontSize: "0.92em",
                      color: "#556B2F",
                      fontWeight: "bold",
                    }}
                  >
                    {language === "en"
                      ? "Click for barcode"
                      : "Klik untuk barcode"}
                  </span>
                )}
              </button>
            </div>
            {showSaweria && (
              <div
                id="saweria-barcode"
                style={{ marginTop: "10px", textAlign: "left" }}
              >
                <img
                  src="/images/saweria.png"
                  alt="Barcode Saweria"
                  loading="lazy"
                  style={{
                    maxWidth: "180px",
                    width: "100%",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <div
                  style={{
                    fontSize: "0.85em",
                    color: "#555",
                    marginTop: "4px",
                  }}
                >
                  {language === "en"
                    ? "Scan Saweria barcode"
                    : "Scan barcode Saweria"}
                </div>
              </div>
            )}
          </li>
          <li>
            <strong>Nama Bank:</strong> BCA
          </li>
          <li>
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              <strong>Nomor Rekening:</strong>
              <span
                className="rekening-number"
                style={{ marginLeft: "6px", marginRight: "6px" }}
              >
                123456789
              </span>
              <button
                onClick={handleCopy}
                title="Copy nomor rekening"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  marginLeft: "2px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2d7cff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </li>
          <li>
            <strong>Atas Nama:</strong> Dimas Luis Aditya & Niken Aristania
            Fitri
          </li>
        </ul>
      </StoryItem>
    </div>
  );
};

export default GiftRegistry;
