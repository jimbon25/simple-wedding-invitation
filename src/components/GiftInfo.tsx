import React from "react";
import StoryItem from "./StoryItem";
import { Link } from "react-router-dom";
import { useLanguage } from "../utils/LanguageContext";
import InViewTransition from "../utils/InViewTransition";

const GiftInfo: React.FC = () => {
  const { language } = useLanguage();

  // Content based on language
  const content =
    language === "en"
      ? {
          title: "Gift Information",
          paragraph1:
            "Your presence on our special day is the greatest gift. However, if you wish to give a token of love, we greatly appreciate your support.",
          paragraph2:
            "For details about gift options, including monetary gift information, please visit our ",
          giftRegistry: "Gift Registry",
          page: " page.",
        }
      : {
          title: "Informasi Hadiah",
          paragraph1:
            "Kehadiran Anda di hari bahagia kami adalah hadiah terbesar. Namun, jika Anda berkeinginan untuk memberikan tanda kasih, kami sangat menghargai dukungan Anda.",
          paragraph2:
            "Untuk detail mengenai opsi hadiah, termasuk informasi hadiah moneter, silakan kunjungi halaman ",
          giftRegistry: "Daftar Hadiah",
          page: " kami.",
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
            {content.paragraph1}
          </InViewTransition>
        </p>
      </StoryItem>
      <StoryItem delay="0.4s">
        <p>
          <InViewTransition animationType="slide-right">
            {content.paragraph2}
            <Link to="/gift-registry">{content.giftRegistry}</Link>
            {content.page}
          </InViewTransition>
        </p>
      </StoryItem>
    </div>
  );
};

export default GiftInfo;
