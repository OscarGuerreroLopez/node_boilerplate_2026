import type { Express } from 'express';
import { createLogger } from '@core';

interface StartServerParams {
	app: Express;
	port: number;
	entryFile: string;
}

export async function startServer({ app, port, entryFile }: StartServerParams): Promise<void> {
	const scopedLogger = createLogger({
		file: entryFile,
		property: 'startServer'
	});

	try {
		app.listen(port, () => {
			scopedLogger.info(`Listening:${port}`, { code: 'noCode' });
		});
	} catch (error) {
		scopedLogger.error(`Server failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`, {
			code: 'noCode'
		});

		process.exitCode = 1;
	}
}
