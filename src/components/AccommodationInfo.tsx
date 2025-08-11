import React, { useState } from "react";
import StoryItem from "./StoryItem";
import { useLanguage } from "../utils/LanguageContext";
import { TransElement } from "../utils/TransitionComponents";

const AccommodationInfo: React.FC = () => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
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
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="bi bi-car-front-fill" style={{ fontSize: "2rem", color: "#9CAF88" }}></span>
          <TransElement animationType="slide-down">
            {language === "en"
              ? "Accommodation & Transportation"
              : "Akomodasi & Transportasi"}
          </TransElement>
        </h2>
        <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "16px 0 12px 0" }}>
          <hr style={{
            border: "none",
            height: "3px",
            width: "70%",
            maxWidth: "420px",
            background: "#7a8c6a",
            borderRadius: "2px",
            boxShadow: "0 2px 8px rgba(122,140,106,0.18)"
          }} />
        </div>
      </StoryItem>
      <StoryItem delay="0.2s">
        <p>
          <TransElement animationType="slide-left">
            {language === "en"
              ? "For our beloved guests traveling from out of town, here are some accommodation and transportation recommendations:"
              : "Untuk tamu-tamu tercinta kami yang bepergian dari luar kota, berikut adalah beberapa rekomendasi akomodasi dan transportasi:"}
          </TransElement>
        </p>
      </StoryItem>

      <StoryItem delay="0.4s">
        <h3>
          <TransElement animationType="slide-right">
            {language === "en"
              ? "Accommodation Recommendations:"
              : "Rekomendasi Akomodasi:"}
          </TransElement>
        </h3>
      </StoryItem>
      <StoryItem delay="0.6s">
        <ul>
          <li>
            <strong>Hotel A</strong>
            <br />
            <strong>Address:</strong> Jl. Soekarno - Hatta No.55, Jajar,
            Kepuhkembeng, Kec. Peterongan, Kabupaten Jombang, Jawa Timur 61481
            <br />
            <strong>Phone:</strong> 085607777009
            <button
              onClick={() => handleCopy("085607777009")}
              title="Copy nomor telfon"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginLeft: "6px",
                display: "inline-flex",
                alignItems: "center",
                verticalAlign: "middle",
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
            <br />
            <strong>Website:</strong>{" "}
            <span className="link-like">
              <a
                href="https://www.tripadvisor.co.id/Hotel_Review-g3561625-d12708910-Reviews-Green_Red_Hotel_Syariah_Jombang-Jombang_East_Java_Java.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                tripadvisor.co.id
              </a>
            </span>
            <br />
            <strong>Notes:</strong> Hotel syariah, dekat dengan venue
          </li>
          <li className="mt-3">
            <strong>Hotel B</strong>
            <br />
            <strong>Address:</strong> Jl. Soekarno - Hatta No.25, Nglungge,
            Keplaksari, Kec. Peterongan, Kabupaten Jombang, Jawa Timur 61481
            <br />
            <strong>Phone:</strong> (0321) 878800
            <button
              onClick={() => handleCopy("(0321) 878800")}
              title="Copy nomor telfon"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginLeft: "6px",
                display: "inline-flex",
                alignItems: "center",
                verticalAlign: "middle",
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
            <br />
            <strong>Website:</strong>{" "}
            <span className="link-like">
              <a
                href="https://www.traveloka.com/id-id/hotel/indonesia/hotel-yusro-jombang-family-hotel-restaurant--convention-9000000966369"
                target="_blank"
                rel="noopener noreferrer"
              >
                traveloka.com
              </a>
            </span>
            <br />
            <strong>Notes:</strong> Family hotel, restoran & convention, harga
            terjangkau
          </li>
        </ul>
      </StoryItem>

      <StoryItem delay="0.8s">
        <h3>
          <TransElement animationType="slide-left">
            {language === "en"
              ? "Transportation Guide:"
              : "Panduan Transportasi:"}
          </TransElement>
        </h3>
      </StoryItem>
      <StoryItem delay="1s">
        <p>
          <TransElement animationType="slide-right">
            {language === "en"
              ? "The wedding venue is easily accessible by various modes of transportation:"
              : "Lokasi pernikahan mudah dijangkau dengan berbagai jenis transportasi:"}
          </TransElement>
        </p>
      </StoryItem>
      <StoryItem delay="1.2s">
        <TransElement animationType="fade">
          <ul>
            <li>
              <strong>{language === "en" ? "By Car:" : "Dengan Mobil:"}</strong>{" "}
              {language === "en"
                ? "Plenty of parking is available at the event venue. You can use ride-hailing apps like Grab or Gojek."
                : "Tersedia banyak tempat parkir di lokasi acara. Anda bisa menggunakan aplikasi seperti Grab atau Gojek."}
            </li>
          </ul>
        </TransElement>
      </StoryItem>
    </div>
  );
};

export default AccommodationInfo;
