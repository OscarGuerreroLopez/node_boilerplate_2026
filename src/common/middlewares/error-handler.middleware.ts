import { type NextFunction, type Request, type Response } from 'express';
import { HTTP_STATUS } from '@common/constants';
import { NodeEnvEnum, type ErrorResponse } from '@common/types';
import { HttpError } from '@common/errors';
import { envs } from '@core/config';
import { createLogger } from '@core/logger';

interface ExpressError extends Error {
	status?: number;
	statusCode?: number;
	type?: string;
}

export interface ErrorLogContext {
	code: string;
	statusCode: number;
	errorName: string;
	message?: string;
	stack?: string;
	[key: string]: unknown;
}

const STATUS_ERROR_NAMES: Record<number, string> = {
	[HTTP_STATUS.BAD_REQUEST]: 'BadRequestError',
	[HTTP_STATUS.FORBIDDEN]: 'ForbiddenError',
	[HTTP_STATUS.NOT_FOUND]: 'NotFoundError',
	[HTTP_STATUS.PAYLOAD_TOO_LARGE]: 'PayloadTooLargeError'
};

const STATUS_ERROR_MESSAGES: Record<number, string> = {
	[HTTP_STATUS.BAD_REQUEST]: 'Bad request',
	[HTTP_STATUS.FORBIDDEN]: 'Forbidden',
	[HTTP_STATUS.NOT_FOUND]: 'Not found',
	[HTTP_STATUS.PAYLOAD_TOO_LARGE]: 'Payload too large'
};

const logger = createLogger({
	file: 'src/common/middlewares/error-handler.middleware.ts',
	property: 'errorHandler'
});

const includeErrorDetails = envs.NODE_ENV !== NodeEnvEnum.PRODUCTION;

export const buildErrorLogContext = (
	error: Error,
	statusCode: number,
	code: string,
	showDetails: boolean
): ErrorLogContext => {
	const context: ErrorLogContext = {
		code,
		statusCode,
		errorName: error.name
	};

	if (!showDetails) {
		return context;
	}

	return {
		...context,
		message: error.message,
		stack: error.stack
	};
};

const isClientError = (statusCode: number): boolean => {
	return statusCode >= HTTP_STATUS.BAD_REQUEST && statusCode < HTTP_STATUS.INTERNAL_SERVER_ERROR;
};

const resolveStatusCode = (error: ExpressError): number => {
	if (error instanceof HttpError) {
		return error.statusCode;
	}

	if (error.type === 'entity.parse.failed') {
		return HTTP_STATUS.BAD_REQUEST;
	}

	if (error.type === 'entity.too.large') {
		return HTTP_STATUS.PAYLOAD_TOO_LARGE;
	}

	const candidateStatusCode = error.statusCode ?? error.status;

	if (typeof candidateStatusCode === 'number' && isClientError(candidateStatusCode)) {
		return candidateStatusCode;
	}

	return HTTP_STATUS.INTERNAL_SERVER_ERROR;
};

const resolveErrorResponse = (error: ExpressError, statusCode: number, code: string): ErrorResponse => {
	if (error instanceof HttpError) {
		return {
			name: error.name,
			message: error.message,
			code: error.code
		};
	}

	if (error.type === 'entity.parse.failed') {
		return {
			name: 'BadRequestError',
			message: 'Invalid JSON body',
			code
		};
	}

	if (isClientError(statusCode)) {
		return {
			name: STATUS_ERROR_NAMES[statusCode] ?? 'ClientError',
			message: STATUS_ERROR_MESSAGES[statusCode] ?? 'Client error',
			code
		};
	}

	return {
		name: 'InternalServerError',
		message: 'Internal server error',
		code
	};
};

export const errorHandlerMiddleware = (
	error: unknown,
	req: Request,
	res: Response<ErrorResponse>,
	_next: NextFunction
): void => {
	const normalizedError = error instanceof Error ? error : new Error('Unknown error');
	const statusCode = resolveStatusCode(normalizedError);
	const code = req.code ?? 'noCode';

	if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
		logger.error(
			'Unhandled request error',
			buildErrorLogContext(normalizedError, statusCode, code, includeErrorDetails)
		);
	}

	res.status(statusCode).json(resolveErrorResponse(normalizedError, statusCode, code));
};
