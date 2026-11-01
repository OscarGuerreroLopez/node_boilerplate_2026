export class SampleValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SampleValidationError';
	}
}
