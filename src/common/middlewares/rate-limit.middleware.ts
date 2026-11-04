import rateLimit from 'express-rate-limit';
import { type RequestHandler } from 'express';
import { HTTP_STATUS } from '@common/constants';

interface MakeRateLimitMiddlewareOptions {
	enabled: boolean;
	windowMs: number;
	maxRequests: number;
}

export const makeRateLimitMiddleware = ({
	enabled,
	windowMs,
	maxRequests
}: MakeRateLimitMiddlewareOptions): RequestHandler => {
	if (!enabled) {
		return (_req, _res, next): void => {
			next();
		};
	}

	return rateLimit({
		windowMs,
		limit: maxRequests,
		standardHeaders: true,
		legacyHeaders: false,
		skip: (req) => req.path === '/health',
		handler: (req, res): void => {
			res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
				name: 'TooManyRequestsError',
				message: 'Too many requests',
				code: req.code ?? 'noCode'
			});
		}
	});
};
