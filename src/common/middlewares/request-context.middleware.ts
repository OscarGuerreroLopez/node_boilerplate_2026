import { randomUUID } from 'node:crypto';
import { type NextFunction, type Request, type Response } from 'express';
import { parseUserHeader, TRUSTED_IDENTITY_HEADER } from '@common/context';
import { isUuid } from '@common/utils';
import { envs } from '@core/config';

interface RequestContextMiddlewareOptions {
	trustIdentityHeader: boolean;
}

type RequestContextMiddleware = (req: Request, res: Response, next: NextFunction) => void;

export const makeRequestContextMiddleware = ({
	trustIdentityHeader
}: RequestContextMiddlewareOptions): RequestContextMiddleware => {
	return (req, _res, next): void => {
		const headerCode = req.headers.code;
		const codeFromHeader = Array.isArray(headerCode) ? headerCode[0] : headerCode;

		req.code = typeof codeFromHeader === 'string' && isUuid(codeFromHeader) ? codeFromHeader : randomUUID();
		req.user = trustIdentityHeader ? parseUserHeader(req.headers[TRUSTED_IDENTITY_HEADER]) : undefined;
		next();
	};
};

export const requestContextMiddleware = makeRequestContextMiddleware({
	trustIdentityHeader: envs.TRUST_IDENTITY_HEADER
});
