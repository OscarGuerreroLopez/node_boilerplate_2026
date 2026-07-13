interface CreateSampleDto {
	name?: string;
}

export class SampleDto {
	constructor(public readonly name: string) {}

	static create(data: CreateSampleDto): SampleDto {
		const { name } = data;

		if (name === undefined) {
			return new SampleDto('world');
		}

		if (typeof name !== 'string' || !name.trim()) {
			throw new Error('Name must be a non-empty string');
		}

		return new SampleDto(name.trim());
	}
}
