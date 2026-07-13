import { envs } from '@core';
import { sanitizeLogData } from '@common';
import { persistLocalLog } from './logger.local';
import type { LogLevel, LoggerContext, LoggerMethods, LoggerScope } from './logger.types';

const DEFAULT_LOGGER_SERVICE = 'BOILERPLATE_API';
const isLocalRuntime = envs.NODE_ENV === 'local';

const persistLog = (level: LogLevel, payload: Record<string, unknown>): void => {
	if (!isLocalRuntime) {
		return;
	}

	persistLocalLog(level, payload);
};

const log = (level: LogLevel, message: string, context?: LoggerContext): void => {
	if (level === 'debug' && envs.NODE_ENV === 'production') {
		return;
	}

	const payload = {
		level,
		message,
		at: new Date().toISOString(),
		...(context ?? {})
	};
	const sanitizedPayload = sanitizeLogData(payload) as Record<string, unknown>;

	switch (level) {
		case 'debug':
			console.debug(sanitizedPayload);
			break;
		case 'error':
			console.error(sanitizedPayload);
			break;
		case 'warn':
			console.warn(sanitizedPayload);
			break;
		default:
			console.log(sanitizedPayload);
			break;
	}

	persistLog(level, sanitizedPayload);
};

export const createLogger = ({ service = DEFAULT_LOGGER_SERVICE, file, property }: LoggerScope): LoggerMethods => {
	const baseContext: LoggerContext = { service, file, property };

	return {
		debug: (message: string, context?: LoggerContext): void => {
			log('debug', message, { ...baseContext, ...(context ?? {}) });
		},
		info: (message: string, context?: LoggerContext): void => {
			log('info', message, { ...baseContext, ...(context ?? {}) });
		},
		warn: (message: string, context?: LoggerContext): void => {
			log('warn', message, { ...baseContext, ...(context ?? {}) });
		},
		error: (message: string, context?: LoggerContext): void => {
			log('error', message, { ...baseContext, ...(context ?? {}) });
		}
	};
};
