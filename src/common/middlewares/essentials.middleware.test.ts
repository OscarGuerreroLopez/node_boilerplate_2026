import express, { type Express } from 'express';
import request from 'supertest';
import { HTTP_STATUS } from '@common/constants';
import { applyExpressEssentials } from './essentials.middleware';
import { makeErrorHandlerMiddleware } from './error-handler.middleware';

interface BuildAppOptions {
	corsAllowedOrigins: string[];
	allowAllOriginsWhenEmpty: boolean;
}

const OVERSIZED_BODY_LENGTH = 2048;

const buildApp = ({ corsAllowedOrigins, allowAllOriginsWhenEmpty }: BuildAppOptions): Express => {
	const app = express();

	applyExpressEssentials(app, {
		corsAllowedOrigins,
		maxJsonBodySize: '1kb',
		allowAllOriginsWhenEmpty
	});

	app.get('/test', (_req, res): void => {
		res.json({ ok: true });
	});

	app.post('/test', (_req, res): void => {
		res.json({ ok: true });
	});

	app.use(makeErrorHandlerMiddleware({ includeErrorDetails: false }));

	return app;
};

describe('applyExpressEssentials CORS behavior', () => {
	it('allows requests without an Origin header', async () => {
		const app = buildApp({
			corsAllowedOrigins: [],
			allowAllOriginsWhenEmpty: false
		});

		const response = await request(app).get('/test');

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.headers['access-control-allow-origin']).toBeUndefined();
	});

	it('allows any origin when the allowlist is empty and empty allowlists are allowed', async () => {
		const app = buildApp({
			corsAllowedOrigins: [],
			allowAllOriginsWhenEmpty: true
		});

		const response = await request(app).get('/test').set('origin', 'http://example.com');

		expect(response.headers['access-control-allow-origin']).toBe('http://example.com');
		expect(response.headers['access-control-allow-credentials']).toBeUndefined();
	});

	it('enables credentials for allowlisted origins', async () => {
		const app = buildApp({
			corsAllowedOrigins: ['http://example.com'],
			allowAllOriginsWhenEmpty: false
		});

		const response = await request(app).get('/test').set('origin', 'http://example.com');

		expect(response.headers['access-control-allow-origin']).toBe('http://example.com');
		expect(response.headers['access-control-allow-credentials']).toBe('true');
	});

	it('denies browser origins when the allowlist is empty and empty allowlists are denied', async () => {
		const app = buildApp({
			corsAllowedOrigins: [],
			allowAllOriginsWhenEmpty: false
		});

		const response = await request(app).get('/test').set('origin', 'http://example.com');

		expect(response.headers['access-control-allow-origin']).toBeUndefined();
	});

	it('allows origins in the allowlist', async () => {
		const app = buildApp({
			corsAllowedOrigins: ['http://example.com'],
			allowAllOriginsWhenEmpty: false
		});

		const response = await request(app).get('/test').set('origin', 'http://example.com');

		expect(response.headers['access-control-allow-origin']).toBe('http://example.com');
	});

	it('denies origins outside the allowlist', async () => {
		const app = buildApp({
			corsAllowedOrigins: ['http://example.com'],
			allowAllOriginsWhenEmpty: true
		});

		const response = await request(app).get('/test').set('origin', 'http://not-allowed.com');

		expect(response.headers['access-control-allow-origin']).toBeUndefined();
	});
});

describe('applyExpressEssentials parser errors', () => {
	it('keeps security and CORS headers on malformed JSON responses', async () => {
		const app = buildApp({
			corsAllowedOrigins: ['http://example.com'],
			allowAllOriginsWhenEmpty: false
		});

		const response = await request(app)
			.post('/test')
			.set('origin', 'http://example.com')
			.set('content-type', 'application/json')
			.send('{"name":');

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(response.headers['access-control-allow-origin']).toBe('http://example.com');
		expect(response.headers['x-content-type-options']).toBe('nosniff');
	});
});

describe('applyExpressEssentials body limits', () => {
	it('rejects oversized JSON bodies', async () => {
		const app = buildApp({
			corsAllowedOrigins: [],
			allowAllOriginsWhenEmpty: true
		});

		const response = await request(app)
			.post('/test')
			.set('content-type', 'application/json')
			.send({ data: 'a'.repeat(OVERSIZED_BODY_LENGTH) });

		expect(response.status).toBe(HTTP_STATUS.PAYLOAD_TOO_LARGE);
		expect(response.body).toEqual({
			name: 'PayloadTooLargeError',
			message: 'Payload too large',
			code: 'noCode'
		});
	});

	it('rejects oversized URL-encoded bodies', async () => {
		const app = buildApp({
			corsAllowedOrigins: [],
			allowAllOriginsWhenEmpty: true
		});

		const response = await request(app)
			.post('/test')
			.set('content-type', 'application/x-www-form-urlencoded')
			.send({ data: 'a'.repeat(OVERSIZED_BODY_LENGTH) });

		expect(response.status).toBe(HTTP_STATUS.PAYLOAD_TOO_LARGE);
		expect(response.body).toEqual({
			name: 'PayloadTooLargeError',
			message: 'Payload too large',
			code: 'noCode'
		});
	});
});
