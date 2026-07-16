import { envs } from '@core/config';
import { makeRequestSizeLimitMiddleware } from './request-size.middleware';
import { makeApiKeyMiddleware } from './api-key.middleware';

export * from './essentials.middleware';
export * from './request-context.middleware';

export const requestSmallSizeLimitMiddleware = makeRequestSizeLimitMiddleware(envs.SMALL_REQUEST_BYTES);

export const credentialsMiddleware = makeApiKeyMiddleware({
	getExpectedApiKey: () => envs.API_KEY
});
