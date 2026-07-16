import { type User } from '@common/types';

declare module 'express' {
	export interface Request {
		code?: string;
		user?: User;
	}
}

export {};
