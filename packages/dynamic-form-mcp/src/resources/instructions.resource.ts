/**
 * Instructions Resource
 *
 * Exposes ng-forge best practices and usage guidelines for AI assistants.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let instructionsCache: string | null = null;

function getInstructions(): string {
  if (!instructionsCache) {
    const filePath = join(__dirname, '../registry/instructions.md');
    instructionsCache = readFileSync(filePath, 'utf-8');
  }
  return instructionsCache;
}

export function registerInstructionsResource(server: McpServer): void {
  server.resource('ng-forge://instructions', 'ng-forge Best Practices - MUST follow when generating FormConfig', async () => {
    return {
      contents: [
        {
          uri: 'ng-forge://instructions',
          mimeType: 'text/markdown',
          text: getInstructions(),
        },
      ],
    };
  });
}
