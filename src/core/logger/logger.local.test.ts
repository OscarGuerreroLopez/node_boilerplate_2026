import type { LogLevel } from './logger.types';

jest.mock('node:fs/promises', () => ({
	appendFile: jest.fn(),
	mkdir: jest.fn()
}));

interface FileSystemMock {
	appendFile: jest.Mock;
	mkdir: jest.Mock;
}

interface LoggerLocalModule {
	persistLocalLog: (level: LogLevel, payload: Record<string, unknown>) => Promise<void>;
}

const EXPECTED_DIRECTORY_ATTEMPTS = 2;

const getFileSystemMock = (): FileSystemMock => {
	return jest.requireMock<FileSystemMock>('node:fs/promises');
};

const loadPersistLocalLog = (): LoggerLocalModule['persistLocalLog'] => {
	jest.resetModules();

	return jest.requireActual<LoggerLocalModule>('./logger.local').persistLocalLog;
};

describe('persistLocalLog', () => {
	it('writes logs to the level-specific file', async () => {
		const persistLocalLog = loadPersistLocalLog();
		const fileSystem = getFileSystemMock();

		fileSystem.mkdir.mockResolvedValue(undefined);
		fileSystem.appendFile.mockResolvedValue(undefined);

		await persistLocalLog('info', { message: 'hello' });

		expect(fileSystem.mkdir).toHaveBeenCalledWith(expect.stringContaining('logs'), {
			recursive: true
		});
		expect(fileSystem.appendFile).toHaveBeenCalledWith(
			expect.stringContaining('info.log'),
			expect.stringContaining('hello')
		);
	});

	it('retries directory creation after a failure', async () => {
		const persistLocalLog = loadPersistLocalLog();
		const fileSystem = getFileSystemMock();

		fileSystem.mkdir.mockResolvedValue(undefined);
		fileSystem.appendFile.mockResolvedValue(undefined);
		fileSystem.mkdir.mockRejectedValueOnce(new Error('directory unavailable'));

		await expect(persistLocalLog('warn', { message: 'first' })).rejects.toThrow('directory unavailable');
		expect(fileSystem.appendFile).not.toHaveBeenCalled();

		await persistLocalLog('warn', { message: 'second' });

		expect(fileSystem.mkdir).toHaveBeenCalledTimes(EXPECTED_DIRECTORY_ATTEMPTS);
		expect(fileSystem.appendFile).toHaveBeenCalledTimes(1);
	});

	it('rejects when the log write fails', async () => {
		const persistLocalLog = loadPersistLocalLog();
		const fileSystem = getFileSystemMock();

		fileSystem.mkdir.mockResolvedValue(undefined);
		fileSystem.appendFile.mockRejectedValueOnce(new Error('write failed'));

		await expect(persistLocalLog('error', { message: 'failure' })).rejects.toThrow('write failed');
	});
});
