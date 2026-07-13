import { randomUUID } from 'node:crypto';
import { type NextFunction, type Request, type Response } from 'express';
import { parseUserHeader } from '@common/context';

export const requestContextMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
	const headerCode = req.headers.code;
	const codeFromHeader = Array.isArray(headerCode) ? headerCode[0] : headerCode;

	req.code = typeof codeFromHeader === 'string' ? codeFromHeader : randomUUID();
	req.user = parseUserHeader(req.headers.user);
	next();
};
