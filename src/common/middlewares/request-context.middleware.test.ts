import express, { type Express, type Request, type Response } from 'express';
import request from 'supertest';
import { TRUSTED_IDENTITY_HEADER } from '@common/context';
import { makeRequestContextMiddleware } from './request-context.middleware';

const OVERSIZED_IDENTITY_LENGTH = 8200;

const buildApp = (trustIdentityHeader: boolean): Express => {
	const app = express();

	app.use(makeRequestContextMiddleware({ trustIdentityHeader }));

	app.get('/test', (req: Request, res: Response): void => {
		res.json({ user: req.user ?? null });
	});

	return app;
};

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
