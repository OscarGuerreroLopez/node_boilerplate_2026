import { makeGreetingService } from './greeting.service';

describe('makeGreetingService', () => {
	it('builds a hello greeting', () => {
		const buildHelloMessage = jest.fn().mockReturnValue('hello Oscar');
		const service = makeGreetingService({ buildHelloMessage });

		expect(service('Oscar')).toBe('hello Oscar');
		expect(buildHelloMessage).toHaveBeenCalledWith('Oscar');
	});

	it('supports an injected message builder', () => {
		const buildHelloMessage = jest.fn().mockReturnValue('custom greeting');
		const service = makeGreetingService({ buildHelloMessage });

		expect(service('Oscar')).toBe('custom greeting');
		expect(buildHelloMessage).toHaveBeenCalledWith('Oscar');
	});
});
