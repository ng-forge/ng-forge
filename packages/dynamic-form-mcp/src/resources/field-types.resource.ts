/**
 * Field Types Resource
 *
 * Exposes available ng-forge field types and their configurations.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getFieldTypes, getFieldType, getFieldTypesByCategory } from '../registry/index.js';

export function registerFieldTypesResource(server: McpServer): void {
  // List all field types
  server.resource('ng-forge Field Types', 'ng-forge://field-types', async () => {
    const fieldTypes = getFieldTypes();
    return {
      contents: [
        {
          uri: 'ng-forge://field-types',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description: 'Available ng-forge dynamic form field types',
              categories: {
                value: 'Fields that collect user input and contribute to form values',
                container: 'Layout and grouping containers for organizing fields',
                button: 'Action buttons for form interactions',
                display: 'Display-only elements for static content',
              },
              fieldTypes: fieldTypes.map((ft) => ({
                type: ft.type,
                category: ft.category,
                description: ft.description,
                valueType: ft.valueType,
                validationSupported: ft.validationSupported,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Get specific field type details
  server.resource('Field Type Details', 'ng-forge://field-types/{type}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/field-types\/(.+)/);
    const typeName = match?.[1];

    if (!typeName) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'Field type not specified in URI',
          },
        ],
      };
    }

    const fieldType = getFieldType(typeName);

    if (!fieldType) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Field type '${typeName}' not found. Available types: ${getFieldTypes()
              .map((ft) => ft.type)
              .join(', ')}`,
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(fieldType, null, 2),
        },
      ],
    };
  });

  // Get field types by category
  server.resource('Field Types by Category', 'ng-forge://field-types/category/{category}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/field-types\/category\/(.+)/);
    const category = match?.[1] as 'value' | 'container' | 'button' | 'display';

    if (!category || !['value', 'container', 'button', 'display'].includes(category)) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'Valid categories: value, container, button, display',
          },
        ],
      };
    }

    const fieldTypes = getFieldTypesByCategory(category);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              category,
              fieldTypes,
            },
            null,
            2,
          ),
        },
      ],
    };
  });
}
