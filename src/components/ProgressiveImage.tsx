import React, { useState, useEffect } from "react";
import "./ProgressiveImage.css";

interface ProgressiveImageProps {
  src: string; // High-resolution main image URL
  placeholderSrc: string; // Low-resolution blurred thumbnail image URL
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  placeholderSrc,
  alt,
  className = "",
  width,
  height,
  style = {},
}) => {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state if src or placeholder changes
    setImgSrc(placeholderSrc || src);
    setImgLoaded(false);
    setIsLoading(true);

    // Preload high-resolution image
    const highResImage = new Image();
    highResImage.src = src;

    highResImage.onload = () => {
      // After hi-res image is loaded, switch src and mark as loaded
      setImgSrc(src);
      setImgLoaded(true);
      setIsLoading(false);
    };

    highResImage.onerror = () => {
      // If image fails to load, keep using the placeholder
      console.warn(`Failed to load image: ${src}`);
      setIsLoading(false);
    };

    // Cleanup
    return () => {
      highResImage.onload = null;
      highResImage.onerror = null;
    };
  }, [src, placeholderSrc]);

  return (
    <div
      className={`progressive-img-container ${className}`}
      style={{
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <img
        src={imgSrc}
        alt={alt}
        className={`progressive-img ${imgLoaded ? "loaded" : "loading"}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "filter 0.5s ease-out",
          filter: isLoading ? "blur(10px)" : "blur(0)",
        }}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default ProgressiveImage;
