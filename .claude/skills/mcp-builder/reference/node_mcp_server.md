# Node/TypeScript MCP Server Implementation Guide

## Overview

This document provides Node/TypeScript-specific best practices and examples for implementing MCP servers using the MCP TypeScript SDK.

---

## Quick Reference

### Key Imports

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { z } from 'zod';
```

### Server Initialization

```typescript
const server = new McpServer({
  name: 'service-mcp-server',
  version: '1.0.0',
});
```

### Tool Registration Pattern

```typescript
server.registerTool(
  'tool_name',
  {
    title: 'Tool Display Name',
    description: 'What the tool does',
    inputSchema: { param: z.string() },
    outputSchema: { result: z.string() },
  },
  async ({ param }) => {
    const output = { result: `Processed: ${param}` };
    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output,
    };
  },
);
```

---

## Server Naming Convention

Node/TypeScript MCP servers must follow this naming pattern:

- **Format**: `{service}-mcp-server` (lowercase with hyphens)
- **Examples**: `github-mcp-server`, `jira-mcp-server`, `stripe-mcp-server`

## Project Structure

```
{service}-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # Main entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── tools/            # Tool implementations
│   ├── services/         # API clients and utilities
│   ├── schemas/          # Zod validation schemas
│   └── constants.ts      # Shared constants
└── dist/                 # Built JavaScript files
```

## Tool Implementation

### Tool Naming

Use snake_case with service prefix:

- Use `slack_send_message` instead of just `send_message`
- Use `github_create_issue` instead of just `create_issue`

### Tool Structure

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'example-mcp',
  version: '1.0.0',
});

const UserSearchInputSchema = z
  .object({
    query: z
      .string()
      .min(2, 'Query must be at least 2 characters')
      .max(200, 'Query must not exceed 200 characters')
      .describe('Search string to match against names/emails'),
    limit: z.number().int().min(1).max(100).default(20).describe('Maximum results to return'),
    offset: z.number().int().min(0).default(0).describe('Number of results to skip for pagination'),
    response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe('Output format'),
  })
  .strict();

type UserSearchInput = z.infer<typeof UserSearchInputSchema>;

server.registerTool(
  'example_search_users',
  {
    title: 'Search Example Users',
    description: `Search for users in the Example system by name, email, or team.`,
    inputSchema: UserSearchInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async (params: UserSearchInput) => {
    // Implementation
  },
);
```

## Zod Schemas for Input Validation

```typescript
import { z } from 'zod';

const CreateUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
    email: z.string().email('Invalid email format'),
    age: z.number().int('Age must be a whole number').min(0, 'Age cannot be negative'),
  })
  .strict();

enum ResponseFormat {
  MARKDOWN = 'markdown',
  JSON = 'json',
}

const SearchSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe('Output format'),
});
```

## Error Handling

```typescript
import axios, { AxiosError } from 'axios';

function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return 'Error: Resource not found. Please check the ID is correct.';
        case 403:
          return 'Error: Permission denied.';
        case 429:
          return 'Error: Rate limit exceeded. Please wait.';
        default:
          return `Error: API request failed with status ${error.response.status}`;
      }
    }
  }
  return `Error: ${error instanceof Error ? error.message : String(error)}`;
}
```

## Package Configuration

### package.json

```json
{
  "name": "{service}-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.6.1",
    "axios": "^1.7.9",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Transport Options

### stdio (Local)

```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

### Streamable HTTP (Remote)

```typescript
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';

async function runHTTP() {
  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.listen(3000);
}
```

## Quality Checklist

- [ ] All tools registered using `registerTool` with complete configuration
- [ ] All tools include `title`, `description`, `inputSchema`, and `annotations`
- [ ] All Zod schemas have proper constraints with `.strict()` enforcement
- [ ] Error messages are clear and actionable
- [ ] TypeScript strict mode enabled
- [ ] No use of `any` type
- [ ] Pagination implemented where applicable
- [ ] `npm run build` completes successfully
