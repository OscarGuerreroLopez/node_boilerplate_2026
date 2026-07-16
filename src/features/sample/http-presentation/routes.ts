import { Router } from 'express';
import { credentialsMiddleware, requestSmallSizeLimitMiddleware } from '@common/middlewares';
import { SampleController } from './controller';

export class SampleRoutes {
	static get routes(): Router {
		const router = Router();
		const controller = new SampleController();

		router.get('/', credentialsMiddleware, requestSmallSizeLimitMiddleware, controller.sample);

		return router;
	}
}
