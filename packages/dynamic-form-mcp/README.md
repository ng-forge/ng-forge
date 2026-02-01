# @ng-forge/dynamic-form-mcp

MCP (Model Context Protocol) server for ng-forge dynamic forms - AI-assisted form schema generation.

## Features

This MCP server provides AI assistants with:

- **Documentation Lookup**: Explore field types, concepts, and patterns
- **Code Examples**: Get working, copy-paste-ready form configurations
- **Config Validation**: Validate FormConfig objects with detailed error messages
- **Skeleton Generation**: Generate form scaffolds from parameters
- **UI Adapter Info**: Get UI library-specific configurations (Material, Bootstrap, PrimeNG, Ionic)

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

## Available Tools

The server provides 4 focused tools with zero overlap:

| Tool               | Purpose       | One-liner               |
| ------------------ | ------------- | ----------------------- |
| `ngforge_lookup`   | Documentation | "Tell me about X"       |
| `ngforge_examples` | Working code  | "Show me how to do X"   |
| `ngforge_validate` | Verification  | "Is my config correct?" |
| `ngforge_scaffold` | Generation    | "Generate a skeleton"   |

### `ngforge_lookup`

Look up ng-forge Dynamic Forms documentation topics.

**Parameters:**

- `topic` (required): Topic to look up
  - Field types: `input`, `select`, `slider`, `radio`, `checkbox`, `textarea`, `datepicker`, `toggle`, `text`, `hidden`
  - Containers: `group`, `row`, `array`, `page`
  - Concepts: `validation`, `conditional`, `derivation`, `options-format`, `expression-variables`, `async-validators`
  - Patterns: `golden-path`, `pitfalls`, `field-placement`, `logic-matrix`, `multi-page-gotchas`, `workflow`
  - Use `list` to see all available topics
- `depth`: `brief` | `full` | `schema` (default: `full`)
  - `brief`: Quick syntax (~20 lines)
  - `full`: Complete docs with examples
  - `schema`: Include JSON schema (requires `uiIntegration`)
- `uiIntegration`: `material` | `bootstrap` | `primeng` | `ionic` (optional)

**Examples:**

```
ngforge_lookup topic="input" depth="brief"
ngforge_lookup topic="validation" depth="full"
ngforge_lookup topic="select" depth="schema" uiIntegration="material"
ngforge_lookup topic="list"
```

### `ngforge_examples`

Get working, copy-paste-ready form configurations.

**Parameters:**

- `pattern`: Pattern to retrieve
  - **Getting Started**: `complete` (multi-page with all features), `mega` (kitchen sink)
  - **Minimal patterns** (~20-50 lines): `minimal-multipage`, `minimal-array`, `minimal-conditional`, `minimal-validation`, `minimal-hidden`
  - **Standard patterns**: `derivation`, `multi-page`, `conditional`, `validation`
  - Use `list` to see all available patterns
- `depth`: `minimal` | `brief` | `full` | `explained` (default: `full`)
  - `minimal`: Code only
  - `brief`: Code + summary
  - `full`: Code + comments
  - `explained`: Code + detailed explanation

**Examples:**

```
ngforge_examples pattern="complete"
ngforge_examples pattern="minimal-array" depth="minimal"
ngforge_examples pattern="list"
```

### `ngforge_validate`

Validate FormConfig objects with detailed, actionable error messages.

**Parameters:**

- `config` (required): One of:
  - File path (`.ts`/`.js`): Reads file, extracts FormConfig(s), validates each
  - JSON string: Parses and validates
  - JSON object: Validates directly
- `uiIntegration`: `material` | `bootstrap` | `primeng` | `ionic` (default: `material`)

**Features:**

- Auto-detects input type (file path vs JSON)
- Extracts multiple FormConfig objects from TypeScript files
- Returns specific error messages with:
  - Exact property that's wrong
  - What the correct structure should look like
  - Copy-paste fix suggestions

**Examples:**

```
ngforge_validate config="/path/to/form.config.ts"
ngforge_validate config='{"fields": [...]}' uiIntegration="bootstrap"
```

### `ngforge_scaffold`

Generate FormConfig skeletons from parameters.

**Parameters:**

- `pages`: Number of pages (0 = single-page, 1-10 = multi-page wizard)
- `fields`: Basic fields as `"name:type"` pairs (e.g., `["email:input", "country:select"]`)
- `groups`: Group names for nested objects (e.g., `["address", "billing"]`)
- `arrays`: Array names for dynamic lists (e.g., `["contacts", "items"]`)
- `hidden`: Hidden fields as `"name:value"` pairs (e.g., `["userId:abc123"]`)
- `uiIntegration`: `material` | `bootstrap` | `primeng` | `ionic` (default: `material`)

**Generated code includes:**

- Proper page structure with navigation
- Array containers with add/remove buttons
- Groups with placeholder fields
- Hidden fields with values
- Submit button on last page
- `as const satisfies FormConfig` wrapper

**Examples:**

```
ngforge_scaffold pages=0 fields=["name:input","email:input"]
ngforge_scaffold pages=3 arrays=["contacts"] groups=["address"]
ngforge_scaffold hidden=["userId:abc123","source:web"]
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

## Recommended Workflow

1. **Start with lookup**: `ngforge_lookup topic="workflow"` - See tool usage guide
2. **Get structure templates**: `ngforge_lookup topic="golden-path"` - Recommended form structures
3. **Get field syntax**: `ngforge_lookup topic="<field-type>"` - Syntax for specific fields
4. **Get examples**: `ngforge_examples pattern="complete"` - Full working example
5. **Validate config**: `ngforge_validate config=...` - Verify your config

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
