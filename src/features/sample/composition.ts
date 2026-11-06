import { buildHelloMessage } from '@common/utils';
import { readGreetingConfig } from './data-access';
import { makeGreetingService } from './domain/services/greeting.service';
import { makeSampleUseCase } from './domain/usecases/sample';

const greetingService = makeGreetingService({
	readGreetingConfig,
	buildHelloMessage
});

export const sampleUseCase = makeSampleUseCase({ greetingService });
