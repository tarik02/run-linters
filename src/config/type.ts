import type { LinterContext } from '../context';

export type LinterOptions = {
    ignoreFiles?: string | readonly string[];
};

export type LinterGlobal = LinterOptions & {
    exclude: string | readonly string[];
};

export type LinterDefault = LinterOptions;

export type Linter = LinterOptions & {
    name: string;
    files: string | readonly string[];
    runCheck: (context: LinterContext) => Promise<void>;
    runFix?: (context: LinterContext) => Promise<void>;
};

export type Config = {
    global?: LinterGlobal;
    default?: LinterDefault;
    linters: Array<Linter>;
};
