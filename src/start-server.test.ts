import { type AddressInfo, createServer } from 'node:net';
import express from 'express';
import { startServer } from './start-server';

const SHUTDOWN_TIMEOUT_MS = 100;
const ENTRY_FILE = 'src/start-server.test.ts';

afterEach(() => {
	process.exitCode = undefined;
	jest.restoreAllMocks();
});

describe('startServer', () => {
	it('starts the server and shuts it down gracefully', async () => {
		jest.spyOn(console, 'log').mockImplementation(() => undefined);

		const runningServer = await startServer({
			app: express(),
			port: 0,
			entryFile: ENTRY_FILE,
			shutdownTimeoutMs: SHUTDOWN_TIMEOUT_MS
		});

		expect(runningServer).toBeDefined();
		expect(runningServer?.server.listening).toBe(true);

		await runningServer?.shutdown('SIGTERM');

		expect(runningServer?.server.listening).toBe(false);
	});

	it('reports runtime server errors and sets a failure exit code', async () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		jest.spyOn(console, 'log').mockImplementation(() => undefined);

		const runningServer = await startServer({
			app: express(),
			port: 0,
			entryFile: ENTRY_FILE,
			shutdownTimeoutMs: SHUTDOWN_TIMEOUT_MS
		});

		runningServer?.server.emit('error', new Error('runtime failure'));

		expect(process.exitCode).toBe(1);
		expect(errorSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'error',
				message: expect.stringContaining('Server error: runtime failure')
			})
		);

		await runningServer?.shutdown('SIGTERM');
	});

	it('reports listen errors and sets a failure exit code', async () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		jest.spyOn(console, 'log').mockImplementation(() => undefined);
		const blockingServer = createServer();

		await new Promise<void>((resolve) => {
			blockingServer.listen(0, resolve);
		});

		const address = blockingServer.address() as AddressInfo;

		const runningServer = await startServer({
			app: express(),
			port: address.port,
			entryFile: ENTRY_FILE,
			shutdownTimeoutMs: SHUTDOWN_TIMEOUT_MS
		});

		expect(runningServer).toBeUndefined();
		expect(process.exitCode).toBe(1);
		expect(errorSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'error',
				message: expect.stringContaining('Server failed')
			})
		);

		await new Promise<void>((resolve) => {
			blockingServer.close(() => {
				resolve();
			});
		});
	});
});
