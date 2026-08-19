# @ng-forge/dynamic-forms-cli

Validates `@ng-forge/dynamic-forms` FormConfig objects from the command line.

[![CI](https://img.shields.io/github/actions/workflow/status/ng-forge/ng-forge/ci.yml?branch=main)](https://github.com/ng-forge/ng-forge/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-cli.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-cli)
[![npm downloads](https://img.shields.io/npm/dm/@ng-forge/dynamic-forms-cli.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1494269650555371582?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/qpzzvFagj3)

## Quick start

```bash
npx --yes @ng-forge/dynamic-forms-cli "src/**/*.form.ts" --ui material
```

Requires **Node 24 or newer**. Pass `--yes` when a script or an agent runs it, so npx does not stop at its first-install prompt.

It finds every FormConfig in the matched files, validates each against the schema for your UI integration, and prints the errors with a suggested fix.

```
# Validation Report

**File:** src/app/checkout/checkout.form.ts
**UI Integration:** material

## Found 1 FormConfig(s)

### 2 Error(s) Found

#### checkoutForm (line 8): Invalid

- **fields[3].props.options:** Unrecognized key
  - **Fix:** Move `options` from `props: { options: [...] }` to field level: `{ key, type, options: [...] }`
- **fields[7].value:** Required
  - **Fix:** Hidden fields REQUIRE a `value` property. Add: `value: "your-value-here"`

### Related documentation
- Options syntax: https://ng-forge.com/dynamic-forms/schema-fields/field-types
- Hidden field rules: https://ng-forge.com/dynamic-forms/prebuilt/hidden-fields
```

## Why this exists alongside the compiler

A config written as `as const satisfies FormConfig` is already type-checked. This CLI covers what the compiler does not:

- Rules that are structural rather than type-level, such as containers accepting only `hidden` logic, or hidden fields requiring a `value`
- Configs that reach your app as JSON at runtime
- A gate in CI, and a ground-truth check for AI-generated configs where the model's own confidence is not evidence

## How configs are found

The file is parsed with ts-morph and searched, in order, for:

1. `satisfies FormConfig` (recommended, most reliable)
2. `const x: FormConfig = { ... }`
3. `as FormConfig`
4. Structural match: an object with a `fields` array

Any of the first three counts on its own. A config you have explicitly typed is validated even when its shape is wrong, which is the case where staying silent would be most misleading. The structural match is only for configs carrying no type evidence at all.

Configs are found in these declaration positions:

- `const` / `let` declarations
- class properties
- default exports

Anything else, a config returned from a factory function for instance, is not discovered. Assign it to a variable if you want it checked.

Values that only exist at runtime (function calls, identifiers, `new Date()`) are replaced with placeholders so the rest of the config can still be checked. Those substitutions are listed under "Extraction Notes" in the report.

## Options

| Flag                     | Default    | Description                                        |
| ------------------------ | ---------- | -------------------------------------------------- |
| `-u, --ui <integration>` | `material` | One of `material`, `bootstrap`, `primeng`, `ionic` |
| `--json`                 | off        | Emit machine-readable JSON instead of the report   |
| `-q, --quiet`            | off        | Only print failures                                |
| `--require-config`       | off        | Fail when the matched files contain no FormConfig  |

## Exit codes

| Code | Meaning                                                             |
| ---- | ------------------------------------------------------------------- |
| `0`  | Every config valid, or no configs found (unless `--require-config`) |
| `1`  | At least one config failed validation                               |
| `2`  | Bad invocation: unknown UI integration, or no files matched         |

Code `2` is kept separate from `1` so a typo in your glob does not read as a passing run.

## In CI

```yaml
- name: Validate form configs
  run: npx --yes @ng-forge/dynamic-forms-cli "src/**/*.form.ts" --ui material --quiet --require-config
```

`--require-config` is what makes this a real gate. Without it, a refactor that moves configs somewhere the extractor cannot see reports success rather than failure.

## Programmatic use

The same pipeline is exported, so you can build the check into your own tooling:

```typescript
import { validateFile, formatFileReport, collectRelatedDocs } from '@ng-forge/dynamic-forms-cli';

const result = await validateFile('src/app/login.form.ts', 'material');

if (!result.valid) {
  console.error(formatFileReport(result, { relatedDocs: collectRelatedDocs }));
}
```

`validateSource` takes the source text directly if you already hold it, for example in an editor integration.

## Validating configs at runtime

If your forms arrive as JSON from an API or a CMS, the compiler cannot see them and the CLI runs too early. Import the `/validate` entry point instead, which carries the schemas without the ts-morph source parser and is safe in an application bundle:

```typescript
import { validateFormConfig, getFormConfigJsonSchema } from '@ng-forge/dynamic-forms-cli/validate';

const result = validateFormConfig('material', configFromApi);

if (!result.valid) {
  console.error(result.errorSummary);
}

// JSON Schema, for constraining an LLM's structured output
const schema = getFormConfigJsonSchema('material');
```

## Related

- [`@ng-forge/dynamic-forms`](https://www.npmjs.com/package/@ng-forge/dynamic-forms) - the form library
- [`@ng-forge/dynamic-form-mcp`](https://www.npmjs.com/package/@ng-forge/dynamic-form-mcp) - MCP server exposing the same validation to AI assistants

## License

MIT
