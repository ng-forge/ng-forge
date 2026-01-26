/**
 * Schemas Resource
 *
 * Exposes JSON schemas as MCP resources for LLM context.
 * Provides per-field-type schemas to avoid context size issues.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getFieldTypeJsonSchema, getSupportedFieldTypes, type UiIntegration, type FieldType } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS: UiIntegration[] = ['material', 'bootstrap', 'primeng', 'ionic'];

function isValidUiIntegration(value: string): value is UiIntegration {
  return UI_INTEGRATIONS.includes(value as UiIntegration);
}

function isValidFieldType(value: string): value is FieldType {
  return getSupportedFieldTypes().includes(value as FieldType);
}

export function registerSchemasResource(server: McpServer): void {
  // List all available schemas
  server.resource('ng-forge Schemas', 'ng-forge://schemas', async () => {
    const fieldTypes = getSupportedFieldTypes();

    return {
      contents: [
        {
          uri: 'ng-forge://schemas',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description: 'JSON Schemas for ng-forge dynamic forms',
              note: 'Use per-field-type schemas to avoid large context sizes (~25KB each vs ~258KB for full schema)',
              integrations: UI_INTEGRATIONS,
              fieldTypes,
              usage: {
                perFieldType: 'ng-forge://schemas/{integration}/{fieldType}',
                example: 'ng-forge://schemas/material/input',
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // List field types for a UI integration
  server.resource('Field Types', 'ng-forge://schemas/{uiIntegration}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/schemas\/([^/]+)$/);
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

    const fieldTypes = getSupportedFieldTypes();

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              uiIntegration,
              fieldTypes,
              schemas: fieldTypes.map((ft) => ({
                fieldType: ft,
                uri: `ng-forge://schemas/${uiIntegration}/${ft}`,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Individual field type schema
  server.resource('Field Schema', 'ng-forge://schemas/{uiIntegration}/{fieldType}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/schemas\/([^/]+)\/([^/]+)$/);
    const uiIntegration = match?.[1];
    const fieldType = match?.[2];

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

    if (!fieldType || !isValidFieldType(fieldType)) {
      const validTypes = getSupportedFieldTypes();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Invalid field type: ${fieldType}. Valid options: ${validTypes.join(', ')}`,
          },
        ],
      };
    }

    const schema = getFieldTypeJsonSchema(uiIntegration, fieldType);

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
