import { type NextFunction, type Request, type Response } from 'express';
import { HTTP_STATUS } from '@common/constants';
import { HttpError } from '@common/errors';
import { type ErrorResponse, type User } from '@common/types';
import { SampleValidationError } from '../domain/errors/sample-validation.error';
import { type SampleUseCase } from '../domain/usecases';

interface SampleControllerDependencies {
	sampleUseCase: SampleUseCase;
}

interface SampleRequest {
	name?: string;
}

interface SampleResponse {
	message: string;
	result: string;
	code: string;
	user?: User;
}

export class SampleController {
	constructor(private readonly dependencies: SampleControllerDependencies) {}

	public sample = async (
		req: Request<unknown, unknown, unknown, Partial<SampleRequest>>,
		res: Response<SampleResponse | ErrorResponse>,
		next: NextFunction
	): Promise<void> => {
		const { user, code } = req;

		try {
			const { result } = await this.dependencies.sampleUseCase({
				name: req.query.name
			});

			res.json({ message: 'ok', result, code: code ?? 'noCode', user });
		} catch (error: unknown) {
			if (error instanceof SampleValidationError) {
				next(
					new HttpError({
						statusCode: HTTP_STATUS.BAD_REQUEST,
						name: 'BadRequestError',
						message: error.message,
						code: code ?? 'noCode'
					})
				);
				return;
			}

			next(error);
		}
	};
}
