import type { Linter } from '../config';

export const tsc: Linter = {
    name: 'tsc',
    files: '**/*.{ts,tsx}',
    runCheck: ({ shell }) => shell(['tsc', '--noEmit', '--skipLibCheck']),
};
