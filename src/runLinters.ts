import { type Options as GlobOptions, globby } from 'globby';

import type { Config } from './config';
import { type Context, createLinterContext } from './context';
import { LinterFailedError, isAbortError } from './errors';

const arrayWrap = <T>(value: T | readonly T[]): readonly T[] => (value instanceof Array ? value : [value]);

export type Action = 'check' | 'fix';

export const runLinters = async (
    config: Config,
    context: Context,
    filesFilter: Set<string> | undefined,
    action: Action,
): Promise<number> => {
    const { cwd, log } = context;

    let hadAnyError = false;
    for (const linter of config.linters) {
        log.info(`running linter ${linter.name}`);

        const globOptions: GlobOptions = {
            cwd,
            onlyFiles: true,
            ignoreFiles: [
                ...arrayWrap(config.global?.ignoreFiles ?? ['.gitignore']),
                ...arrayWrap(linter.ignoreFiles ?? config.default?.ignoreFiles ?? []),
            ],
            ignore: [...arrayWrap(config.global?.exclude ?? [])],
            absolute: true,
        };
        log.trace({ globOptions }, 'globbing files');

        let files = await globby(linter.files, globOptions);
        if (files.length === 0) {
            log.warn({ linter: linter.name }, 'no files found');
            continue;
        }

        if (filesFilter !== undefined) {
            files = files.filter((file) => filesFilter.has(file));
        }

        if (files.length === 0) {
            continue;
        }

        context.signal?.throwIfAborted();

        log.debug({ linter: linter.name, files }, 'running linter on files');

        try {
            if (action === 'fix' && linter.runFix) {
                await linter.runFix(createLinterContext(context, files));
            } else {
                await linter.runCheck(createLinterContext(context, files));
            }
        } catch (err) {
            if (err instanceof LinterFailedError) {
                log.error(`linter ${linter.name} failed: ${err.message}`);
            } else if (!isAbortError(err)) {
                log.error({ err }, `linter ${linter.name} failed`);
            }
            hadAnyError = true;
        }
    }

    if (hadAnyError) {
        log.error('one or more linters failed, returning exit code 1');
        return 1;
    }

    return 0;
};
