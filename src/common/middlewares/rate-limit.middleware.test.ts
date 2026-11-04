import express from 'express';
import request from 'supertest';
import { HTTP_STATUS } from '@common/constants';
import { requestContextMiddleware } from './request-context.middleware';
import { makeRateLimitMiddleware } from './rate-limit.middleware';

const buildApp = (enabled: boolean, maxRequests = 1): express.Express => {
	const app = express();

	app.set('trust proxy', false);
	app.use(requestContextMiddleware);
	app.use(makeRateLimitMiddleware({ enabled, windowMs: 60_000, maxRequests }));
	app.get('/health', (_req, res): void => {
		res.json({ ok: true });
	});
	app.get('/limited', (_req, res): void => {
		res.json({ ok: true });
	});

	return app;
};

describe('makeRateLimitMiddleware', () => {
	it('returns a structured 429 response after the configured limit', async () => {
		const app = buildApp(true);

		await request(app).get('/limited');
		const response = await request(app).get('/limited').set('code', 'limited-code');

		expect(response.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
		expect(response.body).toEqual({
			name: 'TooManyRequestsError',
			message: 'Too many requests',
			code: 'limited-code'
		});
		expect(response.headers['ratelimit-limit']).toBe('1');
		expect(response.headers['x-ratelimit-limit']).toBeUndefined();
	});

	it('does not count forwarded addresses when trust proxy is disabled', async () => {
		const app = buildApp(true);

		await request(app).get('/limited');
		const response = await request(app).get('/limited').set('x-forwarded-for', '203.0.113.25');

		expect(response.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
	});

	it('exempts the health endpoint', async () => {
		const app = buildApp(true);

		const firstResponse = await request(app).get('/health');
		const secondResponse = await request(app).get('/health');

		expect([firstResponse.status, secondResponse.status]).toEqual([HTTP_STATUS.OK, HTTP_STATUS.OK]);
	});

	it('does not limit requests when disabled', async () => {
		const app = buildApp(false);

		const firstResponse = await request(app).get('/limited');
		const secondResponse = await request(app).get('/limited');

		expect([firstResponse.status, secondResponse.status]).toEqual([HTTP_STATUS.OK, HTTP_STATUS.OK]);
	});
});
