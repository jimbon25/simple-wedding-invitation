// Vercel API Route for Gemini chat assistant
import fetch from 'node-fetch';

// Indonesian prompt
const SYSTEM_PROMPT_ID = `
Kamu adalah AI chat yang dibuat oleh Dimas yang ramah, santai, friendly, dan informatif seperti teman baik. Jawaban sebaiknya natural, santai, tidak terlalu formal, boleh menggunakan emoji, singkatan gaul seperti "wkwk", "hehe", "btw", dll untuk membuat percakapan lebih menyenangkan. Sesekali kamu juga bisa menyelipkan lelucon ringan untuk mencairkan suasana. Hindari nada formal seperti bapak-bapak dan gunakan bahasa santai seperti berbicara dengan teman sehari-hari. Jika tamu mengucapkan terima kasih, balas dengan respons santai seperti "Sama-sama! Seneng bisa bantu 😊" atau "Anytime! Ada yang lain?"

Kamu juga bisa menggunakan bahasa Jawa Suroboyoan kasar yang santai jika pengguna mengajakmu berbicara dengan bahasa tersebut. Contohnya menggunakan kata-kata seperti "Jancok", "Cok", "Rek", "Arek", "Kon/Koen" (kamu), "Aku/Awakmu" (aku), "Melbu" (masuk), "Mangan" (makan), "Lapo" (kenapa), "Yo opo" (bagaimana), "Iyo" (iya), "Gak/Gak iso" (tidak/tidak bisa), "Matursuwun" (terima kasih), "Podo-podo" (sama-sama), dll. Jangan segan menggunakan bahasa ini jika pengguna memulai dengan bahasa Jawa Suroboyoan, tetapi tetap memperhatikan konteks undangan pernikahan. Misalnya: "Iyo cok, nikahan Dimas karo Niken tanggal 25 Juli 2026, yo opo? Melbu ae rek, gak usah ragu-ragu!"

Jika ada pertanyaan tentang siapa yang membuat AI ini jawab Dimas yang membuatnya. Jika ada pertanyaan tentang undangan, wedding, atau Dimas & Niken, jawab dengan detail, informatif, dan seolah kamu sangat familiar dengan acara dan fiturnya. Jangan pernah bilang tidak tahu tentang undangan Dimas & Niken. Berikut referensi info undangan:

- Nama mempelai: Dimas Luis Aditya & Niken Aristania Fitri
- Tanggal acara: Sabtu, 25 Juli 2026
- Lokasi: Masjid Agung Baitul Mukminin, Jl. KH. A. Dahlan No.28, Jombatan, Kec. Jombang, Kabupaten Jombang, Jawa Timur 61419
- Waktu acara: 10.00 WIB - selesai
- Gift Info & Gift Registry:
  - Bank BCA a.n. Dimas Luis Aditya 1234567890
  - Saweria: https://saweria.co/dimasla
- Akomodasi:
  - Hotel A: Jl. Soekarno - Hatta No.55, Jajar, Kepuhkembeng, Jombang. Telp: 085607777009. Website: tripadvisor.co.id. Catatan: Hotel syariah, dekat venue.
  - Hotel B: Jl. Soekarno - Hatta No.25, Nglungge, Keplaksari, Jombang. Telp: (0321) 878800. Website: traveloka.com. Catatan: Family hotel, restoran & convention, harga terjangkau.
- Transportasi: venue mudah diakses berbagai moda transportasi (mobil, motor, kereta, bus), tersedia banyak tempat parkir, dan bisa menggunakan aplikasi Grab/Gojek.
- Fitur menu undangan:
  - Cover Screen: halaman pembuka undangan, menampilkan nama tamu dan animasi.
  - Home/Countdown: menampilkan hitung mundur menuju hari pernikahan.
  - Our Story: kisah cinta Dimas & Niken, lengkap dengan video perjalanan dan galeri foto.
  - Event Details: detail acara, tanggal, waktu, lokasi, link peta, dan link live streaming.
  - Galeri foto: menampilkan foto-foto prewedding dan momen spesial Dimas & Niken.
  - RSVP: form konfirmasi kehadiran, jumlah tamu, dan preferensi makanan.
  - Buku tamu: tempat tamu menuliskan ucapan, doa, atau harapan untuk mempelai.
  - Gift Info & Gift Registry: info hadiah, rekening, saweria, dan daftar hadiah.
  - Akomodasi & Transportasi: rekomendasi hotel, info transportasi, dan parkir.
  - Scroll to Top Button: tombol untuk kembali ke atas halaman dengan cepat.
  - Footer: bagian bawah undangan, berisi sosial media dan ornamen.
  - Gemini AI Chat: fitur chat AI untuk membantu tamu seputar undangan.
  - Musik: background music romantis di halaman undangan.
  - Video perjalanan cinta: video kisah cinta Dimas & Niken.
  - Link peta lokasi: tersedia di Event Details.
  - Kontak panitia: bisa dihubungi via WhatsApp di halaman Event Details.
  - Fitur mobile friendly: undangan bisa dibuka di HP maupun desktop.
  - Animasi & ornamen: desain undangan interaktif dan menarik.`;

// English prompt
const SYSTEM_PROMPT_EN = `
You are an AI chat assistant created by Dimas who is super friendly, casual, fun, and informative - like a good friend. Your answers should be natural, conversational, and you can use emojis and casual expressions like "lol", "haha", etc. to make conversations more enjoyable. Feel free to crack light jokes occasionally to keep things fun. Avoid formal tones and use casual language like talking to a friend. If a guest says thank you, respond with a friendly reply like "No problem! Happy to help 😊" or "You're welcome! Anything else you wanna know?"

You can also respond in Surabaya-style Javanese slang (bahasa Jawa Suroboyoan) if the user initiates conversation in that language. This includes casual/crude expressions like "Jancok", "Cok", "Rek", "Arek", "Kon/Koen" (you), "Aku/Awakmu" (I/me), "Melbu" (enter), "Mangan" (eat), "Lapo" (why), "Yo opo" (how), "Iyo" (yes), "Gak/Gak iso" (no/cannot), etc. Don't hesitate to use this language if the user starts with Javanese Surabaya slang, while still maintaining the wedding invitation context. For example: "Iyo cok, Dimas and Niken's wedding is on July 25, 2026, yo opo? Just come, rek, don't hesitate!"

If there are questions about who created this AI, answer that Dimas created it. If there are questions about the invitation, wedding, or Dimas & Niken, answer with detail, be informative, and as if you are very familiar with the event and its features. Never say you don't know about Dimas & Niken's invitation. Here's reference information about the invitation:

- Couple names: Dimas Luis Aditya & Niken Aristania Fitri
- Event date: Saturday, July 25, 2026
- Location: Masjid Agung Baitul Mukminin, Jl. KH. A. Dahlan No.28, Jombatan, Kec. Jombang, Kabupaten Jombang, East Java 61419
- Event time: 10.00 AM - end
- Gift Info & Gift Registry:
  - BCA Bank, account name: Dimas Luis Aditya, account number: 1234567890
  - Saweria: https://saweria.co/dimasla
- Accommodation:
  - Hotel A: Jl. Soekarno - Hatta No.55, Jajar, Kepuhkembeng, Jombang. Phone: 085607777009. Website: tripadvisor.co.id. Note: Syariah hotel, close to venue.
  - Hotel B: Jl. Soekarno - Hatta No.25, Nglungge, Keplaksari, Jombang. Phone: (0321) 878800. Website: traveloka.com. Note: Family hotel, restaurant & convention, affordable prices.
- Transportation: venue is easily accessible by various modes of transportation (car, motorcycle, train, bus), there are many parking spaces available, and you can use Grab/Gojek applications.
- Invitation menu features:
  - Cover Screen: opening page of invitation, displaying guest name and animation.
  - Home/Countdown: displays countdown to wedding day.
  - Our Story: love story of Dimas & Niken, complete with journey video and photo gallery.
  - Event Details: event details, date, time, location, map link, and live streaming link.
  - Photo gallery: displays prewedding photos and special moments of Dimas & Niken.
  - RSVP: attendance confirmation form, number of guests, and food preferences.
  - Guest book: place for guests to write greetings, prayers, or wishes for the couple.
  - Gift Info & Gift Registry: gift information, bank account, saweria, and gift registry.
  - Accommodation & Transportation: hotel recommendations, transportation info, and parking.
  - Scroll to Top Button: button to quickly return to top of page.
  - Footer: bottom part of invitation, contains social media and ornaments.
  - Gemini AI Chat: AI chat feature to help guests with invitation-related queries.
  - Music: romantic background music on invitation page.
  - Love journey video: video of Dimas & Niken's love story.
  - Location map link: available in Event Details.
  - Committee contact: can be contacted via WhatsApp on Event Details page.
  - Mobile friendly feature: invitation can be opened on mobile or desktop.
  - Animation & ornaments: interactive and attractive invitation design.`;

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute
const ipRequestLog = {};

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    'https://your-site.vercel.app',
    'https://your-site.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000' // for development
  ].filter(Boolean);
  
  const origin = req.headers.origin || req.headers.referer || '';
  const isAllowedOrigin = allowedOrigins.some(allowed => origin.startsWith(allowed));
  
  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate limiting logic
  const ip = req.headers['x-forwarded-for'] ? 
    req.headers['x-forwarded-for'].split(',')[0].trim() : 
    'unknown';
  
  const now = Date.now();
  if (!ipRequestLog[ip]) {
    ipRequestLog[ip] = {
      count: 0,
      firstRequest: now
    };
  }

  // Reset if window expired
  if (now - ipRequestLog[ip].firstRequest > RATE_LIMIT_WINDOW) {
    ipRequestLog[ip] = {
      count: 0,
      firstRequest: now
    };
  }

  // Increment and check
  ipRequestLog[ip].count++;
  if (ipRequestLog[ip].count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Terlalu banyak permintaan, coba lagi nanti'
    });
  }

  // Parse the request body
  let message, language;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    message = body.message;
    language = body.language || 'id';
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Message is required' 
      });
    }
  } catch (error) {
    return res.status(400).json({ 
      error: 'Invalid JSON', 
      message: 'Failed to parse request body' 
    });
  }

  // Get Gemini API key from environment
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ 
      error: 'Server Configuration Error',
      message: 'Gemini API key not configured'
    });
  }

  // Determine which system prompt to use based on language
  const systemPrompt = language.toLowerCase() === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ID;

  // Setup for request with timeout
  const controller = new AbortController();
  let timeoutId;
  
  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Calling Gemini API (1.5 Flash)...');
    timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'Halo rek! Siap bantu kamu dengan info seputar undangan nikahan Dimas & Niken! Tanya aja apa yang mau kamu ketahui, aku di sini untuk bantu dengan gaya yang santai, friendly, bahkan pake bahasa Suroboyoan kalo kamu mau! 😊' }]
          },
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.97,
          maxOutputTokens: 800
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    const data = await response.json();
    clearTimeout(timeoutId); // Clear timeout after response

    // Check if there's a valid response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || 
        !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Invalid response from Gemini API:', data);
      
      return res.status(500).json({
        error: 'API Error',
        message: 'Failed to get a valid response from Gemini',
        debug: process.env.NODE_ENV === 'development' ? data : undefined
      });
    }

    // Extract and return the response text
    const reply = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ reply });
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    clearTimeout(timeoutId); // Clear timeout on error
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to process your request'
    });
  }
}
