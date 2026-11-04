import express from 'express';
import request from 'supertest';
import { HTTP_STATUS } from '@common/constants';
import { makeApiKeyMiddleware } from './api-key.middleware';
import { requestContextMiddleware } from './request-context.middleware';

const EXPECTED_API_KEY = 'expected-api-key';
const FORBIDDEN_CODE = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

const buildApp = (): express.Express => {
	const app = express();

	app.use(requestContextMiddleware);
	app.get('/protected', makeApiKeyMiddleware({ getExpectedApiKey: () => EXPECTED_API_KEY }), (_req, res): void => {
		res.json({ ok: true });
	});

	return app;
};

describe('makeApiKeyMiddleware', () => {
	it('accepts the expected API key', async () => {
		const response = await request(buildApp()).get('/protected').set('x-api-key', EXPECTED_API_KEY);

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.body).toEqual({ ok: true });
	});

	it.each([
		['an empty key', ''],
		['a whitespace-only key', '   '],
		['a key with a different byte length', 'short'],
		['a same-length key with different casing', 'Expected-api-key']
	])('rejects %s', async (_description, providedApiKey) => {
		const response = await request(buildApp())
			.get('/protected')
			.set('x-api-key', providedApiKey)
			.set('code', FORBIDDEN_CODE);

		expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
		expect(response.body).toEqual({
			name: 'ForbiddenError',
			message: 'Invalid apiKey',
			code: FORBIDDEN_CODE
		});
	});
});
