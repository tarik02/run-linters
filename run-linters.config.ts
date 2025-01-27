import { defineConfig } from 'run-linters/config';
import { eslint, prettier, tsc } from 'run-linters/presets';

export default defineConfig({
    linters: [eslint, prettier, tsc],
});
