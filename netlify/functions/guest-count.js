// netlify/functions/guest-count.js
const fetch = require('node-fetch');
const UAParser = require('ua-parser-js');
const { v4: uuidv4 } = require('uuid');

// Rate limit: max 10 requests per IP per 10 minutes
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const ipRequestLog = {};

// Tracking visitor history
const visitorHistory = {};

// Function to reset history (for testing)
// (Removed unused resetVisitorHistory function)

// List of allowed countries (ISO country codes)
// Add countries allowed to access the invitation
const ALLOWED_COUNTRIES = ['ID', 'SG', 'MY']; 
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

exports.handler = async function(event, context) {
  const allowedOrigins = [
    'https://invitation-dn.netlify.app',
    'https://invitation-dn.netlify.app/'
    // Tambahkan domain lain jika perlu
  ];
  const origin = event.headers['origin'] || '';
  const referer = event.headers['referer'] || '-';
  const isAllowedOrigin = allowedOrigins.some(o => origin.startsWith(o));
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Vary': 'Origin'
  };

  // Origin/Referer validation
  if (origin && !isAllowedOrigin) {
    return { statusCode: 403, headers: corsHeaders, body: 'Invalid origin' };
  }
  // API Key validation untuk request admin (reset)
  const apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'] || '';
  const pentestRateKey = process.env.PENTEST_RATE_KEY || 'PENTEST-RATE-KEY';
  const isPentestRateKey = apiKey === pentestRateKey;

  // Handle admin reset request (for testing)
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      if (body.action === 'reset_history') {
        if (apiKey === process.env.GUEST_API_KEY || isPentestRateKey) {
          Object.keys(visitorHistory).forEach(key => delete visitorHistory[key]);
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true, message: 'Visitor history reset successfully' })
          };
        }
        // Jika key tidak cocok, langsung return 403 (tanpa else)
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ success: false, message: 'API key required for admin action' })
        };
      }
    } catch (e) {
      // Ignore parsing errors for non-reset requests
    }
  }
  
  // Secret parameter untuk developer mode
  const DEV_MODE_SECRET = process.env.DEV_MODE_SECRET || '';
  // Deteksi developer mode dari referer atau query
  try {
    let devModeParam = '';
    if (referer && referer !== '-') {
      const urlObj = new URL(referer, allowedOrigins[0]);
      devModeParam = urlObj.searchParams.get('devMode');
    }
    if (DEV_MODE_SECRET && devModeParam === DEV_MODE_SECRET) {
      console.log('Dev mode terdeteksi dari parameter URL, tracking dilewati');
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, message: 'Developer mode aktif, tracking dilewati' })
      };
    }
  } catch (e) {
    // ignore URL parse errors
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  // User-Agent validation & parsing
  const userAgent = event.headers['user-agent'] || '';
  if (!userAgent || userAgent.length < 10) {
    return { statusCode: 400, headers: corsHeaders, body: 'Invalid User-Agent' };
  }
  // Detect strange User-Agents (bots, curls, headless, etc.) - hanya tandai suspicious, jangan blokir
  const suspiciousUA = /(bot|curl|python|wget|scrapy|headless|phantom|selenium|spider|httpclient|axios|go-http|node-fetch|java|libwww|perl|ruby|powershell|http_request|httpclient|fetch|postman|insomnia)/i;
  let suspiciousUAFlag = false;
  if (suspiciousUA.test(userAgent)) {
    suspiciousUAFlag = true;
    // Hanya tandai, jangan blokir
    console.log('Suspicious User-Agent detected:', userAgent);
  }
  const parser = new UAParser(userAgent);
  const uaResult = parser.getResult();
  const device = uaResult.device.type || 'Desktop';
  const browser = uaResult.browser.name || '-';
  const os = uaResult.os.name || '-';

  // Rate limiting (bypass if pentest key)
  const ip = event.headers['x-forwarded-for'] ? event.headers['x-forwarded-for'].split(',')[0].trim() : 'unknown';
  const now = Date.now();
  if (!isPentestRateKey) {
    if (!ipRequestLog[ip]) ipRequestLog[ip] = [];
    ipRequestLog[ip] = ipRequestLog[ip].filter(ts => now - ts < RATE_LIMIT_WINDOW);
    if (ipRequestLog[ip].length >= RATE_LIMIT_MAX) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Terlalu banyak request dari IP ini.' })
      };
    }
    ipRequestLog[ip].push(now);
  }
  
  // Tracking visit history - using IP + simple fingerprint
  const fingerprint = `${ip}-${userAgent.substring(0, 100)}`;
  
  // Get sections/page visited from referrer or query parameters
  let visitedSection = '-';
  try {
    if (event.headers.referer) {
      const url = new URL(event.headers.referer);
      const hash = url.hash.substring(1); // Remove the # symbol
      visitedSection = hash || 'home';
    }
  } catch (e) {
    // ignore
  }

  // Parse body for possible section info
  let requestBody = {};
  try {
    if (event.body) {
      requestBody = JSON.parse(event.body);
      if (requestBody.section) {
        visitedSection = requestBody.section;
      }
    }
  } catch (e) {
    // ignore
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
    region: 'Unknown',
    asn: 'Unknown',
    org: 'Unknown',
    isp: 'Unknown',
    suspicious: false,
    loc: null
  };
  let suspiciousReason = [];
  try {
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
      }
    }
    // Patch: support geoData mocking in tests
    if (event.headers['x-geo-mock']) {
      try {
        const mock = JSON.parse(event.headers['x-geo-mock']);
        geoData = { ...geoData, ...mock };
      } catch {}
    }
    // Check if country is allowed
    if (!ALLOWED_COUNTRIES.includes(geoData.countryCode)) {
      geoData.suspicious = true;
      suspiciousReason.push(`Negara tidak diizinkan: ${geoData.countryCode}`);
      console.log(`Suspicious access from non-allowed country: ${geoData.countryCode}`);
    }
    // Check if ASN is suspicious (VPN/Proxy)
    if (SUSPICIOUS_ASNS.includes(geoData.asn)) {
      geoData.suspicious = true;
      suspiciousReason.push(`VPN/Proxy terdeteksi: ${geoData.org} (AS${geoData.asn})`);
      console.log(`Suspicious access from potential VPN/Proxy: ${geoData.org}`);
    }
  } catch (error) {
    console.error('Error fetching IP geolocation:', error);
  }
  // Setelah geoData terisi, jika User-Agent mencurigakan, tandai suspicious
  if (suspiciousUAFlag) {
    geoData.suspicious = true;
    suspiciousReason.push('User-Agent mencurigakan');
  }

  // Parse body
  try {
    const body = JSON.parse(event.body);
    // Honeypot (optional)
    if (body.website || body.contact_number) {
      return { statusCode: 400, headers: corsHeaders, body: 'Bot detected.' };
    }
    // Time-based validation (anti-bot)
    if (body.formStart && body.formSubmit) {
      const formStart = Number(body.formStart);
      const formSubmit = Number(body.formSubmit);
      if (!isNaN(formStart) && !isNaN(formSubmit)) {
        const duration = formSubmit - formStart;
        // Tolak jika isi form <2 detik (bot) atau >1 jam (kemungkinan abuse)
        if (duration < 2000 || duration > 3600000) {
          return { statusCode: 400, headers: corsHeaders, body: 'Suspicious form timing.' };
        }
      }
    }
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders, body: 'Invalid JSON' };
  }


  // Get ?to= parameter from query string (main), fallback to referer if not present
  let guestParam = '-';
  if (event.queryStringParameters && event.queryStringParameters['to']) {
    guestParam = event.queryStringParameters['to'];
  } else {
    try {
  const url = new URL(event.headers.referer || '', allowedOrigins[0]);
      guestParam = url.searchParams.get('to') || '-';
    } catch (e) {
      // ignore
    }
  }

  // Query String/Parameter Anomaly Detection (SQLi/XSS/etc)
  // Detect strange characters/patterns in guestParam (or other parameters if needed)
  if (guestParam && guestParam !== '-') {
    // Uncommon non-alphanumeric characters, atau pola XSS/SQLi
    if (/[^a-zA-Z0-9 _-]/.test(guestParam) || /<|script|\{|\}|\$|\(|\)|select|union|insert|update|delete|drop|--|\/\*/i.test(guestParam)) {
      geoData.suspicious = true;
      suspiciousReason.push(`Query string/parameter mencurigakan: ${guestParam}`);
      console.log('Suspicious query string/parameter detected:', guestParam);
      // Langsung blokir request
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: 'Access denied: Suspicious query string or guest parameter.'
      };
    }
  }



  try {
    // Choose bot & chat id according to suspicious status
    const BOT_TOKEN = geoData.suspicious
      ? process.env.SUSPECT_BOT_TOKEN
      : process.env.ANALYTICS_BOT_TOKEN;
    const CHAT_ID = geoData.suspicious
      ? process.env.SUSPECT_CHAT_ID
      : process.env.ANALYTICS_CHAT_ID;

    const securityEmoji = geoData.suspicious ? '❗' : '✔';

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
    // Add coordinate info only for developer (valid API key)
    let adminLocInfo = '';

    // --- Additional details for suspect ---
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
      try {
        if (event.body) {
          let parsed = JSON.parse(event.body);
          if (parsed && typeof parsed === 'object') {
            // Remove honeypot & api key
            delete parsed.website;
            delete parsed.apiKey;
            suspectDetails += `\n# *Body:* \`${JSON.stringify(parsed)}\``;
          }
        }
      } catch {}
      // Number of requests from IP in last 10 minutes
      suspectDetails += `\n# *Request IP (10m):* ${ipRequestLog[ip]?.length || 1}x`;
      // Org/ASN detail
      suspectDetails += `\n# *Org/ASN:* ${geoData.org} (AS${geoData.asn})`;
      // Flag suspicious guestParam
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

    const formattedMessage = [
      '```',
      `${geoData.suspicious ? '❗ *SUSPICIOUS ACCESS DETECTED!*' :
        isNewSession && visitorHistory[fingerprint].visitCount > 1 ? '⭮ *Sesi Baru Pengunjung Lama*' :
        visitorHistory[fingerprint].visitCount > 1 ? '⭠ *Pengunjung Kembali*' : '◻ *Pengunjung Baru*'}`,
      `> *IP:* \`${ip}\``,
      `> *Waktu:* \`${new Date().toISOString()}\``,
      `> *Browser:* \`${browser}\``,
      `> *OS:* \`${os}\``,
      `> *Perangkat:* \`${device}\``,
      `> *Referrer:* \`${referer || '-'}\``,
      guestParam !== '-' ? `◯ *Tamu:* \`${guestParam}\`` : '',
      suspectDetails,
      '',
      '⭮ *Statistik Kunjungan:*',
      `• *Kunjungan ke:* \`${visitorHistory[fingerprint].visitCount}\``,
      `• *Pertama kali:* \`${new Date(visitorHistory[fingerprint].firstVisit).toISOString().split('T')[0]}\``,
      `• *ID Sesi:* \`${latestVisit.sessionId.substring(0, 8)}...\``,
      sessionDuration ? `• *Durasi rata-rata:* \`${sessionDuration}\`` : '',
      '',
      '◻ *Lokasi:*',
      `${securityEmoji} \`${geoData.city}, ${geoData.region}, ${geoData.country} (${geoData.countryCode})\``,
      `# *ISP/ASN:* \`${geoData.isp} (AS${geoData.asn})\``,
      geoData.suspicious ? `❗ *Alasan:* ${suspiciousReason.join(' | ')}` : '',
      adminLocInfo,
      '```'
    ].filter(Boolean).join('\n');

    if (BOT_TOKEN && CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: formattedMessage,
          parse_mode: 'Markdown'
        })
      });
    }
    // Patch: blokir langsung jika negara tidak diizinkan atau ASN mencurigakan
    if (!ALLOWED_COUNTRIES.includes(geoData.countryCode)) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: 'Access denied: Country not allowed or please turn off your VPN or proxy to access this invitation.'
      };
    }
    if (SUSPICIOUS_ASNS.includes(geoData.asn)) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: 'Access denied: Country not allowed or please turn off your VPN or proxy to access this invitation.'
      };
    }
    // Untuk suspicious query string dan User-Agent, hanya alert, jangan blokir
    // Request tetap diterima (status 200)
  } catch (err) {
    console.error('Failed to send visitor info to Telegram:', err);
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      message: 'Welcome to the invitation!'
    })
  };
};
