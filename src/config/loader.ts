import { bundleRequire } from 'bundle-require';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ConfigNotFoundError } from '../errors';

export const loadConfig = async (cwd: string) => {
    for (const file of ['run-linters.config.js', 'run-linters.config.ts']) {
        console.log(`Checking for config file ${file}`);
        try {
            await fs.stat(path.join(cwd, file));
        } catch (error) {
            console.log(error);
            if ((error as { code?: string }).code !== 'ENOENT') {
                throw error;
            }
            continue;
        }

        const {
            mod: { default: config },
        } = await bundleRequire({
            cwd,
            filepath: path.join(cwd, file),
        });
        return config;
    }

    console.log('Config file not found');
    throw new ConfigNotFoundError();
};
