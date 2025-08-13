// netlify/functions/__tests__/functions-shared.test.js

describe('functions-shared Netlify Function - All Cases', () => {
  beforeAll(() => {
    global.fetch = jest.fn();
    process.env.ADMIN_TELEGRAM_BOT_TOKEN = 'dummy-bot-token';
    process.env.ADMIN_TELEGRAM_CHAT_ID = 'dummy-chat-id';
    process.env.TELEGRAM_BOT_TOKEN = 'dummy-bot-token';
    process.env.TELEGRAM_CHAT_ID = 'dummy-chat-id';
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/dummy';
    process.env.REACT_APP_SITE_URL = 'https://dummy-site.netlify.app';
  });

  beforeEach(() => {
    // Reset rate limiter sebelum setiap test
    try {
      const { ipRequestLog } = require('../functions-shared');
      for (const key in ipRequestLog) delete ipRequestLog[key];
    } catch {}
  });

  afterAll(() => {
    global.fetch.mockRestore();
  });

    const validHeaders = {
      'x-forwarded-for': '1.2.3.4',
      origin: 'https://dummy-site.netlify.app',
      referer: '-',
      'user-agent': 'Mozilla/5.0'
    };
    jest.resetModules();
    jest.clearAllMocks();
    // Mock global.fetch agar notifikasi Telegram/Discord selalu sukses
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    // Reset rate limiter
    const { ipRequestLog } = require('../functions-shared');
    for (const ip in ipRequestLog) {
      delete ipRequestLog[ip];
    }

  it('should block empty body', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: ''
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Request body kosong');
  });

  it('should block invalid JSON', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: '{invalid}'
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid JSON');
  });

  it('should block blacklist content', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'promo diskon', message: 'gratis hadiah' })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Konten terlarang');
  });

  it('should block honeypot bot', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ website: 'bot.com' })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Bot detected');
  });

  it('should block suspicious timing', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const now = Date.now();
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ formStart: now, formSubmit: now + 1000 })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Suspicious form timing');
  });

  it('should block name too long', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'a'.repeat(51), message: 'halo' })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Nama terlalu panjang');
  });

  it('should block message too long', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'halo', message: 'a'.repeat(301) })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Pesan terlalu panjang');
  });

  it('should block suspicious content', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'halo', message: '<script>alert(1)</script>' })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Konten tidak valid');
  });

  it('should block GET method', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'GET',
      body: JSON.stringify({ name: 'halo', message: 'halo' })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(405);
  });

  it('should block rate limit', async () => {
    global.fetch.mockResolvedValue({ ok: true });
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'halo', message: 'halo' })
    };
    // Simulate 5 requests to trigger rate limit
    for (let i = 0; i < 5; i++) {
      await sharedHandler(event, {});
    }
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(429);
    expect(result.body).toContain('Terlalu banyak permintaan');
  });

  it('should allow valid RSVP request', async () => {
    global.fetch.mockResolvedValue({ ok: true });
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'Tamu', attendance: 'Hadir', guests: 2, foodPreference: 'Vegetarian', message: 'Selamat', type: 'rsvp' })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('success');
  });

  it('should allow valid guestbook request', async () => {
    global.fetch.mockResolvedValue({ ok: true });
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'Tamu', message: 'Selamat', type: 'guestbook' })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('success');
  });

  it('should allow visit type (tracking disabled)', async () => {
    jest.resetModules();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }));
    const { ipRequestLog, sharedHandler } = require('../functions-shared');
    for (const ip in ipRequestLog) delete ipRequestLog[ip];
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'Tamu', message: 'Selamat', type: 'visit' })
    };
    const result = await sharedHandler(event, {});
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('Visit tracking disabled');
  });
});
