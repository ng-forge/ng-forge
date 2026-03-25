# @ng-forge/openapi-generator

Converts OpenAPI 3.x specifications into `@ng-forge/dynamic-forms` FormConfig objects and TypeScript interfaces.

## Installation

```bash
npm install @ng-forge/openapi-generator
```

## CLI Usage

```bash
ng-forge-generator --spec openapi.yaml --output src/generated
```

### Options

| Option                 | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `--spec <path>`        | Path to OpenAPI spec file (required)                           |
| `--output <path>`      | Output directory for generated files (required)                |
| `--interactive <mode>` | Interactive mode: `full` or `none` (default: `full`)           |
| `--endpoints <list>`   | Comma-separated `METHOD:/path` endpoints (for non-interactive) |
| `--editable`           | Generate editable forms for GET endpoints                      |
| `--watch`              | Watch spec file for changes and regenerate                     |
| `--config <path>`      | Path to config file directory                                  |
| `--dry-run`            | List files that would be generated without writing them        |
| `--skip-existing`      | Skip files that already exist on disk                          |
| `--verbose`            | Show detailed output including field mapping decisions         |
| `--quiet`              | Suppress all output except warnings and errors                 |

### Interactive Modes

- **`--interactive full`** (default): Prompts the user to select endpoints (POST/PUT/PATCH pre-checked) and resolve ambiguous field types.
- **`--interactive none`**: No prompts. Uses `--endpoints` flag, saved config, or auto-selects POST/PUT/PATCH endpoints. GET endpoints require the `--editable` flag.

### Examples

```bash
# Interactive mode (default) — prompts for endpoint selection and field types
ng-forge-generator --spec openapi.yaml --output src/generated

# Non-interactive for CI — auto-selects POST/PUT/PATCH
ng-forge-generator --spec openapi.yaml --output src/generated --interactive none

# Specific endpoints only
ng-forge-generator --spec openapi.yaml --output src/generated \
  --interactive none --endpoints "POST:/users,PUT:/users/{id}"

# Include GET endpoints as editable forms
ng-forge-generator --spec openapi.yaml --output src/generated --interactive none --editable

# Preview without writing
ng-forge-generator --spec openapi.yaml --output src/generated --dry-run

# Watch for changes
ng-forge-generator --spec openapi.yaml --output src/generated --watch

# Verbose output for debugging field mapping
ng-forge-generator --spec openapi.yaml --output src/generated --interactive none --verbose

# Quiet mode for CI pipelines
ng-forge-generator --spec openapi.yaml --output src/generated --interactive none --quiet
```

## Field Type Mapping

| OpenAPI Type                  | Format/Constraint    | Form Field Type         | Ambiguous?    |
| ----------------------------- | -------------------- | ----------------------- | ------------- |
| `string`                      | --                   | input (text)            | Yes: textarea |
| `string`                      | `email`              | input (email)           | No            |
| `string`                      | `password`           | input (password)        | No            |
| `string`                      | `uri` / `url`        | input (url)             | No            |
| `string`                      | `date` / `date-time` | datepicker              | No            |
| `string`                      | `time`               | input (time)            | No            |
| `string` + `enum`             | --                   | select                  | Yes: radio    |
| `string` + `maxLength` <= 100 | --                   | input (text)            | No            |
| `string` + `maxLength` > 200  | --                   | textarea                | No            |
| `integer` / `number`          | --                   | input (number)          | Yes: slider   |
| `boolean`                     | --                   | checkbox                | Yes: toggle   |
| `array` + enum items          | --                   | multi-checkbox          | No            |
| `array` + object items        | --                   | array (template)        | No            |
| `array` + primitive items     | --                   | array (single template) | No            |
| `object`                      | --                   | group                   | No            |

### Name-based Heuristics

- Fields ending with `description`, `notes`, `comment`, `bio`, `body`, `content`, `summary`, `message`, `text` are resolved to **textarea** (overrides ambiguous text input).
- Fields ending with `phone`, `tel`, `telephone`, `mobile`, `fax`, `cell` are resolved to input type **tel**.

## Validator Mapping

| OpenAPI Constraint | Form Validator |
| ------------------ | -------------- |
| `required`         | `required`     |
| `minLength`        | `minLength`    |
| `maxLength`        | `maxLength`    |
| `minimum`          | `min`          |
| `maximum`          | `max`          |
| `pattern`          | `pattern`      |
| `format: email`    | `email`        |
| `minItems` (array) | `minLength`    |
| `maxItems` (array) | `maxLength`    |

## Custom Extensions

- **`x-ng-forge-type`**: Override the generated field type entirely (e.g., `x-ng-forge-type: color-picker`).
- **`x-enum-labels`**: Custom human-readable labels for enum values. Supports array format `['Label 1', 'Label 2']` or object format `{ value1: 'Label 1', value2: 'Label 2' }`.

## GET Endpoint Behavior

- **Without `--editable`**: GET endpoints are excluded in non-interactive mode.
- **With `--editable`**: GET response schemas generate forms with editable fields.
- **Without `--editable` + explicit `--endpoints "GET:/path"`**: Fields are generated with `disabled: true`, and array fields have no add/remove buttons.
- Top-level array responses are always skipped with a warning.

## Configuration Persistence

A `.ng-forge-generator.json` config file is saved in the output directory (or the `--config` directory). It stores selected endpoints and field type decisions, enabling reproducible non-interactive re-runs.

## Output Structure

```
<output>/
├── forms/
│   ├── <endpoint>.form.ts    # FormConfig objects
│   └── index.ts              # Barrel exports
├── types/
│   ├── <endpoint>.types.ts   # TypeScript interfaces
│   └── index.ts              # Barrel exports
└── .ng-forge-generator.json  # Config
```

### File Naming

- **With `operationId`**: kebab-cased operationId (e.g., `createPet` -> `create-pet.form.ts`)
- **Without `operationId`**: method + path (e.g., `POST /users/register` -> `post-users-register.form.ts`)

## Programmatic API

The package exports all core functions for programmatic use:

- **Parsing**: `parseOpenAPISpec`, `extractEndpoints`, `walkSchema`
- **Mapping**: `mapSchemaToFieldType`, `mapSchemaToValidators`, `mapSchemaToFields`
- **Generation**: `generateFormConfig`, `generateInterface`, `generateBarrel`
- **I/O**: `writeGeneratedFiles`, `loadConfig`, `saveConfig`

## Exit Codes

| Code | Meaning                                                             |
| ---- | ------------------------------------------------------------------- |
| `0`  | Success                                                             |
| `1`  | Error (parse failure, no endpoints found/selected, invalid options) |
