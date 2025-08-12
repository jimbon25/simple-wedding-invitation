// netlify/functions/functions-shared.js
// This file contains the main code used by send-notification.js
const fetch = require('node-fetch');

// Simple in-memory rate limiter (per instance, not global)
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // max 5 requests per window
const ipRequestLog = {};

// Escape special characters for Telegram/Discord Markdown to prevent formatting errors
function escapeMarkdown(text) {
  if (!text) return '';
  // Escape characters for Telegram Markdown (Markdown mode, not HTML)
  return text.replace(/([_*\]()~`>#+\-=|{}.!])/g, '$1')
      .replace(/([[\]])/g, '$1'); // [ and ] do not need to be escaped inside character class
}

// Main handler to be used by both files
exports.sharedHandler = async function(event, context) {
  // Debug log for tracing request
  console.log('=== Incoming Request ===');
  console.log('event.body:', event.body);
  console.log('event.headers:', event.headers);
  
  // Get IP address from header (Netlify: x-forwarded-for) - moved to top
  const ip = event.headers['x-forwarded-for'] ? event.headers['x-forwarded-for'].split(',')[0].trim() : 'unknown';
  
  // Replace with your invitation domain
  const allowedOrigins = [
    'https://invitation-dn.netlify.app/',
    process.env.REACT_APP_SITE_URL,
    'http://localhost:3000' // for development
  ].filter(Boolean);
  
  const origin = event.headers.origin || event.headers.referer || '';
  const isAllowedOrigin = allowedOrigins.some(allowed => origin.startsWith(allowed));
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  // Debug/log event.body for tracing Invalid JSON error
  if (!event.body || typeof event.body !== 'string' || event.body.trim() === '') {
    console.error('Request body kosong atau bukan string:', event.body);
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Request body kosong atau tidak valid.' })
    };
  }

  let name, message, attendance, guests, foodPreference, type, body;
  try {
    body = JSON.parse(event.body);
    // Blacklist kata/email/nama tertentu
    const blacklistPatterns = [
      /promo|diskon|gratis|admin|test|dummy|iklan|penawaran|hadiah|bonus|tawaran|pinjaman|asuransi|investasi|tiktok|instagram|wa\.me|bit\.ly|shopee|tokopedia|bukalapak|gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|gmx\.com|protonmail\.com|icloud\.com|mail\.ru|qq\.com|163\.com|126\.com|sina\.com|sohu\.com|aliyun\.com|foxmail\.com|example\.com|tempmail|mailinator|guerrillamail|10minutemail|disposable|spambot|www\.|http|https/i,
      /\b(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/, // email
    ];
    const combinedTextLower = `${body.name || ''} ${body.message || ''}`.toLowerCase();
    for (const pattern of blacklistPatterns) {
      if (pattern.test(combinedTextLower)) {
        console.warn(`Blacklist content detected from IP ${ip}:`, combinedTextLower.substring(0, 100));
        // Notifikasi admin Telegram jika konten blacklist terdeteksi
        if (process.env.ADMIN_TELEGRAM_BOT_TOKEN && process.env.ADMIN_TELEGRAM_CHAT_ID) {
          await fetch(`https://api.telegram.org/bot${process.env.ADMIN_TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: process.env.ADMIN_TELEGRAM_CHAT_ID,
              text: `⚠ *SPAM/BLACKLIST DETECTED*\nIP: ${ip}\nName: ${body.name}\nMessage: ${body.message}\nType: ${body.type || '-'}\n`,
              parse_mode: 'Markdown'
            }),
          });
        }
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Konten terlarang terdeteksi.' }) };
      }
    }
    // Honeypot anti-bot
    if (body.website || body.contact_number) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Bot detected.' }) };
    }

    // Time-based validation (anti-bot)
    if (body.formStart && body.formSubmit) {
      const formStart = Number(body.formStart);
      const formSubmit = Number(body.formSubmit);
      if (!isNaN(formStart) && !isNaN(formSubmit)) {
        const duration = formSubmit - formStart;
        // Tolak jika isi form <2 detik (bot) atau >1 jam (kemungkinan abuse)
        if (duration < 2000 || duration > 3600000) {
          return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Suspicious form timing.' }) };
        }
      }
    }
    name = escapeMarkdown(String(body.name || body.nama || ''));
    message = escapeMarkdown(String(body.message || body.pesan || ''));
    attendance = escapeMarkdown(String(body.attendance || body.kehadiran || ''));
    guests = escapeMarkdown(String(body.guests || body.jumlahTamu || ''));
    foodPreference = escapeMarkdown(String(body.foodPreference || body.preferensiMakanan || ''));
    type = body.type || '';

    // Validate name and message length (backend, anti-bypass)
    if (name.length > 50) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Nama terlalu panjang (maksimal 50 karakter).' }) };
    }
    if (message.length > 300) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Pesan terlalu panjang (maksimal 300 karakter).' }) };
    }

    // Enhanced content validation
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)/gi,
      /(\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g
    ];

    const combinedText = `${name} ${message}`.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(combinedText)) {
        console.warn(`Suspicious content detected from IP ${ip}:`, combinedText.substring(0, 100));
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Konten tidak valid terdeteksi.' }) };
      }
    }
  } catch (e) {
    console.error('JSON.parse error:', e);
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Invalid JSON', detail: String(e) })
    };
  }
  // Rate limiting already uses IP from above
  const now = Date.now();
  if (!ipRequestLog[ip]) {
    ipRequestLog[ip] = [];
  }
  // Remove requests that are outside the window
  ipRequestLog[ip] = ipRequestLog[ip].filter(ts => now - ts < RATE_LIMIT_WINDOW);
  if (ipRequestLog[ip].length >= RATE_LIMIT_MAX) {
    // Notifikasi admin Telegram jika rate limit terpicu (flood/spam)
    if (process.env.ADMIN_TELEGRAM_BOT_TOKEN && process.env.ADMIN_TELEGRAM_CHAT_ID) {
      const safeName = (body && body.name) ? body.name : '-';
      const safeMessage = (body && body.message) ? body.message : '-';
      const safeType = type || (body && body.type) || '-';
      await fetch(`https://api.telegram.org/bot${process.env.ADMIN_TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.ADMIN_TELEGRAM_CHAT_ID,
          text: `🚨 *RATE LIMIT/FLOOD DETECTED*\nIP: ${ip}\nType: ${safeType}\nName: ${safeName}\nMessage: ${safeMessage}\nCount: ${ipRequestLog[ip].length}\n`,
          parse_mode: 'Markdown'
        }),
      });
    }
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((RATE_LIMIT_WINDOW - (now - ipRequestLog[ip][0])) / 1000)),
        'Access-Control-Allow-Origin': 'https://invitation-dn.netlify.app',
        'Vary': 'Origin'
      },
      body: JSON.stringify({ success: false, error: 'Terlalu banyak permintaan dari IP ini. Coba lagi nanti.' })
    };
  }
  ipRequestLog[ip].push(now);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  try {
    // 2. Telegram message format (triple backtick)
    let telegramText = '';
    if (type === 'rsvp') {
      telegramText = [
        '```',
        'RSVP Baru:',
        `Nama: ${name || '-'}`,
        `Kehadiran: ${attendance || '-'}`,
        `Jumlah Tamu: ${guests || '-'}`,
        `Preferensi Makanan: ${foodPreference || '-'}`,
        `Pesan: ${message || '-'}`,
        '```'
      ].join('\n');
    } else if (type === 'guestbook') {
      telegramText = [
        '```',
        'Buku Tamu Baru:',
        `Nama: ${name || '-'}`,
        `Pesan: ${message || '-'}`,
        '```'
      ].join('\n');
    } else if (type === 'visit') {
      // Do not track visits
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true, info: 'Visit tracking disabled.' }) };
    } else {
      telegramText = [
        '```',
        `Nama: ${name || '-'}`,
        `Pesan: ${message || '-'}`,
        '```'
      ].join('\n');
    }
    let telegramResult = { ok: true };
    let discordResult = { ok: true };
    // Select bot/channel according to type
    let telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    let telegramChatId = process.env.TELEGRAM_CHAT_ID;
    let discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (type === 'visit') {
      telegramBotToken = process.env.ANALYTICS_BOT_TOKEN || telegramBotToken;
      telegramChatId = process.env.ANALYTICS_CHAT_ID || telegramChatId;
      discordWebhookUrl = process.env.VISIT_DISCORD_WEBHOOK_URL || discordWebhookUrl;
    }

    // Send to Telegram
    if (telegramBotToken && telegramChatId) {
      const telegramRes = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramText,
          parse_mode: 'Markdown'
        }),
      });
      telegramResult.ok = telegramRes.ok;
    }

    // Send to Discord except for type 'visit'
    if (discordWebhookUrl && type !== 'visit') {
      let embed = {};
      if (type === 'rsvp') {
        embed = {
          title: 'RSVP Baru',
          color: 0x00bfff,
          fields: [
            { name: 'Nama', value: name || '-', inline: true },
            { name: 'Kehadiran', value: attendance || '-', inline: true },
            { name: 'Jumlah Tamu', value: guests ? String(guests) : '-', inline: true },
            { name: 'Preferensi Makanan', value: foodPreference || '-', inline: true },
            { name: 'Pesan', value: message || '-', inline: false },
          ],
          timestamp: new Date().toISOString(),
        };
      } else if (type === 'guestbook') {
        embed = {
          title: 'Buku Tamu Baru',
          color: 0x00bfff,
          fields: [
            { name: 'Nama', value: name || '-', inline: true },
            { name: 'Pesan', value: message || '-', inline: false },
          ],
          timestamp: new Date().toISOString(),
        };
      } else {
        embed = {
          title: 'Pesan Baru',
          color: 0x00bfff,
          fields: [
            { name: 'Nama', value: name || '-', inline: true },
            { name: 'Pesan', value: message || '-', inline: false },
          ],
          timestamp: new Date().toISOString(),
        };
      }
      const discordRes = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });
      discordResult.ok = discordRes.ok;
    }

    if (!telegramResult.ok || !discordResult.ok) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Failed to send to Telegram or Discord' }) };
    }

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: 'Failed to send message.' };
  }
};

// Ekspor ipRequestLog agar bisa diakses dan direset dari test
exports.ipRequestLog = ipRequestLog;
