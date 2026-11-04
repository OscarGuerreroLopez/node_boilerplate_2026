import express, { type Express, type Request, type Response } from 'express';
import request from 'supertest';
import { TRUSTED_IDENTITY_HEADER } from '@common/context';
import { makeRequestContextMiddleware } from './request-context.middleware';

const OVERSIZED_IDENTITY_LENGTH = 8200;
const VALID_UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const buildApp = (trustIdentityHeader: boolean): Express => {
	const app = express();

	app.use(makeRequestContextMiddleware({ trustIdentityHeader }));

	app.get('/test', (req: Request, res: Response): void => {
		res.json({ user: req.user ?? null });
	});

	app.get('/code', (req: Request, res: Response): void => {
		res.json({ code: req.code });
	});

	return app;
};

describe('makeRequestContextMiddleware code handling', () => {
	it('preserves a canonical UUID code', async () => {
		const response = await request(buildApp(false)).get('/code').set('code', VALID_UUID);

		expect(response.body).toEqual({ code: VALID_UUID });
	});

	it('preserves an uppercase canonical UUID code', async () => {
		const response = await request(buildApp(false)).get('/code').set('code', VALID_UUID.toUpperCase());

		expect(response.body).toEqual({ code: VALID_UUID.toUpperCase() });
	});

	it('generates a UUID when the code is missing or invalid', async () => {
		const app = buildApp(false);

		const missingResponse = await request(app).get('/code');
		const invalidResponse = await request(app).get('/code').set('code', 'health-code');
		const oversizedResponse = await request(app).get('/code').set('code', `${VALID_UUID}-extra`);
		const prefixedResponse = await request(app).get('/code').set('code', `urn:uuid:${VALID_UUID}`);

		expect(missingResponse.body.code).toMatch(UUID_PATTERN);
		expect(invalidResponse.body.code).toMatch(UUID_PATTERN);
		expect(oversizedResponse.body.code).toMatch(UUID_PATTERN);
		expect(prefixedResponse.body.code).toMatch(UUID_PATTERN);
		expect(invalidResponse.body.code).not.toBe('health-code');
	});
});

describe('makeRequestContextMiddleware identity handling', () => {
	it('ignores the trusted identity header when trust is disabled', async () => {
		const app = buildApp(false);

		const response = await request(app)
			.get('/test')
			.set(TRUSTED_IDENTITY_HEADER, JSON.stringify({ id: 'user-1' }));

		expect(response.body).toEqual({ user: null });
	});

	it('parses trusted identity and removes password fields when trust is enabled', async () => {
		const app = buildApp(true);

		const response = await request(app)
			.get('/test')
			.set(
				TRUSTED_IDENTITY_HEADER,
				JSON.stringify({
					id: 'user-1',
					email: 'oscar@example.com',
					role: 'admin',
					password: 'secret',
					profile: {
						password: 'secret',
						theme: 'dark'
					}
				})
			);

		expect(response.body).toEqual({
			user: {
				id: 'user-1',
				email: 'oscar@example.com',
				role: 'admin',
				profile: {
					theme: 'dark'
				}
			}
		});
	});

	it('ignores the legacy user header', async () => {
		const app = buildApp(true);

		const response = await request(app)
			.get('/test')
			.set('user', JSON.stringify({ id: 'user-1' }));

		expect(response.body).toEqual({ user: null });
	});

	it('rejects invalid and oversized identity headers', async () => {
		const app = buildApp(true);

		const invalidResponse = await request(app).get('/test').set(TRUSTED_IDENTITY_HEADER, '{"id":');
		const oversizedResponse = await request(app)
			.get('/test')
			.set(TRUSTED_IDENTITY_HEADER, JSON.stringify({ id: 'a'.repeat(OVERSIZED_IDENTITY_LENGTH) }));

		expect(invalidResponse.body).toEqual({ user: null });
		expect(oversizedResponse.body).toEqual({ user: null });
	});
});
