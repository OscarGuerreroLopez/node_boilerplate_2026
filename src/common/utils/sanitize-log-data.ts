const FULLY_MASKED_VALUE = '********';
const NON_STRING_MASKED_VALUE = '***';
const MASK_SEPARATOR = '***';
const MASK_VISIBLE_CHARS = 4;
const MASK_VISIBLE_SEGMENTS = 2;
const MIN_VISIBLE_STRING_LENGTH = MASK_VISIBLE_CHARS * MASK_VISIBLE_SEGMENTS;
const C0_CONTROL_CHARACTER_MAX = 0x1f;
const DELETE_CHARACTER = 0x7f;
const C1_CONTROL_CHARACTER_MAX = 0x9f;

const FULLY_MASKED_KEY_PATTERNS = [
	/password/,
	/passwd/,
	/pwd/,
	/secret/,
	/token/,
	/apikey/,
	/^auth$/,
	/authorization/,
	/cookie/,
	/credential/,
	/privatekey/
];

const normalizeKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const isControlCharacter = (character: string): boolean => {
	const codeUnit = character.charCodeAt(0);

	return codeUnit <= C0_CONTROL_CHARACTER_MAX || (codeUnit >= DELETE_CHARACTER && codeUnit <= C1_CONTROL_CHARACTER_MAX);
};

const stripControlCharacters = (value: string): string => {
	return Array.from(value)
		.filter((character) => !isControlCharacter(character))
		.join('');
};

const isFullyMaskedKey = (normalizedKey: string): boolean => {
	return FULLY_MASKED_KEY_PATTERNS.some((pattern) => pattern.test(normalizedKey));
};

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

const maskSensitiveValue = (value: unknown): string => {
	return typeof value === 'string' ? FULLY_MASKED_VALUE : NON_STRING_MASKED_VALUE;
};

export const sanitizeLogData = (value: unknown): unknown => {
	if (typeof value === 'string') {
		return stripControlCharacters(value);
	}

	if (Array.isArray(value)) {
		return value.map((item) => sanitizeLogData(item));
	}

	if (value === null || typeof value !== 'object') {
		return value;
	}

	const sanitizedObject: Record<string, unknown> = {};

	for (const [key, nestedValue] of Object.entries(value)) {
		const normalizedKey = normalizeKey(key);

		if (isFullyMaskedKey(normalizedKey)) {
			sanitizedObject[key] = maskSensitiveValue(nestedValue);
			continue;
		}

		if (normalizedKey.includes('email')) {
			sanitizedObject[key] =
				typeof nestedValue === 'string'
					? partiallyMaskSensitiveString(stripControlCharacters(nestedValue))
					: NON_STRING_MASKED_VALUE;
			continue;
		}

		sanitizedObject[key] = sanitizeLogData(nestedValue);
	}

	return sanitizedObject;
};
