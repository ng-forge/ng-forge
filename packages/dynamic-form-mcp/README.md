# @ng-forge/dynamic-form-mcp

MCP (Model Context Protocol) server for ng-forge dynamic forms - enables AI assistants to generate, validate, and work with dynamic form configurations.

## Features

- **Documentation Lookup**: Explore field types, concepts, and patterns
- **Code Examples**: Get working, copy-paste-ready form configurations
- **Config Validation**: Validate FormConfig objects with detailed error messages
- **Skeleton Generation**: Generate form scaffolds from parameters

## Installation

```bash
npm install @ng-forge/dynamic-form-mcp
```

## Setup

### Cursor

Add to your Cursor MCP settings:

```json
{
  "ng-forge": {
    "command": "npx",
    "args": ["-y", "@ng-forge/dynamic-form-mcp"]
  }
}
```

### VS Code with Copilot

Create `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "ng-forge": {
      "command": "npx",
      "args": ["-y", "@ng-forge/dynamic-form-mcp"]
    }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "ng-forge": {
      "command": "npx",
      "args": ["-y", "@ng-forge/dynamic-form-mcp"]
    }
  }
}
```

### JetBrains IDEs

Go to **Settings > Tools > AI Assistant > Model Context Protocol (MCP)** and add:

| Field     | Value                         |
| --------- | ----------------------------- |
| Name      | ng-forge                      |
| Command   | npx                           |
| Arguments | -y @ng-forge/dynamic-form-mcp |

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

The server provides 4 focused tools:

| Tool               | Description                                                 | Read-only |
| ------------------ | ----------------------------------------------------------- | --------- |
| `ngforge_lookup`   | Get documentation about field types, concepts, and patterns | ✅        |
| `ngforge_examples` | Get working code examples for common form patterns          | ✅        |
| `ngforge_validate` | Validate FormConfig and get detailed error feedback         | ✅        |
| `ngforge_scaffold` | Generate valid FormConfig skeletons                         | ✅        |

---

### ngforge_lookup

Get documentation about any ng-forge topic.

| Parameter       | Type                                                      | Default    | Description             |
| --------------- | --------------------------------------------------------- | ---------- | ----------------------- |
| `topic`         | string                                                    | (required) | Topic to look up        |
| `depth`         | `"brief"` \| `"full"` \| `"schema"`                       | `"full"`   | Level of detail         |
| `uiIntegration` | `"material"` \| `"bootstrap"` \| `"primeng"` \| `"ionic"` | -          | Filter UI-specific info |

**Available Topics:**

| Category    | Topics                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Field Types | `input`, `select`, `radio`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`, `hidden`, `text` |
| Containers  | `group`, `row`, `array`, `page`                                                                        |
| Concepts    | `validation`, `conditional`, `derivation`, `options-format`, `expression-variables`                    |
| Patterns    | `golden-path`, `multi-page-gotchas`, `pitfalls`, `workflow`                                            |

---

### ngforge_examples

Get working code examples for common patterns.

| Parameter | Type                                                  | Default    | Description     |
| --------- | ----------------------------------------------------- | ---------- | --------------- |
| `pattern` | string                                                | (required) | Pattern name    |
| `depth`   | `"minimal"` \| `"brief"` \| `"full"` \| `"explained"` | `"full"`   | Level of detail |

**Available Patterns:**

| Pattern               | Description                              |
| --------------------- | ---------------------------------------- |
| `minimal-multipage`   | Simplest 2-page wizard form              |
| `minimal-array`       | Array with add/remove buttons            |
| `minimal-conditional` | Show/hide field based on condition       |
| `minimal-validation`  | Password confirmation validation         |
| `minimal-hidden`      | Hidden fields in multi-page form         |
| `complete`            | Full form with all major features        |
| `mega`                | Kitchen sink demonstrating every feature |

---

### ngforge_validate

Validate FormConfig and get detailed error feedback.

| Parameter       | Type                                                      | Default      | Description                    |
| --------------- | --------------------------------------------------------- | ------------ | ------------------------------ |
| `config`        | string \| object                                          | (required)   | File path or JSON config       |
| `uiIntegration` | `"material"` \| `"bootstrap"` \| `"primeng"` \| `"ionic"` | `"material"` | UI library to validate against |

**Input Detection:**

| Input                    | Treated As         |
| ------------------------ | ------------------ |
| Ends with `.ts` or `.js` | File path          |
| Starts with `{` or `[`   | JSON string        |
| Object                   | Validated directly |

**Example Errors:**

- "Hidden field missing REQUIRED value property"
- "options MUST be at FIELD level, NOT inside props"
- "containers only support 'hidden' logic type"

---

### ngforge_scaffold

Generate valid FormConfig skeletons.

| Parameter       | Type     | Default      | Description                           |
| --------------- | -------- | ------------ | ------------------------------------- |
| `pages`         | number   | `0`          | Number of pages (0 = single-page)     |
| `fields`        | string[] | `[]`         | Fields as `"name:type"` pairs         |
| `groups`        | string[] | `[]`         | Group field names                     |
| `arrays`        | string[] | `[]`         | Array field names                     |
| `hidden`        | string[] | `[]`         | Hidden fields as `"name:value"` pairs |
| `uiIntegration` | enum     | `"material"` | UI library                            |

**Supported field types:** `input`, `select`, `radio`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`

---

## MCP Resources

| Resource URI               | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `ng-forge://instructions`  | Best practices guide for generating FormConfig |
| `ng-forge://examples`      | Curated FormConfig examples                    |
| `ng-forge://examples/{id}` | Specific example by ID                         |
| `ng-forge://field-types`   | Field type reference                           |
| `ng-forge://validators`    | Validator reference                            |
| `ng-forge://ui-adapters`   | UI library configurations                      |
| `ng-forge://docs`          | Full documentation index                       |

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

```bash
nx run dynamic-form-mcp:generate-registry
```

## License

MIT
