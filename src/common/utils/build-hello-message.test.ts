import { buildHelloMessage } from './build-hello-message';

describe('buildHelloMessage', () => {
	it('returns hello world when no name is provided', () => {
		expect(buildHelloMessage()).toBe('hello world');
	});

	it('returns hello world when name is blank', () => {
		expect(buildHelloMessage('   ')).toBe('hello world');
	});

	it('returns hello name when name is provided', () => {
		expect(buildHelloMessage('Oscar')).toBe('hello Oscar');
	});
});
