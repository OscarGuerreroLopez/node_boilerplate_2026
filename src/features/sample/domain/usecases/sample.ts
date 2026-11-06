import { SampleDto } from '../dtos';
import type { GreetingService } from '../services';

interface SampleResponse {
	result: string;
}

interface MakeSampleUseDependencies {
	greetingService: GreetingService;
}

interface SampleUseCasePayload {
	name?: string;
}

export type SampleUseCase = (payload: SampleUseCasePayload) => Promise<SampleResponse>;

type MakeSampleUseCase = (dependencies: MakeSampleUseDependencies) => SampleUseCase;

export const makeSampleUseCase: MakeSampleUseCase = ({ greetingService }) => {
	const sample: SampleUseCase = async ({ name }) => {
		const dto = SampleDto.create({ name });

		const result = await greetingService(dto.name);

		return { result };
	};

	return sample;
};
