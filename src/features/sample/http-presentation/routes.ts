import { Router, type RequestHandler } from 'express';
import { sampleUseCase } from '../composition';
import { SampleController } from './controller';

export interface SampleRoutesDependencies {
	credentialsMiddleware: RequestHandler;
}

export const makeSampleRoutes = ({ credentialsMiddleware }: SampleRoutesDependencies): Router => {
	const router = Router();
	const controller = new SampleController({ sampleUseCase });

	router.get('/', credentialsMiddleware, (req, res, next) => {
		void controller.sample(req, res, next);
	});

	return router;
};
