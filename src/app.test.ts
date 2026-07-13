import request from 'supertest';
import app from './app';

const expectedApiKey = process.env.API_KEY ?? 'local-api-key';

describe('app', () => {
	it('returns health response', async () => {
		const response = await request(app).get('/health').set('code', 'health-code');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			message: 'ok',
			code: 'health-code'
		});
	});

	it('returns forbidden when x-api-key is missing', async () => {
		const response = await request(app).get('/api/v1/sample');

		expect(response.status).toBe(403);
		expect(response.body.name).toBe('ForbiddenError');
		expect(response.body.message).toBe('Invalid apiKey');
		expect(typeof response.body.code).toBe('string');
	});

	it('returns sample payload when credentials are valid', async () => {
		const response = await request(app)
			.get('/api/v1/sample?name=Oscar')
			.set('x-api-key', expectedApiKey)
			.set('code', 'sample-code')
			.set('user', '{"id":"u-1","email":"oscar@example.com"}');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			message: 'ok',
			result: 'hello Oscar',
			code: 'sample-code',
			user: { id: 'u-1', email: 'oscar@example.com' }
		});
	});

	it('returns bad request when name is invalid', async () => {
		const response = await request(app).get('/api/v1/sample?name=%20%20%20').set('x-api-key', expectedApiKey);

		expect(response.status).toBe(400);
		expect(response.body.name).toBe('BadRequestError');
		expect(response.body.message).toBe('Invalid name');
		expect(typeof response.body.code).toBe('string');
	});
});
