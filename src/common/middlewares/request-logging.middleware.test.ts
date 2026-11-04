import express from 'express';
import request from 'supertest';
import { HTTP_STATUS } from '@common/constants';
import { requestContextMiddleware } from './request-context.middleware';
import { requestLoggingMiddleware } from './request-logging.middleware';

const REQUEST_CODE = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

const buildApp = (): express.Express => {
	const app = express();

	app.use(requestContextMiddleware);
	app.use(requestLoggingMiddleware);
	app.get('/ok', (_req, res): void => {
		res.json({ ok: true });
	});
	app.get('/failure', (_req, res): void => {
		res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ ok: false });
	});

	return app;
};

const waitForFinishListener = async (): Promise<void> => {
	await new Promise((resolve) => setImmediate(resolve));
};

afterEach(() => {
	jest.restoreAllMocks();
});

describe('requestLoggingMiddleware', () => {
	it('logs successful requests with stable request fields', async () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
		const app = buildApp();

		await request(app).get('/ok?secret=value').set('code', REQUEST_CODE);
		await waitForFinishListener();

		expect(logSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'info',
				message: 'request completed',
				code: REQUEST_CODE,
				method: 'GET',
				route: '/ok',
				statusCode: 200,
				durationMs: expect.any(Number)
			})
		);
	});

	it('logs unmatched routes as warnings without dynamic path values', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		const app = buildApp();

		await request(app).get('/missing/123');
		await waitForFinishListener();

		expect(warnSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'warn',
				message: 'request completed',
				route: 'unmatched',
				statusCode: 404
			})
		);
	});

	it('logs server errors at error level', async () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const app = buildApp();

		await request(app).get('/failure');
		await waitForFinishListener();

		expect(errorSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'error',
				message: 'request completed',
				route: '/failure',
				statusCode: 500
			})
		);
	});
});
