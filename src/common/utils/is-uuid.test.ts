import { isUuid } from './is-uuid';

const VALID_UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const OVERSIZED_UUID = `${VALID_UUID}-extra`;

describe('isUuid', () => {
	it('accepts canonical UUIDs regardless of case or version', () => {
		expect(isUuid(VALID_UUID)).toBe(true);
		expect(isUuid(VALID_UUID.toUpperCase())).toBe(true);
		expect(isUuid('3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe(true);
	});

	it('rejects non-canonical and malformed values', () => {
		expect(isUuid(OVERSIZED_UUID)).toBe(false);
		expect(isUuid(`{${VALID_UUID}}`)).toBe(false);
		expect(isUuid(`urn:uuid:${VALID_UUID}`)).toBe(false);
		expect(isUuid('health-code')).toBe(false);
		expect(isUuid('3f2504e0-4f89-41d3-9a0c-0305e82c330g')).toBe(false);
		expect(isUuid('3f2504e04f8941d39a0c0305e82c3301')).toBe(false);
		expect(isUuid('')).toBe(false);
	});
});
