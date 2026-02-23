# {{ NgDocPage.title }}

<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
  <svg width="48" height="48" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="256" cy="256" r="240" fill="#6BA539"/>
    <path d="M160 160 L256 120 L352 160 L352 352 L256 392 L160 352Z" fill="white" opacity="0.95"/>
    <path d="M256 120 L256 392" stroke="#6BA539" stroke-width="8"/>
    <path d="M160 160 L352 160" stroke="#6BA539" stroke-width="6"/>
    <path d="M160 240 L352 240" stroke="#6BA539" stroke-width="6"/>
    <path d="M160 320 L352 320" stroke="#6BA539" stroke-width="6"/>
    <circle cx="256" cy="160" r="12" fill="#6BA539"/>
    <circle cx="256" cy="240" r="12" fill="#6BA539"/>
    <circle cx="256" cy="320" r="12" fill="#6BA539"/>
  </svg>
  <div>
    <strong style="font-size: 1.1em;">@ng-forge/openapi-generator</strong><br/>
    <span style="opacity: 0.7;">Generate type-safe <code>@ng-forge/dynamic-forms</code> configurations from OpenAPI 3.x specifications.</span>
  </div>
</div>

## Overview

The OpenAPI Generator reads your OpenAPI 3.x spec and produces ready-to-use `FormConfig` objects and TypeScript interfaces. No manual field wiring — your API contract drives your forms.

**Key features:**

- Generates `as const satisfies FormConfig` for full type inference
- Maps OpenAPI types, formats, and constraints to field types and validators
- Interactive mode for resolving ambiguous field types (e.g. input vs textarea)
- Watch mode for regeneration on spec changes
- Persists decisions in a config file for reproducible builds

## Installation

The generator is a standalone CLI tool. Run it directly with `npx`:

```bash
npx @ng-forge/openapi-generator generate --spec ./openapi.yaml --output ./src/forms
```

Or install it as a dev dependency:

```bash
npm install -D @ng-forge/openapi-generator
```

## Quick Start

Given a Petstore-like OpenAPI spec:

```yaml
openapi: 3.0.3
info:
  title: Petstore
  version: 1.0.0
paths:
  /pets:
    post:
      operationId: createPet
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [name]
              properties:
                name:
                  type: string
                  minLength: 1
                  maxLength: 100
                age:
                  type: integer
                  minimum: 0
                email:
                  type: string
                  format: email
                status:
                  type: string
                  enum: [available, pending, sold]
```

Run the generator:

```bash
npx @ng-forge/openapi-generator generate --spec ./petstore.yaml --output ./src/forms
```

This produces:

**`src/forms/forms/create-pet.form.ts`**

```typescript
import type { FormConfig } from '@ng-forge/dynamic-forms';

export const createPetFormConfig = {
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      props: { type: 'text' },
      validation: [{ type: 'required' }, { type: 'minLength', value: 1 }, { type: 'maxLength', value: 100 }],
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      props: { type: 'number' },
      validation: [{ type: 'min', value: 0 }],
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      props: { type: 'email' },
      validation: [{ type: 'email' }],
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Pending', value: 'pending' },
        { label: 'Sold', value: 'sold' },
      ],
    },
  ],
} as const satisfies FormConfig;
```

**`src/forms/types/create-pet.types.ts`**

```typescript
export interface CreatePetFormValue {
  name: string;
  age?: number;
  email?: string;
  status?: 'available' | 'pending' | 'sold';
}
```

Both directories include barrel `index.ts` files for convenient imports.

## CLI Reference

```bash
ng-forge-generator generate [options]
```

| Flag                   | Type                 | Default        | Description                                                   |
| ---------------------- | -------------------- | -------------- | ------------------------------------------------------------- |
| `--spec <path>`        | `string`             | **(required)** | Path to OpenAPI 3.x spec file (JSON or YAML)                  |
| `--output <path>`      | `string`             | **(required)** | Output directory for generated files                          |
| `--interactive <mode>` | `'full'` \| `'none'` | `'full'`       | `'full'` prompts for ambiguous fields; `'none'` uses defaults |
| `--endpoints <list>`   | `string`             | —              | Comma-separated endpoints: `POST:/pets,GET:/pets/{id}`        |
| `--editable`           | `boolean`            | `false`        | Make GET response fields editable (read-only by default)      |
| `--watch`              | `boolean`            | `false`        | Watch spec file and regenerate on changes                     |
| `--config <path>`      | `string`             | `cwd`          | Directory containing `.ng-forge-generator.json`               |

## OpenAPI to Field Type Mapping

The generator maps OpenAPI schema types and formats to `@ng-forge/dynamic-forms` field types:

| OpenAPI Type         | Format               | Field Type       | Props                  |
| -------------------- | -------------------- | ---------------- | ---------------------- |
| `string`             | `email`              | `input`          | `{ type: 'email' }`    |
| `string`             | `uri` / `url`        | `input`          | `{ type: 'url' }`      |
| `string`             | `date` / `date-time` | `datepicker`     | —                      |
| `string`             | `password`           | `input`          | `{ type: 'password' }` |
| `string`             | _(none)_             | `input`          | `{ type: 'text' }`     |
| `string`             | + `enum`             | `select`         | —                      |
| `integer` / `number` | _(any)_              | `input`          | `{ type: 'number' }`   |
| `boolean`            | _(any)_              | `checkbox`       | —                      |
| `array`              | + enum items         | `multi-checkbox` | —                      |
| `array`              | + object items       | `array`          | _(container)_          |
| `object`             | _(any)_              | `group`          | _(container)_          |

### Ambiguous Field Types

Some mappings have alternatives. In interactive mode, the CLI prompts you to choose:

| Scope         | Default               | Alternative             |
| ------------- | --------------------- | ----------------------- |
| Text input    | `input` (single-line) | `textarea` (multi-line) |
| Single select | `select` (dropdown)   | `radio` (radio buttons) |
| Numeric       | `input` (number)      | `slider` (range)        |
| Boolean       | `checkbox`            | `toggle` (switch)       |

In non-interactive mode (`--interactive none`), the **Default** column is used automatically.

## Validator Mapping

OpenAPI schema constraints map directly to `@ng-forge/dynamic-forms` validators:

| OpenAPI Property          | Validator   | Value        |
| ------------------------- | ----------- | ------------ |
| Field in `required` array | `required`  | —            |
| `minLength`               | `minLength` | number       |
| `maxLength`               | `maxLength` | number       |
| `minimum`                 | `min`       | number       |
| `maximum`                 | `max`       | number       |
| `pattern`                 | `pattern`   | regex string |
| `format: 'email'`         | `email`     | —            |

## Schema Support

| Schema Structure          | Support      | Notes                                               |
| ------------------------- | ------------ | --------------------------------------------------- |
| Plain `properties`        | Supported    | Maps each property to a field                       |
| `allOf`                   | Supported    | Merges schemas, combines `required` arrays          |
| `oneOf` + `discriminator` | Supported    | Creates conditional groups with radio discriminator |
| `anyOf`                   | Skipped      | Warning logged                                      |
| `if/then/else`            | Skipped      | Warning logged                                      |
| `additionalProperties`    | Skipped      | Warning logged                                      |
| `$ref`                    | Dereferenced | Resolved at parse time via swagger-parser           |

## Config File

The generator persists your choices in `.ng-forge-generator.json`:

```json
{
  "spec": "./openapi.yaml",
  "output": "./src/forms",
  "endpoints": ["POST:/pets", "GET:/pets/{id}"],
  "decisions": {
    "description": "textarea",
    "age": "slider"
  },
  "editable": false
}
```

On subsequent runs, persisted decisions are reused — so interactive prompts only appear for new or changed fields.

## Interactive vs Non-Interactive Mode

**Interactive (`--interactive full`)** — the default:

1. Prompts you to select which endpoints to generate forms for (POST/PUT/PATCH are pre-selected, GET is unchecked)
2. Prompts for each ambiguous field type choice
3. Saves decisions to the config file

**Non-interactive (`--interactive none`)**:

- Uses all endpoints, or filters by `--endpoints` flag
- Uses default field type choices for ambiguous fields
- No prompts — suitable for CI/CD pipelines

## Watch Mode

```bash
npx @ng-forge/openapi-generator generate \
  --spec ./openapi.yaml \
  --output ./src/forms \
  --watch
```

Watch mode monitors your spec file and regenerates forms on changes:

- Uses a 500ms debounce to avoid thrashing
- Runs in non-interactive mode (uses persisted decisions)
- Press `Ctrl+C` to stop

## Output Structure

Generated files follow this layout:

```
<output-dir>/
├── forms/
│   ├── create-pet.form.ts
│   ├── list-pets.form.ts
│   └── index.ts
└── types/
    ├── create-pet.types.ts
    ├── list-pets.types.ts
    └── index.ts
```

File names are derived from `operationId` if available, otherwise from the HTTP method and path (e.g. `POST /pets/{id}/tags` → `post-pets-by-id-tags`).

## GET Endpoints

By default, fields generated from GET response schemas are `disabled: true` (read-only display). Use the `--editable` flag to make them editable:

```bash
npx @ng-forge/openapi-generator generate \
  --spec ./openapi.yaml \
  --output ./src/forms \
  --editable
```

## Programmatic API

The package exports its internals for programmatic use:

```typescript
import {
  // Parsing
  parseOpenAPISpec,
  extractEndpoints,

  // Mapping
  mapSchemaToFieldType,
  mapSchemaToValidators,
  mapSchemaToFields,

  // Generation
  generateFormConfig,
  generateInterface,
  generateBarrel,
  writeGeneratedFiles,

  // Configuration
  loadConfig,
  saveConfig,

  // CLI
  run,
} from '@ng-forge/openapi-generator';
```

Use these to integrate form generation into custom build pipelines, Nx generators, or CI workflows.
