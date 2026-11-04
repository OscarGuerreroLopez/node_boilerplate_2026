import { sanitizeLogData } from './sanitize-log-data';

const FULLY_MASKED = '********';
const NON_STRING_MASKED = '***';
const SAMPLE_NUMBER = 42;

describe('sanitizeLogData', () => {
	it('masks sensitive keys with different formats', () => {
		const sanitized = sanitizeLogData({
			password: 'secret-password',
			passwordHash: 'hashed-password',
			accessToken: 'access-token',
			api_key: 'api-key',
			Authorization: 'Bearer token',
			clientSecret: 'client-secret',
			credentials: { username: 'user' },
			cookie: 'session=value',
			privateKey: 'private-key'
		});

		expect(sanitized).toEqual({
			password: FULLY_MASKED,
			passwordHash: FULLY_MASKED,
			accessToken: FULLY_MASKED,
			api_key: FULLY_MASKED,
			Authorization: FULLY_MASKED,
			clientSecret: FULLY_MASKED,
			credentials: NON_STRING_MASKED,
			cookie: FULLY_MASKED,
			privateKey: FULLY_MASKED
		});
	});

	it('masks email values partially', () => {
		const sanitized = sanitizeLogData({
			email: 'oscar@example.com',
			contactEmail: 'beatriz@example.com',
			shortEmail: 'ana@example.com',
			plainEmail: 'no-at-sign'
		});

		expect(sanitized).toEqual({
			email: 'osca***@example.com',
			contactEmail: 'beat***@example.com',
			shortEmail: `${FULLY_MASKED}@example.com`,
			plainEmail: 'no-a***sign'
		});
	});

	it('sanitizes nested objects and arrays', () => {
		const sanitized = sanitizeLogData({
			safe: 'value',
			nested: {
				token: 'nested-token',
				email: 'oscar@example.com'
			},
			items: [{ apiKey: 'item-key' }, { value: 'safe' }]
		});

		expect(sanitized).toEqual({
			safe: 'value',
			nested: {
				token: FULLY_MASKED,
				email: 'osca***@example.com'
			},
			items: [{ apiKey: FULLY_MASKED }, { value: 'safe' }]
		});
	});

	it('masks non-string sensitive values without recursing', () => {
		const sanitized = sanitizeLogData({
			token: 123,
			email: 123,
			publicKey: 'public-key'
		});

		expect(sanitized).toEqual({
			token: NON_STRING_MASKED,
			email: NON_STRING_MASKED,
			publicKey: 'public-key'
		});
	});

	it('strips control characters from string values', () => {
		const sanitized = sanitizeLogData({
			message: 'line 1\nline 2\tend',
			nested: ['safe\u0000value', { detail: 'x\u007fy\u0085z' }],
			email: 'os\u0000car@example.com',
			safe: 'café 🚀'
		});

		expect(sanitized).toEqual({
			message: 'line 1line 2end',
			nested: ['safevalue', { detail: 'xyz' }],
			email: 'osca***@example.com',
			safe: 'café 🚀'
		});
	});

	it('leaves primitive and null values unchanged', () => {
		expect(sanitizeLogData('value')).toBe('value');
		expect(sanitizeLogData('line 1\nline 2\u0000\u007f')).toBe('line 1line 2');
		expect(sanitizeLogData(SAMPLE_NUMBER)).toBe(SAMPLE_NUMBER);
		expect(sanitizeLogData(null)).toBeNull();
	});
});
