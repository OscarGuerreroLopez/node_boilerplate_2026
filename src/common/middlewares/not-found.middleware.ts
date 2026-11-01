import { type NextFunction, type Request, type Response } from 'express';
import { HTTP_STATUS } from '@common/constants';
import { type ErrorResponse } from '@common/types';

export const notFoundMiddleware = (req: Request, res: Response<ErrorResponse>, _next: NextFunction): void => {
	res.status(HTTP_STATUS.NOT_FOUND).json({
		name: 'NotFoundError',
		message: 'Route not found',
		code: req.code ?? 'noCode'
	});
};
