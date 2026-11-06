import type { ReadGreetingConfig } from '../dtos';

interface GreetingServiceDependencies {
	readGreetingConfig: ReadGreetingConfig;
	buildHelloMessage: (name?: string | undefined, prefix?: string | undefined) => string;
}

export type GreetingService = (name?: string | undefined) => Promise<string>;

export type MakeGreetingService = (dependencies: GreetingServiceDependencies) => GreetingService;

export const makeGreetingService: MakeGreetingService = ({ readGreetingConfig, buildHelloMessage }) => {
	async function greetingService(name?: string): Promise<string> {
		const { prefix } = await readGreetingConfig();

		return buildHelloMessage(name, prefix);
	}

	return greetingService;
};
