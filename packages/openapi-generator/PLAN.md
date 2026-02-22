# `@ng-forge/openapi-generator` - Plan Outline

## What We're Building

A CLI tool that generates `@ng-forge/dynamic-forms` configurations from OpenAPI specs. Users select endpoints interactively, and the tool outputs TypeScript types + form field configs.

## Core Flow

1. Parse OpenAPI spec
2. Show scrollable endpoint list (GET/POST/PATCH/PUT) → user must select at least one
3. Prompt for ambiguous field types (radio vs select, checkbox vs toggle, etc.)
4. Generate TypeScript interfaces + form configs
5. Save choices to config file for watch mode / CI

## Key Behaviors

| Scenario                                   | Behavior                                  |
| ------------------------------------------ | ----------------------------------------- |
| GET endpoint                               | Readonly by default (configurable)        |
| POST/PATCH/PUT                             | Normal editable form                      |
| `oneOf` + discriminator                    | Radio button toggles variant field groups |
| `allOf`                                    | Merge into single flat form               |
| `anyOf`, `if/else`, `additionalProperties` | Skip with warning                         |
| No endpoints selected                      | Error (required)                          |

## Dependencies

```
@apidevtools/swagger-parser  # Parse + dereference OpenAPI
commander                    # CLI framework
inquirer                     # Interactive prompts (scrollable lists)
chokidar                     # File watching
chalk                        # Terminal colors
```

## CLI Interface

```bash
# Interactive (default)
npx ng-forge-generator generate --spec ./api.yaml --output ./src/generated

# Non-interactive (CI)
npx ng-forge-generator generate --spec ./api.yaml --output ./src/generated \
  --interactive=none --endpoints "POST:/pets,PATCH:/pets/{id}"

# Watch mode (requires saved config)
npx ng-forge-generator generate --spec ./api.yaml --output ./src/generated --watch

# GET endpoint as editable (for preloading data)
npx ng-forge-generator generate --spec ./api.yaml --output ./src/generated \
  --endpoints "GET:/pets/{id}" --editable
```

## Output Structure

```
src/generated/
├── types/
│   └── pet.ts              # TypeScript interfaces
├── forms/
│   └── create-pet.form.ts  # Form field configs
└── index.ts                # Barrel exports
```

## UI Integration - Field Scopes

UI integration packages will declare a `scope` on field definitions to indicate interchangeable alternatives:

```typescript
// e.g., in dynamic-forms-material
{ type: 'checkbox', scope: 'boolean', ... }
{ type: 'toggle', scope: 'boolean', ... }
{ type: 'radio', scope: 'single-select', ... }
{ type: 'select', scope: 'single-select', ... }
{ type: 'multi-checkbox', scope: 'multi-select', ... }
```

The codegen reads the installed UI package's field definitions, groups by scope, and shows UI-specific alternatives in the prompts. This way Material users see `radio` vs `button-toggle`, PrimeNG users see `radioButton` vs `selectButton`, etc.

## Rough Task Breakdown

1. **Scaffolding** - Nx project, package.json, tsconfig
2. **Types** - Config schema, internal mapping types
3. **Parser** - Load spec, extract endpoints, analyze schemas
4. **Mapper** - OpenAPI → dynamic-forms field mapping
5. **Generator** - Output TypeScript code
6. **CLI** - Commands, interactive prompts
7. **Watch mode** - File watching + regeneration
8. **Tests** - Unit tests with fixture specs
9. **UI Integration** - Add `scope` property to field definitions in all UI packages
