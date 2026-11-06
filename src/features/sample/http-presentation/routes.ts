import { Router, type RequestHandler } from 'express';
import { SampleController } from './controller';

export interface SampleRoutesDependencies {
	credentialsMiddleware: RequestHandler;
}

export const makeSampleRoutes = ({ credentialsMiddleware }: SampleRoutesDependencies): Router => {
	const router = Router();
	const controller = new SampleController();

	router.get('/', credentialsMiddleware, controller.sample);

	return router;
};
