import React from "react";
import StoryItem from "./StoryItem";
import { useLanguage } from "../utils/LanguageContext";
import { TransText } from "../utils/TransitionComponents";
import InViewTransition from "../utils/InViewTransition";

const EventDetails: React.FC = () => {
  // Removed 't' from destructuring
  const { language } = useLanguage();

  // Replace with your actual wedding date, time, location, and address
  const weddingDateText =
    language === "en" ? "Saturday, July 25, 2026" : "Sabtu, 25 Juli 2026";
  const weddingTimeText =
    language === "en" ? "10:00 AM - End" : "10:00 WIB - Selesai";
  const venueName = "Masjid Agung Baitul Mukminin ";
  const venueAddress =
    "Jl. KH. A. Dahlan No.28, Jombatan, Kec. Jombang, Kabupaten Jombang, Jawa Timur 61419";

  const googleMapsEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2156.5709343839785!2d112.23215068201172!3d-7.556604254007488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7840220123f1ad%3A0x937bb9770f73e064!2sMasjid%20Agung%20Baitul%20Mukminin%20Kabupaten%20Jombang!5e0!3m2!1sid!2sid!4v1753665752204!5m2!1sid!2sid";

  // Function to format date for ICS
  const formatDateToICS = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  const handleDownloadICS = () => {
    // Parse the date and time from the text strings
    const [day, monthName, year] = weddingDateText.split(", ")[1].split(" ");
    const monthMap: { [key: string]: number } = {
      Januari: 0,
      Februari: 1,
      Maret: 2,
      April: 3,
      Mei: 4,
      Juni: 5,
      Juli: 6,
      Agustus: 7,
      September: 8,
      Oktober: 9,
      November: 10,
      Desember: 11,
    };
    const month = monthMap[monthName];

    const [time, ampm] = weddingTimeText.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0; // Midnight

    const startDate = new Date(
      Number(year),
      month,
      Number(day),
      hours,
      minutes,
      0,
    );
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours for event duration

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invitation//NONSGML v1.0//EN",
      "BEGIN:VEVENT",
      `UID:${new Date().getTime()}@wedding.com`,
      `DTSTAMP:${formatDateToICS(new Date())}`,
      `DTSTART:${formatDateToICS(startDate)}`,
      `DTEND:${formatDateToICS(endDate)}`,
      `SUMMARY:Wedding of Dimas & Niken`,
      `LOCATION:${venueName}, ${venueAddress}`,
      "DESCRIPTION:Join us to celebrate the wedding of Dimas Luis Aditya and Niken Aristania Fitri!",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding_invitation.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <StoryItem>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            className="bi bi-calendar-event-fill"
            style={{ fontSize: "2rem", color: "#9CAF88" }}
          ></span>
          <InViewTransition animationType="slide-down">
            <TransText textKey="event_details" animationType="fade" />
          </InViewTransition>
        </h2>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            margin: "16px 0 12px 0",
          }}
        >
          <hr
            style={{
              border: "none",
              height: "3px",
              width: "70%",
              maxWidth: "420px",
              background: "#7a8c6a",
              borderRadius: "2px",
              boxShadow: "0 2px 8px rgba(122,140,106,0.18)",
            }}
          />
        </div>
      </StoryItem>

      <style>{`
        .event-details-container {
          margin-bottom: 20px;
        }
        .event-detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .event-detail-label {
          width: 80px;
          text-align: left;
        }
        .event-detail-separator {
          width: 20px;
          text-align: center;
        }
        .event-detail-content {
          flex: 1;
        }
        .event-detail-address {
          margin-left: 100px; /* 80px (label) + 20px (separator) */
        }
      `}</style>

      <div className="event-details-container">
        <StoryItem delay="0.2s">
          <div className="event-detail-row">
            <div className="event-detail-label">
              <InViewTransition animationType="slide-left">
                <TransText textKey="date" as="span" animationType="fade" />
              </InViewTransition>
            </div>
            <div className="event-detail-separator">:</div>
            <div className="event-detail-content">
              <InViewTransition animationType="slide-left">
                <strong>{weddingDateText}</strong>
              </InViewTransition>
            </div>
          </div>
        </StoryItem>

        <StoryItem delay="0.4s">
          <div className="event-detail-row">
            <div className="event-detail-label">
              <InViewTransition animationType="slide-right">
                <TransText textKey="time" as="span" animationType="fade" />
              </InViewTransition>
            </div>
            <div className="event-detail-separator">:</div>
            <div className="event-detail-content">
              <InViewTransition animationType="slide-right">
                <strong>{weddingTimeText}</strong>
              </InViewTransition>
            </div>
          </div>
        </StoryItem>

        <StoryItem delay="0.6s">
          <div className="event-detail-row">
            <div className="event-detail-label">
              <InViewTransition animationType="slide-left">
                <TransText textKey="location" as="span" animationType="fade" />
              </InViewTransition>
            </div>
            <div className="event-detail-separator">:</div>
            <div className="event-detail-content">
              <InViewTransition animationType="slide-left">
                <strong>{venueName}</strong>
              </InViewTransition>
            </div>
          </div>
        </StoryItem>

        <StoryItem delay="0.8s">
          <div className="event-detail-address">
            <InViewTransition animationType="fade">
              {venueAddress}
            </InViewTransition>
          </div>
        </StoryItem>
      </div>

      <StoryItem delay="1s">
        <div className="mt-4">
          <button className="btn btn-primary" onClick={handleDownloadICS}>
            <TransText
              textKey="add_to_calendar"
              animationType="slide-diagonal"
            />
          </button>
        </div>
      </StoryItem>

      <StoryItem delay="1.2s">
        <div className="mt-4">
          <h3>
            <TransText textKey="our_location" animationType="slide-down" />
          </h3>
          <div className="embed-responsive embed-responsive-16by9 event-map-wrapper">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 220 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Wedding Venue Location"
            ></iframe>
          </div>
          <style>{`
            .event-map-wrapper {
              height: 450px;
              border-radius: 16px;
              overflow: hidden;
              margin: 0 auto;
              max-width: 100%;
            }
            @media (max-width: 600px) {
              .event-map-wrapper {
                height: 320px;
                aspect-ratio: 1/1;
                min-height: 220px;
              }
            }
          `}</style>
        </div>
      </StoryItem>
      <StoryItem delay="1.4s">
        <p className="mt-2 text-muted"></p>
      </StoryItem>
    </div>
  );
};

export default EventDetails;
