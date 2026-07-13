import express from 'express';
import { envs } from '@core';
import { HealthRoutes } from '@features/health';
import { V1Routes } from '@versions';
import { applyExpressEssentials, requestContextMiddleware } from '@common/middlewares';

const app = express();

app.set('trust proxy', true);
applyExpressEssentials(app, {
	corsAllowedOrigins: envs.CORS_ALLOWED_ORIGINS,
	maxJsonBodySize: envs.MAX_JSON_BODY_SIZE
});
app.use(requestContextMiddleware);
app.use(HealthRoutes.routes);
app.use('/api/v1', V1Routes.routes);

export default app;
