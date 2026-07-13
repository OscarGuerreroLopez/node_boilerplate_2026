export const buildHelloMessage = (name?: string): string => {
	const safeName = name?.trim();
	return `hello ${safeName && safeName.length > 0 ? safeName : 'world'}`;
};
