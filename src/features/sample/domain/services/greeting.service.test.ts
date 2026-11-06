import { makeGreetingService } from './greeting.service';

describe('makeGreetingService', () => {
	it('reads the greeting configuration and builds the message', async () => {
		const readGreetingConfig = jest.fn().mockResolvedValue({ prefix: 'hello' });
		const buildHelloMessage = jest.fn().mockReturnValue('hello Oscar');
		const service = makeGreetingService({ readGreetingConfig, buildHelloMessage });

		await expect(service('Oscar')).resolves.toBe('hello Oscar');
		expect(readGreetingConfig).toHaveBeenCalledTimes(1);
		expect(buildHelloMessage).toHaveBeenCalledWith('Oscar', 'hello');
	});

	it('uses the configured prefix', async () => {
		const readGreetingConfig = jest.fn().mockResolvedValue({ prefix: 'hi' });
		const buildHelloMessage = jest.fn().mockReturnValue('hi Oscar');
		const service = makeGreetingService({ readGreetingConfig, buildHelloMessage });

		await expect(service('Oscar')).resolves.toBe('hi Oscar');
		expect(buildHelloMessage).toHaveBeenCalledWith('Oscar', 'hi');
	});
});
