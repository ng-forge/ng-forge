# @ng-forge/dynamic-form-mcp

MCP (Model Context Protocol) server for ng-forge dynamic forms - AI-assisted form schema generation.

## Features

This MCP server provides AI assistants with:

- **Field Type Discovery**: Explore available field types and their configurations
- **Form Schema Generation**: Generate complete form configurations from requirements
- **Validation Tools**: Generate validator configurations (built-in, custom, async, HTTP)
- **Expression Tools**: Generate conditional logic for visibility, disabled state, and computed values
- **UI Adapter Info**: Get UI library-specific configurations (Material, Bootstrap, PrimeNG, Ionic)
- **Documentation**: Access library documentation and best practices

## Installation

```bash
npm install @ng-forge/dynamic-form-mcp
```

## Usage

### Claude Desktop Configuration

Add to your Claude Desktop configuration (`~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ng-forge": {
      "command": "npx",
      "args": ["@ng-forge/dynamic-form-mcp"]
    }
  }
}
```

### Local Development

For development within the ng-forge monorepo:

```json
{
  "mcpServers": {
    "ng-forge": {
      "command": "node",
      "args": ["/path/to/ng-forge/dist/packages/dynamic-form-mcp/bin/ng-forge-mcp.js"]
    }
  }
}
```

## Available Resources

| Resource URI                       | Description                           |
| ---------------------------------- | ------------------------------------- |
| `ng-forge://field-types`           | List all available field types        |
| `ng-forge://field-types/{type}`    | Get details for a specific field type |
| `ng-forge://validators`            | List all available validators         |
| `ng-forge://validators/{type}`     | Get details for a specific validator  |
| `ng-forge://ui-adapters`           | List all UI library adapters          |
| `ng-forge://ui-adapters/{library}` | Get UI library specific configuration |
| `ng-forge://docs`                  | List documentation topics             |
| `ng-forge://docs/{topic}`          | Get specific documentation topic      |

## Available Tools

### `suggest_field_type`

Suggests the optimal field type based on property characteristics.

**Parameters:**

- `propertyName` (required): The property/field name
- `dataType`: TypeScript data type
- `context`: Additional context
- `uiLibrary`: Target UI library
- `hasOptions`: Whether the field has predefined options

### `generate_form_schema`

Generates a complete form configuration from requirements.

**Parameters:**

- `formName` (required): Name/purpose of the form
- `fields` (required): Array of field requirements
- `uiLibrary`: Target UI library
- `multiPage`: Generate multi-page form
- `includeSubmission`: Include submission configuration

### `generate_from_typescript_interface`

Parses a TypeScript interface and generates form fields.

**Parameters:**

- `interfaceCode` (required): TypeScript interface definition
- `uiLibrary`: Target UI library
- `options`: Generation options

### `generate_from_sample_data`

Infers form schema from JSON sample data.

**Parameters:**

- `sampleData` (required): JSON sample data object
- `uiLibrary`: Target UI library
- `inferLabels`: Generate human-readable labels

### `add_validation`

Generates validator configuration for form fields.

**Parameters:**

- `validatorType` (required): Type of validator
- `value`: Value for min/max/pattern validators
- `expression`: JavaScript expression for custom validators
- `functionName`: Registered validator function name
- `conditionalExpression`: Expression for conditional validation

### `add_expression`

Generates expression configuration for conditional logic.

**Parameters:**

- `expressionType` (required): Type of expression (hidden, disabled, value, derivation, etc.)
- `expression` (required): JavaScript expression
- `relatedFields`: Dependent field keys

**Note:** Derivations are defined on the target field itself using shorthand `derivation: '...'` or logic blocks.

## Development

### Building

```bash
nx build dynamic-form-mcp
```

### Testing

```bash
nx test dynamic-form-mcp
```

### Generating Registry

The registry is automatically generated before build:

```bash
nx run dynamic-form-mcp:generate-registry
```

## License

MIT
