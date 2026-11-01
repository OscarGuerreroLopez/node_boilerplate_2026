import { SampleDto } from '../dtos';

interface SampleResponse {
	result: string;
}

interface MakeSampleUseDependencies {
	greetingService: (name?: string | undefined) => string;
}

interface SampleUseCasePayload {
	name?: string;
}

type SampleUseCase = (payload: SampleUseCasePayload) => SampleResponse;

type MakeSampleUseCase = (dependencies: MakeSampleUseDependencies) => SampleUseCase;

export const makeSampleUseCase: MakeSampleUseCase = ({ greetingService }) => {
	const sample: SampleUseCase = ({ name }) => {
		const dto = SampleDto.create({ name });

		const result = greetingService(dto.name);

		return { result };
	};

	return sample;
};
