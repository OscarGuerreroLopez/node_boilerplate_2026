import express, { type Express, type RequestHandler } from 'express';
import request from 'supertest';
import { HTTP_STATUS } from '@common/constants';
import { HttpError } from '@common/errors';
import { buildErrorLogContext, makeErrorHandlerMiddleware } from './error-handler.middleware';
import { makeRequestContextMiddleware } from './request-context.middleware';

const UNEXPECTED_CODE = '5d41402a-bc2f-4f0b-b9f3-9f3e9f2f6d1c';
const requestContextMiddleware = makeRequestContextMiddleware({
	trustIdentityHeader: false,
	trustProxy: false
});

const buildApp = (handler: RequestHandler): Express => {
	const app = express();

	app.use(requestContextMiddleware);
	app.get('/error', handler);
	app.use(makeErrorHandlerMiddleware({ includeErrorDetails: false }));

	return app;
};

describe('buildErrorLogContext', () => {
	it('omits raw error details when details are disabled', () => {
		const error = new Error('secret database detail');

		const context = buildErrorLogContext(error, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'error-code', false);

		expect(context).toEqual({
			code: 'error-code',
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			errorName: 'Error'
		});
	});

	it('includes raw error details when details are enabled', () => {
		const error = new Error('local debugging detail');

		const context = buildErrorLogContext(error, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'error-code', true);

		expect(context).toEqual({
			code: 'error-code',
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			errorName: 'Error',
			message: 'local debugging detail',
			stack: error.stack
		});
	});
});

describe('makeErrorHandlerMiddleware', () => {
	it('returns a safe 500 response for unexpected errors', async () => {
		const app = buildApp((): void => {
			throw new Error('secret database detail');
		});

		const response = await request(app).get('/error').set('code', UNEXPECTED_CODE);

		expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
		expect(response.body).toEqual({
			name: 'InternalServerError',
			message: 'Internal server error',
			code: UNEXPECTED_CODE
		});
		expect(JSON.stringify(response.body)).not.toContain('secret database detail');
	});

	it('returns the status and message from an HttpError', async () => {
		const app = buildApp((): void => {
			throw new HttpError({
				statusCode: HTTP_STATUS.BAD_REQUEST,
				name: 'BadRequestError',
				message: 'Custom validation message',
				code: 'http-error-code'
			});
		});

		const response = await request(app).get('/error');

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(response.body).toEqual({
			name: 'BadRequestError',
			message: 'Custom validation message',
			code: 'http-error-code'
		});
	});
});
