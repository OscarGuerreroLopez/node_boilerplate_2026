import express from 'express';
import { envs } from '@core/config';
import { NodeEnvEnum } from '@common/types';
import { HealthRoutes } from '@features/health';
import { V1Routes } from '@versions';
import {
	applyExpressEssentials,
	errorHandlerMiddleware,
	notFoundMiddleware,
	requestContextMiddleware,
	requestLoggingMiddleware
} from '@common/middlewares';

const app = express();

app.set('trust proxy', envs.TRUST_PROXY);
app.use(requestContextMiddleware);
app.use(requestLoggingMiddleware);
applyExpressEssentials(app, {
	corsAllowedOrigins: envs.CORS_ALLOWED_ORIGINS,
	maxJsonBodySize: envs.MAX_JSON_BODY_SIZE,
	allowAllOriginsWhenEmpty: envs.NODE_ENV !== NodeEnvEnum.PRODUCTION
});
app.use(HealthRoutes.routes);
app.use(envs.API_PREFIX, V1Routes.routes);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
