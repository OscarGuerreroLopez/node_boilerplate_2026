import { type NextFunction, type Request, type Response } from 'express';
import { HTTP_STATUS } from '@common/constants';
import { type User } from '@common/types';
import { sampleUseCase } from '../application/usecases';

interface SampleRequest {
	name?: string;
}

interface SampleResponse {
	message: string;
	result: string;
	code: string;
	user?: User;
}

interface ErrorResponse {
	name: string;
	message: string;
	code: string;
}

export class SampleController {
	public entrypoint = (
		req: Request<unknown, unknown, unknown, Partial<SampleRequest>>,
		res: Response<SampleResponse | ErrorResponse>,
		_next: NextFunction
	): void => {
		const { user, code } = req;

		try {
			const { result } = sampleUseCase({
				name: req.query.name,
				user,
				code
			});

			res.json({ message: 'ok', result, code: code ?? 'noCode', user });
		} catch {
			res.status(HTTP_STATUS.BAD_REQUEST).json({
				name: 'BadRequestError',
				message: 'Invalid name',
				code: code ?? 'noCode'
			});
		}
	};
}
