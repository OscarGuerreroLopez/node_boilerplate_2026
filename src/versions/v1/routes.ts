import { Router } from 'express';
import { SampleRoutes } from '@features/sample';

export class V1Routes {
	static get routes(): Router {
		const router = Router();

		router.use('/sample', SampleRoutes.routes);

		return router;
	}
}
