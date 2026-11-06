import { Router, type RequestHandler } from 'express';
import { makeSampleRoutes } from '@features/sample';

export interface V1RoutesDependencies {
	credentialsMiddleware: RequestHandler;
}

export const makeV1Routes = ({ credentialsMiddleware }: V1RoutesDependencies): Router => {
	const router = Router();

	router.use('/sample', makeSampleRoutes({ credentialsMiddleware }));

	return router;
};
