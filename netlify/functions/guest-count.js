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
// Add countries allowed to access the invitation
const ALLOWED_COUNTRIES = ['ID']; 

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
  const allowedOrigin = 'https://invitation-dn.netlify.app/';
  const origin = event.headers['origin'] || '';
  const referer = event.headers['referer'] || '-';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin'
  };

  // API Key validation (optional, for more private endpoint)
  const apiKey = event.headers['x-api-key'];
  const pentestRateKey = process.env.PENTEST_RATE_KEY || 'PENTEST-RATE-KEY';
  const isPentestRateKey = apiKey === pentestRateKey;
  if (apiKey !== process.env.GUEST_API_KEY && !isPentestRateKey) {
    return { statusCode: 403, headers: corsHeaders, body: 'Forbidden' };
  }

  // Origin/Referer validation
  if (origin && origin !== allowedOrigin) {
    return { statusCode: 403, headers: corsHeaders, body: 'Invalid origin' };
  }
  if (referer !== '-' && !referer.startsWith(allowedOrigin)) {
    return { statusCode: 403, headers: corsHeaders, body: 'Invalid referer' };
  }

  // Body size limit (2KB)
  if ((event.body || '').length > 2048) {
    return { statusCode: 413, headers: corsHeaders, body: 'Payload too large' };
  }

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, User-Agent, X-Api-Key'
      },
      body: ''
    };
  }
  
  // Handle admin reset request (for testing)
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      if (body.action === 'reset_history') {
        if (resetVisitorHistory(event)) {
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
              success: true, 
              message: 'Visitor history reset successfully' 
            })
          };
        } else {
          return {
            statusCode: 403,
            headers: corsHeaders,
            body: JSON.stringify({ 
              success: false, 
              message: 'Unauthorized reset attempt' 
            })
          };
        }
      }
    } catch (e) {
      // Ignore parsing errors for non-reset requests
    }
  }
  
  // Secret parameter for developer mode
  const DEV_MODE_SECRET = 'your_secret_key'; // set your own secret here

  // Check if request is from developer based on URL parameter
  try {
    if (referer && referer !== '-') {
      const urlObj = new URL(referer);
      const devMode = urlObj.searchParams.get('devMode');
      if (devMode === DEV_MODE_SECRET) {
        console.log('Dev mode detected from URL parameter, tracking skipped');
        return { 
          statusCode: 200, 
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: true, 
            message: 'Developer mode active, tracking skipped' 
          })
        };
      }
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
  // Detect strange User-Agents (bots, curls, headless, etc.) - don't block, mark suspicious.
  const suspiciousUA = /(bot|curl|python|wget|scrapy|headless|phantom|selenium|spider|httpclient|axios|go-http|node-fetch|java|libwww|perl|ruby|powershell|http_request|httpclient|fetch|postman|insomnia)/i;
  let suspiciousUAFlag = false;
  if (suspiciousUA.test(userAgent)) {
    suspiciousUAFlag = true;
    // Later geoData.suspicious will be set to true after geoData is filled
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
    loc: null // coordinates latitude,longitude if available
  };
  let suspiciousReason = [];
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
          region: ipInfo.region || 'Unknown', // Additional regions
          asn: ipInfo.org ? ipInfo.org.split(' ')[0].replace('AS', '') : 'Unknown',
          org: ipInfo.org ? ipInfo.org.split(' ').slice(1).join(' ') : 'Unknown',
          isp: ipInfo.org || 'Unknown',
          suspicious: false,
          loc: ipInfo.loc || null // format: "latitude,longitude"
        };
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
      }
    }
  } catch (error) {
    console.error('Error fetching IP geolocation:', error);
  }
  // After geoData is filled, if User-Agent is strange, mark suspicious
  if (suspiciousUAFlag) {
    geoData.suspicious = true;
    suspiciousReason.push('User-Agent mencurigakan');
  }

  // Parse body
  try {
    const body = JSON.parse(event.body);
    // Honeypot (optional)
    if (body.website) {
      return { statusCode: 400, headers: corsHeaders, body: 'Bot detected.' };
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
  const url = new URL(event.headers.referer || '', allowedOrigin);
      guestParam = url.searchParams.get('to') || '-';
    } catch (e) {
      // ignore
    }
  }

  // Query String/Parameter Anomaly Detection (SQLi/XSS/etc)
  // Detect strange characters/patterns in guestParam (or other parameters if needed)
  if (guestParam && guestParam !== '-') {
    // Uncommon non-alphanumeric characters, or simple XSS/SQLi patterns
    if (/[^a-zA-Z0-9 _-]/.test(guestParam) || /<|script|\{|\}|\$|\(|\)|select|union|insert|update|delete|drop|--|\/\*/i.test(guestParam)) {
      geoData.suspicious = true;
      suspiciousReason.push(`Query string/parameter mencurigakan: ${guestParam}`);
      console.log('Suspicious query string/parameter detected:', guestParam);
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
    // Block VPN/proxy users, suspicious query strings, strange User-Agents, or countries not allowed after an alert is sent.
    if (geoData.suspicious) {
      // Block if VPN/proxy
      if (SUSPICIOUS_ASNS.includes(geoData.asn)) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: 'Access denied: Country not allowed or please turn off your VPN or proxy to access this invitation.'
        };
      }
      // Block if suspicious reason includes suspicious query string/parameter
      if (suspiciousReason.some(reason => reason.includes('Query string/parameter mencurigakan'))) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: 'Access denied: Suspicious query string or guest parameter.'
        };
      }
      // Block if User-Agent is suspicious
      if (suspiciousReason.some(reason => reason.includes('User-Agent mencurigakan'))) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: 'Access denied: Suspicious User-Agent detected.'
        };
      }
      // Block if country is not allowed
      if (suspiciousReason.some(reason => reason.includes('Negara tidak diizinkan'))) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: 'Access denied: Country not allowed or please turn off your VPN or proxy to access this invitation.'
        };
      }
    }
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
