import React from "react";
import ProgressiveImage from "./ProgressiveImage";
import { useLanguage } from "../utils/LanguageContext";

const bride = {
  name: "Niken Aristania Fitri",
  photo: "/images/g9.webp",
  thumbnail: "/images/thumbnails/g9-thumb.webp",
  bio: {
    en: "A cheerful soul with a love for books and travel. Ready to start a new chapter with Dimas.",
    id: "Penyuka buku dan petualangan, siap memulai babak baru bersama Dimas.",
  },
  parents: {
    en: "Daughter of Mr. Aris Supriyadi & Mrs. Fitriani",
    id: "Putri dari Bapak Aris Supriyadi & Ibu Fitriani",
  },
  instagram: "niken.aristania",
};

const groom = {
  name: "Dimas Luis Aditya",
  photo: "/images/g10.webp",
  thumbnail: "/images/thumbnails/g10-thumb.webp",
  bio: {
    en: "A passionate dreamer, music lover, and always up for new adventures with Niken.",
    id: "Pemimpi, pecinta musik, dan selalu siap berpetualang bersama Niken.",
  },
  parents: {
    en: "Son of Mr. Luis Adi & Mrs. Sulastri",
    id: "Putra dari Bapak Luis Adi & Ibu Sulastri",
  },
  instagram: "dimas.luisaditya",
};

const CoupleProfile: React.FC = () => {
  const { language } = useLanguage();
  return (
    <>
      <div
        className="couple-profile-section"
        style={{
          background: "rgba(154, 175, 136, 0.18)",
          backdropFilter: "blur(8px)",
          border: "none",
          borderRadius: "24px",
          boxShadow: "none",
          outline: "none",
          margin: 0,
          padding: "24px",
          transition: "background 0.3s",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#7A8C5A",
            }}
          >
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </span>
        </div>
        <div
          style={{
            textAlign: "center",
            marginBottom: "0.5rem",
            fontSize: "1.05rem",
            color: "#6c757d",
          }}
        >
          {language === "en"
            ? "Assalamu'alaikum Warahmatullahi Wabarakatuh"
            : "Assalamu'alaikum Warahmatullahi Wabarakatuh"}
        </div>
        <div
          style={{
            textAlign: "center",
            margin: "18px 0 8px 0",
            fontSize: "1.08rem",
            color: "#7A8C5A",
            fontWeight: 500,
          }}
        >
          {language === "en"
            ? "With prayers and gratitude to Allah SWT, we present our beloved son and daughter..."
            : "Dengan memohon rahmat dan ridho Allah SWT, kami mempersembahkan putra dan putri kami..."}
        </div>
        <div
          className="row g-4 mt-2 justify-content-center align-items-center"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Groom profile */}
          <div
            className="col-12 col-md-5 d-flex flex-column align-items-center justify-content-center"
            style={{ minHeight: "100%" }}
          >
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="couple-profile-anim"
              style={{ textAlign: "center", width: "100%" }}
            >
              <ProgressiveImage
                src={groom.photo}
                placeholderSrc={groom.thumbnail}
                alt={groom.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                  display: "block",
                  margin: "0 auto",
                }}
              />
              <h3
                className="profile-name-title"
                style={{ marginTop: "12px", fontWeight: 700 }}
              >
                {groom.name}
              </h3>
              <div
                style={{
                  fontSize: "0.98rem",
                  color: "#7A8C5A",
                  fontWeight: 500,
                  marginBottom: "2px",
                  textAlign: "center",
                }}
              >
                {groom.parents[language]}
              </div>
              <p
                className="profile-bio-text"
                style={{ textAlign: "center", marginBottom: 0 }}
              >
                {groom.bio[language]}
              </p>
              <a
                href={`https://instagram.com/${groom.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm mt-1 instagram-btn-custom"
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.92rem",
                  }}
                >
                  {/* Instagram SVG icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ verticalAlign: "middle" }}
                  >
                    <rect width="24" height="24" rx="6" fill="#9CAF88" />
                    <path
                      d="M16.5 7.5C16.7761 7.5 17 7.72386 17 8C17 8.27614 16.7761 8.5 16.5 8.5C16.2239 8.5 16 8.27614 16 8C16 7.72386 16.2239 7.5 16.5 7.5Z"
                      fill="white"
                    />
                    <path
                      d="M12 9.5C10.067 9.5 8.5 11.067 8.5 13C8.5 14.933 10.067 16.5 12 16.5C13.933 16.5 15.5 14.933 15.5 13C15.5 11.067 13.933 9.5 12 9.5ZM12 15.5C10.6193 15.5 9.5 14.3807 9.5 13C9.5 11.6193 10.6193 10.5 12 10.5C13.3807 10.5 14.5 11.6193 14.5 13C14.5 14.3807 13.3807 15.5 12 15.5Z"
                      fill="white"
                    />
                    <path
                      d="M17.5 8.5C17.5 8.22386 17.2761 8 17 8C16.7239 8 16.5 8.22386 16.5 8.5C16.5 8.77614 16.7239 9 17 9C17.2761 9 17.5 8.77614 17.5 8.5Z"
                      fill="white"
                    />
                    <path
                      d="M19 8.5C19 7.11929 17.8807 6 16.5 6H7.5C6.11929 6 5 7.11929 5 8.5V16.5C5 17.8807 6.11929 19 7.5 19H16.5C17.8807 19 19 17.8807 19 16.5V8.5ZM17.5 16.5C17.5 17.0523 17.0523 17.5 16.5 17.5H7.5C6.94772 17.5 6.5 17.0523 6.5 16.5V8.5C6.5 7.94772 6.94772 7.5 7.5 7.5H16.5C17.0523 7.5 17.5 7.94772 17.5 8.5V16.5Z"
                      fill="white"
                    />
                  </svg>
                  <span
                    className="instagram-text-custom"
                    style={{ fontSize: "0.92rem", padding: "0 2px" }}
                  >
                    Instagram
                  </span>
                </span>
              </a>
            </div>
          </div>
          {/* Heart icon */}
          <div
            className="col-12 col-md-2 d-flex justify-content-center align-items-center"
            style={{ minHeight: "100%" }}
          >
            <span
              className="bi bi-heart-fill section-icon-pulse"
              style={{ fontSize: "2.2rem", color: "#9CAF88" }}
            ></span>
          </div>
          {/* Bride profile */}
          <div
            className="col-12 col-md-5 d-flex flex-column align-items-center justify-content-center"
            style={{ minHeight: "100%" }}
          >
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="couple-profile-anim"
              style={{ textAlign: "center", width: "100%" }}
            >
              <ProgressiveImage
                src={bride.photo}
                placeholderSrc={bride.thumbnail}
                alt={bride.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                  display: "block",
                  margin: "0 auto",
                }}
              />
              <h3
                className="profile-name-title"
                style={{ marginTop: "12px", fontWeight: 700 }}
              >
                {bride.name}
              </h3>
              <div
                style={{
                  fontSize: "0.98rem",
                  color: "#7A8C5A",
                  fontWeight: 500,
                  marginBottom: "2px",
                  textAlign: "center",
                }}
              >
                {bride.parents[language]}
              </div>
              <p
                className="profile-bio-text"
                style={{ textAlign: "center", marginBottom: 0 }}
              >
                {bride.bio[language]}
              </p>
              <a
                href={`https://instagram.com/${bride.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm mt-1 instagram-btn-custom"
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {/* Instagram SVG icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="24" height="24" rx="6" fill="#9CAF88" />
                    <path
                      d="M16.5 7.5C16.7761 7.5 17 7.72386 17 8C17 8.27614 16.7761 8.5 16.5 8.5C16.2239 8.5 16 8.27614 16 8C16 7.72386 16.2239 7.5 16.5 7.5Z"
                      fill="white"
                    />
                    <path
                      d="M12 9.5C10.067 9.5 8.5 11.067 8.5 13C8.5 14.933 10.067 16.5 12 16.5C13.933 16.5 15.5 14.933 15.5 13C15.5 11.067 13.933 9.5 12 9.5ZM12 15.5C10.6193 15.5 9.5 14.3807 9.5 13C9.5 11.6193 10.6193 10.5 12 10.5C13.3807 10.5 14.5 11.6193 14.5 13C14.5 14.3807 13.3807 15.5 12 15.5Z"
                      fill="white"
                    />
                    <path
                      d="M17.5 8.5C17.5 8.22386 17.2761 8 17 8C16.7239 8 16.5 8.22386 16.5 8.5C16.5 8.77614 16.7239 9 17 9C17.2761 9 17.5 8.77614 17.5 8.5Z"
                      fill="white"
                    />
                    <path
                      d="M19 8.5C19 7.11929 17.8807 6 16.5 6H7.5C6.11929 6 5 7.11929 5 8.5V16.5C5 17.8807 6.11929 19 7.5 19H16.5C17.8807 19 19 17.8807 19 16.5V8.5ZM17.5 16.5C17.5 17.0523 17.0523 17.5 16.5 17.5H7.5C6.94772 17.5 6.5 17.0523 6.5 16.5V8.5C6.5 7.94772 6.94772 7.5 7.5 7.5H16.5C17.0523 7.5 17.5 7.94772 17.5 8.5V16.5Z"
                      fill="white"
                    />
                  </svg>
                  <span className="instagram-text-custom">Instagram</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <style>{`
  .couple-profile-section {
    background: rgba(154, 175, 136, 0.18); /* sage green soft, transparan */
    backdrop-filter: blur(8px);
    border: none !important;
    border-radius: 24px !important;
    box-shadow: none !important;
    outline: none !important;
    margin: 0 !important;
    padding: 24px !important;
    transition: background 0.3s;
  }
body.dark-mode .couple-profile-section {
  background: rgba(24, 32, 24, 0.82) !important; /* gelap transparan, tidak double */
}
.instagram-btn-custom .instagram-text-custom {
  font-weight: 400;
  font-size: 1rem;
  color: #6c757d;
}
body.dark-mode .instagram-btn-custom .instagram-text-custom {
  color: #f8f8f8;
  text-shadow: 0 1px 6px rgba(0,0,0,0.18);
}
.profile-section-title {
  color: #222;
}
body.dark-mode .profile-section-title {
  color: #f8f8f8;
  text-shadow: 0 2px 8px rgba(0,0,0,0.22);
}
.profile-name-title {
  color: #333;
}
body.dark-mode .profile-name-title {
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,0.18);
}
.profile-bio-text {
  color: #444;
}
body.dark-mode .profile-bio-text {
  color: #f2f2f2;
  text-shadow: 0 1px 6px rgba(0,0,0,0.18);
}
      `}</style>
    </>
  );
};

export default CoupleProfile;
