import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

interface ApplyExpressEssentialsOptions {
	corsAllowedOrigins: string[];
	maxJsonBodySize: string;
}

const ZERO = 0;

export const applyExpressEssentials = (
	app: express.Express,
	{ corsAllowedOrigins, maxJsonBodySize }: ApplyExpressEssentialsOptions
): void => {
	const allowedOrigins = new Set(corsAllowedOrigins);

	app.use(express.urlencoded({ extended: true }));
	app.use(express.json({ limit: maxJsonBodySize }));
	app.use(
		cors({
			credentials: true,
			origin: (origin, callback) => {
				if (origin === undefined || allowedOrigins.size === ZERO) {
					callback(null, true);
					return;
				}

				callback(null, allowedOrigins.has(origin));
			}
		})
	);
	app.use(helmet());
};
