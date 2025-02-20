import path from 'node:path';

import type { Linter } from '../config';
import { toError } from '../errors';

export const depcheck: Linter = {
    name: 'depcheck',
    files: '**/package.json',
    runCheck: async ({ shell, files }) => {
        const errors: Error[] = [];
        for (const file of files) {
            try {
                await shell(['depcheck', path.dirname(file)]);
            } catch (err) {
                errors.push(toError(err));
            }
        }
        if (errors.length > 0) {
            throw new AggregateError(errors, 'One or more errors occurred while running depcheck');
        }
    },
};
