import { timingSafeEqual } from 'node:crypto';
import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { HTTP_STATUS } from '@common/constants';
import { type ErrorResponse } from '@common/types';

interface MakeApiKeyMiddlewareOptions {
	getExpectedApiKey: () => string;
}

const isSameApiKey = (providedApiKey: string, expectedApiKey: string): boolean => {
	const providedBuffer = Buffer.from(providedApiKey, 'utf8');
	const expectedBuffer = Buffer.from(expectedApiKey, 'utf8');

	if (providedBuffer.length !== expectedBuffer.length) {
		return false;
	}

	return timingSafeEqual(providedBuffer, expectedBuffer);
};

export const makeApiKeyMiddleware = ({ getExpectedApiKey }: MakeApiKeyMiddlewareOptions): RequestHandler => {
	return (req: Request, res: Response<ErrorResponse>, next: NextFunction): void => {
		const apiKey = req.headers['x-api-key'];
		const expectedApiKey = getExpectedApiKey();

		if (typeof apiKey !== 'string' || !isSameApiKey(apiKey, expectedApiKey)) {
			res.status(HTTP_STATUS.FORBIDDEN).json({
				name: 'ForbiddenError',
				message: 'Invalid apiKey',
				code: req.code ?? 'noCode'
			});
			return;
		}

		next();
	};
};
