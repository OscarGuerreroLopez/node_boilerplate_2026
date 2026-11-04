import type { Server } from 'node:http';
import type { Express } from 'express';
import { createLogger } from '@core/logger';

interface StartServerParams {
	app: Express;
	port: number;
	entryFile: string;
	shutdownTimeoutMs: number;
}

interface RunningServer {
	server: Server;
	shutdown: (signal: string) => Promise<void>;
}

const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

const waitForListening = async (server: Server): Promise<void> => {
	if (server.listening) {
		return;
	}

	await new Promise<void>((resolve, reject) => {
		const cleanup = (): void => {
			server.off('listening', onListening);
			server.off('error', onError);
		};
		const onListening = (): void => {
			cleanup();
			resolve();
		};
		const onError = (error: Error): void => {
			cleanup();
			reject(error);
		};

		server.once('listening', onListening);
		server.once('error', onError);
	});
};

const createGracefulShutdown = (
	server: Server,
	shutdownTimeoutMs: number,
	logger: ReturnType<typeof createLogger>
): ((signal: string) => Promise<void>) => {
	let shutdownPromise: Promise<void> | undefined;

	return async (signal: string): Promise<void> => {
		if (shutdownPromise) {
			await shutdownPromise;
			return;
		}

		shutdownPromise = new Promise((resolve) => {
			logger.info(`Shutdown requested:${signal}`, { code: 'noCode' });

			const forceCloseTimer = setTimeout(() => {
				logger.warn('Forcing open connections closed', { code: 'noCode' });
				server.closeAllConnections();
			}, shutdownTimeoutMs);
			forceCloseTimer.unref();

			server.closeIdleConnections();
			server.close((error) => {
				clearTimeout(forceCloseTimer);

				if (error) {
					logger.error(`Server close failed: ${error.message}`, { code: 'noCode' });
					process.exitCode = 1;
				} else {
					logger.info('Server closed', { code: 'noCode' });
				}

				resolve();
			});
		});

		await shutdownPromise;
	};
};

export async function startServer({
	app,
	port,
	entryFile,
	shutdownTimeoutMs
}: StartServerParams): Promise<RunningServer | undefined> {
	const scopedLogger = createLogger({
		file: entryFile,
		property: 'startServer'
	});

	try {
		const server = app.listen(port);

		await waitForListening(server);

		const closeServer = createGracefulShutdown(server, shutdownTimeoutMs, scopedLogger);
		const signalHandlerRef: { current?: (signal: NodeJS.Signals) => void } = {};
		const shutdownRef: { current?: (signal: string) => Promise<void> } = {};
		const handleServerError = (error: Error): void => {
			scopedLogger.error(`Server error: ${error.message}`, { code: 'noCode' });
			process.exitCode = 1;
			void shutdownRef.current?.('server-error');
		};
		const removeRuntimeHandlers = (): void => {
			const handler = signalHandlerRef.current;

			server.off('error', handleServerError);

			if (!handler) {
				return;
			}

			for (const signal of SHUTDOWN_SIGNALS) {
				process.removeListener(signal, handler);
			}
		};
		const shutdown = async (signal: string): Promise<void> => {
			await closeServer(signal);
			removeRuntimeHandlers();
		};
		const handleSignal = (signal: NodeJS.Signals): void => {
			void shutdown(signal);
		};

		signalHandlerRef.current = handleSignal;
		shutdownRef.current = shutdown;
		server.on('error', handleServerError);

		for (const signal of SHUTDOWN_SIGNALS) {
			process.once(signal, handleSignal);
		}

		scopedLogger.info(`Listening:${port}`, { code: 'noCode', timeoutMs: shutdownTimeoutMs });

		return { server, shutdown };
	} catch (error) {
		scopedLogger.error(`Server failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`, {
			code: 'noCode'
		});

		process.exitCode = 1;

		return undefined;
	}
}
