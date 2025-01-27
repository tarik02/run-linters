import type { Linter } from '../config';

export const eslint: Linter = {
    name: 'eslint',
    files: '**.{js,ts}',
    ignoreFiles: ['.eslintignore'],
    runCheck: ({ shell, files }) => shell(['eslint', ...files]),
    runFix: ({ shell, files }) => shell(['eslint', '--fix', ...files]),
};
