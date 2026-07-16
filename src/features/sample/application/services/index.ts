import { buildHelloMessage } from '@common/utils';
import { makeGreetingService } from './greeting.service';

export const greetingService = makeGreetingService({ buildHelloMessage });
