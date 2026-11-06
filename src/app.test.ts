import request from 'supertest';
import { HTTP_STATUS } from '@common/constants';
import { envs } from '@core/config';
import { createApp } from './app';

const TEST_API_KEY = 'test-api-key';
const TEST_RATE_LIMIT_WINDOW_MS = 60000;
const TEST_RATE_LIMIT_MAX = 120;
const HEALTH_CODE = 'e58ed763-928c-4155-bee9-fdbaaadc15f3';
const SAMPLE_CODE = '2f1c5d4e-1a2b-4c3d-8e9f-0123456789ab';
const INVALID_NAME_CODE = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const NOT_FOUND_CODE = '16fd2706-8baf-433b-82eb-8c7fada847da';
const INVALID_JSON_CODE = '9b2f5c1e-3d4a-4b6c-8d7e-5f4a3b2c1d0e';

const makeTestApp = (overrides: Partial<typeof envs> = {}): ReturnType<typeof createApp> =>
	createApp({
		...envs,
		API_KEY: TEST_API_KEY,
		TRUST_PROXY: false,
		RATE_LIMIT_WINDOW_MS: TEST_RATE_LIMIT_WINDOW_MS,
		RATE_LIMIT_MAX: TEST_RATE_LIMIT_MAX,
		...overrides
	});

const app = makeTestApp();

describe('app', () => {
	it('returns health response', async () => {
		const response = await request(app).get('/health').set('code', HEALTH_CODE);

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.body).toEqual({
			message: 'ok',
			code: HEALTH_CODE
		});
	});

	it('returns forbidden when x-api-key is missing', async () => {
		const response = await request(app).get('/api/v1/sample');

		expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
		expect(response.body.name).toBe('ForbiddenError');
		expect(response.body.message).toBe('Invalid apiKey');
		expect(typeof response.body.code).toBe('string');
	});

	it('validates against the injected API key configuration', async () => {
		const configuredApp = makeTestApp({ API_KEY: 'configured-key' });
		const rejectedResponse = await request(configuredApp).get('/api/v1/sample').set('x-api-key', TEST_API_KEY);
		const acceptedResponse = await request(configuredApp).get('/api/v1/sample').set('x-api-key', 'configured-key');

		expect(rejectedResponse.status).toBe(HTTP_STATUS.FORBIDDEN);
		expect(acceptedResponse.status).toBe(HTTP_STATUS.OK);
	});

	it('returns sample payload and ignores the legacy user header', async () => {
		const response = await request(app)
			.get('/api/v1/sample?name=Oscar')
			.set('x-api-key', TEST_API_KEY)
			.set('code', SAMPLE_CODE)
			.set('user', '{"id":"u-1","email":"oscar@example.com"}');

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.body).toEqual({
			message: 'ok',
			result: 'hello Oscar',
			code: SAMPLE_CODE
		});
	});

	it('returns trusted identity only when behind a trusted proxy', async () => {
		const trustedProxyApp = makeTestApp({
			TRUST_PROXY: true,
			TRUST_IDENTITY_HEADER: true
		});
		const response = await request(trustedProxyApp)
			.get('/api/v1/sample?name=Oscar')
			.set('x-api-key', TEST_API_KEY)
			.set(
				'x-authenticated-user',
				JSON.stringify({
					id: 'u-1',
					email: 'oscar@example.com',
					role: 'admin',
					admin: true
				})
			);

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.body.user).toEqual({
			id: 'u-1',
			email: 'oscar@example.com',
			role: 'admin'
		});
	});

	it('does not return trusted identity when not behind a proxy', async () => {
		const directApp = makeTestApp({
			TRUST_PROXY: false,
			TRUST_IDENTITY_HEADER: true
		});
		const response = await request(directApp)
			.get('/api/v1/sample?name=Oscar')
			.set('x-api-key', TEST_API_KEY)
			.set('x-authenticated-user', JSON.stringify({ id: 'u-1' }));

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.body.user).toBeUndefined();
	});

	it('returns bad request when name is invalid', async () => {
		const response = await request(app)
			.get('/api/v1/sample?name=%20%20%20')
			.set('x-api-key', TEST_API_KEY)
			.set('code', INVALID_NAME_CODE);

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(response.body).toEqual({
			name: 'BadRequestError',
			message: 'Name must be a non-empty string',
			code: INVALID_NAME_CODE
		});
	});

	it('returns a structured not found response for unknown routes', async () => {
		const response = await request(app).get('/api/v1/unknown').set('code', NOT_FOUND_CODE);

		expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
		expect(response.body).toEqual({
			name: 'NotFoundError',
			message: 'Route not found',
			code: NOT_FOUND_CODE
		});
	});

	it('returns a structured bad request response for malformed JSON', async () => {
		const response = await request(app)
			.post('/health')
			.set('content-type', 'application/json')
			.set('code', INVALID_JSON_CODE)
			.send('{"name":');

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(response.body).toEqual({
			name: 'BadRequestError',
			message: 'Invalid JSON body',
			code: INVALID_JSON_CODE
		});
	});

	it('limits direct requests when TRUST_PROXY is false', async () => {
		const limitedApp = makeTestApp({ RATE_LIMIT_MAX: 1 });
		const firstResponse = await request(limitedApp).get('/api/v1/sample').set('x-api-key', TEST_API_KEY);
		const secondResponse = await request(limitedApp).get('/api/v1/sample').set('x-api-key', TEST_API_KEY);

		expect(firstResponse.status).toBe(HTTP_STATUS.OK);
		expect(secondResponse.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
	});

	it('does not limit requests when TRUST_PROXY is true', async () => {
		const trustedProxyApp = makeTestApp({ TRUST_PROXY: true, RATE_LIMIT_MAX: 1 });
		const firstResponse = await request(trustedProxyApp).get('/api/v1/sample').set('x-api-key', TEST_API_KEY);
		const secondResponse = await request(trustedProxyApp).get('/api/v1/sample').set('x-api-key', TEST_API_KEY);

		expect([firstResponse.status, secondResponse.status]).toEqual([HTTP_STATUS.OK, HTTP_STATUS.OK]);
	});
});
