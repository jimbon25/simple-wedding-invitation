import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import StoryItem from "./StoryItem";
import ProgressiveImage from "./ProgressiveImage";
import { useLanguage } from "../utils/LanguageContext";

const Gallery: React.FC = () => {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  // const [showGallery, setShowGallery] = useState(false);

  // Using optimized image objects with dimension hints and thumbnails for progressive loading
  const allImages = [
    {
      src: "/images/gallery/g1.webp",
      thumbnailSrc: "/images/gallery/thumbnails/g1-thumb.webp",
      width: 800,
      height: 600,
    },
    {
      src: "/images/gallery/g2.webp",
      thumbnailSrc: "/images/gallery/thumbnails/g2-thumb.webp",
      width: 800,
      height: 600,
    },
    {
      src: "/images/gallery/g3.webp",
      thumbnailSrc: "/images/gallery/thumbnails/g3-thumb.webp",
      width: 800,
      height: 600,
    },
    {
      src: "/images/gallery/g4.webp",
      thumbnailSrc: "/images/gallery/thumbnails/g4-thumb.webp",
      width: 800,
      height: 600,
    },
    {
      src: "/images/gallery/g7.webp",
      thumbnailSrc: "/images/gallery/thumbnails/g7-thumb.webp",
      width: 800,
      height: 600,
    },
    {
      src: "/images/gallery/g8.webp",
      thumbnailSrc: "/images/gallery/thumbnails/g8-thumb.webp",
      width: 800,
      height: 600,
    },
    {
      src: "/images/gallery/g9.webp",
      thumbnailSrc: "/images/gallery/thumbnails/g9-thumb.webp",
      width: 800,
      height: 600,
    },
    {
      src: "/images/gallery/g10.webp",
      thumbnailSrc: "/images/gallery/thumbnails/g10-thumb.webp",
      width: 800,
      height: 600,
    },
  ];

  const midPoint = Math.ceil(allImages.length / 2);
  const imagesTop = allImages.slice(0, midPoint);
  const imagesBottom = allImages.slice(midPoint);

  // Preload top images once component mounts
  useEffect(() => {
    const preloadImages = () => {
      // Only preload first two images for faster
      imagesTop.slice(0, 2).forEach((image) => {
        const img = new Image();
        img.src = image.src;
      });
    };

    preloadImages();
  }, [imagesTop]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const finalSettings = {
    ...settings,
    slidesToShow: 4,
  };

  const handleImageClick = (imageIndex: number) => {
    setIndex(imageIndex);
    setOpen(true);
  };

  return (
    <div className="mb-5">
      <StoryItem>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="bi bi-images" style={{ fontSize: "2rem", color: "#9CAF88" }}></span>
          {t("gallery_title")}
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
        <p className="mb-4">{t("gallery_subtitle")}</p>
      </StoryItem>

      {/* Top Slider */}
      <StoryItem delay="0.4s">
        <Slider
          {...finalSettings}
          className="gallery-slider gallery-swipe-area"
        >
          {imagesTop.map((image, idx) => (
            <div
              key={idx}
              className="p-2"
              onClick={() => handleImageClick(idx)}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  borderRadius: "0.5rem",
                  background: "#eaeaea",
                }}
              >
                <ProgressiveImage
                  src={image.src}
                  placeholderSrc={image.thumbnailSrc}
                  alt={`Couple's moment ${idx + 1}`}
                  className="img-fluid rounded shadow-sm"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                  width={image.width}
                  height={image.height}
                />
              </div>
            </div>
          ))}
        </Slider>
      </StoryItem>

      {/* Bottom Slider */}
      <StoryItem delay="0.6s">
        <Slider
          {...finalSettings}
          className="gallery-slider gallery-swipe-area"
        >
          {imagesBottom.map((image, idx) => (
            <div
              key={idx}
              className="p-2"
              onClick={() => handleImageClick(midPoint + idx)}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  borderRadius: "0.5rem",
                  background: "#eaeaea",
                }}
              >
                <ProgressiveImage
                  src={image.src}
                  placeholderSrc={image.thumbnailSrc}
                  alt={`Couple's moment ${midPoint + idx + 1}`}
                  className="img-fluid rounded shadow-sm"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                  width={image.width}
                  height={image.height}
                />
              </div>
            </div>
          ))}
        </Slider>
      </StoryItem>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={allImages.map((img) => ({ src: img.src }))}
        index={index}
      />
    </div>
  );
};

export default Gallery;
