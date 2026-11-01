import request from 'supertest';
import { HTTP_STATUS } from '@common/constants';
import app from './app';

const expectedApiKey = process.env.API_KEY ?? 'local-api-key';

describe('app', () => {
	it('returns health response', async () => {
		const response = await request(app).get('/health').set('code', 'health-code');

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.body).toEqual({
			message: 'ok',
			code: 'health-code'
		});
	});

	it('returns forbidden when x-api-key is missing', async () => {
		const response = await request(app).get('/api/v1/sample');

		expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
		expect(response.body.name).toBe('ForbiddenError');
		expect(response.body.message).toBe('Invalid apiKey');
		expect(typeof response.body.code).toBe('string');
	});

	it('returns sample payload and ignores the legacy user header', async () => {
		const response = await request(app)
			.get('/api/v1/sample?name=Oscar')
			.set('x-api-key', expectedApiKey)
			.set('code', 'sample-code')
			.set('user', '{"id":"u-1","email":"oscar@example.com"}');

		expect(response.status).toBe(HTTP_STATUS.OK);
		expect(response.body).toEqual({
			message: 'ok',
			result: 'hello Oscar',
			code: 'sample-code'
		});
	});

	it('returns bad request when name is invalid', async () => {
		const response = await request(app)
			.get('/api/v1/sample?name=%20%20%20')
			.set('x-api-key', expectedApiKey)
			.set('code', 'invalid-name-code');

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(response.body).toEqual({
			name: 'BadRequestError',
			message: 'Name must be a non-empty string',
			code: 'invalid-name-code'
		});
	});

	it('returns a structured not found response for unknown routes', async () => {
		const response = await request(app).get('/api/v1/unknown').set('code', 'not-found-code');

		expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
		expect(response.body).toEqual({
			name: 'NotFoundError',
			message: 'Route not found',
			code: 'not-found-code'
		});
	});

	it('returns a structured bad request response for malformed JSON', async () => {
		const response = await request(app)
			.post('/health')
			.set('content-type', 'application/json')
			.set('code', 'invalid-json-code')
			.send('{"name":');

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(response.body).toEqual({
			name: 'BadRequestError',
			message: 'Invalid JSON body',
			code: 'invalid-json-code'
		});
	});
});
