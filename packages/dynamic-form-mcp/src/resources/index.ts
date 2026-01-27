/**
 * MCP Resources Registration
 *
 * Registers all available resources with the MCP server.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFieldTypesResource } from './field-types.resource.js';
import { registerValidatorsResource } from './validators.resource.js';
import { registerUIAdaptersResource } from './ui-adapters.resource.js';
import { registerDocumentationResource } from './documentation.resource.js';
import { registerInstructionsResource } from './instructions.resource.js';
import { registerExamplesResource } from './examples.resource.js';
import { registerSchemasResource } from './schemas.resource.js';

/**
 * Register all MCP resources
 */
export function registerResources(server: McpServer): void {
  registerInstructionsResource(server);
  registerExamplesResource(server);
  registerFieldTypesResource(server);
  registerValidatorsResource(server);
  registerUIAdaptersResource(server);
  registerDocumentationResource(server);
  registerSchemasResource(server);
}
