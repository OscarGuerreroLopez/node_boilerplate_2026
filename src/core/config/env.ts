import 'dotenv/config';
import { get } from 'env-var';

const NODE_ENVS = ['local', 'development', 'production', 'test'] as const;

const API_KEY = get('API_KEY').default('local-api-key').asString();

const CORS_ALLOWED_ORIGINS = get('CORS_ALLOWED_ORIGINS')
	.default('')
	.asString()
	.split(',')
	.map((origin) => origin.trim())
	.filter((origin) => origin.length > 0);

const MAX_JSON_BODY_SIZE = get('MAX_JSON_BODY_SIZE').default('300kb').asString();
const SMALL_REQUEST_BYTES = get('SMALL_REQUEST_BYTES').default('65536').asIntPositive();

const NODE_ENV = get('NODE_ENV')
	.default('local')
	.asEnum([...NODE_ENVS]);

const SAMPLE_PORT = get('SAMPLE_PORT').default('9000').asPortNumber();
const PORT = get('PORT').default(String(SAMPLE_PORT)).asPortNumber();

export const envs = {
	PORT,
	SAMPLE_PORT,
	API_KEY,
	NODE_ENV,
	CORS_ALLOWED_ORIGINS,
	MAX_JSON_BODY_SIZE,
	SMALL_REQUEST_BYTES
};
