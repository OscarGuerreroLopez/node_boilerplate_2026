interface HttpErrorOptions {
	statusCode: number;
	name: string;
	message: string;
	code?: string;
}

export class HttpError extends Error {
	public readonly statusCode: number;
	public readonly code: string;

	constructor({ statusCode, name, message, code = 'noCode' }: HttpErrorOptions) {
		super(message);
		this.name = name;
		this.statusCode = statusCode;
		this.code = code;
	}
}
