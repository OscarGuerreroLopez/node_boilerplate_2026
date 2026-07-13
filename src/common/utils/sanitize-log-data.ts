const FULLY_MASKED_VALUE = '********';
const NON_STRING_MASKED_VALUE = '***';
const MASK_SEPARATOR = '***';
const MASK_VISIBLE_CHARS = 4;
const MASK_VISIBLE_SEGMENTS = 2;
const MIN_VISIBLE_STRING_LENGTH = MASK_VISIBLE_CHARS * MASK_VISIBLE_SEGMENTS;

const SENSITIVE_KEYS = new Set(['email']);

const partiallyMaskSensitiveString = (value: string): string => {
	const atIndex = value.indexOf('@');

	if (atIndex > 0) {
		const localPart = value.slice(0, atIndex);
		const domainPart = value.slice(atIndex);

		if (localPart.length <= MASK_VISIBLE_CHARS) {
			return `${FULLY_MASKED_VALUE}${domainPart}`;
		}

		const visibleLocalPart = localPart.slice(0, MASK_VISIBLE_CHARS);

		return `${visibleLocalPart}${MASK_SEPARATOR}${domainPart}`;
	}

	if (value.length <= MIN_VISIBLE_STRING_LENGTH) {
		return FULLY_MASKED_VALUE;
	}

	const firstPart = value.slice(0, MASK_VISIBLE_CHARS);
	const lastPart = value.slice(-MASK_VISIBLE_CHARS);

	return `${firstPart}${MASK_SEPARATOR}${lastPart}`;
};

export const sanitizeLogData = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map((item) => sanitizeLogData(item));
	}

	if (value === null || typeof value !== 'object') {
		return value;
	}

	const sanitizedObject: Record<string, unknown> = {};

	for (const [key, nestedValue] of Object.entries(value)) {
		const normalizedKey = key.toLowerCase();

		if (normalizedKey === 'password') {
			sanitizedObject[key] = NON_STRING_MASKED_VALUE;
			continue;
		}

		if (SENSITIVE_KEYS.has(normalizedKey)) {
			sanitizedObject[key] =
				typeof nestedValue === 'string' ? partiallyMaskSensitiveString(nestedValue) : NON_STRING_MASKED_VALUE;
			continue;
		}

		sanitizedObject[key] = sanitizeLogData(nestedValue);
	}

	return sanitizedObject;
};
