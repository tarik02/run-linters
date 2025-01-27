# run-linters

Utility to run linters (eslint, prettier) and others (tsc).

## Installation

1. Install as a dev dependency to your project:

```bash
$ npm i --save-dev run-linters
$ # or
$ yarn add --dev run-linters
$ # or
$ bun add --dev run-linters
```

2. Add `lint` script to package.json:

```
{
    // ...
    "scripts": {
        // ...
        "lint": "run-linters"
        // ...
    },
    // ...
}
```

3. Setup your linters and create configuration file (`run-linters.config.ts` or `run-linters.config.js`):

```ts
import { defineConfig } from 'run-linters/config';
import { eslint, prettier, tsc } from 'run-linters/presets';

export default defineConfig({
    linters: [eslint, prettier, tsc],
});
```

## Usage

```shell
Usage:
  $ run-linters [...files]

Commands:
  [...files]  Run linters and fix issues

For more info, run any command with the `--help` flag:
  $ run-linters --help

Options:
  --log [string]              Set log level (trace, debug, info, warn, error, fatal) (default: info)
  --changed                   Run on staged files (alias for "--git-diff HEAD")
  --staged                    Run on staged files (alias for "--git-diff --staged")
  --git-diff [string]         Run on files changed by git expression
  --git-diff-filter [string]  Override default git filter (ACMR) (default: ACMR)
  --fix                       Fix issues
  -h, --help                  Display this message
  -v, --version               Display version number
```

## Configuration

run-linters can be configured using in-project configuration file (`run-linters.config.ts` or `run-linters.config.js`):

```ts
import { defineConfig } from 'run-linters/config';
import { eslint, prettier, tsc } from 'run-linters/presets';

export default defineConfig({
    // Options from global section are appended to every linter
    global: [
        exclude: ['src-legacy'],
        ignoreFiles: ['.gitignore'], // like exclude, but patterns are take from separate *ignore file (like .gitignore)
    ],
    // These options are only used if they are not specified in linter
    default: {
        ignoreFiles: [],
    },
    linters: [
        eslint,
        prettier,
        tsc,
        {
            name: 'my-custom-linter-for-css',
            files: '**/*.{css}', // globby (fast-glob) pattern
            ignoreFiles: ['.mycustomlinterignore'],
            runCheck: ({ shell, files }) => shell(['my-custom-linter', ...files]),
            runFix: ({ shell, files }) => shell(['my-custom-linter', ...files]), // optional
        },
    ],
});
```

For more linter configuration examples, see [src/presets](https://github.com/tarik02/run-linters/tree/master/presets).

## License

The project is released under the MIT license. Read the [license](https://github.com/Tarik02/run-linters/blob/master/LICENSE) for more information.
