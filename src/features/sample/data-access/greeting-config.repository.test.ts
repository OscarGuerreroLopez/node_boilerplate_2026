import { makeGreetingConfigRepository } from './greeting-config.repository';

const TEST_DELAY_MS = 100;
const ELAPSED_BEFORE_RESOLUTION_MS = TEST_DELAY_MS - 1;

describe('readGreetingConfig', () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	it('returns the in-memory greeting configuration without delay', async () => {
		const readGreetingConfig = makeGreetingConfigRepository({ delayMs: 0 });

		await expect(readGreetingConfig()).resolves.toEqual({ prefix: 'Hola' });
	});

	it('waits for the configured delay', async () => {
		jest.useFakeTimers();
		const readGreetingConfig = makeGreetingConfigRepository({ delayMs: TEST_DELAY_MS });
		const configPromise = readGreetingConfig();
		const onResolved = jest.fn();
		void configPromise.then(onResolved);

		await jest.advanceTimersByTimeAsync(ELAPSED_BEFORE_RESOLUTION_MS);

		expect(onResolved).not.toHaveBeenCalled();

		await jest.advanceTimersByTimeAsync(1);

		await expect(configPromise).resolves.toEqual({ prefix: 'Hola' });
	});
});
