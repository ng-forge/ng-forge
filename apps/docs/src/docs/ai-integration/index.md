# AI Integration

The `@ng-forge/dynamic-form-mcp` package provides a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes ng-forge dynamic form capabilities to AI assistants like Claude, Cursor, GitHub Copilot, and other MCP-compatible tools.

## What is MCP?

Model Context Protocol is an open standard that allows AI assistants to connect to external tools and data sources. Instead of relying solely on training data, MCP enables real-time access to authoritative information directly from the library authors.

## Quick Start

### Installation

```bash
npm install -g @ng-forge/dynamic-form-mcp
# or use directly with npx
npx @ng-forge/dynamic-form-mcp
```

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

### Cursor

Add to Cursor settings under MCP servers:

```json
{
  "ng-forge": {
    "command": "npx",
    "args": ["-y", "@ng-forge/dynamic-form-mcp"]
  }
}
```

### JetBrains IDEs

Go to **Settings > Tools > AI Assistant > Model Context Protocol (MCP)** and add:

- **Name**: ng-forge
- **Command**: npx
- **Arguments**: -y @ng-forge/dynamic-form-mcp

---

## MCP Tools Overview

The ng-forge MCP server provides **4 focused tools** with zero overlap, each serving a single clear purpose:

| Tool               | Purpose       | One-liner                   |
| ------------------ | ------------- | --------------------------- |
| `ngforge_lookup`   | Documentation | "Tell me about X"           |
| `ngforge_examples` | Working code  | "Show me how to do X"       |
| `ngforge_validate` | Verification  | "Is my config correct?"     |
| `ngforge_scaffold` | Generation    | "Generate a skeleton for X" |

### Recommended Workflow

1. **Start with lookup** - `ngforge_lookup topic="workflow"` to see the tool usage guide
2. **Get structure templates** - `ngforge_lookup topic="golden-path"` for form structure patterns
3. **Learn field syntax** - `ngforge_lookup topic="<field-type>"` for specific field documentation
4. **Validate your config** - `ngforge_validate` catches all structural and semantic errors

---

## Tool Reference

### ngforge_lookup

**Purpose:** Get documentation about any ng-forge topic.

**Parameters:**

| Parameter       | Type   | Default    | Description                                                                          |
| --------------- | ------ | ---------- | ------------------------------------------------------------------------------------ |
| `topic`         | string | (required) | Topic to look up                                                                     |
| `depth`         | enum   | `"full"`   | `"brief"` (quick syntax), `"full"` (complete docs), `"schema"` (include JSON schema) |
| `uiIntegration` | enum   | -          | Filter UI-specific info (only with `depth="schema"`)                                 |

**Available Topics:**

| Category        | Topics                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Field Types** | `input`, `select`, `radio`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`, `hidden`, `text`, `button`, `submit`, `next`, `previous`, `addArrayItem`, `removeArrayItem` |
| **Containers**  | `group`, `row`, `array`, `page`                                                                                                                                                   |
| **Concepts**    | `validation`, `conditional`, `derivation`, `options-format`, `expression-variables`, `async-validators`, `validation-messages`                                                    |
| **Patterns**    | `golden-path`, `multi-page-gotchas`, `pitfalls`, `workflow`                                                                                                                       |
| **Reference**   | `list` (shows all topics)                                                                                                                                                         |

**Example Usage:**

```
# Quick syntax reference
ngforge_lookup topic="hidden" depth="brief"

# Complete documentation with examples
ngforge_lookup topic="conditional" depth="full"

# Field schema for Material UI
ngforge_lookup topic="input" depth="schema" uiIntegration="material"

# List all available topics
ngforge_lookup topic="list"
```

---

### ngforge_examples

**Purpose:** Get working code examples for common patterns.

**Parameters:**

| Parameter | Type   | Default    | Description                                                                                                                  |
| --------- | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pattern` | string | (required) | Pattern name to retrieve                                                                                                     |
| `depth`   | enum   | `"full"`   | `"minimal"` (code only), `"brief"` (code + summary), `"full"` (code + comments), `"explained"` (code + detailed explanation) |

**Available Patterns:**

| Pattern               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `minimal-multipage`   | Simplest 2-page wizard form (~50 lines)        |
| `minimal-array`       | Array with add/remove buttons (~30 lines)      |
| `minimal-conditional` | Show/hide field based on condition (~25 lines) |
| `minimal-validation`  | Password confirmation validation (~20 lines)   |
| `minimal-hidden`      | Hidden fields in multi-page form (~15 lines)   |
| `derivation`          | Value derivation (computed fields)             |
| `conditional`         | Conditional visibility patterns                |
| `multi-page`          | Multi-step wizard forms                        |
| `validation`          | Form validation patterns                       |
| `complete`            | Full multi-page form with all major features   |
| `mega`                | Kitchen sink demonstrating EVERY feature       |
| `list`                | Show all available patterns                    |

**Example Usage:**

```
# Get minimal code for a 2-page form
ngforge_examples pattern="minimal-multipage" depth="minimal"

# Full conditional logic example with comments
ngforge_examples pattern="conditional" depth="full"

# Detailed explanation of derivation
ngforge_examples pattern="derivation" depth="explained"

# List all patterns
ngforge_examples pattern="list"
```

---

### ngforge_validate

**Purpose:** Validate FormConfig and get detailed error feedback.

**Parameters:**

| Parameter       | Type          | Default      | Description                                           |
| --------------- | ------------- | ------------ | ----------------------------------------------------- |
| `config`        | string/object | (required)   | File path (`.ts`/`.js`) OR JSON string OR JSON object |
| `uiIntegration` | enum          | `"material"` | UI library to validate against                        |

**Auto-Detection:**

- Strings ending in `.ts` or `.js` → treated as file paths
- Strings starting with `{` or `[` → parsed as JSON
- Objects → validated directly

**Example Usage:**

```
# Validate a TypeScript file
ngforge_validate config="/path/to/form.config.ts"

# Validate JSON directly
ngforge_validate config='{"fields":[{"key":"name","type":"input","label":"Name"}]}'

# Validate for Bootstrap UI
ngforge_validate config=myConfig uiIntegration="bootstrap"
```

**Output:**

The validator returns:

- **Exact property path** that's wrong
- **Clear error messages** explaining what's incorrect
- **Fix suggestions** with copy-paste solutions

Example errors you'll see:

- "Hidden field missing REQUIRED value property"
- "options MUST be at FIELD level, NOT inside props"
- "row containers do NOT support logic blocks"

---

### ngforge_scaffold

**Purpose:** Generate valid FormConfig skeletons based on parameters.

**Parameters:**

| Parameter       | Type     | Default      | Description                                                 |
| --------------- | -------- | ------------ | ----------------------------------------------------------- |
| `pages`         | number   | `0`          | Number of pages (0 = single-page, 1-10 = multi-page wizard) |
| `arrays`        | string[] | `[]`         | Array field names for dynamic lists                         |
| `groups`        | string[] | `[]`         | Group field names for nested objects                        |
| `hidden`        | string[] | `[]`         | Hidden fields as `"name:value"` pairs                       |
| `fields`        | string[] | `[]`         | Basic fields as `"name:type"` pairs                         |
| `uiIntegration` | enum     | `"material"` | UI library (for future UI-specific props)                   |

**Supported Field Types for `fields` parameter:**

`input`, `select`, `radio`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`

**Example Usage:**

```
# Single-page form with basic fields
ngforge_scaffold pages=0 fields=["name:input","email:input","subscribe:checkbox"]

# 3-page wizard
ngforge_scaffold pages=3 fields=["name:input","email:input","message:textarea"]

# Form with dynamic array
ngforge_scaffold pages=2 arrays=["contacts"]

# Form with nested group
ngforge_scaffold pages=0 groups=["address","billing"]

# Form with hidden tracking fields
ngforge_scaffold hidden=["userId:abc123","source:web"]

# Complex form
ngforge_scaffold pages=3 arrays=["contacts"] groups=["address"] hidden=["formId:xyz"] fields=["name:input","country:select"]
```

**Output:**

Produces valid, compilable FormConfig code with:

- Proper page structure with navigation buttons
- Array containers with add buttons
- Groups with placeholder fields
- Hidden fields with values
- Submit button on last page
- `as const satisfies FormConfig` wrapper
- TypeScript output shape comment

---

## MCP Resources

In addition to tools, the server exposes resources that AI can read:

| Resource URI                       | Description                                                           |
| ---------------------------------- | --------------------------------------------------------------------- |
| `ng-forge://instructions`          | Best practices guide that AI should follow when generating FormConfig |
| `ng-forge://examples`              | Curated FormConfig examples for common patterns                       |
| `ng-forge://examples/{id}`         | Specific example by ID                                                |
| `ng-forge://field-types`           | Complete field type reference with props and examples                 |
| `ng-forge://validators`            | Validator reference (built-in, custom, async, http)                   |
| `ng-forge://ui-adapters`           | UI library configurations                                             |
| `ng-forge://ui-adapters/{library}` | Specific UI library config (material, bootstrap, primeng, ionic)      |
| `ng-forge://docs`                  | Full documentation index                                              |
| `ng-forge://docs/{topic}`          | Specific documentation topic                                          |

### Curated Examples (via resources)

| ID                   | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `login-form`         | Simple authentication form with email and password      |
| `user-registration`  | Complete registration with personal info and newsletter |
| `contact-form`       | Contact form with name, email, subject, and message     |
| `address-form`       | Demonstrates nested groups for address structure        |
| `wizard-form`        | Multi-page form with navigation                         |
| `conditional-form`   | Fields that show/hide based on other values             |
| `emergency-contacts` | Repeatable contact entries using array fields           |
| `survey-form`        | Rating slider, radio options, and conditional follow-up |

---

## How AI Uses the MCP Server

When you ask an AI assistant to help with ng-forge forms, it will:

1. **Check the workflow** (`ngforge_lookup topic="workflow"`) to understand tool usage
2. **Get golden path templates** (`ngforge_lookup topic="golden-path"`) for proper structure
3. **Look up field syntax** (`ngforge_lookup topic="<field-type>"`) for specific fields
4. **Generate a skeleton** (`ngforge_scaffold`) if starting from scratch
5. **Browse examples** (`ngforge_examples`) to find similar patterns
6. **Validate the config** (`ngforge_validate`) before presenting it to you

This ensures the generated FormConfig follows ng-forge conventions and works correctly.

---

## Best Practices for AI Prompts

When asking AI to help with ng-forge forms:

### Be Specific About Requirements

```
"Create a 3-page registration form with:
- Page 1: Personal info (name, email, phone)
- Page 2: Address (street, city, state, zip as a group)
- Page 3: Preferences (newsletter checkbox, contact method radio)"
```

### Reference Field Types

```
"Add a datepicker field for birth date with min age 18"
```

### Ask for Validation

```
"Validate this form config and fix any errors"
```

### Request Specific Patterns

```
"Show me how to add conditional visibility - hide the 'company'
field when 'accountType' is 'personal'"
```

---

## Troubleshooting

### "Tool not found" errors

Ensure the MCP server is properly configured in your AI client. Restart the AI application after configuration changes.

### Validation errors you don't understand

Use `ngforge_lookup topic="pitfalls"` to see common mistakes and their solutions.

### Need more context on a feature

Use `ngforge_examples pattern="<pattern>" depth="explained"` for detailed explanations with working code.

### Starting from scratch

Use `ngforge_scaffold` to generate a valid starting point, then customize.
