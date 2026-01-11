/**
 * Validators Resource
 *
 * Exposes available ng-forge validators and their configurations.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getValidators, getValidator, getValidatorsByCategory } from '../registry/index.js';

export function registerValidatorsResource(server: McpServer): void {
  // List all validators
  server.resource('ng-forge Validators', 'ng-forge://validators', async () => {
    const validators = getValidators();
    return {
      contents: [
        {
          uri: 'ng-forge://validators',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description: 'Available ng-forge form validators',
              shorthandValidators: [
                'required: boolean - Mark field as mandatory',
                'email: boolean - Validate email format',
                'min: number - Minimum numeric value',
                'max: number - Maximum numeric value',
                'minLength: number - Minimum string length',
                'maxLength: number - Maximum string length',
                'pattern: string | RegExp - Regex pattern validation',
              ],
              conditionalValidation: {
                description: 'Validators can be conditional using the when property',
                example: `{
  type: 'required',
  when: {
    expression: 'formValue.needsValidation === true'
  }
}`,
              },
              categories: {
                'built-in': 'Standard validators using Angular built-in validators',
                custom: 'Custom synchronous validators using functions or expressions',
                async: 'Asynchronous validators returning Observables',
                http: 'HTTP-based validators with automatic request cancellation',
              },
              validators: validators.map((v) => ({
                type: v.type,
                category: v.category,
                description: v.description,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Get specific validator details
  server.resource('Validator Details', 'ng-forge://validators/{type}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/validators\/(.+)/);
    const typeName = match?.[1];

    if (!typeName) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'Validator type not specified in URI',
          },
        ],
      };
    }

    const validator = getValidator(typeName);

    if (!validator) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Validator type '${typeName}' not found. Available types: ${getValidators()
              .map((v) => v.type)
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
          text: JSON.stringify(validator, null, 2),
        },
      ],
    };
  });

  // Get validators by category
  server.resource('Validators by Category', 'ng-forge://validators/category/{category}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/validators\/category\/(.+)/);
    const category = match?.[1] as 'built-in' | 'custom' | 'async' | 'http';

    if (!category || !['built-in', 'custom', 'async', 'http'].includes(category)) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'Valid categories: built-in, custom, async, http',
          },
        ],
      };
    }

    const validators = getValidatorsByCategory(category);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              category,
              validators,
            },
            null,
            2,
          ),
        },
      ],
    };
  });
}
