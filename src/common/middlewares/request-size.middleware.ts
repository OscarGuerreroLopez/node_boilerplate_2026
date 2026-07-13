import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { HTTP_STATUS } from '@common/constants';

interface ErrorResponse {
	name: string;
	message: string;
	code: string;
}

const TEN = 10;
const ZERO = 0;

const parseContentLength = (headerValue: unknown): number | undefined => {
	if (typeof headerValue !== 'string') {
		return undefined;
	}

	const parsed = Number.parseInt(headerValue, TEN);
	return Number.isFinite(parsed) && parsed >= ZERO ? parsed : undefined;
};

const approximateBodySize = (body: unknown): number => {
	if (body === undefined) {
		return ZERO;
	}

	if (typeof body === 'string') {
		return Buffer.byteLength(body, 'utf8');
	}

	return Buffer.byteLength(JSON.stringify(body), 'utf8');
};

export const makeRequestSizeLimitMiddleware = (maxBytes: number): RequestHandler => {
	return (req: Request, res: Response<ErrorResponse>, next: NextFunction): void => {
		const contentLengthHeader = req.headers['content-length'];
		const contentLengthValue = Array.isArray(contentLengthHeader) ? contentLengthHeader[ZERO] : contentLengthHeader;
		const requestBytes = parseContentLength(contentLengthValue) ?? approximateBodySize(req.body);

		if (requestBytes <= maxBytes) {
			next();
			return;
		}

		res.status(HTTP_STATUS.PAYLOAD_TOO_LARGE).json({
			name: 'PayloadTooLargeError',
			message: 'Payload too large',
			code: req.code ?? 'noCode'
		});
	};
};
