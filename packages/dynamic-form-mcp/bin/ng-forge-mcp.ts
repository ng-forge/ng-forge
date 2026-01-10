#!/usr/bin/env node
/**
 * ng-forge MCP Server CLI
 *
 * This is the entry point for the MCP server when invoked via npx or as a CLI tool.
 */

import { runStdioServer } from '../src/server.js';

runStdioServer().catch((error) => {
  console.error('Failed to start ng-forge MCP server:', error);
  process.exit(1);
});
