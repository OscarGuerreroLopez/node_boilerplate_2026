import { buildHelloMessage } from '@common';
import { makeGreetingService } from './greeting.service';

export const greetingService = makeGreetingService({ buildHelloMessage });
