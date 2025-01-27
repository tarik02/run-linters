import { spawn } from 'node:child_process';

import type { Context } from './context';

export const getGitDiffFiles = (
    context: Context,
    gitDiffExpression: string,
    gitDiffFilter: string,
): Promise<string[]> => {
    const { promise, resolve, reject } = Promise.withResolvers<string[]>();

    const command = spawn('git', ['diff', '--name-only', gitDiffExpression, `--diff-filter=${gitDiffFilter}`], {
        stdio: ['ignore', 'pipe', context.stderr],
        cwd: context.cwd,
        signal: context.signal,
        windowsHide: true,
    });

    let buffer = '';
    command.stdout.on('data', (data) => {
        buffer += data.toString();
    });

    command.on('error', reject);

    command.on('close', (exitCode, exitSignal) => {
        if (context.signal?.aborted) {
            reject(context.signal.reason);
            return;
        }

        if (exitCode === 0) {
            resolve(buffer.trim().split('\n'));
            return;
        }

        if (exitSignal !== null) {
            reject(new Error(`Command failed with signal ${exitSignal}`));
            return;
        }

        reject(new Error(`Command failed with code ${exitCode}`));
    });

    return promise;
};
