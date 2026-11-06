import { type NextFunction, type Request, type Response } from 'express';
import { HTTP_STATUS } from '@common/constants';
import { createLogger } from '@core/logger';

interface MatchedRoute {
	path?: unknown;
}

const NANOSECONDS_PER_MILLISECOND = 1_000_000;
const MILLISECOND_DECIMALS = 100;
const UNMATCHED_ROUTE = 'unmatched';

const logger = createLogger({
	file: 'src/common/middlewares/request-logging.middleware.ts',
	property: 'requestLogging'
});

const resolveRouteTemplate = (req: Request): string => {
	const matchedRoute = req.route as MatchedRoute | undefined;

	if (typeof matchedRoute?.path !== 'string') {
		return UNMATCHED_ROUTE;
	}

	return `${req.baseUrl}${matchedRoute.path}`;
};

const resolveLogLevel = (statusCode: number): 'info' | 'warn' | 'error' => {
	if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
		return 'error';
	}

	if (statusCode >= HTTP_STATUS.BAD_REQUEST) {
		return 'warn';
	}

	return 'info';
};

export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const startedAt = process.hrtime.bigint();

	res.once('finish', () => {
		const durationMs = Number(process.hrtime.bigint() - startedAt) / NANOSECONDS_PER_MILLISECOND;
		const roundedDurationMs = Math.round(durationMs * MILLISECOND_DECIMALS) / MILLISECOND_DECIMALS;
		const context = {
			code: req.code ?? 'noCode',
			method: req.method,
			route: resolveRouteTemplate(req),
			statusCode: res.statusCode,
			durationMs: roundedDurationMs
		};

		switch (resolveLogLevel(res.statusCode)) {
			case 'error':
				logger.error('request completed', context);
				break;
			case 'warn':
				logger.warn('request completed', context);
				break;
			default:
				logger.info('request completed', context);
				break;
		}
	});

	next();
};
