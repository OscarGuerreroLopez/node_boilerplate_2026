import { type User } from '../types';

const PASSWORD_KEY = 'password';

const normaliseKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
};

const removePasswordFields = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map((item) => removePasswordFields(item));
	}

	if (!isPlainObject(value)) {
		return value;
	}

	const cleanedObject: Record<string, unknown> = {};

	for (const [key, entry] of Object.entries(value)) {
		const normalisedKey = normaliseKey(key);

		if (normalisedKey.includes(PASSWORD_KEY)) {
			continue;
		}

		cleanedObject[key] = removePasswordFields(entry);
	}

	return cleanedObject;
};

export const parseUserHeader = (user: unknown): User | undefined => {
	if (user === undefined || user === null) {
		return undefined;
	}

	const [firstValue] = Array.isArray(user) ? user : [user];
	const value = firstValue;

	if (typeof value === 'string') {
		try {
			const parsedValue = JSON.parse(value) as unknown;
			const cleanedValue = removePasswordFields(parsedValue);

			return isPlainObject(cleanedValue) ? (cleanedValue as User) : undefined;
		} catch {
			return undefined;
		}
	}

	if (typeof value === 'object') {
		const cleanedValue = removePasswordFields(value);

		return isPlainObject(cleanedValue) ? (cleanedValue as User) : undefined;
	}

	return undefined;
};
