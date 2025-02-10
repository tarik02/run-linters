#!/usr/bin/env node
import cac from 'cac';
import path from 'node:path';
import process from 'node:process';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

import packageJson from '../../package.json';
import type { Config } from '../config';
import { loadConfig } from '../config';
import type { Context } from '../context';
import { CancelError } from '../errors';
import { getGitDiffFiles } from '../gitDiff';
import { runLinters } from '../runLinters';

const cli = cac('run-linters');

const cwd = process.cwd();
const abortController = new AbortController();

const log = pino(
    {
        level: 'info',
    },
    pinoPretty({
        colorize: true,
        singleLine: true,
        ignore: 'pid,hostname,time',
    }),
);

const removeAbortListeners = () => {
    process.removeListener('SIGINT', onAbort);
    process.removeListener('SIGTERM', onAbort);
};

const onAbort = () => {
    abortController.abort(new CancelError());
    removeAbortListeners();
};

process.addListener('SIGINT', onAbort);
process.addListener('SIGTERM', onAbort);

class ConflictingOptionsError extends Error {}

const checkConflictingOptions = (options: Record<string, unknown>, names: string[]) => {
    for (let i = 0, c = names.length; i < c; ++i) {
        const name = names[i];
        if (!options[name]) {
            continue;
        }
        for (let j = i + 1; j < c; ++j) {
            const otherName = names[j];
            if (options[otherName]) {
                throw new ConflictingOptionsError(`options "${name}" and "${otherName}" are mutually exclusive`);
            }
        }
    }
};

cli.command('[...files]', 'Run linters and fix issues')
    .option('--log [string]', 'Set log level (trace, debug, info, warn, error, fatal)', { default: 'info' })
    .option('--changed', 'Run on staged files (alias for "--git-diff HEAD")')
    .option('--staged', 'Run on staged files (alias for "--git-diff --staged")')
    .option('--git-diff [string]', 'Run on files changed by git expression')
    .option('--git-diff-filter [string]', 'Override default git filter (ACMR)', { default: 'ACMR' })
    .option('--fix', 'Fix issues')
    .action(async (files: string[], options) => {
        log.level = options.log;

        if (files.length > 0) {
            options.files = files;
        }

        checkConflictingOptions(options, ['changed', 'staged', 'gitDiff', 'files']);

        if (options.changed) {
            options.gitDiff = 'HEAD';
        }
        if (options.staged) {
            options.gitDiff = '--staged';
        }

        let config: Config;
        try {
            config = await loadConfig(cwd);
        } catch (err) {
            log.fatal({ err }, 'failed to load config');
            return 1;
        }

        const context: Context = {
            cwd,
            log,
            stdout: process.stdout,
            stderr: process.stderr,
            signal: abortController.signal,
        };

        let filesFilter: Set<string> | undefined;
        if (options.gitDiff) {
            filesFilter = new Set(
                (await getGitDiffFiles(context, options.gitDiff, options.gitDiffFilter)).map((file) =>
                    path.resolve(cwd, file),
                ),
            );
        } else if (files.length > 0) {
            filesFilter = new Set(files.map((file) => path.resolve(cwd, file)));
        }

        return await runLinters(config as Config, context, filesFilter, options.fix ? 'fix' : 'check');
    });

let exitCode = 0;
try {
    cli.help();
    cli.version(packageJson.version);
    cli.parse(process.argv, { run: false });
    exitCode = await cli.runMatchedCommand();
} catch (err) {
    exitCode = 1;
    if (err instanceof ConflictingOptionsError) {
        log.error(err.message);
        cli.outputHelp();
    } else if (err instanceof CancelError) {
        log.warn('Canceled');
    } else {
        log.fatal({ err });
    }
} finally {
    removeAbortListeners();
}

process.exit(exitCode);
