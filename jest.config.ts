import type { Config } from 'jest';

const config: Config = {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	moduleNameMapper: {
		'^@common/(.*)$': '<rootDir>/src/common/$1',
		'^@common$': '<rootDir>/src/common/index.ts',
		'^@core/(.*)$': '<rootDir>/src/core/$1',
		'^@core$': '<rootDir>/src/core/index.ts',
		'^@features/(.*)$': '<rootDir>/src/features/$1',
		'^@features$': '<rootDir>/src/features/index.ts',
		'^@versions/(.*)$': '<rootDir>/src/versions/$1',
		'^@versions$': '<rootDir>/src/versions/index.ts'
	},
	preset: 'ts-jest',
	testPathIgnorePatterns: ['<rootDir>/dist/'],
	testEnvironment: 'jest-environment-node'
};

export default config;
