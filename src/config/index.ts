import type { Config } from './type';

export { loadConfig } from './loader';
export type { Config, Linter, LinterDefault, LinterGlobal, LinterOptions } from './type';

export const defineConfig = (config: Config): Config => config;
