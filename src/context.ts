import { spawn } from 'node:child_process';
import { Writable } from 'node:stream';
import type { Logger } from 'pino';

import { LinterFailedError } from './errors';

export type Context = {
    cwd: string;
    log: Logger;
    stdout: Writable;
    stderr: Writable;
    signal?: AbortSignal;
};

export type LinterContext = {
    shell: (cmd: readonly string[]) => Promise<void>;
    files: readonly string[];
};

export const createLinterContext = (context: Context, files: readonly string[]): LinterContext => ({
    shell: async (cmd) => {
        context.log.debug({ cmd }, 'running shell command');

        const command = spawn(cmd[0], cmd.slice(1), {
            cwd: context.cwd,
            stdio: ['ignore', context.stdout, context.stderr],
            signal: context.signal,
        });

        const { promise, resolve, reject } = Promise.withResolvers<void>();

        command.on('error', reject);

        command.on('close', (exitCode, exitSignal) => {
            if (context.signal?.aborted) {
                reject(context.signal.reason);
                return;
            }

            if (exitCode === 0) {
                resolve();
                return;
            }

            if (exitSignal !== null) {
                reject(new LinterFailedError(`Command failed with signal ${exitSignal}`));
                return;
            }

            reject(new LinterFailedError(`Command failed with code ${exitCode}`));
        });

        return promise;
    },
    files,
});
