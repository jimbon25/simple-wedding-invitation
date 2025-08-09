// Vercel API Route for sending notifications
import fetch from 'node-fetch';


// Helper function
function escapeDiscordMarkdown(text) {
  if (!text) return '';
  return text.replace(/([*_~`|\\])/g, '\\$1');
}

export default async function handler(req, res) {
  // Get IP address from header (Vercel: x-forwarded-for)
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : 'unknown';
  
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Simple in-memory rate limiter (per instance, not global)
  const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
  const RATE_LIMIT_MAX = 5; // max 5 requests per window
  const ipRequestLog = {};
  
  // Check rate limit
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
      message: 'Terlalu banyak permintaan, coba lagi dalam beberapa menit'
    });
  }
  
  // Result object to track which notification channels succeeded
  const results = {
    discord: { sent: false, error: null },
    telegram: { sent: false, error: null }
  };

  // Parse the request body
  let guestName, guestMessage, attendance, platform, recaptchaToken, messageType, guests, foodPreference;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    guestName = body.name?.trim();
    guestMessage = body.message?.trim();
    attendance = body.attendance;
    guests = body.guests;
    foodPreference = body.foodPreference;
    recaptchaToken = body.token;
    // Get message type: 'rsvp' or 'guestbook'
    messageType = body.type || 'rsvp';
    // Platform can be 'discord', 'telegram', or 'all' (default)
    platform = (body.platform || 'all').toLowerCase();
    
    if (!guestName) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Nama tidak boleh kosong' 
      });
    }
  } catch (error) {
    return res.status(400).json({ 
      error: 'Invalid JSON', 
      message: 'Failed to parse request body' 
    });
  }
  
  // Verify reCAPTCHA token
  const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
  if (!RECAPTCHA_SECRET_KEY) {
    console.error('RECAPTCHA_SECRET_KEY tidak dikonfigurasi!');
    return res.status(500).json({
      error: 'Server Configuration Error',
      message: 'reCAPTCHA tidak dikonfigurasi dengan benar'
    });
  }
  
  try {
    // Verify reCAPTCHA token with Google
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    });
    
    const recaptchaData = await recaptchaResponse.json();
    
    if (!recaptchaData.success) {
      console.log('Verifikasi reCAPTCHA gagal:', recaptchaData);
      return res.status(400).json({
        error: 'reCAPTCHA Verification Failed',
        message: 'Verifikasi reCAPTCHA gagal',
        errors: recaptchaData['error-codes']
      });
    }
    
    // If it reaches here, reCAPTCHA has been successfully verified
    console.log('reCAPTCHA verification successful');
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Terjadi kesalahan saat memverifikasi reCAPTCHA'
    });
  }

  // Log info about the request source
  console.log(`Request from: ${req.headers['x-forwarded-for'] || 'unknown'}`);
  console.log(`User Agent: ${req.headers['user-agent'] || 'unknown'}`);
  console.log(`Platform requested: ${platform}`);
  
  // Send to Discord webhook if platform is 'discord' or 'all'
  if (platform === 'discord' || platform === 'all') {
    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
    
    if (DISCORD_WEBHOOK_URL) {
      try {
        // Prepare message for Discord
        const escapedMessage = escapeDiscordMarkdown(guestMessage);
        
        // Format Discord message differently based on message type
        let discordMessage;
        
        if (messageType === 'guestbook') {
          discordMessage = {
            embeds: [{
              title: "Pesan Buku Tamu Baru",
              color: 0x00FFFF,
              fields: [
                { name: "Nama", value: `\`${guestName}\``, inline: true },
                { name: "Pesan", value: escapedMessage || "(Tidak ada pesan)", inline: false },
                { name: "Waktu", value: `\`${new Date().toLocaleString('id-ID')}\``, inline: false }
              ],
              footer: {
                text: "Wedding Invitation Guestbook"
              }
            }]
          };
        } else {
          discordMessage = {
            embeds: [{
              title: "RSVP Baru",
              color: (typeof attendance === 'boolean' ? attendance : attendance === 'Hadir') ? 0x00FF00 : 0xFF0000,
              fields: [
                { name: "Nama", value: `\`${guestName}\``, inline: true },
                { name: "Kehadiran", value: `\`${typeof attendance === 'boolean' ? (attendance ? "Hadir" : "Tidak Hadir") : attendance}\``, inline: true },
                { name: "Jumlah Tamu", value: `\`${guests || "-"}\``, inline: true },
                { name: "Preferensi Makanan", value: `\`${foodPreference || "-"}\``, inline: true },
                { name: "Pesan", value: escapedMessage || "(Tidak ada pesan)", inline: false },
                { name: "Waktu", value: `\`${new Date().toLocaleString('id-ID')}\``, inline: false }
              ],
              footer: {
                text: "Wedding Invitation RSVP"
              }
            }]
          };
        }

        // Send message to Discord webhook
        const response = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordMessage)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Discord API error: ${response.status} ${errorText}`);
        }

        // Log the successful submission
        if (messageType === 'guestbook') {
          console.log(`Guestbook message submitted to Discord: ${guestName}`);
        } else {
          console.log(`RSVP submitted to Discord: ${guestName} (${typeof attendance === 'boolean' ? (attendance ? 'Attending' : 'Not attending') : attendance})`);
        }
        results.discord.sent = true;
      } catch (error) {
        console.error('Error sending to Discord:', error);
        results.discord.error = error.message;
      }
    } else {
      console.warn('Discord webhook URL not configured');
      results.discord.error = 'Discord webhook URL not configured';
    }
  }

  // Send to Telegram bot if platform is 'telegram' or 'all'
  if (platform === 'telegram' || platform === 'all') {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const attendanceStatus = typeof attendance === 'boolean' ? (attendance ? 'Hadir' : 'Tidak Hadir') : attendance;
        // Format message differently based on message type
        let telegramMessage = '';
        if (messageType === 'guestbook') {
          // Format for guestbook entries (triple backtick block)
          telegramMessage = [
            '```',
            'Buku Tamu Baru:',
            `Nama: ${guestName || '-'}`,
            `Pesan: ${guestMessage || '-'}`,
            `Waktu: ${new Date().toLocaleString('id-ID')}`,
            '```'
          ].join('\n');
        } else {
          // Format for RSVP (triple backtick block)
          telegramMessage = [
            '```',
            'RSVP Baru:',
            `Nama: ${guestName || '-'}`,
            `Kehadiran: ${attendanceStatus || '-'}`,
            `Jumlah Tamu: ${guests ? String(guests) : '-'}`,
            `Preferensi Makanan: ${foodPreference || '-'}`,
            `Pesan: ${guestMessage || '-'}`,
            `Waktu: ${new Date().toLocaleString('id-ID')}`,
            '```'
          ].join('\n');
        }

        // Send message to Telegram bot
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'Markdown'
          })
        });

        const data = await response.json();
        
        if (!data.ok) {
          throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
        }

        // Log the successful submission
        if (messageType === 'guestbook') {
          console.log(`Guestbook message submitted to Telegram: ${guestName}`);
        } else {
          console.log(`RSVP submitted to Telegram: ${guestName} (${typeof attendance === 'boolean' ? (attendance ? 'Attending' : 'Not attending') : attendance})`);
        }
        results.telegram.sent = true;
      } catch (error) {
        console.error('Error sending to Telegram:', error);
        results.telegram.error = error.message;
      }
    } else {
      console.warn('Telegram credentials not configured properly');
      results.telegram.error = 'Telegram credentials not configured properly';
    }
  }

  // Check overall result and respond accordingly
  const successCount = Object.values(results).filter(r => r.sent).length;
  const platforms = Object.keys(results).filter(k => results[k].sent);
  
  // If at least one platform succeeded, consider it a success
  if (successCount > 0) {
    return res.status(200).json({
      success: true,
      message: `Notification sent to ${successCount} platform(s): ${platforms.join(', ')}`,
      results
    });
  } else {
  // If all platforms failed, return an error
    const errorMessage = Object.values(results)
      .filter(r => r.error)
      .map(r => r.error)
      .join('; ');
    
    return res.status(500).json({
      error: 'Notification Failed',
      message: `Failed to send notification: ${errorMessage}`,
      results
    });
  }
}
