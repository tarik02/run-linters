import { defineConfig } from 'run-linters/config';
import { depcheck, eslint, prettier, tsc } from 'run-linters/presets';

export default defineConfig({
    linters: [eslint, prettier, tsc, depcheck],
});
