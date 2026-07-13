interface GreetingServiceDependencies {
	buildHelloMessage: (name?: string | undefined) => string;
}

export type MakeGreetingService = (dependencies: GreetingServiceDependencies) => (name?: string | undefined) => string;

export const makeGreetingService: MakeGreetingService = ({ buildHelloMessage }) => {
	function greetingService(name?: string): string {
		return buildHelloMessage(name);
	}
	return greetingService;
};
