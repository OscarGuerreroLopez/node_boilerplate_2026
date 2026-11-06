import express from 'express';
import { envs } from '@core/config';
import { NodeEnvEnum } from '@common/types';
import { makeHealthRoutes } from '@features/health';
import { makeV1Routes } from '@versions';
import {
	applyBodyParsers,
	applyExpressSecurity,
	makeApiKeyMiddleware,
	makeErrorHandlerMiddleware,
	makeNotFoundMiddleware,
	makeRateLimitMiddleware,
	makeRequestContextMiddleware,
	requestLoggingMiddleware
} from '@common/middlewares';

export const createApp = (configuration: typeof envs): express.Express => {
	const app = express();
	const credentialsMiddleware = makeApiKeyMiddleware({
		getExpectedApiKey: () => configuration.API_KEY
	});
	const includeErrorDetails = configuration.NODE_ENV !== NodeEnvEnum.PRODUCTION;

	app.set('trust proxy', configuration.TRUST_PROXY);
	app.use(
		makeRequestContextMiddleware({
			trustIdentityHeader: configuration.TRUST_IDENTITY_HEADER,
			trustProxy: configuration.TRUST_PROXY
		})
	);
	app.use(requestLoggingMiddleware);
	applyExpressSecurity(app, {
		corsAllowedOrigins: configuration.CORS_ALLOWED_ORIGINS,
		allowAllOriginsWhenEmpty: configuration.NODE_ENV !== NodeEnvEnum.PRODUCTION
	});
	app.use(
		makeRateLimitMiddleware({
			enabled: !configuration.TRUST_PROXY,
			windowMs: configuration.RATE_LIMIT_WINDOW_MS,
			maxRequests: configuration.RATE_LIMIT_MAX
		})
	);
	applyBodyParsers(app, { maxJsonBodySize: configuration.MAX_JSON_BODY_SIZE });
	app.use(makeHealthRoutes());
	app.use(configuration.API_PREFIX, makeV1Routes({ credentialsMiddleware }));
	app.use(makeNotFoundMiddleware());
	app.use(makeErrorHandlerMiddleware({ includeErrorDetails }));

	return app;
};

const app = createApp(envs);

export default app;
