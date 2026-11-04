const MAX_UUID_LENGTH = 36;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string): boolean => {
	return value.length <= MAX_UUID_LENGTH && UUID_PATTERN.test(value);
};
