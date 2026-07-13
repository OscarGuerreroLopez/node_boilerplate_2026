import { appendFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { inspect } from 'node:util';
import type { LogLevel } from './logger.types';

const NEW_LINE = '\n';
const LOGS_DIR_PATH = resolve(process.cwd(), 'logs');

const LOG_LEVEL_FILE_PATHS: Record<LogLevel, string> = {
	debug: resolve(LOGS_DIR_PATH, 'debug.log'),
	info: resolve(LOGS_DIR_PATH, 'info.log'),
	warn: resolve(LOGS_DIR_PATH, 'warn.log'),
	error: resolve(LOGS_DIR_PATH, 'error.log')
};

let logDirectoryReady: Promise<unknown> | undefined;

const ensureLogDirectory = async (): Promise<void> => {
	if (logDirectoryReady === undefined) {
		logDirectoryReady = mkdir(LOGS_DIR_PATH, { recursive: true });
	}

	await logDirectoryReady;
};

const formatPrettyLog = (payload: Record<string, unknown>): string => {
	return inspect(payload, {
		depth: null,
		colors: false,
		compact: false,
		breakLength: 120
	});
};

export const persistLocalLog = (level: LogLevel, payload: Record<string, unknown>): void => {
	void ensureLogDirectory()
		.then(async () => {
			const filePath = LOG_LEVEL_FILE_PATHS[level];
			await appendFile(filePath, `${formatPrettyLog(payload)}${NEW_LINE}${NEW_LINE}`);
		})
		.catch(() => {
			// Keep app flow safe if local file logging fails.
		});
};
