# Zod Integration Plan

> **Status:** 🟡 In Progress - Core Integration Complete, Documentation Pending
> **Created:** 2026-01-20
> **Last Updated:** 2026-01-21

## Progress Tracking

| Part | Description                    | Status         | Agent   | PR                                                                                     |
| ---- | ------------------------------ | -------------- | ------- | -------------------------------------------------------------------------------------- |
| 1    | Setup                          | ✅ Complete    | -       | [#179](https://github.com/ng-forge/ng-forge/pull/179) (merged to feat/zod-integration) |
| 2    | Core Integration               | ✅ Complete    | Agent A | [#181](https://github.com/ng-forge/ng-forge/pull/181)                                  |
| 3    | Zod Schema Creation            | ✅ Complete    | Agent B | [#180](https://github.com/ng-forge/ng-forge/pull/180)                                  |
| 4    | UI Integration Schemas         | ✅ Complete    | Agent C | [#180](https://github.com/ng-forge/ng-forge/pull/180)                                  |
| 5    | Documentation & Infrastructure | ⬜ Not Started | Agent D | -                                                                                      |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

### Completed Work Summary

**Part 1 (Setup) - PR #179:**

- Created `@ng-forge/dynamic-forms-zod` package with Nx
- Configured secondary entry points: `/material`, `/bootstrap`, `/primeng`, `/ionic`, `/mcp`
- Set up package.json with Zod peer dependency
- Added `zod-to-json-schema` dependency

**Part 2 (Core Integration) - PR #181:**

- Added `@standard-schema/spec` dependency to core package
- Created `/schema` secondary entry point with `standardSchema()` wrapper
- Updated `FormConfig.schema` to accept `FormSchema<TValue>` (StandardSchemaMarker)
- Implemented `applyFormLevelSchema()` using Angular's `validateStandardSchema()`
- Updated `createSchemaFromFields()` to accept form-level schema option
- Internal code imports directly from `@ng-forge/dynamic-forms/schema` (no duplication)
- ng-packagr correctly builds `/schema` entry point first due to dependency detection

**Parts 3 & 4 (Schemas) - PR #180:**

- Base schemas: DynamicText, FieldOption, FieldMeta, FieldDef, FieldWithValidation
- Validation schemas: built-in, custom, async, HTTP validators
- Logic schemas: conditional expressions, state logic, derivation logic
- Container factories: page, row, group, array (with recursive z.lazy() support)
- Leaf fields: text, hidden
- Form config schema with options
- UI integration schemas for Material, Bootstrap, PrimeNG, Ionic (10 field types each)
- MCP utilities: JSON Schema generation, validation tools
- 52 tests passing

---

## Executive Summary

This document provides a comprehensive analysis for integrating Zod (and other Standard Schema libraries) into the ng-forge dynamic forms ecosystem. The integration is split across two locations:

### 1. Core Package Enhancement (`@ng-forge/dynamic-forms`)

**New secondary entry point: `@ng-forge/dynamic-forms/schema`**

Provides native support for Standard Schema validators (Zod, Valibot, ArkType, etc.) at the form level:

- `standardSchema()` wrapper function
- `FormSchema<T>` union type
- Type guards and utilities

This allows users to pass Zod schemas directly to `FormConfig.schema` without additional packages.

### 2. New Package (`@ng-forge/dynamic-forms-zod`)

Provides Zod schemas for **validating form configurations themselves**:

- Config validation schemas for each UI integration
- MCP server integration utilities
- JSON Schema generation for tooling

### Why This Split?

| Concern                   | Location               | Reason                                |
| ------------------------- | ---------------------- | ------------------------------------- |
| Form-level Zod validation | Core (`/schema` entry) | Works out of the box, no extra deps   |
| Config validation schemas | Zod package            | Only needed for MCP/tooling           |
| Standard Schema support   | Core                   | Library-agnostic (Zod, Valibot, etc.) |

**Benefits:**

- Users get Zod form validation without installing extra packages
- No module augmentation needed - native type support
- Follows existing `ɵkind` pattern for feature detection
- Clean separation: runtime validation (core) vs config validation (zod package)

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Core Enhancement: Standard Schema Support](#2-core-enhancement-standard-schema-support)
3. [Zod Package: Config Validation Schemas](#3-zod-package-config-validation-schemas)
4. [Package Structure](#4-package-structure)
5. [Implementation Roadmap](#5-implementation-roadmap)
6. [Type Testing Strategy](#6-type-testing-strategy)
7. [API Design](#7-api-design)
8. [Considerations and Trade-offs](#8-considerations-and-trade-offs)

---

## 1. Current Architecture Analysis

### 1.1 Validator System Overview

The current validation system in `@ng-forge/dynamic-forms` uses a discriminated union type `ValidatorConfig`:

```typescript
type ValidatorConfig =
  | BuiltInValidatorConfig // required, email, min, max, minLength, maxLength, pattern
  | CustomValidatorConfig // Custom sync validators (function or expression)
  | AsyncValidatorConfig // Resource-based async validation
  | HttpValidatorConfig; // HTTP endpoint validation
```

**Key Files:**

- `packages/dynamic-forms/src/lib/models/validation/validator-config.ts` - Type definitions
- `packages/dynamic-forms/src/lib/core/validation/validator-factory.ts` - Application logic
- `packages/dynamic-forms/src/lib/core/registry/function-registry.service.ts` - Function registration

### 1.2 Validator Application Flow

```
ValidatorConfig → applyValidator() → Angular Signal Forms API
                        ↓
              switch (config.type)
                        ↓
    ┌─────────────┬─────────────┬─────────────┬─────────────┐
    ↓             ↓             ↓             ↓             ↓
 required()    validate()   validateAsync()  validateHttp()
 email()...      ↑               ↑               ↑
              Custom Fn      Resource API    HTTP API
```

### 1.3 Angular Signal Forms Zod Support

Angular 21+ provides native Zod support through `validateStandardSchema()`:

```typescript
import { validateStandardSchema } from '@angular/forms/signals';
import { z } from 'zod';

const schema = z.string().email();
validateStandardSchema(path, schema);
```

**Key Integration Point:** The [Standard Schema Specification](https://github.com/standard-schema/standard-schema) defines `StandardSchemaV1` interface that Zod 3.24+ implements. Angular's `validateStandardSchema()` accepts any `StandardSchemaV1` compliant schema.

### 1.4 UI Integration Patterns

Each UI package (Material, Bootstrap, PrimeNG, Ionic) follows identical patterns:

- Field type definitions with UI-specific props
- Module augmentation for `DynamicFormFieldRegistry` and `FieldRegistryLeaves`
- Provider functions (`withMaterialFields()`, etc.)
- Configuration cascade: Library → Form → Field

### 1.5 Type Testing Patterns

The codebase uses robust type testing with Vitest:

```typescript
// Exhaustive whitelist testing
type ExpectedKeys = 'type' | 'schema' | 'condition';
type ActualKeys = keyof SchemaApplicationConfig;
expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();

// Property type verification
expectTypeOf<BuiltInValidatorConfig['type']>()
  .toEqualTypeOf<'required' | 'email' | 'min' | ...>();
```

---

## 2. Core Enhancement: Standard Schema Support

### 2.1 Objective

Add native support for Standard Schema validators (Zod, Valibot, ArkType, etc.) to the core `@ng-forge/dynamic-forms` package. Based on [GitHub Issue #166](https://github.com/ng-forge/ng-forge/issues/166), users want to reuse existing Zod schemas without boilerplate.

### 2.2 User Requirements (from Issue #166)

**Current approach** - manual wiring:

```typescript
model = signal({ currentPassword: '', newPassword: '' });

schema = schema<ChangePasswordIn>((p) => {
  validateStandardSchema(p, zChangePasswordIn);
});

form = form(this.model, this.schema);
```

**Desired approach** - direct schema integration:

```typescript
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const config = {
  fields: [
    { key: 'currentPassword', type: 'input', label: 'Current Password', value: '' },
    { key: 'newPassword', type: 'input', label: 'New Password', value: '' },
  ],
  schema: standardSchema(zChangePasswordIn),
} as const satisfies FormConfig;
```

### 2.3 Design: The `standardSchema()` Wrapper

Following the existing `ɵkind` pattern used for features, we create an explicit wrapper:

````typescript
// packages/dynamic-forms/src/lib/schema/standard-schema-marker.ts
import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Marker interface for Standard Schema validators.
 * Uses ɵkind pattern consistent with DynamicFormFeature.
 */
export interface StandardSchemaMarker<T> {
  readonly ɵkind: 'standardSchema';
  readonly ɵschema: StandardSchemaV1<T>;
}

/**
 * Wraps a Standard Schema compliant validator (Zod, Valibot, ArkType, etc.)
 * for use with FormConfig.schema.
 *
 * @example
 * ```typescript
 * import { standardSchema } from '@ng-forge/dynamic-forms/schema';
 * import { z } from 'zod';
 *
 * const UserSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * const config = {
 *   fields: [...],
 *   schema: standardSchema(UserSchema),
 * };
 * ```
 */
export function standardSchema<T>(schema: StandardSchemaV1<T>): StandardSchemaMarker<T> {
  return {
    ɵkind: 'standardSchema',
    ɵschema: schema,
  };
}

/**
 * Type guard to check if a value is a StandardSchemaMarker
 */
export function isStandardSchemaMarker(value: unknown): value is StandardSchemaMarker<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ɵkind' in value &&
    (value as StandardSchemaMarker<unknown>).ɵkind === 'standardSchema' &&
    'ɵschema' in value
  );
}
````

### 2.4 Updated FormConfig Type

````typescript
// packages/dynamic-forms/src/lib/models/form-config.ts
import type { Schema } from '@angular/forms/signals';
import type { StandardSchemaMarker } from '../schema/standard-schema-marker';

/**
 * Union type for form-level schema validation.
 * Accepts either Angular's native Schema or a wrapped Standard Schema.
 */
export type FormSchema<T> = Schema<T> | StandardSchemaMarker<T>;

export interface FormConfig<TFields, TValue, TProps> {
  fields: TFields;

  /**
   * Form-level validation schema.
   *
   * Accepts either:
   * - Angular's native Schema<T> function
   * - Standard Schema wrapped with standardSchema() (Zod, Valibot, etc.)
   *
   * @example Angular Schema
   * ```typescript
   * schema: (p) => {
   *   required(p.email);
   *   validate(p.password, passwordValidator);
   * }
   * ```
   *
   * @example Zod Schema
   * ```typescript
   * import { standardSchema } from '@ng-forge/dynamic-forms/schema';
   *
   * schema: standardSchema(z.object({
   *   email: z.string().email(),
   *   password: z.string().min(8),
   * }))
   * ```
   */
  schema?: FormSchema<TValue>;

  // ... rest of FormConfig
}
````

### 2.5 Schema Application Logic

```typescript
// packages/dynamic-forms/src/lib/core/schema-builder.ts
import { validateStandardSchema } from '@angular/forms/signals';
import { isStandardSchemaMarker } from '../schema/standard-schema-marker';

export function applyFormSchema<T>(formPath: SchemaPathTree<T>, schema: FormSchema<T>): void {
  if (isStandardSchemaMarker(schema)) {
    // Standard Schema (Zod, Valibot, etc.) - use Angular's native support
    validateStandardSchema(formPath, schema.ɵschema);
  } else {
    // Angular's native Schema - it's a function
    schema(formPath);
  }
}
```

### 2.6 Secondary Entry Point

```typescript
// packages/dynamic-forms/schema/index.ts (secondary entry point)
export {
  standardSchema,
  isStandardSchemaMarker,
  type StandardSchemaMarker,
  type FormSchema,
} from '../src/lib/schema/standard-schema-marker';
```

**ng-package.json configuration:**

```json
{
  "lib": {
    "entryFile": "src/index.ts",
    "secondaryEntryPoints": ["schema"]
  }
}
```

### 2.7 Usage Examples

#### Basic Usage

```typescript
import { standardSchema } from '@ng-forge/dynamic-forms/schema';
import { z } from 'zod';

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });

const formConfig = {
  fields: [
    { key: 'currentPassword', type: 'input', label: 'Current Password', value: '', props: { type: 'password' } },
    { key: 'newPassword', type: 'input', label: 'New Password', value: '', props: { type: 'password' } },
    { key: 'confirmPassword', type: 'input', label: 'Confirm', value: '', props: { type: 'password' } },
  ],
  schema: standardSchema(ChangePasswordSchema),
} as const satisfies FormConfig;
```

#### With OpenAPI Generated Schemas

```typescript
// Generated from OpenAPI
import { zUserRegistration } from './generated/schemas';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const formConfig = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', value: '' },
    { key: 'username', type: 'input', label: 'Username', value: '' },
    { key: 'password', type: 'input', label: 'Password', value: '', props: { type: 'password' } },
  ],
  schema: standardSchema(zUserRegistration), // Reuse generated schema!
} as const satisfies FormConfig;
```

#### Works with Any Standard Schema Library

```typescript
// Zod
import { z } from 'zod';
schema: standardSchema(z.object({ ... }))

// Valibot
import * as v from 'valibot';
schema: standardSchema(v.object({ ... }))

// ArkType
import { type } from 'arktype';
schema: standardSchema(type({ ... }))
```

### 2.8 Benefits

1. **No extra package needed** - Works out of the box with core
2. **Explicit intent** - `standardSchema()` wrapper makes it clear
3. **Library agnostic** - Works with Zod, Valibot, ArkType, or any Standard Schema
4. **Type-safe** - Full TypeScript inference (see 2.9)
5. **Consistent** - Follows existing `ɵkind` pattern
6. **No module augmentation** - Native type support

### 2.9 Type Safety: Schema ↔ Fields Inference

One of the most powerful aspects of this design is **full type inference between `fields` and `schema`**. The schema is constrained to match the form value structure inferred from fields.

#### How It Works

The existing `InferFormValue<TFields>` utility infers the form value type from the fields definition. We use this to constrain the `schema` property:

```typescript
// FormConfig uses InferFormValue to constrain schema type
interface FormConfig<TFields extends readonly FieldDef[], TValue = InferFormValue<TFields>, TProps = unknown> {
  fields: TFields;
  schema?: FormSchema<TValue>; // TValue is inferred from fields!
  // ...
}

// FormSchema union - both branches are constrained to TValue
type FormSchema<T> = Schema<T> | StandardSchemaMarker<T>;

// standardSchema preserves the type parameter
function standardSchema<T>(schema: StandardSchemaV1<T>): StandardSchemaMarker<T>;
```

#### Type Flow

```
fields definition
       ↓
InferFormValue<TFields> = { email: string; age: number }
       ↓
FormSchema<{ email: string; age: number }>
       ↓
StandardSchemaMarker<{ email: string; age: number }>
       ↑
standardSchema(zodSchema) where z.infer<zodSchema> must match
```

#### Example: Type Error on Mismatch

```typescript
const formConfig = {
  fields: [
    { key: 'email', type: 'input', value: '' },
    { key: 'age', type: 'input', value: 0 },
  ],
  // InferFormValue = { email: string; age: number }

  // ✅ Valid - Zod schema matches inferred structure
  schema: standardSchema(
    z.object({
      email: z.string(),
      age: z.number(),
    }),
  ),
} as const satisfies FormConfig;

const invalidConfig = {
  fields: [
    { key: 'email', type: 'input', value: '' },
    { key: 'age', type: 'input', value: 0 },
  ],

  // ❌ Type Error! 'username' doesn't exist in inferred form value
  schema: standardSchema(
    z.object({
      username: z.string(), // Error: Property 'username' is missing in type...
      age: z.number(),
    }),
  ),
} as const satisfies FormConfig;
```

#### Why This Works

1. **Zod implements StandardSchemaV1** - `z.object({ email: z.string() })` is typed as `StandardSchemaV1<{ email: string }>`
2. **standardSchema() preserves the type** - Returns `StandardSchemaMarker<{ email: string }>`
3. **FormConfig constrains via InferFormValue** - The schema must match the inferred value type
4. **TypeScript enforces the match** - Mismatches produce compile-time errors

#### Handling Partial Validation

For cases where you only want to validate a subset of fields, you can use Zod's `.partial()` or `.pick()`:

```typescript
const formConfig = {
  fields: [
    { key: 'email', type: 'input', value: '' },
    { key: 'age', type: 'input', value: 0 },
    { key: 'name', type: 'input', value: '' },
  ],

  // Only validate email format, allow other fields to pass through
  schema: standardSchema(
    z
      .object({
        email: z.string().email(),
        age: z.number(),
        name: z.string(),
      })
      .partial()
      .required({ email: true }),
  ),
} as const satisfies FormConfig;
```

#### Cross-Field Validation with Type Safety

Zod's `.refine()` for cross-field validation also benefits from type inference:

```typescript
const PasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword, // 'data' is fully typed!
    { message: 'Passwords must match', path: ['confirmPassword'] },
  );

const formConfig = {
  fields: [
    { key: 'password', type: 'input', value: '', props: { type: 'password' } },
    { key: 'confirmPassword', type: 'input', value: '', props: { type: 'password' } },
  ],
  schema: standardSchema(PasswordSchema), // Types align perfectly
} as const satisfies FormConfig;
```

This type safety ensures that:

- Schema validation targets actual form fields
- Typos in field names are caught at compile time
- Refactoring field keys updates schema requirements
- IDE autocomplete works for both fields and schema

---

## 3. Zod Package: Config Validation Schemas

### 3.1 Objective

Create Zod schemas that validate form configurations themselves, providing:

1. Runtime validation for user-provided configs
2. Source of truth for MCP server integration
3. Documentation generation
4. IDE autocomplete via Zod inference

### 3.2 Schema Design Philosophy

Mirror the existing TypeScript types exactly, using Zod's type inference to ensure alignment:

```typescript
// Type alignment pattern
const FieldDefSchema = z.object({...});
type InferredFieldDef = z.infer<typeof FieldDefSchema>;

// Type test to ensure alignment
expectTypeOf<InferredFieldDef>().toEqualTypeOf<FieldDef<unknown>>();
```

### 3.3 Core Schemas

#### 3.3.1 Base Field Definition Schema

```typescript
// packages/dynamic-forms-zod/src/lib/config-schemas/base/field-def.schema.ts
import { z } from 'zod';

export const DynamicTextSchema = z.union([
  z.string(),
  z.object({
    type: z.literal('expression'),
    expression: z.string(),
  }),
]);

export const FieldMetaSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    autocomplete: z.string().optional(),
    autofocus: z.boolean().optional(),
    placeholder: z.string().optional(),
  })
  .passthrough();

export const BaseFieldDefSchema = z.object({
  key: z.string(),
  type: z.string(),
  label: DynamicTextSchema.optional(),
  className: z.string().optional(),
  disabled: z.boolean().optional(),
  readonly: z.boolean().optional(),
  hidden: z.boolean().optional(),
  tabIndex: z.number().optional(),
  col: z.number().min(1).max(12).optional(),
  meta: FieldMetaSchema.optional(),
});
```

#### 3.3.2 Validator Config Schemas

```typescript
// packages/dynamic-forms-zod/src/lib/config-schemas/base/validator-config.schema.ts
export const ConditionalExpressionSchema: z.ZodType<ConditionalExpression> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('fieldValue'),
      fieldPath: z.string(),
      operator: z.enum([
        'equals',
        'notEquals',
        'greater',
        'less',
        'greaterOrEqual',
        'lessOrEqual',
        'contains',
        'startsWith',
        'endsWith',
        'matches',
      ]),
      value: z.unknown(),
    }),
    z.object({
      type: z.literal('formValue'),
      fieldPath: z.string(),
      operator: z.enum([
        'equals',
        'notEquals',
        'greater',
        'less',
        'greaterOrEqual',
        'lessOrEqual',
        'contains',
        'startsWith',
        'endsWith',
        'matches',
      ]),
      value: z.unknown(),
    }),
    z.object({
      type: z.literal('custom'),
      functionName: z.string(),
    }),
    z.object({
      type: z.literal('javascript'),
      expression: z.string(),
    }),
    z.object({
      type: z.literal('and'),
      conditions: z.array(z.lazy(() => ConditionalExpressionSchema)),
    }),
    z.object({
      type: z.literal('or'),
      conditions: z.array(z.lazy(() => ConditionalExpressionSchema)),
    }),
  ]),
);

export const BaseValidatorConfigSchema = z.object({
  when: ConditionalExpressionSchema.optional(),
});

export const BuiltInValidatorConfigSchema = BaseValidatorConfigSchema.extend({
  type: z.enum(['required', 'email', 'min', 'max', 'minLength', 'maxLength', 'pattern']),
  value: z.union([z.number(), z.string(), z.instanceof(RegExp)]).optional(),
  expression: z.string().optional(),
});

export const CustomValidatorConfigSchema = BaseValidatorConfigSchema.extend({
  type: z.literal('custom'),
  functionName: z.string().optional(),
  params: z.record(z.unknown()).optional(),
  expression: z.string().optional(),
  kind: z.string().optional(),
  errorParams: z.record(z.string()).optional(),
}).refine((data) => data.functionName || data.expression, { message: 'Either functionName or expression must be provided' });

export const AsyncValidatorConfigSchema = BaseValidatorConfigSchema.extend({
  type: z.literal('customAsync'),
  functionName: z.string(),
  params: z.record(z.unknown()).optional(),
});

export const HttpValidatorConfigSchema = BaseValidatorConfigSchema.extend({
  type: z.literal('customHttp'),
  functionName: z.string(),
  params: z.record(z.unknown()).optional(),
});

export const ValidatorConfigSchema = z.discriminatedUnion('type', [
  BuiltInValidatorConfigSchema,
  CustomValidatorConfigSchema,
  AsyncValidatorConfigSchema,
  HttpValidatorConfigSchema,
]);
```

#### 3.3.3 Logic Config Schemas

```typescript
// packages/dynamic-forms-zod/src/lib/config-schemas/base/logic-config.schema.ts
export const FormStateConditionSchema = z.enum(['formInvalid', 'formSubmitting', 'pageInvalid']);

export const StateLogicConfigSchema = z.object({
  type: z.enum(['hidden', 'readonly', 'disabled', 'required']),
  condition: z.union([ConditionalExpressionSchema, z.boolean(), FormStateConditionSchema]),
  trigger: z.enum(['onChange', 'debounced']).optional(),
  debounceMs: z.number().optional(),
});

export const DerivationLogicConfigSchema = z
  .object({
    type: z.literal('derivation'),
    targetField: z.string(),
    value: z.unknown().optional(),
    expression: z.string().optional(),
    functionName: z.string().optional(),
    condition: z.union([ConditionalExpressionSchema, z.boolean()]).optional(),
    trigger: z.enum(['onChange', 'debounced']).optional(),
    debounceMs: z.number().optional(),
    dependsOn: z.array(z.string()).optional(),
  })
  .refine((data) => data.value !== undefined || data.expression || data.functionName, {
    message: 'One of value, expression, or functionName must be provided',
  });

export const LogicConfigSchema = z.union([StateLogicConfigSchema, DerivationLogicConfigSchema]);
```

#### 3.3.4 Field Type Schemas (Per UI Integration)

```typescript
// packages/dynamic-forms-zod/src/lib/config-schemas/material/input-field.schema.ts
export const MatInputPropsSchema = z.object({
  appearance: z.enum(['outline', 'fill']).optional(),
  disableRipple: z.boolean().optional(),
  subscriptSizing: z.enum(['fixed', 'dynamic']).optional(),
  type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url']).optional(),
  hint: DynamicTextSchema.optional(),
});

export const MatInputFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('input'),
  value: z.string().default(''),
  props: MatInputPropsSchema.optional(),
  // Validation properties
  required: z.boolean().optional(),
  email: z.boolean().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.union([z.string(), z.instanceof(RegExp)]).optional(),
  validators: z.array(ValidatorConfigSchema).optional(),
  validationMessages: z.record(DynamicTextSchema).optional(),
  logic: z.array(LogicConfigSchema).optional(),
});
```

#### 3.3.5 Container Field Schemas

```typescript
// packages/dynamic-forms-zod/src/lib/config-schemas/base/container-fields.schema.ts

// Forward declarations for recursive schemas
type LeafFieldSchema = z.ZodType<LeafFieldTypes>;
type ContainerFieldSchema = z.ZodType<ContainerFieldTypes>;

// Base leaf fields (shared across all UI integrations)
export const TextFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('text'),
  value: z.string(),
});

export const HiddenFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('hidden'),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.unknown())]),
});

// Generic container schemas (lazy for recursion)
export const createRowFieldSchema = (leafSchema: LeafFieldSchema) =>
  BaseFieldDefSchema.extend({
    type: z.literal('row'),
    fields: z.lazy(() => z.array(z.union([leafSchema, createGroupFieldSchema(leafSchema)]))),
  });

export const createGroupFieldSchema = (leafSchema: LeafFieldSchema) =>
  BaseFieldDefSchema.extend({
    type: z.literal('group'),
    fields: z.lazy(() => z.array(z.union([leafSchema, createRowFieldSchema(leafSchema)]))),
  });

export const createArrayFieldSchema = (leafSchema: LeafFieldSchema) =>
  BaseFieldDefSchema.extend({
    type: z.literal('array'),
    fields: z.lazy(() => z.array(z.union([leafSchema, createRowFieldSchema(leafSchema), createGroupFieldSchema(leafSchema)]))),
  });

export const createPageFieldSchema = (leafSchema: LeafFieldSchema) =>
  z.object({
    key: z.string(),
    type: z.literal('page'),
    className: z.string().optional(),
    hidden: z.boolean().optional(),
    logic: z
      .array(
        StateLogicConfigSchema.extend({
          type: z.literal('hidden'),
        }),
      )
      .optional(),
    fields: z.lazy(() =>
      z.array(
        z.union([leafSchema, createRowFieldSchema(leafSchema), createGroupFieldSchema(leafSchema), createArrayFieldSchema(leafSchema)]),
      ),
    ),
  });
```

#### 3.3.6 Form Config Schema

```typescript
// packages/dynamic-forms-zod/src/lib/config-schemas/form-config.schema.ts
export const ValidationMessagesSchema = z.record(DynamicTextSchema);

export const FormOptionsSchema = z.object({
  disabled: z.boolean().optional(),
  submitButton: z.boolean().optional(),
  nextButton: z.boolean().optional(),
});

export const SubmissionConfigSchema = z.object({
  action: z
    .function()
    .args(z.any())
    .returns(z.union([z.promise(z.any()), z.any()]))
    .optional(),
});

export const createFormConfigSchema = <TFieldSchema extends z.ZodType>(fieldSchema: TFieldSchema, propsSchema?: z.ZodType) =>
  z.object({
    fields: z.array(fieldSchema),
    // Form-level validation schema - Angular Schema function or StandardSchemaMarker
    // At runtime this is either a function or { ɵkind: 'standardSchema', ɵschema: StandardSchemaV1 }
    schema: z.union([z.function(), z.object({ ɵkind: z.literal('standardSchema'), ɵschema: z.any() })]).optional(),
    options: FormOptionsSchema.optional(),
    defaultValidationMessages: ValidationMessagesSchema.optional(),
    customFnConfig: z.any().optional(), // Contains functions, not serializable
    submission: SubmissionConfigSchema.optional(),
    defaultProps: propsSchema?.optional(),
  });
```

### 3.4 UI Integration Schemas

Each UI package will have corresponding schema exports:

```typescript
// packages/dynamic-forms-zod/src/lib/config-schemas/material/index.ts
import { z } from 'zod';
import { createFormConfigSchema } from '../schemas/form-config.schema';

// Material-specific field schemas
export const MatInputFieldSchema = /* ... */;
export const MatSelectFieldSchema = /* ... */;
export const MatCheckboxFieldSchema = /* ... */;
// ... all 15 field types

// Combined Material leaf fields
export const MatLeafFieldSchema = z.discriminatedUnion('type', [
  MatInputFieldSchema,
  MatSelectFieldSchema,
  MatCheckboxFieldSchema,
  // ... etc
]);

// Material container fields (using generic factories)
export const MatRowFieldSchema = createRowFieldSchema(MatLeafFieldSchema);
export const MatGroupFieldSchema = createGroupFieldSchema(MatLeafFieldSchema);
export const MatArrayFieldSchema = createArrayFieldSchema(MatLeafFieldSchema);
export const MatPageFieldSchema = createPageFieldSchema(MatLeafFieldSchema);

// All Material fields
export const MatFieldSchema = z.union([
  MatLeafFieldSchema,
  MatRowFieldSchema,
  MatGroupFieldSchema,
  MatArrayFieldSchema,
  MatPageFieldSchema,
]);

// Material form config
export const MatFormPropsSchema = z.object({
  appearance: z.enum(['outline', 'fill']).optional(),
  subscriptSizing: z.enum(['fixed', 'dynamic']).optional(),
  disableRipple: z.boolean().optional(),
  color: z.enum(['primary', 'accent', 'warn']).optional(),
  labelPosition: z.enum(['before', 'after']).optional(),
});

export const MatFormConfigSchema = createFormConfigSchema(
  MatFieldSchema,
  MatFormPropsSchema,
);
```

### 3.5 Validation Utilities

```typescript
// packages/dynamic-forms-zod/src/lib/utils/validate.ts
import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
  formattedErrors?: Record<string, string[]>;
}

export function validateFormConfig<T extends z.ZodType>(schema: T, config: unknown): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(config);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error,
    formattedErrors: formatZodErrors(result.error),
  };
}

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    formatted[path] = formatted[path] || [];
    formatted[path].push(issue.message);
  }

  return formatted;
}
```

### 3.6 MCP Server Integration

```typescript
// packages/dynamic-forms-zod/src/lib/mcp/schema-provider.ts
import { zodToJsonSchema } from 'zod-to-json-schema';

export function getFormConfigJsonSchema(uiIntegration: 'material' | 'bootstrap' | 'primeng' | 'ionic') {
  const schemas = {
    material: MatFormConfigSchema,
    bootstrap: BsFormConfigSchema,
    primeng: PrimeFormConfigSchema,
    ionic: IonicFormConfigSchema,
  };

  return zodToJsonSchema(schemas[uiIntegration], {
    name: `${uiIntegration}FormConfig`,
    definitions: {
      // Include all sub-schemas
    },
  });
}

export function getFieldTypeJsonSchemas(uiIntegration: 'material' | 'bootstrap' | 'primeng' | 'ionic') {
  // Export individual field schemas for MCP tools
  return {
    input: zodToJsonSchema(getInputFieldSchema(uiIntegration)),
    select: zodToJsonSchema(getSelectFieldSchema(uiIntegration)),
    // ... etc
  };
}
```

---

## 4. Package Structure

### 4.1 Core Package Enhancement

The core `@ng-forge/dynamic-forms` package gets a new secondary entry point:

```
packages/dynamic-forms/
├── src/
│   └── lib/
│       └── schema/                            # NEW: Standard Schema support
│           ├── standard-schema-marker.ts      # standardSchema() wrapper
│           └── index.ts
├── schema/                                    # Secondary entry point
│   ├── ng-package.json
│   └── index.ts
└── package.json                               # Add @standard-schema/spec dependency
```

**New dependency in core package.json:**

```json
{
  "dependencies": {
    "ngxtension": ">=4.0.0",
    "@standard-schema/spec": "^1.0.0" // NEW
  }
}
```

### 4.2 Zod Package Layout

The `@ng-forge/dynamic-forms-zod` package provides **only** config validation schemas:

```
packages/dynamic-forms-zod/
├── src/
│   ├── lib/
│   │   ├── config-schemas/                    # Zod schemas for config validation
│   │   │   ├── base/
│   │   │   │   ├── field-def.schema.ts
│   │   │   │   ├── validator-config.schema.ts
│   │   │   │   ├── logic-config.schema.ts
│   │   │   │   ├── conditional-expression.schema.ts
│   │   │   │   └── container-fields.schema.ts
│   │   │   ├── material/
│   │   │   │   ├── input-field.schema.ts
│   │   │   │   ├── select-field.schema.ts
│   │   │   │   ├── ... (all field types)
│   │   │   │   └── index.ts
│   │   │   ├── bootstrap/
│   │   │   │   └── ... (same structure)
│   │   │   ├── primeng/
│   │   │   │   └── ... (same structure)
│   │   │   ├── ionic/
│   │   │   │   └── ... (same structure)
│   │   │   └── form-config.schema.ts
│   │   │
│   │   ├── mcp/
│   │   │   └── schema-provider.ts
│   │   │
│   │   ├── utils/
│   │   │   └── validate.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── testing/
│   │   ├── material.type-test.ts
│   │   ├── bootstrap.type-test.ts
│   │   ├── primeng.type-test.ts
│   │   └── ionic.type-test.ts
│   │
│   └── index.ts
│
├── package.json
└── README.md
```

### 4.3 Entry Points Summary

**Core Package (`@ng-forge/dynamic-forms`):**

```
@ng-forge/dynamic-forms                  # Main entry (no changes)
@ng-forge/dynamic-forms/schema           # NEW: standardSchema() wrapper
```

**Zod Package (`@ng-forge/dynamic-forms-zod`):**

```
@ng-forge/dynamic-forms-zod              # Main entry: base config schemas
@ng-forge/dynamic-forms-zod/material     # Material-specific config schemas
@ng-forge/dynamic-forms-zod/bootstrap    # Bootstrap-specific config schemas
@ng-forge/dynamic-forms-zod/primeng      # PrimeNG-specific config schemas
@ng-forge/dynamic-forms-zod/ionic        # Ionic-specific config schemas
@ng-forge/dynamic-forms-zod/mcp          # MCP server utilities + JSON Schema
```

### 4.4 Zod Package Dependencies

```json
{
  "name": "@ng-forge/dynamic-forms-zod",
  "version": "0.4.0",
  "description": "Zod schemas for validating @ng-forge/dynamic-forms configurations. Provides runtime validation and MCP server integration.",
  "type": "module",
  "license": "MIT",
  "author": "ng-forge",
  "homepage": "https://ng-forge.com/dynamic-forms/integrations/zod",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ng-forge/ng-forge.git",
    "directory": "packages/dynamic-forms-zod"
  },
  "keywords": ["angular", "zod", "validation", "forms", "dynamic-forms", "schema-validation", "mcp", "ng-forge"],
  "sideEffects": false,
  "engines": {
    "node": ">=20"
  },
  "peerDependencies": {
    "zod": "^3.24.0"
  },
  "dependencies": {
    "zod-to-json-schema": "^3.23.0"
  },
  "optionalPeerDependencies": {
    "@ng-forge/dynamic-forms-material": "~0.4.0",
    "@ng-forge/dynamic-forms-bootstrap": "~0.4.0",
    "@ng-forge/dynamic-forms-primeng": "~0.4.0",
    "@ng-forge/dynamic-forms-ionic": "~0.4.0"
  }
}
```

**Note:** The Zod package does NOT depend on `@ng-forge/dynamic-forms` at runtime - it only mirrors the TypeScript types. UI integration packages are optional peer dependencies for their respective config schemas.

---

## 5. Implementation Roadmap

> **Parallelization Strategy:** Part 1 (Setup) must complete first to establish infrastructure.
> Parts 2-5 can then be executed in parallel using separate agents:
>
> - Agent A: Part 2 (Core Integration)
> - Agent B: Part 3 (Zod Schema Creation)
> - Agent C: Part 4 (UI Integration Schemas)
> - Agent D: Part 5 (Documentation & Infrastructure)

> **Git Strategy:** Use a single feature branch for the entire integration.
>
> ```
> main
>   └── feat/zod-integration        ← Main feature branch (all work merges here)
>         ├── feat/zod-integration/setup         ← Part 1
>         ├── feat/zod-integration/core          ← Part 2 (Agent A)
>         ├── feat/zod-integration/schemas       ← Part 3 (Agent B)
>         ├── feat/zod-integration/ui            ← Part 4 (Agent C)
>         └── feat/zod-integration/docs          ← Part 5 (Agent D)
> ```
>
> Each agent works on a sub-branch, PRs merge into `feat/zod-integration`, then finally PR to `main`.

### Part 1: Setup (Sequential - Must Complete First) ✅

**Goal:** Create package infrastructure and project scaffolding

- [x] Create `/schema` secondary entry point in core package
  - Add `packages/dynamic-forms/schema/ng-package.json`
  - Add `packages/dynamic-forms/schema/index.ts`
  - Update core package build configuration

- [x] Create `@ng-forge/dynamic-forms-zod` package
  - Set up Nx library: `nx g @nx/js:lib dynamic-forms-zod`
  - Configure secondary entry points: `/material`, `/bootstrap`, `/primeng`, `/ionic`, `/mcp`
  - Set up package.json with Zod peer dependency

- [x] Add dependencies
  - Core: Add `@standard-schema/spec` to dependencies
  - Zod package: Add `zod-to-json-schema` to dependencies

### Part 2: Core Integration (Parallelizable - Agent A) ✅

**Goal:** Implement Standard Schema support in `@ng-forge/dynamic-forms`

- [x] Implement Standard Schema marker
  - Created `schema/src/standard-schema-marker.ts` (canonical source in `/schema` entry point)
  - Define `StandardSchemaMarker<T>` interface with `ɵkind: 'standardSchema'`
  - Implement `standardSchema<T>(schema)` wrapper function
  - Implement `isStandardSchemaMarker()` type guard

- [x] Update FormConfig type
  - Define `FormSchema<T> = StandardSchemaMarker<T>` (Standard Schema only for now)
  - Update `FormConfig.schema` property to accept `FormSchema<TValue>`
  - Internal code imports from `@ng-forge/dynamic-forms/schema` (ng-packagr builds in correct order)

- [x] Implement schema application logic
  - Create `applyFormLevelSchema()` utility in `form-schema-merger.ts`
  - Update `createSchemaFromFields()` to accept `formLevelSchema` option
  - Detect schema type via `isStandardSchemaMarker()`
  - For Standard Schema: use Angular's `validateStandardSchema()`

- [x] Export from secondary entry point
  - Export `standardSchema`, `isStandardSchemaMarker`, `FormSchema`, `StandardSchemaMarker` from `/schema`

### Part 3: Zod Schema Creation & Validation (Parallelizable - Agent B) ✅

**Goal:** Create Zod schemas that validate form configurations

- [x] Implement base schemas
  - `DynamicTextSchema` - string | expression object
  - `FieldMetaSchema` - id, name, autocomplete, etc.
  - `BaseFieldDefSchema` - key, type, label, className, etc.
  - `ConditionalExpressionSchema` - recursive discriminated union
  - `BaseValidatorConfigSchema` - with optional `when` clause

- [x] Implement validator config schemas
  - `BuiltInValidatorConfigSchema` - required, email, min, max, etc.
  - `CustomValidatorConfigSchema` - functionName or expression
  - `AsyncValidatorConfigSchema` - customAsync type
  - `HttpValidatorConfigSchema` - customHttp type
  - `ValidatorConfigSchema` - discriminated union of all

- [x] Implement logic config schemas
  - `StateLogicConfigSchema` - hidden, readonly, disabled, required
  - `DerivationLogicConfigSchema` - value derivation
  - `LogicConfigSchema` - union of state and derivation

- [x] Implement container schemas (factories for recursion)
  - `createRowFieldSchema(leafSchema)` - row container
  - `createGroupFieldSchema(leafSchema)` - group container
  - `createArrayFieldSchema(leafSchema)` - array container
  - `createPageFieldSchema(leafSchema)` - page container

- [x] Implement FormConfig schema
  - `FormOptionsSchema` - disabled, submitButton, nextButton
  - `createFormConfigSchema(fieldSchema, propsSchema)` - factory function

- [x] Implement validation utilities
  - `validateFormConfig(schema, config)` - returns ValidationResult
  - `formatValidationErrors(zodError)` - user-friendly error format

### Part 4: UI Integration Schemas (Parallelizable - Agent C) ✅

**Goal:** Create UI-specific field schemas for each integration

- [x] Material schemas (`/material` entry point)
  - All leaf field schemas: input, select, checkbox, radio, etc.
  - `MatFormPropsSchema` - appearance, subscriptSizing, color, etc.
  - `MatLeafFieldSchema` - discriminated union of all leaf fields
  - Container schemas using factories
  - `MatFormConfigSchema` - complete form config schema

- [x] Bootstrap schemas (`/bootstrap` entry point)
  - Same structure as Material with Bootstrap-specific props

- [x] PrimeNG schemas (`/primeng` entry point)
  - Same structure as Material with PrimeNG-specific props

- [x] Ionic schemas (`/ionic` entry point)
  - Same structure as Material with Ionic-specific props

- [x] MCP utilities (`/mcp` entry point)
  - `getFormConfigJsonSchema(uiIntegration)` - JSON Schema generation
  - `getFieldTypeJsonSchemas(uiIntegration)` - per-field JSON Schemas
  - MCP tool definitions for form config creation/validation

### Part 5: Documentation & Infrastructure (Parallelizable - Agent D)

**Goal:** Update docs, tests, and CI/CD for new packages

#### Documentation

- [ ] Create schema validation documentation
  - Main page: `/docs/validation/schema-validation`
  - Overview and comparison of validation approaches

- [ ] Implement tabbed documentation structure
  - **Tab: Angular Native** - Using Angular's `Schema<T>` directly
  - **Tab: Zod** - Using `standardSchema()` with Zod
  - **Tab: Other** - Placeholder for Valibot, ArkType (future)

- [ ] Document config validation (separate guide)
  - MCP/tooling use case
  - JSON Schema export
  - Validation utility usage

- [ ] Update existing documentation
  - FormConfig API reference
  - Migration notes for `schemas` → `schema`
  - Update examples

#### Testing

- [ ] Core package tests
  - Type tests for `FormSchema<T>` union
  - Runtime tests for `applyFormSchema()`
  - Integration tests with actual Zod schemas

- [x] Zod package tests ✅ (52 tests passing)
  - Type alignment tests (Zod inferred types ↔ TypeScript types)
  - Exhaustive key coverage tests
  - Runtime validation tests
  - JSON Schema generation tests

#### CI/CD Pipeline

- [ ] Update build configuration
  - Add `/schema` secondary entry point to core build
  - Add `dynamic-forms-zod` to workspace build graph
  - Configure all secondary entry points for Zod package

- [ ] Update release workflow
  - Add `dynamic-forms-zod` to release targets
  - Configure npm publish for new package
  - Update version sync if needed

- [ ] Update PR checks
  - Add new package to lint/test/build checks
  - Ensure type tests run in CI

---

## 6. Type Testing Strategy

### 6.1 Type Alignment Tests

```typescript
// packages/dynamic-forms-zod/src/testing/material.type-test.ts
import { describe, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import type { MatInputField } from '@ng-forge/dynamic-forms-material';
import { MatInputFieldSchema } from '../lib/integrations/material';

describe('Material Input Field Schema Type Alignment', () => {
  type InferredMatInputField = z.infer<typeof MatInputFieldSchema>;

  it('should match MatInputField type structure', () => {
    // Check key properties align
    expectTypeOf<InferredMatInputField['key']>().toEqualTypeOf<MatInputField['key']>();
    expectTypeOf<InferredMatInputField['type']>().toEqualTypeOf<MatInputField['type']>();
    expectTypeOf<InferredMatInputField['value']>().toEqualTypeOf<MatInputField['value']>();
  });

  it('should accept valid MatInputField values', () => {
    const validField: MatInputField = {
      key: 'email',
      type: 'input',
      value: '',
      props: { type: 'email' },
    };

    const result = MatInputFieldSchema.safeParse(validField);
    expect(result.success).toBe(true);
  });
});
```

### 6.2 Exhaustive Schema Tests

```typescript
// Test that schema covers all required keys
describe('BuiltInValidatorConfigSchema - Exhaustive Coverage', () => {
  type SchemaKeys = keyof z.infer<typeof BuiltInValidatorConfigSchema>;
  type ActualKeys = keyof BuiltInValidatorConfig;

  it('should cover all BuiltInValidatorConfig keys', () => {
    expectTypeOf<SchemaKeys>().toEqualTypeOf<ActualKeys>();
  });
});
```

### 6.3 Runtime Validation Tests

```typescript
// packages/dynamic-forms-zod/src/lib/config-schemas/__tests__/validator-config.spec.ts
describe('ValidatorConfigSchema', () => {
  describe('BuiltInValidatorConfig', () => {
    it('should accept valid required validator', () => {
      const config = { type: 'required' };
      expect(ValidatorConfigSchema.safeParse(config).success).toBe(true);
    });

    it('should accept min validator with value', () => {
      const config = { type: 'min', value: 5 };
      expect(ValidatorConfigSchema.safeParse(config).success).toBe(true);
    });

    it('should reject invalid validator type', () => {
      const config = { type: 'invalid' };
      expect(ValidatorConfigSchema.safeParse(config).success).toBe(false);
    });
  });

  describe('CustomValidatorConfig', () => {
    it('should require functionName or expression', () => {
      const config = { type: 'custom' };
      const result = ValidatorConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });
});
```

---

## 7. API Design

### 7.1 Core Package API (`@ng-forge/dynamic-forms/schema`)

```typescript
// Exports from @ng-forge/dynamic-forms/schema
export {
  // Wrapper function for Standard Schema validators
  standardSchema,

  // Type guard for detection
  isStandardSchemaMarker,

  // Types
  type StandardSchemaMarker,
  type FormSchema,
} from '@ng-forge/dynamic-forms/schema';
```

### 7.2 Zod Package API (`@ng-forge/dynamic-forms-zod`)

```typescript
// Main entry - base config schemas
export {
  // Base schemas
  FieldDefSchema,
  BaseFieldDefSchema,
  ValidatorConfigSchema,
  LogicConfigSchema,
  ConditionalExpressionSchema,

  // Schema factories
  createFormConfigSchema,
  createRowFieldSchema,
  createGroupFieldSchema,
  createArrayFieldSchema,
  createPageFieldSchema,

  // Validation utilities
  validateFormConfig,
  formatValidationErrors,

  // Types
  type ValidationResult,
} from '@ng-forge/dynamic-forms-zod';

// UI-specific entry points
import { MatFormConfigSchema, MatInputFieldSchema, ... } from '@ng-forge/dynamic-forms-zod/material';
import { BsFormConfigSchema, BsInputFieldSchema, ... } from '@ng-forge/dynamic-forms-zod/bootstrap';
import { PrimeFormConfigSchema, PrimeInputFieldSchema, ... } from '@ng-forge/dynamic-forms-zod/primeng';
import { IonicFormConfigSchema, IonicInputFieldSchema, ... } from '@ng-forge/dynamic-forms-zod/ionic';

// MCP utilities
import { getFormConfigJsonSchema, getFieldTypeJsonSchemas } from '@ng-forge/dynamic-forms-zod/mcp';
```

### 7.3 Usage Examples

#### Form-Level Zod Schema (Primary Use Case)

```typescript
import { standardSchema } from '@ng-forge/dynamic-forms/schema';
import { z } from 'zod';

// Define Zod schema (or import from OpenAPI generated code)
const RegistrationSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });

// No provider needed! Works out of the box with standardSchema() wrapper
const formConfig = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', value: '' },
    { key: 'password', type: 'input', label: 'Password', value: '', props: { type: 'password' } },
    { key: 'confirmPassword', type: 'input', label: 'Confirm Password', value: '', props: { type: 'password' } },
  ],
  schema: standardSchema(RegistrationSchema), // Wrap with standardSchema()
} as const satisfies FormConfig;
```

#### Angular Native Schema (Alternative)

```typescript
import { schema, required, validate } from '@angular/forms/signals';

// Using Angular's native Schema - no wrapper needed
const formConfig = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', value: '' },
    { key: 'password', type: 'input', label: 'Password', value: '', props: { type: 'password' } },
  ],
  schema: (p) => {
    required(p.email);
    required(p.password);
    validate(p.email, emailValidator);
  },
} as const satisfies FormConfig;
```

#### Validating Form Configs (Zod Package)

```typescript
import { validateFormConfig } from '@ng-forge/dynamic-forms-zod';
import { MatFormConfigSchema } from '@ng-forge/dynamic-forms-zod/material';

const userConfig = {
  fields: [
    { key: 'name', type: 'input', value: '' },
    { key: 'invalid', type: 'unknown-type' }, // Invalid!
  ],
};

const result = validateFormConfig(MatFormConfigSchema, userConfig);

if (!result.success) {
  console.error('Config validation failed:', result.formattedErrors);
  // Output: { 'fields.1.type': ['Invalid discriminator value'] }
}
```

---

## 8. Considerations and Trade-offs

### 8.1 Serialization Concerns

**Problem:** Zod schemas are JavaScript objects, not JSON-serializable.

**Solutions:**

1. **Named registry pattern** - Schemas registered by name, configs reference by name
2. **Separate concerns** - Runtime schemas vs JSON config schemas
3. **MCP uses JSON Schema** - Convert Zod to JSON Schema for external tools

### 8.2 Bundle Size Impact

**Zod bundle size:** ~12KB minified + gzipped

**Mitigation:**

- Both packages are opt-in (peer dependencies)
- Tree-shakeable exports
- Lazy loading support for schema registration

### 8.3 Type Complexity

**Challenge:** Recursive schemas (containers containing containers) create complex types.

**Solution:**

- Use `z.lazy()` for recursive definitions
- Limit recursion depth in type tests
- Provide simplified schema variants for common cases

### 8.4 Zod Version Compatibility

**Standard Schema support:** Zod 3.24+

**Strategy:**

- Require Zod ^3.24.0 as peer dependency
- Document version requirements clearly
- Test against multiple Zod versions in CI

### 8.5 Error Message Mapping

**Zod error structure:**

```typescript
{
  code: 'too_small',
  minimum: 8,
  type: 'string',
  inclusive: true,
  message: 'String must contain at least 8 character(s)',
  path: [],
}
```

**Angular validation error:**

```typescript
{
  kind: 'minLength',
  message: 'Minimum 8 characters required',
  minLength: 8,
}
```

**Mapping strategy:**

- Map Zod `code` to Angular `kind` with `zod_` prefix
- Preserve Zod issue properties in error object
- Allow custom message overrides per Zod issue code

### 8.6 Cross-Field Validation with Zod

**Challenge:** Zod `.refine()` for cross-field validation needs form context.

**Solution:**

```typescript
// Form-level Zod schema with refinement
const formSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });

// Applied at form level, not field level
validateStandardSchema(formPath, formSchema);
```

---

## References

### Angular Documentation

- [validateStandardSchema API](https://angular.dev/api/forms/signals/validateStandardSchema)
- [Angular 21 Signal Forms Guide](https://www.sourcetrail.com/javascript/typescript/angular-21-signal-forms-deep-dive-into-the-new-forms-api/)

### Standard Schema

- [Standard Schema Specification](https://github.com/standard-schema/standard-schema)
- [@standard-schema/spec npm](https://www.npmjs.com/package/@standard-schema/spec)
- [Standard Schema Documentation](https://standardschema.dev/)

### Zod Integration Articles

- [How to Use Zod with Angular Signal Forms](https://briantree.se/angular-signal-forms-zod-validation/)
- [Simplifying Zod Validation with validateStandardSchema](https://dev.to/brianmtreese/follow-up-simplifying-zod-validation-in-angular-signal-forms-with-validatestandardschema-1bo6)
- [Zod in Angular](https://eraoftech.medium.com/zod-in-angular-8dcefc2a20ec)

### Related Tools

- [zod-to-json-schema](https://www.npmjs.com/package/zod-to-json-schema)
- [Zod Documentation](https://zod.dev/)

---

## Appendix A: Complete Field Schema Reference

See individual UI integration files for complete field schemas:

- `packages/dynamic-forms-zod/src/lib/config-schemas/material/index.ts`
- `packages/dynamic-forms-zod/src/lib/config-schemas/bootstrap/index.ts`
- `packages/dynamic-forms-zod/src/lib/config-schemas/primeng/index.ts`
- `packages/dynamic-forms-zod/src/lib/config-schemas/ionic/index.ts`

## Appendix B: MCP Tool Definitions

```typescript
// Example MCP tool definition using Zod schemas
export const createFormFieldTool = {
  name: 'create_form_field',
  description: 'Create a dynamic form field configuration',
  inputSchema: zodToJsonSchema(MatFieldSchema),
};

export const validateFormConfigTool = {
  name: 'validate_form_config',
  description: 'Validate a form configuration against the schema',
  inputSchema: {
    type: 'object',
    properties: {
      uiIntegration: { enum: ['material', 'bootstrap', 'primeng', 'ionic'] },
      config: { type: 'object' },
    },
  },
};
```
