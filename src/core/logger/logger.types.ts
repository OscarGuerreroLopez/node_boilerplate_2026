export type LoggerContext = Record<string, unknown>;

export interface LoggerScope {
	service?: string;
	file: string;
	property: string;
}

export interface LoggerMethods {
	debug: (message: string, context?: LoggerContext) => void;
	info: (message: string, context?: LoggerContext) => void;
	warn: (message: string, context?: LoggerContext) => void;
	error: (message: string, context?: LoggerContext) => void;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
