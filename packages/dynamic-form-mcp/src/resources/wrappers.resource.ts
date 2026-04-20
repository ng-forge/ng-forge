/**
 * Wrappers Resource
 *
 * Exposes registered ng-forge wrappers (field decorators). Includes the built-in
 * core wrappers plus demo wrappers shipped with the examples-shared-ui package.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getWrappers, getWrapper, getWrappersByCategory, WRAPPER_AUTHORING_CONTRACT } from '../registry/index.js';

export function registerWrappersResource(server: McpServer): void {
  // List all wrappers
  server.resource('ng-forge Wrappers', 'ng-forge://wrappers', async () => {
    const wrappers = getWrappers();
    return {
      contents: [
        {
          uri: 'ng-forge://wrappers',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description:
                'Available ng-forge field wrappers. Wrappers decorate the rendered output of a field or container without changing form data. Compose via `wrappers: [{ type: "...", ...props }]`.',
              categories: {
                core: 'Ships from @ng-forge/dynamic-forms — always importable.',
                demo: 'Ships from @internal/examples-shared-ui for the docs sandbox — NOT a library primitive.',
                adapter: 'Ships from a UI adapter library (reserved).',
              },
              authoringContract: WRAPPER_AUTHORING_CONTRACT,
              wrappers: wrappers.map((w) => ({
                type: w.type,
                category: w.category,
                availability: w.availability,
                package: w.package,
                description: w.description,
                autoAppliesTo: w.autoAppliesTo,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Get specific wrapper details
  server.resource('Wrapper Details', 'ng-forge://wrappers/{type}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/wrappers\/(.+)/);
    const typeName = match?.[1];

    if (!typeName) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'Wrapper type not specified in URI',
          },
        ],
      };
    }

    const wrapper = getWrapper(typeName);

    if (!wrapper) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Wrapper type '${typeName}' not found. Available types: ${getWrappers()
              .map((w) => w.type)
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
          text: JSON.stringify(wrapper, null, 2),
        },
      ],
    };
  });

  // Get wrappers by category
  server.resource('Wrappers by Category', 'ng-forge://wrappers/category/{category}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/wrappers\/category\/(.+)/);
    const category = match?.[1] as 'core' | 'demo' | 'adapter';

    if (!category || !['core', 'demo', 'adapter'].includes(category)) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'Valid categories: core, demo, adapter',
          },
        ],
      };
    }

    const wrappers = getWrappersByCategory(category);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              category,
              wrappers,
            },
            null,
            2,
          ),
        },
      ],
    };
  });
}
