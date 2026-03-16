# AI Integration

The `@ng-forge/dynamic-form-mcp` package provides a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that enables AI assistants to generate, validate, and work with ng-forge dynamic form configurations.

## Available Tools

The MCP server provides 4 focused tools:

| Tool               | Description                                                 | Read-only |
| ------------------ | ----------------------------------------------------------- | --------- |
| `ngforge_lookup`   | Get documentation about field types, concepts, and patterns | ✅        |
| `ngforge_examples` | Get working code examples for common form patterns          | ✅        |
| `ngforge_validate` | Validate FormConfig and get detailed error feedback         | ✅        |
| `ngforge_scaffold` | Generate valid FormConfig skeletons                         | ✅        |

## Get Started

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

---

## Tool Reference

### ngforge_lookup

Get documentation about any ng-forge topic.

| Parameter       | Type                                                      | Default    | Description             |
| --------------- | --------------------------------------------------------- | ---------- | ----------------------- |
| `topic`         | string                                                    | (required) | Topic to look up        |
| `depth`         | `"brief"` \| `"full"` \| `"schema"`                       | `"full"`   | Level of detail         |
| `uiIntegration` | `"material"` \| `"bootstrap"` \| `"primeng"` \| `"ionic"` | -          | Filter UI-specific info |

**Available Topics:**

| Category    | Topics                                                                                                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field Types | `input`, `select`, `radio`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`, `hidden`, `text`, `button`, `submit`, `next`, `previous`, `addArrayItem`, `prependArrayItem`, `insertArrayItem`, `removeArrayItem`, `popArrayItem`, `shiftArrayItem` |
| Containers  | `group`, `row`, `array`, `page`                                                                                                                                                                                                                            |
| Concepts    | `validation`, `conditional`, `derivation`, `options-format`, `expression-variables`, `async-validators`, `validation-messages`                                                                                                                             |
| Patterns    | `golden-path`, `multi-page-gotchas`, `pitfalls`, `workflow`                                                                                                                                                                                                |

**Examples:**

```
ngforge_lookup topic="hidden" depth="brief"
ngforge_lookup topic="conditional" depth="full"
ngforge_lookup topic="input" depth="schema" uiIntegration="material"
```

---

### ngforge_examples

Get working code examples for common patterns.

| Parameter | Type                                                  | Default    | Description     |
| --------- | ----------------------------------------------------- | ---------- | --------------- |
| `pattern` | string                                                | (required) | Pattern name    |
| `depth`   | `"minimal"` \| `"brief"` \| `"full"` \| `"explained"` | `"full"`   | Level of detail |

**Available Patterns:**

| Pattern               | Description                              | Lines |
| --------------------- | ---------------------------------------- | ----- |
| `minimal-multipage`   | Simplest 2-page wizard form              | ~50   |
| `minimal-array`       | Array with add/remove buttons            | ~30   |
| `minimal-conditional` | Show/hide field based on condition       | ~25   |
| `minimal-validation`  | Password confirmation validation         | ~20   |
| `minimal-hidden`      | Hidden fields in multi-page form         | ~15   |
| `derivation`          | Value derivation (computed fields)       | -     |
| `conditional`         | Conditional visibility patterns          | -     |
| `multi-page`          | Multi-step wizard forms                  | -     |
| `validation`          | Form validation patterns                 | -     |
| `complete`            | Full form with all major features        | -     |
| `mega`                | Kitchen sink demonstrating every feature | -     |

**Examples:**

```
ngforge_examples pattern="minimal-multipage" depth="minimal"
ngforge_examples pattern="conditional" depth="explained"
```

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
- "row containers do NOT support logic blocks"

**Examples:**

```
ngforge_validate config="/path/to/form.config.ts"
ngforge_validate config='{"fields":[...]}' uiIntegration="bootstrap"
```

---

### ngforge_scaffold

Generate valid FormConfig skeletons.

| Parameter       | Type     | Default      | Description                           |
| --------------- | -------- | ------------ | ------------------------------------- |
| `pages`         | number   | `0`          | Number of pages (0 = single-page)     |
| `arrays`        | string[] | `[]`         | Array field names                     |
| `groups`        | string[] | `[]`         | Group field names                     |
| `hidden`        | string[] | `[]`         | Hidden fields as `"name:value"` pairs |
| `fields`        | string[] | `[]`         | Fields as `"name:type"` pairs         |
| `uiIntegration` | enum     | `"material"` | UI library                            |

**Supported Types for `fields`:**

`input`, `select`, `radio`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`

**Examples:**

```
ngforge_scaffold pages=0 fields=["name:input","email:input"]
ngforge_scaffold pages=3 arrays=["contacts"] groups=["address"]
ngforge_scaffold hidden=["userId:abc123","source:web"]
```

---

## MCP Resources

In addition to tools, the server exposes resources that AI can read:

| Resource URI               | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `ng-forge://instructions`  | Best practices guide for generating FormConfig |
| `ng-forge://examples`      | Curated FormConfig examples                    |
| `ng-forge://examples/{id}` | Specific example by ID                         |
| `ng-forge://field-types`   | Field type reference                           |
| `ng-forge://validators`    | Validator reference                            |
| `ng-forge://ui-adapters`   | UI library configurations                      |
| `ng-forge://docs`          | Full documentation index                       |

---

## Feedback

Found an issue or have a suggestion? [Open an issue on GitHub](https://github.com/ng-forge/ng-forge/issues).
