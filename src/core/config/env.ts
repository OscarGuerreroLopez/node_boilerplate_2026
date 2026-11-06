import 'dotenv/config';
import { get } from 'env-var';
import { NodeEnvEnum } from '@common/types';

const NODE_ENVS = Object.values(NodeEnvEnum);
const DEFAULT_API_KEY = 'local-api-key';
const MIN_PRODUCTION_API_KEY_LENGTH = 32;
const DEFAULT_API_PREFIX = '/api/v1';
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX = 120;
const DEFAULT_REQUEST_TIMEOUT_MS = 300_000;
const DEFAULT_HEADERS_TIMEOUT_MS = 60_000;
const DEFAULT_KEEP_ALIVE_TIMEOUT_MS = 5_000;
const API_PREFIX_PATTERN = /^\/[a-z0-9/_-]*$/i;

const normalizeApiPrefix = (value: string): string => {
	const trimmedValue = value.trim();
	const withLeadingSlash = trimmedValue.startsWith('/') ? trimmedValue : `/${trimmedValue}`;
	const withoutTrailingSlash =
		withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')
			? withLeadingSlash.slice(0, withLeadingSlash.length - 1)
			: withLeadingSlash;

	if (!API_PREFIX_PATTERN.test(withoutTrailingSlash)) {
		throw new Error('API_PREFIX must be a valid URL path, for example /api/v1');
	}

	return withoutTrailingSlash;
};

const NODE_ENV = get('NODE_ENV').default(NodeEnvEnum.LOCAL).asEnum(NODE_ENVS);

const API_KEY = get('API_KEY').default(DEFAULT_API_KEY).asString();
const CORS_ALLOWED_ORIGINS = get('CORS_ALLOWED_ORIGINS')
	.default('')
	.asString()
	.split(',')
	.map((origin) => origin.trim())
	.filter((origin) => origin.length > 0);

const MAX_JSON_BODY_SIZE = get('MAX_JSON_BODY_SIZE').default('300kb').asString();
const API_PREFIX = normalizeApiPrefix(get('API_PREFIX').default(DEFAULT_API_PREFIX).asString());
const TRUST_PROXY = get('TRUST_PROXY').default('false').asBoolStrict();
const TRUST_IDENTITY_HEADER = get('TRUST_IDENTITY_HEADER').default('false').asBoolStrict();
const SHUTDOWN_TIMEOUT_MS = get('SHUTDOWN_TIMEOUT_MS').default('10000').asIntPositive();
const RATE_LIMIT_WINDOW_MS = get('RATE_LIMIT_WINDOW_MS').default(String(DEFAULT_RATE_LIMIT_WINDOW_MS)).asIntPositive();
const RATE_LIMIT_MAX = get('RATE_LIMIT_MAX').default(String(DEFAULT_RATE_LIMIT_MAX)).asIntPositive();
const REQUEST_TIMEOUT_MS = get('REQUEST_TIMEOUT_MS').default(String(DEFAULT_REQUEST_TIMEOUT_MS)).asIntPositive();
const HEADERS_TIMEOUT_MS = get('HEADERS_TIMEOUT_MS').default(String(DEFAULT_HEADERS_TIMEOUT_MS)).asIntPositive();
const KEEP_ALIVE_TIMEOUT_MS = get('KEEP_ALIVE_TIMEOUT_MS')
	.default(String(DEFAULT_KEEP_ALIVE_TIMEOUT_MS))
	.asIntPositive();

const PORT = get('PORT').default('9000').asPortNumber();

const normalizedApiKey = API_KEY.trim();

if (NODE_ENV === NodeEnvEnum.PRODUCTION && (normalizedApiKey.length === 0 || normalizedApiKey === DEFAULT_API_KEY)) {
	throw new Error('API_KEY must be set to a non-default value in production');
}

if (NODE_ENV === NodeEnvEnum.PRODUCTION && normalizedApiKey.length < MIN_PRODUCTION_API_KEY_LENGTH) {
	throw new Error(`API_KEY must be at least ${MIN_PRODUCTION_API_KEY_LENGTH} characters in production`);
}

if (HEADERS_TIMEOUT_MS > REQUEST_TIMEOUT_MS) {
	throw new Error('HEADERS_TIMEOUT_MS must be less than or equal to REQUEST_TIMEOUT_MS');
}

export const envs = {
	PORT,
	API_KEY,
	NODE_ENV,
	API_PREFIX,
	TRUST_PROXY,
	TRUST_IDENTITY_HEADER,
	SHUTDOWN_TIMEOUT_MS,
	RATE_LIMIT_WINDOW_MS,
	RATE_LIMIT_MAX,
	REQUEST_TIMEOUT_MS,
	HEADERS_TIMEOUT_MS,
	KEEP_ALIVE_TIMEOUT_MS,
	CORS_ALLOWED_ORIGINS,
	MAX_JSON_BODY_SIZE
};
