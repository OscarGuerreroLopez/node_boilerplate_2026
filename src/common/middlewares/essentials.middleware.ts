import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

interface ApplyExpressSecurityOptions {
	corsAllowedOrigins: string[];
	allowAllOriginsWhenEmpty: boolean;
}

interface ApplyBodyParsersOptions {
	maxJsonBodySize: string;
}

const ZERO = 0;

export const applyExpressSecurity = (
	app: express.Express,
	{ corsAllowedOrigins, allowAllOriginsWhenEmpty }: ApplyExpressSecurityOptions
): void => {
	const allowedOrigins = new Set(corsAllowedOrigins);

	app.use(helmet());
	app.use(
		cors({
			credentials: allowedOrigins.size > ZERO,
			origin: (origin, callback) => {
				if (origin === undefined) {
					callback(null, true);
					return;
				}

				if (allowedOrigins.size === ZERO) {
					callback(null, allowAllOriginsWhenEmpty);
					return;
				}

				callback(null, allowedOrigins.has(origin));
			}
		})
	);
};

export const applyBodyParsers = (app: express.Express, { maxJsonBodySize }: ApplyBodyParsersOptions): void => {
	app.use(express.urlencoded({ extended: true, limit: maxJsonBodySize }));
	app.use(express.json({ limit: maxJsonBodySize }));
};
