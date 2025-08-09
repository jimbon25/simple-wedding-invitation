import React, { useState, useEffect, lazy, Suspense } from "react";
import ToastNotification from "./ToastNotification";
import StoryItem from "./StoryItem";
import { SecurityUtils } from "../utils/security";
import { useLanguage } from "../utils/LanguageContext";
import { getApiEndpoint } from "../utils/apiUtils";
import { TransText } from "../utils/TransitionComponents";

// Lazy load ReCAPTCHA to improve initial load time
const ReCAPTCHA = lazy(() => import("react-google-recaptcha"));
const RSVPForm: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const [attendance, setAttendance] = useState("");
  const [guests, setGuests] = useState<number>(0);
  const [foodPreference, setFoodPreference] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  // State for validation errors
  const [nameError, setNameError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");
  const [guestsError, setGuestsError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot anti-bot
    const form = e.target as HTMLFormElement;
    if (form.website && form.website.value) {
      setSubmitStatus("error");
      setShowToast(true);
      setToastMsg("Permintaan tidak valid.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    setNameError("");
    setAttendanceError("");
    setGuestsError("");
    setCaptchaError("");

    let isValid = true;

    // Enhanced validation using SecurityUtils
    const nameValidation = SecurityUtils.validateName(name);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || "Nama tidak valid.");
      isValid = false;
    }

    // Client-side rate limiting check
    if (!SecurityUtils.checkRateLimit("rsvp_form", 3, 10 * 60 * 1000)) {
      setNameError(
        "Terlalu banyak percobaan. Silakan coba lagi dalam 10 menit.",
      );
      isValid = false;
    }

    if (!attendance) {
      setAttendanceError("Mohon pilih opsi kehadiran.");
      isValid = false;
    }

    if (attendance === "Yes, I will attend" && (guests <= 0 || isNaN(guests))) {
      setGuestsError("Jumlah tamu harus lebih dari 0.");
      isValid = false;
    }

    if (!captchaToken) {
      setCaptchaError("Mohon verifikasi captcha.");
      isValid = false;
    }

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    const payload = {
      type: "rsvp",
      name: name.trim(),
      attendance: attendance === "Yes, I will attend" ? "Hadir" : "Tidak Hadir",
      guests,
      foodPreference,
      message: message.trim(),
      token: captchaToken, // use the 'token' field for consistency with the backend
    };

    // Get appropriate API endpoint based on environment
    const endpoint = getApiEndpoint("send-notification");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          platform: "all",
        }),
      });

      if (response.ok) {
        setMessage(
          language === "en"
            ? "Thank you for your attendance confirmation! Your response has been recorded."
            : "Terima kasih atas konfirmasi kehadiran Anda! Tanggapan Anda telah tercatat.",
        );
        setSubmitStatus("success");
        setShowToast(true);
        setToastMsg(t("rsvp_success"));
        setName("");
        setAttendance("");
        setGuests(0);
        setFoodPreference("");
        setCaptchaToken(null);
      } else if (response.status === 429) {
        setMessage(
          language === "en"
            ? "Too many requests. Please try again later."
            : "Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi.",
        );
        setSubmitStatus("error");
        setShowToast(true);
        setToastMsg(
          language === "en"
            ? "Too many requests, try again later."
            : "Terlalu banyak permintaan, coba lagi nanti.",
        );
      } else {
        setMessage(
          language === "en"
            ? "An error occurred while sending your attendance confirmation. Please try again."
            : "Terjadi kesalahan saat mengirim konfirmasi kehadiran Anda. Mohon coba lagi.",
        );
        setSubmitStatus("error");
        setShowToast(true);
        setToastMsg(t("rsvp_error"));
        console.error(
          "Discord Webhook Error:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      setMessage(
        language === "en"
          ? "An error occurred while sending your attendance confirmation. Please check your internet connection."
          : "Terjadi kesalahan saat mengirim konfirmasi kehadiran Anda. Mohon periksa koneksi internet Anda.",
      );
      setSubmitStatus("error");
      setShowToast(true);
      setToastMsg(t("rsvp_error"));
      console.error("Network or other error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limit submit spam: disable the submit button for 3 seconds after submission
  useEffect(() => {
    let timer1: NodeJS.Timeout | undefined;
    let timer2: NodeJS.Timeout | undefined;
    if (submitStatus) {
      timer1 = setTimeout(() => setSubmitStatus(null), 3000);
    }
    if (showToast) {
      timer2 = setTimeout(() => setShowToast(false), 3000);
    }
    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [submitStatus, showToast]);

  return (
    <div style={{ position: "relative" }}>
      <ToastNotification show={showToast} message={toastMsg} />
      <StoryItem>
        <h2>
          <TransText textKey="rsvp_title" animationType="slide-down" />
        </h2>
      </StoryItem>
      <StoryItem delay="0.2s">
        <p>
          <TransText textKey="rsvp_message" animationType="slide-left" />
        </p>
      </StoryItem>
      <StoryItem delay="0.4s">
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Honeypot field for anti-bot */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            style={{ display: "none" }}
            aria-hidden="true"
          />
          <div className="mb-3">
            <label
              htmlFor="name"
              className="form-label"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <TransText textKey="your_name" animationType="fade" as="span" />
              <span>:</span>
            </label>
            <input
              type="text"
              className={`form-control ${nameError ? "is-invalid" : ""}`}
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputMode="text"
              autoComplete="name"
              maxLength={50}
              style={{ fontSize: "1.1rem", padding: "0.75rem 1rem" }}
            />
            {nameError && <div className="invalid-feedback">{nameError}</div>}
          </div>
          <div className="mb-3">
            <label
              htmlFor="attendance"
              className="form-label"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <TransText
                textKey="will_you_attend"
                animationType="fade"
                as="span"
              />
              <span>?</span>
            </label>
            <select
              className={`form-select ${attendanceError ? "is-invalid" : ""}`}
              id="attendance"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
            >
              <option value="">
                <TransText textKey="select_option" animationType="fade" />
              </option>
              <option value="Yes, I will attend">
                <TransText textKey="yes_attend" animationType="fade" />
              </option>
              <option value="No, I cannot attend">
                <TransText textKey="no_attend" animationType="fade" />
              </option>
            </select>
            {attendanceError && (
              <div className="invalid-feedback">{attendanceError}</div>
            )}
          </div>
          {attendance === "Yes, I will attend" && (
            <>
              <div className="mb-3">
                <label
                  htmlFor="guests"
                  className="form-label"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <TransText
                    textKey="guest_count"
                    animationType="fade"
                    as="span"
                  />
                  <span>:</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${guestsError ? "is-invalid" : ""}`}
                  id="guests"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                  min="0"
                  inputMode="numeric"
                  autoComplete="off"
                  style={{ fontSize: "1.1rem", padding: "0.75rem 1rem" }}
                />
                {guestsError && (
                  <div className="invalid-feedback">{guestsError}</div>
                )}
              </div>
              <div className="mb-3">
                <label
                  htmlFor="foodPreference"
                  className="form-label"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <TransText
                    textKey="food_preference"
                    animationType="fade"
                    as="span"
                  />
                  <span>:</span>
                </label>
                <select
                  className="form-select"
                  id="foodPreference"
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                >
                  <option value="">
                    <TransText textKey="select_option" animationType="fade" />
                  </option>
                  <option value="Regular">
                    <TransText textKey="regular" animationType="fade" />
                  </option>
                  <option value="Vegetarian">
                    <TransText textKey="vegetarian" animationType="fade" />
                  </option>
                  <option value="Gluten-Free">
                    <TransText textKey="gluten_free" animationType="fade" />
                  </option>
                </select>
              </div>
            </>
          )}
          <div className="mb-3">
            <Suspense
              fallback={
                <div
                  className="d-flex align-items-center justify-content-center p-3 bg-light rounded"
                  style={{ height: "78px", width: "302px" }}
                >
                  <div
                    className="spinner-border spinner-border-sm text-secondary me-2"
                    role="status"
                  ></div>
                  <span>Loading reCAPTCHA...</span>
                </div>
              }
            >
              <ReCAPTCHA
                sitekey={
                  process.env.REACT_APP_RECAPTCHA_SITE_KEY ||
                  "your_recaptcha_site_key"
                }
                onChange={(token) => {
                  setCaptchaToken(token);
                  setCaptchaError("");
                }}
                asyncScriptOnLoad={() => console.log("reCAPTCHA loaded")}
              />
            </Suspense>
            {captchaError && (
              <div className="text-danger mt-2">{captchaError}</div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || submitStatus === "success"}
            style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
          >
            <TransText
              textKey={isSubmitting ? "sending" : "send_confirmation"}
              animationType="slide-diagonal"
            />
          </button>
        </form>
      </StoryItem>
      {message && (
        <StoryItem delay="0.6s">
          <div
            className={`mt-3 alert ${submitStatus === "success" ? "alert-success" : "alert-danger"}`}
          >
            {message}
          </div>
        </StoryItem>
      )}
    </div>
  );
};

export default RSVPForm;
