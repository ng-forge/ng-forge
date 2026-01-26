/**
 * Schemas Resource
 *
 * Exposes JSON schemas as MCP resources for LLM context.
 * Provides form config and leaf field schemas for all UI integrations.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getFormConfigJsonSchema, getLeafFieldJsonSchema, type UiIntegration } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS: UiIntegration[] = ['material', 'bootstrap', 'primeng', 'ionic'];

function isValidUiIntegration(value: string): value is UiIntegration {
  return UI_INTEGRATIONS.includes(value as UiIntegration);
}

export function registerSchemasResource(server: McpServer): void {
  // List all available schemas
  server.resource('ng-forge Schemas', 'ng-forge://schemas', async () => {
    return {
      contents: [
        {
          uri: 'ng-forge://schemas',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description: 'JSON Schemas for ng-forge dynamic forms',
              integrations: UI_INTEGRATIONS.map((ui) => ({
                name: ui,
                formConfigSchema: `ng-forge://schemas/${ui}/form-config`,
                leafFieldsSchema: `ng-forge://schemas/${ui}/fields`,
              })),
              usage: 'Access schemas via ng-forge://schemas/{integration}/form-config or ng-forge://schemas/{integration}/fields',
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Form config schema resource
  server.resource('Form Config Schema', 'ng-forge://schemas/{uiIntegration}/form-config', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/schemas\/([^/]+)\/form-config/);
    const uiIntegration = match?.[1];

    if (!uiIntegration || !isValidUiIntegration(uiIntegration)) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Invalid UI integration: ${uiIntegration}. Valid options: ${UI_INTEGRATIONS.join(', ')}`,
          },
        ],
      };
    }

    const schema = getFormConfigJsonSchema(uiIntegration);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/schema+json',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  });

  // Leaf fields schema resource
  server.resource('Leaf Fields Schema', 'ng-forge://schemas/{uiIntegration}/fields', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/schemas\/([^/]+)\/fields/);
    const uiIntegration = match?.[1];

    if (!uiIntegration || !isValidUiIntegration(uiIntegration)) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Invalid UI integration: ${uiIntegration}. Valid options: ${UI_INTEGRATIONS.join(', ')}`,
          },
        ],
      };
    }

    const schema = getLeafFieldJsonSchema(uiIntegration);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/schema+json',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  });
}
