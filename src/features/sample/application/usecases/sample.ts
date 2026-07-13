import { createLogger } from '@core';
import { type User } from '@common/types';
import { SampleDto } from '../../domain';

interface SampleResponse {
	result: string;
}

interface MakeSampleUseDependencies {
	greetingService: (name?: string | undefined) => string;
}

interface SampleUseCasePayload {
	name?: string;
	user?: User;
	code?: string;
}

type SampleUseCase = (payload: SampleUseCasePayload) => SampleResponse;

const sampleLogger = createLogger({
	file: 'usecases/sample.ts',
	property: 'sample'
});

type MakeSampleUseCase = (dependencies: MakeSampleUseDependencies) => SampleUseCase;

export const makeSampleUseCase: MakeSampleUseCase = ({ greetingService }) => {
	const sample: SampleUseCase = ({ name, user, code }) => {
		sampleLogger.info('sample input params', {
			code: code ?? 'noCode',
			params: { name, user },
			password: 'HolaDonPepito'
		});

		const dto = SampleDto.create({ name });

		const result = greetingService(dto.name);

		return { result };
	};

	return sample;
};
