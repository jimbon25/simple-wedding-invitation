// Full unit & integration test for Netlify Function guest-count
const { handler } = require('../guest-count');

const validHeaders = {
  origin: 'https://invitation-dn.netlify.app',
  referer: '-',
  'user-agent': 'Mozilla/5.0',
  'x-api-key': process.env.GUEST_API_KEY || ''
};

describe('guest-count Netlify Function - All Cases', () => {
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
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid User-Agent');
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
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ _startTime: Date.now() }),
      queryStringParameters: {}
    };
    // Simulate suspicious timing by setting _startTime = now
    const result = await handler(event, {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Suspicious form timing');
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
    expect(result.statusCode).toBe(200); // Telegram alert, but not always blocked unless ASN/UA/country
    // You can adjust expected statusCode if you want to block all
  });

  it('should allow valid request', async () => {
    const event = {
      headers: validHeaders,
      httpMethod: 'POST',
      body: JSON.stringify({ section: 'home' }),
      queryStringParameters: { to: 'Tamu Undangan' }
    };
    const result = await handler(event, {});
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('Welcome');
  });
});
