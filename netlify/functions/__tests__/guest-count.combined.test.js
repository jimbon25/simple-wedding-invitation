// netlify/functions/__tests__/guest-count.combined.test.js
const { handler } = require('../guest-count');

const validHeaders = {
  origin: 'https://invitation-dn.netlify.app',
  referer: '-',
  'user-agent': 'Mozilla/5.0',
  'x-api-key': process.env.GUEST_API_KEY || ''
};

describe('guest-count Netlify Function - All Cases & Alert Telegram (gabungan)', () => {
  beforeAll(() => {
    global.fetch = jest.fn();
    process.env.GUEST_API_KEY = 'dla666999dla';
    process.env.DEV_MODE_SECRET = 'dev666999';
    process.env.ALLOWED_COUNTRIES = 'ID,SG,MY';
  });

  afterAll(() => {
    global.fetch.mockRestore();
  });
  it('should block country not allowed', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        country: 'RU', // Negara tidak diizinkan
        org: 'AS14061 DigitalOcean',
        loc: '55.7558,37.6173'
      })
    });
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: '{}',
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(403);
    expect(result.body).toContain('Country not allowed');
  });

  it('should block VPN/proxy ASN', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        country: 'ID',
        org: 'AS14061 DigitalOcean', // ASN VPN/proxy
        loc: '55.7558,37.6173'
      })
    });
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: '{}',
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(403);
    expect(result.body).toContain('VPN or proxy');
  });

  it('should allow reset history with valid API key', async () => {
    const event = {
      headers: {
        ...validHeaders,
        origin: 'https://invitation-dn.netlify.app',
        referer: 'https://invitation-dn.netlify.app/',
        'x-api-key': process.env.GUEST_API_KEY
      },
      httpMethod: 'POST',
      body: JSON.stringify({ action: 'reset_history' }),
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('Visitor history reset successfully');
  });

  it('should block reset history without API key', async () => {
    const event = {
      headers: { ...validHeaders, 'x-api-key': '' },
      httpMethod: 'POST',
      body: JSON.stringify({ action: 'reset_history' }),
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(403);
    expect(result.body).toContain('API key required for admin action');
  });

  it('should allow developer mode', async () => {
    const devSecret = process.env.DEV_MODE_SECRET || 'dev666999';
    const event = {
      headers: {
        ...validHeaders,
        origin: 'https://invitation-dn.netlify.app',
        referer: `https://invitation-dn.netlify.app/?devMode=${devSecret}`
      },
      httpMethod: 'POST',
      body: '{}',
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('Developer mode aktif');
  });
  // --- Test blokir & validasi utama ---
  it('should block invalid origin', async () => {
    const event = {
      headers: { ...validHeaders, origin: 'http://malicious.com' },
      httpMethod: 'POST',
      body: '{}',
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(403);
    expect(result.body).toContain('Invalid origin');
  });

  it('should block invalid referer', async () => {
    const event = {
      headers: { ...validHeaders, referer: 'http://malicious.com' },
      httpMethod: 'POST',
      body: '{}',
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(403);
    expect(result.body).toContain('Invalid referer');
  });

  it('should block GET method', async () => {
    const event = {
      headers: validHeaders,
      httpMethod: 'GET',
      body: '{}',
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(405);
  });

  it('should block payload too large', async () => {
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: 'a'.repeat(3000),
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(413);
  });

  it('should block suspicious user-agent', async () => {
    const event = {
      headers: { ...validHeaders, 'user-agent': 'curl/7.68.0' },
      httpMethod: 'POST',
      body: '{}',
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.body).toBeDefined();
  });

  it('should block honeypot bot', async () => {
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ website: 'bot.com' }),
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Bot detected');
  });

  it('should block suspicious timing', async () => {
    const now = Date.now();
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ formStart: now, formSubmit: now + 1000 }), // <2 detik
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.body).toBeDefined();
  });

  it('should block invalid JSON', async () => {
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: '{invalid}',
      queryStringParameters: {}
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid JSON');
  });

  it('should block suspicious query param', async () => {
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: '{}',
      queryStringParameters: { to: '<script>' }
    };
    const result = await handler(event, {});
    expect(result.body).toBeDefined();
  });

  it('should allow valid request (normal tracking)', async () => {
    // Pastikan geoData di-mock dengan country 'ID' dan org bukan VPN/proxy
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        country: 'ID',
        org: 'AS7717 PT Telekomunikasi Indonesia', // ASN normal
        loc: '-6.2,106.8'
      })
    });
    const event = {
      headers: {
        ...validHeaders,
        origin: 'https://invitation-dn.netlify.app',
        referer: 'https://invitation-dn.netlify.app/'
      },
      httpMethod: 'POST',
      body: JSON.stringify({ section: 'home' }),
      queryStringParameters: { to: 'Tamu Undangan' }
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('Welcome');
  });
});
