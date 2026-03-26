# @ng-forge/openapi-generator

Converts OpenAPI 3.x specifications into `@ng-forge/dynamic-forms` FormConfig objects and TypeScript interfaces.

## Quick Start

**1. Write (or already have) an OpenAPI 3.x spec:**

```yaml
# openapi.yaml
openapi: '3.0.3'
info:
  title: My API
  version: '1.0'
paths:
  /users/register:
    post:
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
                  minLength: 8
                bio:
                  type: string
                  maxLength: 500
```

**2. Run the generator:**

```bash
npx ng-forge-generator --spec openapi.yaml --output src/generated
```

**3. Import and use in your Angular component:**

```typescript
import { registerUserFormConfig } from './generated/forms';
import type { RegisterUserFormValue } from './generated/types';

@Component({
  template: `<ngf-dynamic-form [config]="formConfig" (formSubmit)="onSubmit($event)" />`,
})
export class RegisterComponent {
  formConfig = registerUserFormConfig;

  onSubmit(value: RegisterUserFormValue) {
    this.http.post('/users/register', value).subscribe();
  }
}
```

The generator produces a typed FormConfig and a matching TypeScript interface:

<details>
<summary>Generated <code>register-user.form.ts</code></summary>

```typescript
import type { FormConfig } from '@ng-forge/dynamic-forms';

export const registerUserFormConfig = {
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      props: { type: 'email' },
      validators: [{ type: 'required' }, { type: 'email' }],
    },
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      props: { type: 'password' },
      validators: [{ type: 'required' }, { type: 'minLength', value: 8 }],
    },
    {
      key: 'bio',
      type: 'textarea',
      label: 'Bio',
      validators: [{ type: 'maxLength', value: 500 }],
    },
  ],
} as const satisfies FormConfig;
```

</details>

<details>
<summary>Generated <code>register-user.types.ts</code></summary>

```typescript
export interface RegisterUserFormValue {
  email: string;
  password: string;
  bio?: string;
}
```

</details>

## Installation

```bash
npm install @ng-forge/openapi-generator
```

## CLI Usage

```bash
ng-forge-generator --spec openapi.yaml --output src/generated
```

### Options

| Option                 | Description                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `--spec <path>`        | Path to OpenAPI spec file (required)                                                     |
| `--output <path>`      | Output directory for generated files (required)                                          |
| `--interactive <mode>` | `full` (prompt for endpoints + ambiguous types) or `none` (auto-select). Default: `full` |
| `--endpoints <list>`   | Comma-separated endpoints, e.g. `"POST:/users,PUT:/users/{id}"`                          |
| `--read-only`          | Generate GET endpoint forms with all fields disabled                                     |
| `--watch`              | Watch spec file for changes and regenerate                                               |
| `--config <path>`      | Directory for `.ng-forge-generator.json` config (defaults to `--output`)                 |
| `--dry-run`            | List files that would be generated without writing them                                  |
| `--skip-existing`      | Skip files that already exist on disk                                                    |
| `--verbose`            | Show detailed output including field mapping decisions                                   |
| `--quiet`              | Suppress info output; still shows success summary, warnings, and errors                  |

### Interactive Modes

- **`--interactive full`** (default): Prompts the user to select endpoints (all pre-checked) and resolve ambiguous field types. Automatically falls back to `none` in non-TTY environments (e.g., CI pipelines).
- **`--interactive none`**: No prompts. Uses `--endpoints` flag, saved config, or auto-selects all endpoints. GET endpoints with top-level array responses are always skipped.

### Examples

```bash
# Interactive mode (default) — prompts for endpoint selection and field types
ng-forge-generator --spec openapi.yaml --output src/generated

# Non-interactive for CI — auto-selects POST/PUT/PATCH
ng-forge-generator --spec openapi.yaml --output src/generated --interactive none

# Specific endpoints only
ng-forge-generator --spec openapi.yaml --output src/generated \
  --interactive none --endpoints "POST:/users,PUT:/users/{id}"

# Generate GET endpoints with disabled (read-only) fields
ng-forge-generator --spec openapi.yaml --output src/generated --interactive none --read-only

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

## Advanced Schema Handling

### `allOf` (Schema Composition)

The generator merges all schemas in an `allOf` array into a single flat set of properties. This is commonly used for inheritance-style schemas:

```yaml
NewPet:
  allOf:
    - $ref: '#/components/schemas/Pet' # base properties
    - type: object
      properties:
        ownerEmail: # additional properties
          type: string
          format: email
```

The generated form includes all properties from `Pet` plus `ownerEmail`, as if they were declared in a single schema.

### `oneOf` + `discriminator` (Polymorphic Forms)

When a schema uses `oneOf` with a `discriminator`, the generator creates a conditional form:

```yaml
Payment:
  oneOf:
    - $ref: '#/components/schemas/CreditCardPayment'
    - $ref: '#/components/schemas/BankTransferPayment'
  discriminator:
    propertyName: paymentMethod
    mapping:
      credit_card: '#/components/schemas/CreditCardPayment'
      bank_transfer: '#/components/schemas/BankTransferPayment'
```

This produces:

- A **radio field** for the discriminator property (`paymentMethod`)
- **Conditional field groups** for each variant, shown/hidden via `logic` based on the discriminator value
- **Distinct variant interfaces** (e.g., `PaymentCreditCard`, `PaymentBankTransfer`) combined as a union type

When a property references a discriminator schema (e.g., `method: { $ref: '#/components/schemas/Payment' }`), the generator wraps the discriminator fields inside a **group field** for that property.

## GET Endpoint Behavior

- **Default**: GET endpoints are included with editable fields, just like POST/PUT/PATCH.
- **With `--read-only`**: GET endpoint fields are generated with `disabled: true`, and array fields have no add/remove buttons.
- Top-level array responses are always skipped with a warning.

## Watch Mode

The `--watch` flag starts a file watcher on the spec file. When the spec changes:

1. The generator re-runs automatically using saved config (non-interactive)
2. If new endpoints are detected that weren't in the original selection, a message is logged — re-run without `--watch` to select them
3. Changes are debounced (500ms) to avoid redundant regenerations during rapid edits
4. Press `Ctrl+C` to stop watching

Watch mode is useful during API-first development workflows where the spec is being actively edited.

## Configuration Persistence

A `.ng-forge-generator.json` config file is saved in the output directory (or the `--config` directory). It stores:

- **Selected endpoints** — which `METHOD:/path` pairs to generate
- **Field type decisions** — ambiguous field type choices (e.g., `"registerUser.acceptTerms": "checkbox"`)
- **Read-only flag** — whether GET endpoint fields are disabled

This enables reproducible non-interactive re-runs. On subsequent runs, the generator reuses saved decisions without prompting.

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

### Parsing

```typescript
// Parse and dereference an OpenAPI 3.x spec file
parseOpenAPISpec(specPath: string): Promise<OpenAPISpec>

// Extract GET/POST/PUT/PATCH endpoints with their schemas
extractEndpoints(spec: OpenAPISpec): EndpointInfo[]

// Walk a schema, merging allOf and resolving discriminators
walkSchema(schema: SchemaObject, requiredFields?: string[]): WalkedSchema
```

### Mapping

```typescript
// Map a single schema property to a form field type
mapSchemaToFieldType(schema: SchemaObject): FieldTypeResult

// Map schema constraints to form validators
mapSchemaToValidators(schema: SchemaObject, required: boolean): ValidatorConfig[]

// Map an entire schema to an array of FieldConfig objects
mapSchemaToFields(schema: SchemaObject, requiredFields: string[], options?: MappingOptions): MappingResult
```

### Generation

```typescript
// Generate a TypeScript FormConfig source string from fields
generateFormConfig(fields: FieldConfig[], options: FormConfigGeneratorOptions): string

// Generate a TypeScript interface source string from a schema
generateInterface(schema: SchemaObject, options: InterfaceGeneratorOptions): string

// Generate an index.ts barrel file
generateBarrel(fileNames: string[]): string
```

### I/O

```typescript
// Write generated files to disk (with change detection and skip-existing support)
writeGeneratedFiles(outputDir: string, files: GeneratedFile[], options?: WriteOptions): Promise<WriteResult>

// Load/save the .ng-forge-generator.json config file
loadConfig(dir: string): Promise<GeneratorConfig | null>
saveConfig(dir: string, config: GeneratorConfig): Promise<void>
```

## Troubleshooting

### Why did my field become `input` instead of `textarea`?

Plain `string` fields without a `format` are ambiguous — they could be a short text input or a long textarea. The generator resolves this by:

1. **`maxLength` constraint**: `<= 100` → input, `> 200` → textarea, between 100-200 → ambiguous
2. **Name heuristic**: fields ending with `description`, `notes`, `bio`, `message`, etc. → textarea
3. **Interactive prompt** (if `--interactive full`): you choose
4. **Default** (if `--interactive none`): falls back to `input`

To force a specific type, use the `x-ng-forge-type` extension on the property in your spec.

### Why are my GET endpoints being skipped?

GET endpoints with top-level array responses are always skipped since they don't map to a single form. For all other GET endpoints, forms are generated by default with editable fields.

To make GET endpoint fields read-only, use `--read-only`.

### Why does the generator say "Swagger 2.0" is not supported?

Only OpenAPI 3.x specs are supported. Convert Swagger 2.0 specs using [converter.swagger.io](https://converter.swagger.io) or the `swagger2openapi` npm package.

### How do I re-run without being prompted again?

The generator saves your choices to `.ng-forge-generator.json`. Subsequent runs with `--interactive none` reuse those decisions automatically. To reset, delete the config file.

## Exit Codes

| Code | Meaning                                                             |
| ---- | ------------------------------------------------------------------- |
| `0`  | Success                                                             |
| `1`  | Error (parse failure, no endpoints found/selected, invalid options) |
