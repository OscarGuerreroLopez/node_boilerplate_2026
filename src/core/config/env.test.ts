import { NodeEnvEnum } from '@common/types';
import type { envs as environmentConfig } from './env';

jest.mock('dotenv/config', () => ({}));

const ENV_KEYS = [
	'NODE_ENV',
	'API_KEY',
	'PORT',
	'SAMPLE_PORT',
	'API_PREFIX',
	'TRUST_PROXY',
	'TRUST_IDENTITY_HEADER',
	'SHUTDOWN_TIMEOUT_MS',
	'RATE_LIMIT_WINDOW_MS',
	'RATE_LIMIT_MAX'
] as const;
const ORIGINAL_ENV = { ...process.env };
const PORT_OVERRIDE = 1234;
const SAMPLE_PORT_OVERRIDE = 5678;
const SHUTDOWN_TIMEOUT_OVERRIDE = 5000;
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10000;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000;
const DEFAULT_RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW_OVERRIDE = 30000;
const RATE_LIMIT_MAX_OVERRIDE = 60;

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
	it('uses PORT over SAMPLE_PORT when both are set', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			PORT: '1234',
			SAMPLE_PORT: '5678'
		});

		const envs = loadEnvs();

		expect(envs.PORT).toBe(PORT_OVERRIDE);
		expect(envs.SAMPLE_PORT).toBe(SAMPLE_PORT_OVERRIDE);
	});

	it('falls back to SAMPLE_PORT when PORT is missing', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.LOCAL,
			API_KEY: 'test-key',
			SAMPLE_PORT: '5678'
		});

		const envs = loadEnvs();

		expect(envs.PORT).toBe(SAMPLE_PORT_OVERRIDE);
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

	it('throws in production when API_KEY is missing', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.PRODUCTION
		});

		expect(() => loadEnvs()).toThrow('API_KEY must be set to a non-default value in production');
	});

	it('throws in production when API_KEY is still the default', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.PRODUCTION,
			API_KEY: 'local-api-key'
		});

		expect(() => loadEnvs()).toThrow('API_KEY must be set to a non-default value in production');
	});

	it('throws in production when API_KEY is blank', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.PRODUCTION,
			API_KEY: '   '
		});

		expect(() => loadEnvs()).toThrow('API_KEY must be set to a non-default value in production');
	});

	it('allows production with a custom API_KEY', async () => {
		setEnv({
			NODE_ENV: NodeEnvEnum.PRODUCTION,
			API_KEY: 'production-key'
		});

		const envs = loadEnvs();

		expect(envs.API_KEY).toBe('production-key');
	});
});
