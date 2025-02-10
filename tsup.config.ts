import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/cli/run-linters.ts', 'src/config/index.ts', 'src/presets/index.ts', 'src/index.ts'],
    sourcemap: true,
    dts: true,
    format: 'esm',
    treeshake: true,
});
