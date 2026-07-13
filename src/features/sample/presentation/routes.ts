import { Router } from 'express';
import { envs } from '@core';
import { makeApiKeyMiddleware, makeRequestSizeLimitMiddleware } from '@common/middlewares';
import { SampleController } from './controller';

const credentialsMiddleware = makeApiKeyMiddleware({
	getExpectedApiKey: () => envs.API_KEY
});
const requestSizeLimitMiddleware = makeRequestSizeLimitMiddleware(envs.MAX_SAMPLE_REQUEST_BYTES);

export class SampleRoutes {
	static get routes(): Router {
		const router = Router();
		const controller = new SampleController();

		router.get('/', credentialsMiddleware, requestSizeLimitMiddleware, controller.entrypoint);

		return router;
	}
}
