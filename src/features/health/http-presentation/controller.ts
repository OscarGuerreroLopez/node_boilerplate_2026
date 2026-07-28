import { type NextFunction, type Request, type Response } from 'express';

interface HealthResponse {
	message: string;
	code: string;
}

export class HealthController {
	public health = (req: Request, res: Response<HealthResponse>, _next: NextFunction): void => {
		const { code } = req;
		res.json({ message: 'ok', code: code ?? 'noCode' });
	};
}
