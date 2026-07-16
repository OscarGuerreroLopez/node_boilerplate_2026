import app from './app';
import { envs } from '@core/config';
import { startServer } from './start-server';

void startServer({
	app,
	port: envs.SAMPLE_PORT,
	entryFile: 'index.ts'
});
