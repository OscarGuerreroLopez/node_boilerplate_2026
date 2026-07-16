import { type NextFunction, type Request, type Response } from 'express';
import { HTTP_STATUS } from '@common/constants';
import { type User } from '@common/types';
import { sampleUseCase } from '../application/usecases';
import { createLogger } from '@core/logger';

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

const logger = createLogger({
	file: 'src/features/sample/http-presentation/controller.ts',
	property: 'sample'
});

export class SampleController {
	public sample = (
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
		} catch (error: unknown) {
			const errorContext =
				error instanceof Error ? { message: error.message, stack: error.stack } : { info: JSON.stringify(error) };

			logger.error('Error occurred while processing sample request', {
				user,
				code,
				...errorContext
			});

			res.status(HTTP_STATUS.BAD_REQUEST).json({
				name: 'BadRequestError',
				message: 'Bad request, check logs for more details',
				code: code ?? 'noCode'
			});
		}
	};
}
