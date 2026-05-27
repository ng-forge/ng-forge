#!/usr/bin/env node
/** ng-forge MCP Server CLI */

import { runStdioServer } from '../src/server.js';

runStdioServer().catch((error) => {
  console.error('Failed to start ng-forge MCP server:', error);
  process.exit(1);
});
