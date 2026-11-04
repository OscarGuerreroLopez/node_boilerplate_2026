import { envs } from '@core/config';
import { makeApiKeyMiddleware } from './api-key.middleware';

export * from './error-handler.middleware';
export * from './essentials.middleware';
export * from './not-found.middleware';
export * from './request-context.middleware';
export * from './request-logging.middleware';
export * from './rate-limit.middleware';

export const credentialsMiddleware = makeApiKeyMiddleware({
	getExpectedApiKey: () => envs.API_KEY
});
