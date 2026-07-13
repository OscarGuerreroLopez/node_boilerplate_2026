import { type User } from '@common';

declare module 'express' {
	export interface Request {
		code?: string;
		user?: User;
	}
}

export {};
