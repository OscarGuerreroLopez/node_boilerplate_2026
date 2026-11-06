import { makeSampleUseCase } from './sample';

describe('makeSampleUseCase', () => {
	it('uses greeting service with the validated name', async () => {
		const greetingService = jest.fn().mockResolvedValue('custom greeting');
		const sample = makeSampleUseCase({ greetingService });

		const response = await sample({ name: '  Oscar  ' });

		expect(greetingService).toHaveBeenCalledWith('Oscar');
		expect(response).toEqual({ result: 'custom greeting' });
	});

	it('defaults to world when name is not provided', async () => {
		const greetingService = jest.fn().mockResolvedValue('hello world');
		const sample = makeSampleUseCase({ greetingService });

		const response = await sample({});

		expect(greetingService).toHaveBeenCalledWith('world');
		expect(response).toEqual({ result: 'hello world' });
	});
});
