import { greetingService } from '../services';
import { makeSampleUseCase } from './sample';

export const sampleUseCase = makeSampleUseCase({ greetingService });
