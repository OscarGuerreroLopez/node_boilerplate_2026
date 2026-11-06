export const buildHelloMessage = (name?: string, prefix = 'hello'): string => {
	const safeName = name?.trim();
	return `${prefix} ${safeName && safeName.length > 0 ? safeName : 'world'}`;
};
