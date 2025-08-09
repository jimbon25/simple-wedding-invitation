import React, { createContext, useState, useContext, ReactNode } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Translations object
const translations: Record<Language, Record<string, string>> = {
  id: {
    // App
    open_invitation: "Open Invitation",
    to_guest: "Kepada Yth. Bapak/Ibu/Saudara/i",
    wedding_of: "Pernikahan",
    wedding_invitation: "Undangan Pernikahan",
    join_celebration: "Bergabunglah bersama kami merayakan hari istimewa kami!",
    join_community: "Bergabunglah dengan komunitas kami",
    stay_connected: "Gabung untuk melihat daftar kehadiran & ucapan",
    countdown: "Hitung Mundur",
    days: "Hari",
    hours: "Jam",
    minutes: "Menit",
    seconds: "Detik",
    share_invitation: "Undangan Pernikahan",
    share_message: "Anda diundang ke pernikahan Dimas & Niken!",
    link_copied: "Tautan disalin ke clipboard!",
    loading_invitation: "Memuat undangan",
    loading_complete: "Selamat datang!",

    // Navbar
    home: "Beranda",
    our_story: "Kisah Kami",
    event_details: "Detail Acara",
    gallery: "Galeri",
    rsvp_guestbook: "RSVP & Buku Tamu",
    others: "Lainnya",
    gift_info: "Informasi Hadiah",
    accommodation_info: "Akomodasi & Transportasi",
    gift_registry: "Daftar Hadiah",
    language_demo: "Demo Transisi Bahasa",

    // Event Details
    date: "Tanggal",
    time: "Waktu",
    location: "Lokasi",
    add_to_calendar: "Tambahkan ke Kalender",
    our_location: "Lokasi Kami",

    // RSVP
    rsvp_title: "Konfirmasi Kehadiran",
    rsvp_message: "Mohon beritahu kami jika Anda bisa hadir!",
    your_name: "Nama Anda",
    will_you_attend: "Apakah Anda akan hadir",
    select_option: "Pilih opsi",
    yes_attend: "Ya, saya akan hadir",
    no_attend: "Tidak, saya tidak bisa hadir",
    guest_count: "Jumlah Tamu (termasuk Anda)",
    food_preference: "Preferensi Makanan",
    regular: "Reguler",
    vegetarian: "Vegetarian",
    gluten_free: "Bebas Gluten",
    send_confirmation: "Kirim Konfirmasi",
    sending: "Mengirim...",
    rsvp_success: "Konfirmasi kehadiran berhasil dikirim!",
    rsvp_error: "Gagal mengirim konfirmasi kehadiran.",

    // Guest Book
    guestbook_title: "Buku Tamu",
    guestbook_message:
      "Mohon tinggalkan harapan dan pesan Anda untuk Dimas & Niken!",
    your_message: "Pesan Anda",
    send_message: "Kirim Pesan",
    guestbook_success: "Pesan buku tamu berhasil dikirim!",
    guestbook_error: "Gagal mengirim pesan buku tamu.",

    // Gallery
    gallery_title: "Galeri",
    gallery_subtitle: "Kumpulan momen berharga kami.",
    view_gallery: "Lihat Galeri",
    hide_gallery: "Sembunyikan Galeri",
    all: "Semua",
    pre_wedding: "Pra-nikah",
    engagement: "Pertunangan",

    // AI Chat
    ask_assistant: "Tanya Asisten Undangan",
    typing: "Mengetik",
    write_question: "Tulis pertanyaan...",
    send: "Kirim",
    ai_intro:
      "Halo! Saya asisten AI untuk undangan Dimas & Niken. Siap bantu kamu seputar acara, lokasi, RSVP, hadiah, galeri, akomodasi, atau fitur undangan lainnya. Ojo sungkan2 takok mbak mas!",
    ai_error: "Terjadi kesalahan.",

    // Thank You Section
    thank_you_title: "Terima Kasih",
    thank_you_message:
      "Atas doa, kehadiran, dan perhatian yang diberikan. Semoga kebahagiaan dan keberkahan selalu menyertai kita semua.",

    // Back to Top Button
    back_to_top: "Kembali ke Atas",

    // Language
    language: "Bahasa",

    // External Link Dialog
    external_link: "Link Eksternal",
    external_link_warning: "Anda akan diarahkan ke situs eksternal. Lanjutkan?",
    cancel: "Batal",
    continue: "Lanjutkan",
  },

  en: {
    // App
    open_invitation: "Open Invitation",
    to_guest: "To Mr/Mrs/Ms",
    wedding_of: "The Wedding Of",
    wedding_invitation: "Wedding Invitation",
    join_celebration: "Join us to celebrate our special day!",
    join_community: "Join our community",
    stay_connected: "Join to see rsvp & guest",
    countdown: "Countdown",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    share_invitation: "Wedding Invitation",
    share_message: "You are invited to Dimas & Niken's wedding!",
    link_copied: "Link copied to clipboard!",
    loading_invitation: "Loading invitation",
    loading_complete: "Welcome!",

    // Navbar
    home: "Home",
    our_story: "Our Story",
    event_details: "Event Details",
    gallery: "Gallery",
    rsvp_guestbook: "RSVP & Guestbook",
    others: "Others",
    gift_info: "Gift Information",
    accommodation_info: "Accommodation & Transport",
    gift_registry: "Gift Registry",
    language_demo: "Language Transition Demo",

    // Event Details
    date: "Date",
    time: "Time",
    location: "Location",
    add_to_calendar: "Add to Calendar",
    our_location: "Our Location",

    // RSVP
    rsvp_title: "RSVP",
    rsvp_message: "Please let us know if you can attend!",
    your_name: "Your Name",
    will_you_attend: "Will you attend",
    select_option: "Select an option",
    yes_attend: "Yes, I will attend",
    no_attend: "No, I cannot attend",
    guest_count: "Number of Guests (including you)",
    food_preference: "Food Preference",
    regular: "Regular",
    vegetarian: "Vegetarian",
    gluten_free: "Gluten-Free",
    send_confirmation: "Send Confirmation",
    sending: "Sending...",
    rsvp_success: "RSVP confirmation sent successfully!",
    rsvp_error: "Failed to send RSVP confirmation.",

    // Guest Book
    guestbook_title: "Guestbook",
    guestbook_message:
      "Please leave your wishes and messages for Dimas & Niken!",
    your_message: "Your Message",
    send_message: "Send Message",
    guestbook_success: "Guestbook message sent successfully!",
    guestbook_error: "Failed to send guestbook message.",

    // Gallery
    gallery_title: "Gallery",
    gallery_subtitle: "Collection of our precious moments.",
    view_gallery: "View Gallery",
    hide_gallery: "Hide Gallery",
    all: "All",
    pre_wedding: "Pre-wedding",
    engagement: "Engagement",

    // AI Chat
    ask_assistant: "Ask Wedding Assistant",
    typing: "Typing",
    write_question: "Write your question...",
    send: "Send",
    ai_intro:
      "Hello! I am the AI assistant for Dimas & Niken's wedding. I can help you with information about the event, location, RSVP, gifts, gallery, accommodations, or other features of the invitation.",
    ai_error: "An error occurred.",

    // Thank You Section
    thank_you_title: "Thank You",
    thank_you_message:
      "For your prayers, presence, and attention. May happiness and blessings always be with us all.",

    // Back to Top Button
    back_to_top: "Back to Top",

    // Language
    language: "Language",

    // External Link Dialog
    external_link: "External Link",
    external_link_warning: "You're about to leave this site. Continue?",
    cancel: "Cancel",
    continue: "Continue",
  },
};

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  // Check if there's a saved language preference in localStorage
  const savedLanguage = localStorage.getItem("language");
  const [language, setLanguageState] = useState<Language>(
    savedLanguage === "en" || savedLanguage === "id" ? savedLanguage : "id",
  );

  // Function to set language and save to localStorage
  const setLanguage = (lang: Language) => {
    // Add fade-out effect to all elements with translation
    document.querySelectorAll(".lang-transition").forEach((el) => {
      el.classList.add("lang-fade-out");
    });

    // Change language after a small delay to allow fade-out animation
    setTimeout(() => {
      setLanguageState(lang);
      localStorage.setItem("language", lang);

      // Add fade-in effect after language change
      setTimeout(() => {
        document.querySelectorAll(".lang-transition").forEach((el) => {
          el.classList.remove("lang-fade-out");
          el.classList.add("lang-fade-in");
        });
      }, 50);
    }, 300);
  };

  // Translation function
  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
