import app from './app';
import { envs } from '@core/config';
import { startServer } from './start-server';

void startServer({
	app,
	port: envs.PORT,
	entryFile: 'index.ts',
	shutdownTimeoutMs: envs.SHUTDOWN_TIMEOUT_MS
});
