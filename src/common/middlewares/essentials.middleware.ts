import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

interface ApplyExpressEssentialsOptions {
	corsAllowedOrigins: string[];
	maxJsonBodySize: string;
	allowAllOriginsWhenEmpty: boolean;
}

const ZERO = 0;

export const applyExpressEssentials = (
	app: express.Express,
	{ corsAllowedOrigins, maxJsonBodySize, allowAllOriginsWhenEmpty }: ApplyExpressEssentialsOptions
): void => {
	const allowedOrigins = new Set(corsAllowedOrigins);

	app.use(helmet());
	app.use(
		cors({
			credentials: true,
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
	app.use(express.urlencoded({ extended: true, limit: maxJsonBodySize }));
	app.use(express.json({ limit: maxJsonBodySize }));
};
