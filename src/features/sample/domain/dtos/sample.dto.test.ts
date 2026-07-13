import { SampleDto } from './sample.dto';

describe('SampleDto', () => {
	it('returns world when name is not provided', () => {
		const dto = SampleDto.create({});

		expect(dto.name).toBe('world');
	});

	it('returns trimmed name when provided', () => {
		const dto = SampleDto.create({ name: '  Oscar  ' });

		expect(dto.name).toBe('Oscar');
	});

	it('throws when name is empty', () => {
		expect(() => SampleDto.create({ name: '   ' })).toThrow('Name must be a non-empty string');
	});
});
