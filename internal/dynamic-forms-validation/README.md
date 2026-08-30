# @ng-forge/dynamic-forms-validation

Internal. Not published.

Everything the MCP server and the validation CLI share:

| Directory                                       | Contents                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `src/`                                          | Adapter-agnostic base Zod schemas                                 |
| `material/`, `bootstrap/`, `primeng/`, `ionic/` | Per-adapter schemas                                               |
| `validate/`                                     | `validateFormConfig` and JSON Schema generation, free of ts-morph |
| `discovery/`                                    | ts-morph discovery of FormConfig objects inside source files      |
| `reporting/`                                    | Markdown report formatting and the error-to-fix table             |

## Consumers

- `@ng-forge/dynamic-forms-cli` bundles it and ships `ng-forge-validate`
- `@ng-forge/dynamic-form-mcp` bundles it behind `ngforge_validate`

Both bundle rather than depend, so this library never reaches npm.

## Entry points

`@ng-forge/dynamic-forms-validation` exports everything.

`@ng-forge/dynamic-forms-validation/schema-only` exports just the schema
validation half. It exists so the CLI's browser-safe `/validate` entry point
can offer runtime validation without pulling a TypeScript parser into an
application bundle. Import from it when adding anything that application code
will reach.

## Tests

```bash
nx test dynamic-forms-validation
```
