import type { Linter } from '../config';

export const prettier: Linter = {
    name: 'prettier',
    files: '**/*',
    ignoreFiles: ['.prettierignore'],
    runCheck: ({ shell, files }) => shell(['prettier', '--ignore-unknown', '--check', ...files]),
    runFix: ({ shell, files }) => shell(['prettier', '--ignore-unknown', '--list-different', '--write', ...files]),
};
