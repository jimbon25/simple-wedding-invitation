import React from "react";
import StoryItem from "./StoryItem";
import { useLanguage } from "../utils/LanguageContext";
import InViewTransition from "../utils/InViewTransition";

const HealthProtocol: React.FC = () => {
  const { language } = useLanguage();
  // Content based on language
  const content =
    language === "en"
      ? {
          title: "Health Protocol",
          intro:
            "Your safety and comfort are our top priorities. We kindly request all guests to adhere to the following health protocols during the event:",
          masks: "Mask Usage:",
          masksDesc:
            "Please wear masks at all times, especially in indoor areas.",
          sanitizer: "Hand Sanitization:",
          sanitizerDesc:
            "Hand sanitizers will be provided at various points. Please use them regularly.",
          distancing: "Social Distancing:",
          distancingDesc:
            "Maintain a safe distance from other guests when possible.",
          temperature: "Temperature Check:",
          temperatureDesc:
            "Temperature checks will be conducted upon arrival. Guests with temperatures above 37.5°C may be asked to rest or seek medical advice.",
          stayHome: "Stay Home If Unwell:",
          stayHomeDesc:
            "If you feel unwell or have symptoms of illness, please prioritize your health and stay home. Your health matters more.",
          thanks:
            "Thank you for your understanding and cooperation in making our special day safe and enjoyable for everyone.",
        }
      : {
          title: "Protokol Kesehatan",
          intro:
            "Keselamatan dan kenyamanan Anda adalah prioritas utama kami. Kami mohon semua tamu untuk mematuhi protokol kesehatan berikut selama acara:",
          masks: "Penggunaan Masker:",
          masksDesc:
            "Mohon kenakan masker setiap saat, terutama di area dalam ruangan.",
          sanitizer: "Sanitasi Tangan:",
          sanitizerDesc:
            "Pembersih tangan akan disediakan di berbagai titik. Mohon gunakan secara teratur.",
          distancing: "Jaga Jarak Sosial:",
          distancingDesc: "Jaga jarak aman dari tamu lain jika memungkinkan.",
          temperature: "Pengecekan Suhu:",
          temperatureDesc:
            "Pengecekan suhu akan dilakukan saat kedatangan. Tamu dengan suhu di atas 37.5°C mungkin diminta untuk beristirahat atau mencari saran medis.",
          stayHome: "Tetap di Rumah Jika Tidak Sehat:",
          stayHomeDesc:
            "Jika Anda merasa tidak sehat atau memiliki gejala sakit, mohon prioritaskan kesehatan Anda dan tetap di rumah. Kesehatan Anda lebih penting.",
          thanks:
            "Terima kasih atas pengertian dan kerja sama Anda dalam menjadikan hari istimewa kami aman dan menyenangkan bagi semua.",
        };

  return (
    <div>
      <StoryItem>
        <h2>
          <InViewTransition animationType="slide-down">
            {content.title}
          </InViewTransition>
        </h2>
      </StoryItem>
      <StoryItem delay="0.2s">
        <p>
          <InViewTransition animationType="slide-left">
            {content.intro}
          </InViewTransition>
        </p>
      </StoryItem>
      <StoryItem delay="0.4s">
        <InViewTransition animationType="fade">
          <ul>
            <li>
              <strong>{content.masks}</strong> {content.masksDesc}
            </li>
            <li>
              <strong>{content.sanitizer}</strong> {content.sanitizerDesc}
            </li>
            <li>
              <strong>{content.distancing}</strong> {content.distancingDesc}
            </li>
            <li>
              <strong>{content.temperature}</strong> {content.temperatureDesc}
            </li>
            <li>
              <strong>{content.stayHome}</strong> {content.stayHomeDesc}
            </li>
          </ul>
        </InViewTransition>
      </StoryItem>
      <StoryItem delay="0.6s">
        <p>
          <InViewTransition animationType="slide-up">
            {content.thanks}
          </InViewTransition>
        </p>
      </StoryItem>
    </div>
  );
};

export default HealthProtocol;
