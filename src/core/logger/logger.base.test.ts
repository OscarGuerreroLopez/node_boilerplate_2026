import { NodeEnvEnum } from '@common/types';
import { envs } from '@core/config';
import { createLogger } from './logger.base';
import { persistLocalLog } from './logger.local';

jest.mock('@core/config', () => ({
	envs: {
		NODE_ENV: 'local'
	}
}));

jest.mock('./logger.local', () => ({
	persistLocalLog: jest.fn()
}));

const waitForPersistence = async (): Promise<void> => {
	await new Promise((resolve) => setImmediate(resolve));
};

afterEach(() => {
	envs.NODE_ENV = NodeEnvEnum.LOCAL;
	jest.restoreAllMocks();
});

describe('createLogger persistence', () => {
	beforeEach(() => {
		jest.mocked(persistLocalLog).mockResolvedValue(undefined);
	});

	it('writes each log level and persists sanitized context', () => {
		const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
		const infoSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const logger = createLogger({ file: 'test.ts', property: 'test' });

		logger.debug('debug message');
		logger.info('info message', { apiKey: 'secret-key', email: 'oscar@example.com' });
		logger.warn('warning message');
		logger.error('error message');

		expect(debugSpy).toHaveBeenCalledWith(expect.objectContaining({ level: 'debug', message: 'debug message' }));
		expect(infoSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'info',
				message: 'info message',
				apiKey: '********',
				email: 'osca***@example.com'
			})
		);
		expect(warnSpy).toHaveBeenCalledWith(expect.objectContaining({ level: 'warn', message: 'warning message' }));
		expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ level: 'error', message: 'error message' }));
		expect(persistLocalLog).toHaveBeenCalledWith(
			'info',
			expect.objectContaining({ apiKey: '********', email: 'osca***@example.com' })
		);
	});

	it('suppresses debug logs in production', () => {
		const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
		const logger = createLogger({ file: 'test.ts', property: 'test' });
		envs.NODE_ENV = NodeEnvEnum.PRODUCTION;

		logger.debug('hidden message');

		expect(debugSpy).not.toHaveBeenCalled();
		expect(persistLocalLog).not.toHaveBeenCalled();
	});

	it('reports persistence failures to stderr without throwing', async () => {
		const writeSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
		jest.spyOn(console, 'log').mockImplementation(() => undefined);
		jest.mocked(persistLocalLog).mockRejectedValueOnce(new Error('disk full'));
		const logger = createLogger({ file: 'test.ts', property: 'test' });

		logger.info('message', { code: 'code-1' });
		await waitForPersistence();

		expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('[logger] failed to persist log: disk full'));
	});
});
