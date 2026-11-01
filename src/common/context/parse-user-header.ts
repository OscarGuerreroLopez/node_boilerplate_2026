import { type User } from '../types';

export const TRUSTED_IDENTITY_HEADER = 'x-authenticated-user';

const PASSWORD_KEY = 'password';
const MAX_IDENTITY_HEADER_LENGTH = 8192;
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const USER_STRING_FIELDS = ['id', 'email', 'name', 'role'] as const;

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

		if (UNSAFE_KEYS.has(key) || normalisedKey.includes(PASSWORD_KEY)) {
			continue;
		}

		cleanedObject[key] = removePasswordFields(entry);
	}

	return cleanedObject;
};

const hasValidUserShape = (value: Record<string, unknown>): boolean =>
	USER_STRING_FIELDS.every((field) => value[field] === undefined || typeof value[field] === 'string');

const toUser = (value: Record<string, unknown>): User => {
	const user: User = {};

	for (const [key, entry] of Object.entries(value)) {
		if (!UNSAFE_KEYS.has(key)) {
			user[key] = entry;
		}
	}

	return user;
};

const parseValue = (value: unknown): User | undefined => {
	const cleanedValue = removePasswordFields(value);

	if (!isPlainObject(cleanedValue) || !hasValidUserShape(cleanedValue)) {
		return undefined;
	}

	return toUser(cleanedValue);
};

export const parseUserHeader = (user: unknown): User | undefined => {
	if (user === undefined || user === null) {
		return undefined;
	}

	const [value] = Array.isArray(user) ? user : [user];

	if (typeof value === 'string') {
		if (value.length > MAX_IDENTITY_HEADER_LENGTH) {
			return undefined;
		}

		try {
			return parseValue(JSON.parse(value) as unknown);
		} catch {
			return undefined;
		}
	}

	if (typeof value === 'object') {
		return parseValue(value);
	}

	return undefined;
};
