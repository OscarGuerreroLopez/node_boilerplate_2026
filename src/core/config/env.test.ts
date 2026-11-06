import { NodeEnvEnum } from '@common/types';
import type { envs as environmentConfig } from './env';

jest.mock('dotenv/config', () => ({}));

const ENV_KEYS = [
	'NODE_ENV',
	'API_KEY',
	'PORT',
	'API_PREFIX',
	'TRUST_PROXY',
	'TRUST_IDENTITY_HEADER',
	'SHUTDOWN_TIMEOUT_MS',
	'RATE_LIMIT_WINDOW_MS',
	'RATE_LIMIT_MAX',
	'REQUEST_TIMEOUT_MS',
	'HEADERS_TIMEOUT_MS',
	'KEEP_ALIVE_TIMEOUT_MS'
] as const;
const ORIGINAL_ENV = { ...process.env };
const PORT_OVERRIDE = 1234;
const DEFAULT_PORT = 9000;
const SHUTDOWN_TIMEOUT_OVERRIDE = 5000;
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10000;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000;
const DEFAULT_RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW_OVERRIDE = 30000;
const RATE_LIMIT_MAX_OVERRIDE = 60;
const DEFAULT_REQUEST_TIMEOUT_MS = 300000;
const DEFAULT_HEADERS_TIMEOUT_MS = 60000;
const DEFAULT_KEEP_ALIVE_TIMEOUT_MS = 5000;
const REQUEST_TIMEOUT_OVERRIDE = 15000;
const HEADERS_TIMEOUT_OVERRIDE = 10000;
const KEEP_ALIVE_TIMEOUT_OVERRIDE = 7000;
const MIN_PRODUCTION_API_KEY_LENGTH = 32;
const SHORT_PRODUCTION_API_KEY = 'a'.repeat(MIN_PRODUCTION_API_KEY_LENGTH - 1);
const VALID_PRODUCTION_API_KEY = 'a'.repeat(MIN_PRODUCTION_API_KEY_LENGTH);

type EnvKey = (typeof ENV_KEYS)[number];

const setEnv = (overrides: Partial<Record<EnvKey, string>>): void => {
	for (const key of ENV_KEYS) {
		Reflect.deleteProperty(process.env, key);
	}

	Object.assign(process.env, overrides);
};

const loadEnvs = (): typeof environmentConfig => {
	jest.resetModules();

	return jest.requireActual<{ envs: typeof environmentConfig }>('./env').envs;
};

afterEach(() => {
	for (const key of ENV_KEYS) {
		const originalValue = ORIGINAL_ENV[key];

		if (originalValue === undefined) {
			Reflect.deleteProperty(process.env, key);
		} else {
			process.env[key] = originalValue;
		}
	}

	jest.resetModules();
});

describe('envs', () => {
	it('uses the configured PORT', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			PORT: String(PORT_OVERRIDE)
		});

		const envs = loadEnvs();

		expect(envs.PORT).toBe(PORT_OVERRIDE);
	});

	it('uses the default PORT when it is missing', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key'
		});

		const envs = loadEnvs();

		expect(envs.PORT).toBe(DEFAULT_PORT);
	});

	it('normalizes API_PREFIX', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			API_PREFIX: 'api/v2/'
		});

		const envs = loadEnvs();

		expect(envs.API_PREFIX).toBe('/api/v2');
	});

	it('uses the default API_PREFIX when it is missing', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key'
		});

		const envs = loadEnvs();

		expect(envs.API_PREFIX).toBe('/api/v1');
	});

	it('throws when API_PREFIX is invalid', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			API_PREFIX: 'api v1'
		});

		expect(() => loadEnvs()).toThrow('API_PREFIX must be a valid URL path');
	});

	it('parses TRUST_PROXY', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			TRUST_PROXY: 'true'
		});

		const envs = loadEnvs();

		expect(envs.TRUST_PROXY).toBe(true);
	});

	it('disables TRUST_PROXY by default', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key'
		});

		const envs = loadEnvs();

		expect(envs.TRUST_PROXY).toBe(false);
	});

	it('parses TRUST_IDENTITY_HEADER', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			TRUST_IDENTITY_HEADER: 'true'
		});

		const envs = loadEnvs();

		expect(envs.TRUST_IDENTITY_HEADER).toBe(true);
	});

	it('disables TRUST_IDENTITY_HEADER by default', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key'
		});

		const envs = loadEnvs();

		expect(envs.TRUST_IDENTITY_HEADER).toBe(false);
	});

	it('parses SHUTDOWN_TIMEOUT_MS', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			SHUTDOWN_TIMEOUT_MS: '5000'
		});

		const envs = loadEnvs();

		expect(envs.SHUTDOWN_TIMEOUT_MS).toBe(SHUTDOWN_TIMEOUT_OVERRIDE);
	});

	it('uses the default SHUTDOWN_TIMEOUT_MS when it is missing', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key'
		});

		const envs = loadEnvs();

		expect(envs.SHUTDOWN_TIMEOUT_MS).toBe(DEFAULT_SHUTDOWN_TIMEOUT_MS);
	});

	it('parses rate limit settings', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			RATE_LIMIT_WINDOW_MS: String(RATE_LIMIT_WINDOW_OVERRIDE),
			RATE_LIMIT_MAX: String(RATE_LIMIT_MAX_OVERRIDE)
		});

		const envs = loadEnvs();

		expect(envs.RATE_LIMIT_WINDOW_MS).toBe(RATE_LIMIT_WINDOW_OVERRIDE);
		expect(envs.RATE_LIMIT_MAX).toBe(RATE_LIMIT_MAX_OVERRIDE);
	});

	it('uses default rate limit settings', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key'
		});

		const envs = loadEnvs();

		expect(envs.RATE_LIMIT_WINDOW_MS).toBe(DEFAULT_RATE_LIMIT_WINDOW_MS);
		expect(envs.RATE_LIMIT_MAX).toBe(DEFAULT_RATE_LIMIT_MAX);
	});

	it('parses HTTP server timeout settings', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			REQUEST_TIMEOUT_MS: String(REQUEST_TIMEOUT_OVERRIDE),
			HEADERS_TIMEOUT_MS: String(HEADERS_TIMEOUT_OVERRIDE),
			KEEP_ALIVE_TIMEOUT_MS: String(KEEP_ALIVE_TIMEOUT_OVERRIDE)
		});

		const envs = loadEnvs();

		expect(envs.REQUEST_TIMEOUT_MS).toBe(REQUEST_TIMEOUT_OVERRIDE);
		expect(envs.HEADERS_TIMEOUT_MS).toBe(HEADERS_TIMEOUT_OVERRIDE);
		expect(envs.KEEP_ALIVE_TIMEOUT_MS).toBe(KEEP_ALIVE_TIMEOUT_OVERRIDE);
	});

	it('uses default HTTP server timeout settings', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key'
		});

		const envs = loadEnvs();

		expect(envs.REQUEST_TIMEOUT_MS).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
		expect(envs.HEADERS_TIMEOUT_MS).toBe(DEFAULT_HEADERS_TIMEOUT_MS);
		expect(envs.KEEP_ALIVE_TIMEOUT_MS).toBe(DEFAULT_KEEP_ALIVE_TIMEOUT_MS);
	});

	it('throws when HEADERS_TIMEOUT_MS exceeds REQUEST_TIMEOUT_MS', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			REQUEST_TIMEOUT_MS: '1000',
			HEADERS_TIMEOUT_MS: '2000'
		});

		expect(() => loadEnvs()).toThrow('HEADERS_TIMEOUT_MS must be less than or equal to REQUEST_TIMEOUT_MS');
	});

	it('throws when API_KEY is missing', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL
		});

		expect(() => loadEnvs()).toThrow('API_KEY must be set');
	});

	it('throws when API_KEY is missing and NODE_ENV is not set', async () => {
		setEnv({});

		expect(() => loadEnvs()).toThrow('API_KEY must be set');
	});

	it('throws when API_KEY is blank', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: '   '
		});

		expect(() => loadEnvs()).toThrow('API_KEY must be set');
	});

	it('throws in production when API_KEY is too short', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.PRODUCTION,
			API_KEY: SHORT_PRODUCTION_API_KEY
		});

		expect(() => loadEnvs()).toThrow(
			`API_KEY must be at least ${MIN_PRODUCTION_API_KEY_LENGTH} characters in production`
		);
	});

	it('throws in production when API_KEY is blank after trimming', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.PRODUCTION,
			API_KEY: '   '
		});

		expect(() => loadEnvs()).toThrow('API_KEY must be set');
	});

	it('allows production with a valid API_KEY', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.PRODUCTION,
			API_KEY: VALID_PRODUCTION_API_KEY
		});

		const envs = loadEnvs();

		expect(envs.API_KEY).toBe(VALID_PRODUCTION_API_KEY);
	});

	it('trims API_KEY before checking production length', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.PRODUCTION,
			API_KEY: `  ${VALID_PRODUCTION_API_KEY}  `
		});

		const envs = loadEnvs();

		expect(envs.API_KEY).toBe(`  ${VALID_PRODUCTION_API_KEY}  `);
	});
});
