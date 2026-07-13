export const NodeEnvEnum = {
	LOCAL: 'local',
	DEVELOPMENT: 'development',
	PRODUCTION: 'production',
	TEST: 'test'
} as const;

export type NodeEnv = (typeof NodeEnvEnum)[keyof typeof NodeEnvEnum];
