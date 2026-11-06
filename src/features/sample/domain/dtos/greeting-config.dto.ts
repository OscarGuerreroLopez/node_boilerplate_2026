export interface GreetingConfig {
	readonly prefix: string;
}

export type ReadGreetingConfig = () => Promise<GreetingConfig>;
