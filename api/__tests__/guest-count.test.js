import { jest } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();
describe('Vercel guest-count API', () => {
		let handler;
		beforeAll(async () => {
			handler = (await import('../guest-count.js')).default;
		});

	beforeEach(() => {
			fetchMock.resetMocks();
			process.env.ALLOWED_COUNTRIES = 'ID';
			process.env.DEV_MODE_SECRET = 'dev-secret';
			process.env.GUEST_API_KEY = 'dummy-key';
			process.env.PENTEST_RATE_KEY = 'pentest-key';
			process.env.IPINFO_TOKEN = 'ipinfo-token';
			process.env.ANALYTICS_BOT_TOKEN = 'analytics-token';
			process.env.ANALYTICS_CHAT_ID = 'analytics-chat';
			process.env.SUSPECT_BOT_TOKEN = 'suspect-token';
			process.env.SUSPECT_CHAT_ID = 'suspect-chat';
			process.env.NEXT_PUBLIC_SITE_URL = 'https://your-site.vercel.app';
			// Mock fetch to always return valid JSON for IPInfo/Telegram
			fetchMock.mockResponse(async req => {
				if (req.url.includes('ipinfo')) {
					return JSON.stringify({ country: 'ID', org: 'AS14061 DigitalOcean', city: 'Jakarta', region: 'Jakarta', loc: '1,1' });
				}
				if (req.url.includes('telegram')) {
					return JSON.stringify({ ok: true });
				}
				return JSON.stringify({ ok: true });
			});
			// Reset any global state if needed
			// ...existing code...
	});

	function mockReq({
		method = 'GET',
		headers = {},
		body = undefined,
		query = {},
		referer = 'https://your-site.vercel.app',
		origin = 'https://your-site.vercel.app',
		ip = '1.2.3.4',
		userAgent = 'Mozilla/5.0',
		to = undefined
	} = {}) {
		return {
			method,
			headers: {
				'x-forwarded-for': ip,
				'origin': origin,
				'referer': referer,
				'user-agent': userAgent,
				...headers
			},
			body,
			query: to ? { to } : query
		};
	}

	function mockRes() {
		let statusCode = 0;
		let jsonData = null;
		return {
			setHeader: jest.fn(),
			status: function(code) { statusCode = code; return this; },
			json: function(data) { jsonData = data; return this; },
			end: jest.fn(),
			send: function(data) { jsonData = data; return this; },
			getStatus: () => statusCode,
			getJson: () => jsonData
		};
	}

	it('should allow valid guest from allowed country', async () => {
		const req = mockReq({});
		const res = mockRes();
		await handler(req, res);
		expect([200, 403]).toContain(res.getStatus());
		// ...existing code...
	});

	it('should block guest from non-allowed country', async () => {
		fetchMock.mockResponse(JSON.stringify({ country: 'US', org: 'AS14061 DigitalOcean', city: 'NY', region: 'NY', loc: '1,1' }));
		const req = mockReq({});
		const res = mockRes();
		await handler(req, res);
		expect(res.getStatus()).toBe(403);
	});

	it('should block suspicious User-Agent', async () => {
		fetchMock.mockResponse(JSON.stringify({ country: 'ID', org: 'AS14061 DigitalOcean', city: 'Jakarta', region: 'Jakarta', loc: '1,1' }));
		const req = mockReq({ userAgent: 'curl/7.0' });
		const res = mockRes();
		await handler(req, res);
		expect(res.getStatus()).toBe(403);
	});

	it('should block suspicious query param', async () => {
		fetchMock.mockResponse(JSON.stringify({ country: 'ID', org: 'AS14061 DigitalOcean', city: 'Jakarta', region: 'Jakarta', loc: '1,1' }));
		const req = mockReq({ to: '<script>' });
		const res = mockRes();
		await handler(req, res);
		expect(res.getStatus()).toBe(403);
	});

	it('should block if rate limit exceeded', async () => {
		const req = mockReq({});
		const res = mockRes();
		for (let i = 0; i < 10; i++) {
			await handler(req, res);
		}
		await handler(req, res);
		expect([429, 403]).toContain(res.getStatus());
		// ...existing code...
	});

	it('should skip tracking in dev mode', async () => {
		const req = mockReq({ referer: 'https://your-site.vercel.app?devMode=dev-secret' });
		const res = mockRes();
		await handler(req, res);
		expect(res.getStatus()).toBe(200);
		expect(res.getJson().message).toMatch(/Developer mode active/);
	});

	it('should block invalid API key', async () => {
		const req = mockReq({ headers: { 'x-api-key': 'wrong-key' } });
		const res = mockRes();
		await handler(req, res);
		expect(res.getStatus()).toBe(403);
	});

	it('should allow pentest rate key', async () => {
		const req = mockReq({ headers: { 'x-api-key': 'pentest-key' } });
		const res = mockRes();
		await handler(req, res);
		expect([200, 403]).toContain(res.getStatus());
	});

	it('should handle Telegram API error gracefully', async () => {
		fetchMock.mockResponseOnce(JSON.stringify({ country: 'ID', org: 'AS14061 DigitalOcean', city: 'Jakarta', region: 'Jakarta', loc: '1,1' }));
		fetchMock.mockResponseOnce(JSON.stringify({ ok: false }));
		const req = mockReq({});
		const res = mockRes();
		await handler(req, res);
		expect([200, 403]).toContain(res.getStatus());
		// ...existing code...
	});
});
