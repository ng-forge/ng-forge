The `@ng-forge/dynamic-form-mcp` package provides a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes ng-forge dynamic form capabilities to AI assistants like Claude, Cursor, GitHub Copilot, and other MCP-compatible tools.

## What is MCP?

Model Context Protocol is an open standard that allows AI assistants to connect to external tools and data sources. Instead of relying solely on training data, MCP enables real-time access to authoritative information directly from the library authors.

## Configuration

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

## Available Resources

The MCP server exposes several resources that AI assistants can query:

| Resource URI                       | Description                                                           |
| ---------------------------------- | --------------------------------------------------------------------- |
| `ng-forge://instructions`          | Best practices guide that AI should follow when generating FormConfig |
| `ng-forge://examples`              | Curated FormConfig examples for common patterns                       |
| `ng-forge://examples/{id}`         | Specific example by ID (login-form, user-registration, etc.)          |
| `ng-forge://field-types`           | Complete field type reference with props and examples                 |
| `ng-forge://validators`            | Validator reference (built-in, custom, async, http)                   |
| `ng-forge://ui-adapters`           | UI library configurations                                             |
| `ng-forge://ui-adapters/{library}` | Specific UI library config (material, bootstrap, primeng, ionic)      |
| `ng-forge://docs`                  | Full documentation index                                              |
| `ng-forge://docs/{topic}`          | Specific documentation topic                                          |

### Curated Examples

The following examples are available via `ng-forge://examples/{id}`:

| ID                   | Name               | Description                                             |
| -------------------- | ------------------ | ------------------------------------------------------- |
| `login-form`         | Login Form         | Simple authentication form with email and password      |
| `user-registration`  | User Registration  | Complete registration with personal info and newsletter |
| `contact-form`       | Contact Form       | Contact form with name, email, subject, and message     |
| `address-form`       | Address Form       | Demonstrates nested groups for address structure        |
| `wizard-form`        | Multi-Step Wizard  | Multi-page form with navigation                         |
| `conditional-form`   | Conditional Fields | Fields that show/hide based on other values             |
| `emergency-contacts` | Dynamic Array      | Repeatable contact entries using array fields           |
| `survey-form`        | Survey Form        | Rating slider, radio options, and conditional follow-up |

## Available Tools

The MCP server provides one tool:

### validate_form_config

Validates a FormConfig object against the ng-forge schema and returns detailed feedback.

**Input:**

```json
{
  "config": {
    "fields": [{ "key": "name", "type": "input", "label": "Name" }]
  }
}
```

**Output:**

```json
{
  "valid": true,
  "errorCount": 0,
  "warningCount": 1,
  "errors": [],
  "warnings": [
    {
      "path": "config.fields[0]",
      "message": "Field \"name\" is missing a label. Labels improve accessibility."
    }
  ],
  "summary": "Config is valid with 1 warning(s)"
}
```

The validator checks for:

- Missing required properties (key, type)
- Unknown field types
- Invalid validator configurations
- Structural issues (select without options, array without template, etc.)
- Logical errors (min > max, invalid regex patterns)
- Duplicate field keys
- Accessibility concerns (missing labels)

## How AI Uses the MCP Server

When you ask an AI assistant to help with ng-forge forms, it will:

1. **Read the instructions** (`ng-forge://instructions`) to understand best practices
2. **Browse examples** (`ng-forge://examples`) to find similar patterns
3. **Check field types** (`ng-forge://field-types`) for available options and props
4. **Validate the config** (`validate_form_config`) before presenting it to you

This ensures the generated FormConfig follows ng-forge conventions and works correctly.
