import React, { useState, useEffect } from "react";
import { useLanguage } from "../utils/LanguageContext";
import "./LoadingScreen.css";

interface LoadingScreenProps {
  onLoadComplete?: () => void;
  minDisplayTime?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onLoadComplete,
  minDisplayTime = 3000, // Minimum display time in ms
}) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame: number;
    let progressInterval: NodeJS.Timeout;
    let maxTimeoutId: NodeJS.Timeout;

    // Pre-load critical assets
    const preloadAssets = async () => {
      // Preload critical images
      const criticalImages = [
        "/cover.gif",
        "/navbar-gif.gif",
        "/images/background.webp",
        "/images/gallery/g1.webp",
        "/images/gallery/g2.webp",
        "/images/gallery/g3.webp",
      ];

      const imagePromises = criticalImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Use resolve instead of reject to continue even if some assets fail
          img.src = src;
        });
      });

      // Preload audio
      const audioPromises = ["/music/wedding-music.mp3"].map((src) => {
        return new Promise((resolve) => {
          const audio = new Audio();
          audio.oncanplaythrough = resolve;
          audio.onerror = resolve; // Use resolve instead of reject
          audio.src = src;

          // Add a timeout to resolve anyway after 3 seconds
          setTimeout(resolve, 3000);
        });
      });

      try {
        await Promise.allSettled([...imagePromises, ...audioPromises]);
        console.log("Critical assets preloaded");
      } catch (err) {
        console.warn("Some assets failed to preload", err);
      }
    };

    // Start preloading assets
    preloadAssets();

    // Simulate loading progress with progressive increments
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99; // Stay at 99 until ready to finish

        // Accelerate as it approaches 100%
        const increment =
          prev < 50 ? 2.5 : prev < 80 ? 1.2 : prev < 95 ? 0.4 : 0.2;
        const nextProgress = Math.min(prev + increment, 99);
        return nextProgress;
      });
    }, 100);

    // Function to detect when all assets are loaded
    const checkAllAssetsLoaded = () => {
      try {
        // Only check visible assets
        const allImages = document.querySelectorAll("img");
        const allVideos = document.querySelectorAll("video");
        let totalAssets = 0;
        let loadedAssets = 0;

        // Count loaded assets, only those visible
        allImages.forEach((img) => {
          const rect = img.getBoundingClientRect();
          // Check if element is in or near the viewport
          if (rect.top < window.innerHeight * 2) {
            totalAssets++;
            if (img.complete) loadedAssets++;
          }
        });

        allVideos.forEach((video) => {
          const rect = video.getBoundingClientRect();
          if (rect.top < window.innerHeight * 2) {
            totalAssets++;
            if (video.readyState >= 2) loadedAssets++; // Lowered readyState threshold
          }
        });

        // Calculate actual progress, default to 100%
        const actualProgress =
          totalAssets > 0 ? (loadedAssets / totalAssets) * 100 : 100;

        console.log(
          `Loading progress: ${Math.floor(actualProgress)}% (${loadedAssets}/${totalAssets} assets)`,
        );

        // If all assets are loaded OR waited long enough
        const elapsedTime = Date.now() - startTime;
        if (actualProgress >= 100 || elapsedTime >= 8000) {
          // 8 seconds max waiting time
          // Ensure minimum display time is met
          if (elapsedTime >= minDisplayTime) {
            setProgress(100);
            setTimeout(() => {
              setIsComplete(true);
              if (onLoadComplete) onLoadComplete();
            }, 500);
            clearInterval(progressInterval);
            cancelAnimationFrame(animationFrame);
            clearTimeout(maxTimeoutId);
          } else {
            // Wait until minimum time is reached
            setTimeout(() => {
              setProgress(100);
              setTimeout(() => {
                setIsComplete(true);
                if (onLoadComplete) onLoadComplete();
              }, 500);
              clearInterval(progressInterval);
              cancelAnimationFrame(animationFrame);
              clearTimeout(maxTimeoutId);
            }, minDisplayTime - elapsedTime);
          }
        } else {
          animationFrame = requestAnimationFrame(checkAllAssetsLoaded);
        }
      } catch (error) {
        console.error("Error checking assets:", error);
        // If an error occurs, finish loading
        setProgress(100);
        setTimeout(() => {
          setIsComplete(true);
          if (onLoadComplete) onLoadComplete();
        }, 500);
      }
    };

    // Start checking after minimum time
    setTimeout(checkAllAssetsLoaded, 500);

    // Set maximum timeout to avoid stuck loading
    maxTimeoutId = setTimeout(() => {
      console.log("Maximum loading time reached, finishing...");
      setProgress(100);
      setTimeout(() => {
        setIsComplete(true);
        if (onLoadComplete) onLoadComplete();
      }, 500);
      clearInterval(progressInterval);
      cancelAnimationFrame(animationFrame);
    }, 10000); // Maximum 10 seconds for loading

    return () => {
      clearInterval(progressInterval);
      cancelAnimationFrame(animationFrame);
      clearTimeout(maxTimeoutId);
    };
  }, [minDisplayTime, onLoadComplete]);

  return (
    <div className={`loading-screen ${isComplete ? "fade-out" : ""}`}>
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2 className="loading-title">D & N</h2>

        {/* Animasi heart loading */}
        <div className="loading-heart">
          <div className="heart"></div>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        <p className="loading-text">
          {progress >= 100
            ? t("loading_complete") || "Selamat datang!"
            : `${t("loading_invitation")} ${Math.floor(progress)}%`}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
