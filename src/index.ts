import app from './app';
import { envs } from '@core/config';
import { startServer } from './start-server';

void startServer({
	app,
	port: envs.PORT,
	entryFile: 'index.ts',
	shutdownTimeoutMs: envs.SHUTDOWN_TIMEOUT_MS,
	requestTimeoutMs: envs.REQUEST_TIMEOUT_MS,
	headersTimeoutMs: envs.HEADERS_TIMEOUT_MS,
	keepAliveTimeoutMs: envs.KEEP_ALIVE_TIMEOUT_MS
});
