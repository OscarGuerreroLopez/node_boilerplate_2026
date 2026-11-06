import type { GreetingConfig, ReadGreetingConfig } from '../domain/dtos';

const DEFAULT_GREETING_CONFIG_DELAY_MS = 2500;

const inMemoryGreetingConfig: GreetingConfig = {
	prefix: 'Hola'
};

interface GreetingConfigRepositoryDependencies {
	delayMs?: number;
}

export const makeGreetingConfigRepository = ({
	delayMs = DEFAULT_GREETING_CONFIG_DELAY_MS
}: GreetingConfigRepositoryDependencies = {}): ReadGreetingConfig => {
	return async () => {
		if (delayMs > 0) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}

		return inMemoryGreetingConfig;
	};
};

export const readGreetingConfig = makeGreetingConfigRepository();
