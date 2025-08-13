// Vercel API Route for guest count tracking
import fetch from 'node-fetch';
import UAParser from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';

// Rate limit configuration
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 10;
const ipRequestLog = {};

// Visitor visit history
const visitorHistory = {};

// Function to reset history (for testing)
const resetVisitorHistory = (req) => {
  // Can only be used with API key for security
  const apiKey = req?.headers?.['x-api-key'] || '';
  if (apiKey === process.env.GUEST_API_KEY) {
    console.log('Resetting visitor history via admin request');
    Object.keys(visitorHistory).forEach(key => {
      delete visitorHistory[key];
    });
    return true;
  }
  return false;
};

// List of allowed countries (ISO country codes)
// Use environment variable for allowed countries, fallback to ['ID']
const ALLOWED_COUNTRIES = (process.env.ALLOWED_COUNTRIES ? process.env.ALLOWED_COUNTRIES.split(',') : ['ID']);

// List of suspicious ASNs (Autonomous System Numbers)
// Usually used by VPN, proxy, or similar services
const SUSPICIOUS_ASNS = [
  '14061', // DigitalOcean
  '16509', // Amazon AWS
  '14618', // Amazon AWS
  '15169', // Google Cloud
  '8075',  // Microsoft Azure
  '13335', // Cloudflare
  '174',   // Cogent Communications
  '9009',  // M247
  '3223',  // Voxility
  '53667'  // PONYNET (VPN Service)
];

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Secret parameter for developer mode
  const DEV_MODE_SECRET = process.env.DEV_MODE_SECRET || 'your_secret_key'; // fallback for local/dev

  // Check if the request is from developer based on URL parameter
  try {
    const referer = req.headers.referer || '';
    if (referer) {
      const urlObj = new URL(referer);
      const devMode = urlObj.searchParams.get('devMode');
      if (devMode === DEV_MODE_SECRET) {
        console.log('Dev mode terdeteksi dari parameter URL, tracking diabaikan');
        return res.status(200).json({ 
          success: true, 
          message: 'Developer mode active, tracking skipped'
        });
      }
    }
  } catch (e) {
    // ignore URL parse errors
  }

  // API Key validation
  const apiKey = req.headers['x-api-key'];
  const pentestRateKey = process.env.PENTEST_RATE_KEY || 'PENTEST-RATE-KEY';
  const isPentestRateKey = apiKey === pentestRateKey;
  if (apiKey !== process.env.GUEST_API_KEY && !isPentestRateKey) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Handle admin reset request (for testing)
  if (req.method === 'POST') {
    try {
      if (req.body.action === 'reset_history') {
        if (resetVisitorHistory(req)) {
          return res.status(200).json({ 
            success: true, 
            message: 'Visitor history reset successfully' 
          });
        } else {
          return res.status(403).json({ 
            success: false, 
            message: 'Unauthorized reset attempt' 
          });
        }
      }
    } catch (e) {
      // Ignore errors for non-reset requests
    }
  }

  // Origin/Referer validation
  const clientOrigin = req.headers['origin'] || '';
  const referer = req.headers['referer'] || '-';
  if (clientOrigin && !allowedOrigins.some(allowed => clientOrigin.startsWith(allowed))) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  if (referer !== '-' && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return res.status(403).json({ error: 'Invalid referer' });
  }

  // Rate limiting logic (skip if pentest rate key is used)
  const ip = req.headers['x-forwarded-for'] ? 
    req.headers['x-forwarded-for'].split(',')[0].trim() : 
    'unknown';
  const now = Date.now();
  if (!isPentestRateKey) {
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
  }
  
  // Visit history - using IP
  const userAgent = req.headers['user-agent'] || '';
  // Suspicious User-Agent detection (do not block here, just flag, block after alert)
  const suspiciousUA = /(bot|curl|python|wget|scrapy|headless|phantom|selenium|spider|httpclient|axios|go-http|node-fetch|java|libwww|perl|ruby|powershell|http_request|httpclient|fetch|postman|insomnia)/i;
  let suspiciousUAFlag = false;
  if (!userAgent || userAgent.length < 10) {
    suspiciousUAFlag = true;
  } else if (suspiciousUA.test(userAgent)) {
    suspiciousUAFlag = true;
    console.log('Suspicious User-Agent detected:', userAgent);
  }
  const fingerprint = `${ip}-${userAgent.substring(0, 100)}`;
  
  // Get sections/pages visited from referrer or query parameters
  let visitedSection = '-';
  try {
    if (req.headers.referer) {
      const url = new URL(req.headers.referer);
      const hash = url.hash.substring(1);
      visitedSection = hash || 'home';
    }
  } catch (e) {
    // ignore
  }

  // Parse body for possible section info
  if (req.body && req.body.section) {
    visitedSection = req.body.section;
  }

  // Current timestamp for this visit
  const visitTimestamp = now;
  
  if (!visitorHistory[fingerprint]) {
    visitorHistory[fingerprint] = {
      firstVisit: visitTimestamp,
      lastVisit: visitTimestamp,
      visitCount: 1,
      totalTimeSpent: 0, // Total time in ms
      avgSessionDuration: 0, // Average session duration in ms
      sections: { [visitedSection]: 1 }, // Track visited sections
      visits: [{ 
        timestamp: visitTimestamp, 
        userAgent, 
        section: visitedSection,
        sessionId: uuidv4() // Generate unique session ID
      }]
    };
  } else {
    // Update visit history
    const previousVisit = visitorHistory[fingerprint].lastVisit;
    visitorHistory[fingerprint].lastVisit = visitTimestamp;
    visitorHistory[fingerprint].visitCount++;
    
    // Calculate time spent if this is a returning visitor within 30 minutes
    const timeDiff = visitTimestamp - previousVisit;
    if (timeDiff < 30 * 60 * 1000) { // 30 minutes in milliseconds
      visitorHistory[fingerprint].totalTimeSpent += timeDiff;
      visitorHistory[fingerprint].avgSessionDuration = 
        visitorHistory[fingerprint].totalTimeSpent / (visitorHistory[fingerprint].visitCount - 1);
    }
    
    // Track visited sections
    if (!visitorHistory[fingerprint].sections[visitedSection]) {
      visitorHistory[fingerprint].sections[visitedSection] = 1;
    } else {
      visitorHistory[fingerprint].sections[visitedSection]++;
    }
    
    // Maintain a capped history of last 10 visits
    if (visitorHistory[fingerprint].visits.length >= 10) {
      visitorHistory[fingerprint].visits.shift(); // Remove oldest visit
    }
    
    // Get last visit to determine if this is a new session
    const lastVisit = visitorHistory[fingerprint].visits[visitorHistory[fingerprint].visits.length - 1];
    const isNewSession = (visitTimestamp - lastVisit.timestamp) > 30 * 60 * 1000; // 30 minutes
    
    visitorHistory[fingerprint].visits.push({ 
      timestamp: visitTimestamp, 
      userAgent, 
      section: visitedSection,
      sessionId: isNewSession ? uuidv4() : lastVisit.sessionId // Reuse or create session ID
    });
  }
  
  // Calculate time since first visit for internal log
  if (visitorHistory[fingerprint].visitCount > 1) {
    console.log(`Returning visitor (${fingerprint.substring(0, 20)}...) - Visit #${visitorHistory[fingerprint].visitCount}`);
  }

  // IP Geolocation Checking
  let geoData = {
    country: 'Unknown',
    countryCode: 'XX',
    city: 'Unknown',
    region: 'Unknown', // Additional region
    asn: 'Unknown',
    org: 'Unknown',
    isp: 'Unknown',
    suspicious: false,
    loc: null // latitude,longitude coordinates if available
  };
  try {
    // Using ipinfo.io to get geolocation information
    // You need to register to get a token: https://ipinfo.io/
    const ipInfoToken = process.env.IPINFO_TOKEN;
    if (ipInfoToken && ip !== 'unknown' && ip !== '127.0.0.1' && ip !== 'localhost') {
      const ipInfoResponse = await fetch(`https://ipinfo.io/${ip}?token=${ipInfoToken}`);
      const ipInfo = await ipInfoResponse.json();
      if (ipInfo) {
        geoData = {
          country: ipInfo.country || 'Unknown',
          countryCode: ipInfo.country || 'XX',
          city: ipInfo.city || 'Unknown',
          region: ipInfo.region || 'Unknown',
          asn: ipInfo.org ? ipInfo.org.split(' ')[0].replace('AS', '') : 'Unknown',
          org: ipInfo.org ? ipInfo.org.split(' ').slice(1).join(' ') : 'Unknown',
          isp: ipInfo.org || 'Unknown',
          suspicious: false,
          loc: ipInfo.loc || null
        };
        // Check if country is allowed
        if (!ALLOWED_COUNTRIES.includes(geoData.countryCode)) {
          geoData.suspicious = true;
          console.log(`Suspicious access from non-allowed country: ${geoData.countryCode}`);
        }
        // Check if ASN is suspicious (VPN/Proxy)
        if (SUSPICIOUS_ASNS.includes(geoData.asn)) {
          geoData.suspicious = true;
          console.log(`Suspicious access from potential VPN/Proxy: ${geoData.org}`);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching IP geolocation:', error);
  }
  
  // Parse user agent
  const uaString = req.headers['user-agent'] || '';
  const ua = new UAParser(uaString);
  const browser = ua.getBrowser();
  const os = ua.getOS();
  const device = ua.getDevice();
  
  const guestData = {
    ip,
    timestamp: new Date().toISOString(),
    userAgent: uaString,
    browser: `${browser.name || 'Unknown'} ${browser.version || ''}`.trim(),
    os: `${os.name || 'Unknown'} ${os.version || ''}`.trim(),
    device: device.type || 'desktop',
    referer
  };

  // Check if the user is a search engine bot
  const isBot = /bot|crawl|spider|slurp|baidu|yandex|bing|google|yahoo|duckduckgo/i.test(uaString);
  if (isBot) {
    guestData.isBot = true;
    guestData.botName = uaString.match(/bot|crawl|spider|slurp|baidu|yandex|bing|google|yahoo|duckduckgo/i)[0];
  }

  // Method details but not exposing path in notification
  guestData.method = req.method;
  
  // Get ?to= parameter from query string (API call) or from referer (browser navigation)
  let guestParam = '-';
  if (req.query && req.query.to) {
    guestParam = req.query.to;
  } else {
    try {
      if (referer) {
        const urlObj = new URL(referer);
        const toParam = urlObj.searchParams.get('to');
        if (toParam) {
          guestParam = toParam;
        }
      }
    } catch (e) {
      // ignore URL parse errors
    }
  }

  // --- Query String/Parameter Anomaly Detection (SQLi/XSS/etc) ---
  // Detect strange characters/patterns in guestParam (or other parameters if needed)
  let suspiciousReason = [];
  if (guestParam && guestParam !== '-') {
    if (/[^a-zA-Z0-9 _-]/.test(guestParam) || /<|script|\{|\}|\$|\(|\)|select|union|insert|update|delete|drop|--|\/\*/i.test(guestParam)) {
      geoData.suspicious = true;
      suspiciousReason.push(`Query string/parameter mencurigakan: ${guestParam}`);
      console.log('Suspicious query string/parameter detected:', guestParam);
    }
  }
  // After geoData is filled, if the User-Agent is strange, mark it suspicious.
  if (suspiciousUAFlag) {
    geoData.suspicious = true;
    suspiciousReason.push('User-Agent mencurigakan');
  }
  // Block if country is not allowed
  if (geoData.countryCode && !ALLOWED_COUNTRIES.includes(geoData.countryCode)) {
    geoData.suspicious = true;
    suspiciousReason.push(`Negara tidak diizinkan: ${geoData.countryCode}`);
  }
  // Block if ASN is suspicious (VPN/Proxy)
  if (geoData.asn && SUSPICIOUS_ASNS.includes(geoData.asn)) {
    geoData.suspicious = true;
    suspiciousReason.push(`VPN/Proxy terdeteksi: ${geoData.org} (AS${geoData.asn})`);
  }


  // Add any query parameters or body data (for POST)
  if (req.method === 'GET') {
    guestData.query = req.query;
  } else if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      // Filter out sensitive data
      const { name, message, attendance } = body;
      guestData.data = { name, attendance };
      if (message) {
        guestData.data.hasMessage = true;
      }
    } catch (e) {
      guestData.bodyError = 'Failed to parse body';
    }
  }
  
  // Add guest parameter if found
  if (guestParam) {
    guestData.guestName = guestParam;
  }

  // Send guest data to the appropriate Telegram bot (analytics or suspect)
  try {
    // Get Telegram credentials for both analytics and suspect bots
    const ANALYTICS_BOT_TOKEN = process.env.ANALYTICS_BOT_TOKEN;
    const ANALYTICS_CHAT_ID = process.env.ANALYTICS_CHAT_ID;
    const SUSPECT_BOT_TOKEN = process.env.SUSPECT_BOT_TOKEN;
    const SUSPECT_CHAT_ID = process.env.SUSPECT_CHAT_ID;

    // Select bot/token/channel according to suspicious status (after suspicious detection)
    let botToken = ANALYTICS_BOT_TOKEN;
    let chatId = ANALYTICS_CHAT_ID;
    if (geoData.suspicious && SUSPECT_BOT_TOKEN && SUSPECT_CHAT_ID) {
      botToken = SUSPECT_BOT_TOKEN;
      chatId = SUSPECT_CHAT_ID;
    }

    if (!botToken || !chatId) {
      console.warn('Telegram bot credentials not configured, skipping notification');
      return res.status(200).json({ success: true, message: 'Visit logged (no notification)' });
    }

    // Determine emoji indicating security status
    const securityEmoji = geoData.suspicious ? '⚠' : '✓';

    // Format the guest data for Telegram message with enhanced session tracking info
    const latestVisit = visitorHistory[fingerprint].visits[visitorHistory[fingerprint].visits.length - 1];
    const isNewSession = visitorHistory[fingerprint].visits.length > 1 ?
      latestVisit.sessionId !== visitorHistory[fingerprint].visits[visitorHistory[fingerprint].visits.length - 2].sessionId :
      true;


    // Format session duration if available
    let sessionDuration = '';
    if (visitorHistory[fingerprint].avgSessionDuration > 0) {
      const durationSec = Math.round(visitorHistory[fingerprint].avgSessionDuration / 1000);
      const minutes = Math.floor(durationSec / 60);
      const seconds = durationSec % 60;
      sessionDuration = `${minutes}m ${seconds}s`;
    }
    let adminLocInfo = '';
    // --- Additional suspect-specific details (enrichment) ---
    let suspectDetails = '';
    if (geoData.suspicious) {
      // Full User-Agent
      suspectDetails += `\n# *User-Agent:* \`${userAgent}\``;
      // Query string from referer
      try {
        if (referer && referer.includes('?')) {
          const qs = referer.split('?')[1].split('#')[0];
          suspectDetails += `\n# *Query String:* \`?${qs}\``;
        }
      } catch {}
      // Body JSON (without sensitive fields)
      try {
        if (req.body) {
          let parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
          if (parsed && typeof parsed === 'object') {
            delete parsed.website;
            delete parsed.apiKey;
            suspectDetails += `\n# *Body:* \`${JSON.stringify(parsed)}\``;
          }
        }
      } catch {}
      // Number of IP requests in the last 10 minutes
      suspectDetails += `\n# *Request IP (10m):* ${ipRequestLog[ip]?.count || 1}x`;
      // Org/ASN detail
      suspectDetails += `\n# *Org/ASN:* ${geoData.org} (AS${geoData.asn})`;
      // Flag for suspicious guestParam
      let guestSuspicious = false;
      if (guestParam && guestParam !== '-') {
        if (/[^a-zA-Z0-9 _-]/.test(guestParam) || /<|script|\{|\}|\$|\(|\)/i.test(guestParam)) {
          guestSuspicious = true;
        }
      }
      if (guestSuspicious) {
        suspectDetails += `\n# *Guest Param Suspicious:* \`${guestParam}\``;
      }
    }

// ...existing code...
    const formattedData = [
      '```',
      `${geoData.suspicious ? '⚠ *SUSPICIOUS ACCESS DETECTED!*' :
        isNewSession && visitorHistory[fingerprint].visitCount > 1 ? '⟲ *Sesi Baru Pengunjung Lama*' :
        visitorHistory[fingerprint].visitCount > 1 ? '↩ *Pengunjung Kembali*' : '◈ *Pengunjung Baru*'}`,
      `► *IP:* \`${guestData.ip}\``,
      `► *Waktu:* \`${guestData.timestamp}\``,
      `► *Browser:* \`${guestData.browser}\``,
      `► *OS:* \`${guestData.os}\``,
      `► *Perangkat:* \`${guestData.device}\``,
      `► *Referrer:* \`${guestData.referer || '-'}\``,
      guestData.guestName ? `⦿ *Tamu:* \`${guestData.guestName}\`` : '',
      guestData.isBot ? `⚠ *Bot terdeteksi:* \`${guestData.botName}\`` : '',
      suspectDetails,
      '',
      '⟳ *Statistik Kunjungan:*',
      `• *Kunjungan ke:* \`${visitorHistory[fingerprint].visitCount}\``,
      `• *Pertama kali:* \`${new Date(visitorHistory[fingerprint].firstVisit).toISOString().split('T')[0]}\``,
      `• *ID Sesi:* \`${latestVisit.sessionId.substring(0, 8)}...\``,
      sessionDuration ? `• *Durasi rata-rata:* \`${sessionDuration}\`` : '',
      '',
      '◆ *Lokasi:*',
      `${securityEmoji} \`${geoData.city}, ${geoData.region}, ${geoData.country} (${geoData.countryCode})\``,
      `⌘ *ISP/ASN:* \`${geoData.isp} (AS${geoData.asn})\``,
      geoData.suspicious ? '⚠ *Alasan:* Negara tidak diizinkan atau ASN mencurigakan' : '',
      adminLocInfo,
      guestData.data?.name ? `⦿ *Nama:* \`${guestData.data.name}\`` : '',
      guestData.data?.attendance !== undefined ? `► *Kehadiran:* \`${guestData.data.attendance ? 'Hadir' : 'Tidak Hadir'}\`` : '',
      guestData.data?.hasMessage ? '► *Pesan:* Ya' : '',
      '```'
    ].filter(Boolean).join('\n');

    // Send to Telegram (analytics or suspect bot)
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedData,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
    }

    // After Telegram alert, block if suspicious (same as Netlify)
    if (geoData.suspicious) {
      // Block if VPN/proxy
      if (SUSPICIOUS_ASNS.includes(geoData.asn)) {
        return res.status(403).send('Access denied: Country not allowed or please turn off your VPN or proxy to access this invitation.');
      }
      // Block if suspicious reason due to query string/parameter
      if (suspiciousReason.some(reason => reason.includes('Query string/parameter mencurigakan'))) {
        return res.status(403).send('Access denied: Suspicious query string or guest parameter.');
      }
      // Block if suspicious User-Agent
      if (suspiciousReason.some(reason => reason.includes('User-Agent mencurigakan'))) {
        return res.status(403).send('Access denied: Suspicious User-Agent detected.');
      }
      // Block if country is not allowed
      if (suspiciousReason.some(reason => reason.includes('Negara tidak diizinkan'))) {
        return res.status(403).send('Access denied: Country not allowed or please turn off your VPN or proxy to access this invitation.');
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Welcome to the invitation!'
    });

  } catch (error) {
    console.error('Error sending analytics to Telegram:', error);

    // Still return success to client even if notification fails
    return res.status(200).json({
      success: true,
      message: 'Welcome to the invitation!'
    });
  }
}
