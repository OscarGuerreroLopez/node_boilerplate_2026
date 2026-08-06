import { makeSampleUseCase } from './sample';

describe('makeSampleUseCase', () => {
	it('uses greeting service with the validated name', () => {
		const greetingService = jest.fn().mockReturnValue('custom greeting');
		const sample = makeSampleUseCase({ greetingService });

		const response = sample({ name: '  Oscar  ', code: 'code-1' });

		expect(greetingService).toHaveBeenCalledWith('Oscar');
		expect(response).toEqual({ result: 'custom greeting' });
	});

	it('defaults to world when name is not provided', () => {
		const greetingService = jest.fn().mockReturnValue('hello world');
		const sample = makeSampleUseCase({ greetingService });

		const response = sample({});

		expect(greetingService).toHaveBeenCalledWith('world');
		expect(response).toEqual({ result: 'hello world' });
	});
});
