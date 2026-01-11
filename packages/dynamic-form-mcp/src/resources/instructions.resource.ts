/**
 * Instructions Resource
 *
 * Exposes ng-forge best practices and usage guidelines for AI assistants.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { INSTRUCTIONS } from '../registry/instructions.js';

export function registerInstructionsResource(server: McpServer): void {
  server.resource('ng-forge Best Practices', 'ng-forge://instructions', async () => {
    return {
      contents: [
        {
          uri: 'ng-forge://instructions',
          mimeType: 'text/markdown',
          text: INSTRUCTIONS,
        },
      ],
    };
  });
}
