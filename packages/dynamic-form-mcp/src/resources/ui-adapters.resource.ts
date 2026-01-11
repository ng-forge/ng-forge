/**
 * UI Adapters Resource
 *
 * Exposes UI library-specific field configurations for Material, Bootstrap, PrimeNG, and Ionic.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getUIAdapters, getUIAdapter } from '../registry/index.js';

export function registerUIAdaptersResource(server: McpServer): void {
  // List all UI adapters
  server.resource('ng-forge UI Adapters', 'ng-forge://ui-adapters', async () => {
    const adapters = getUIAdapters();
    return {
      contents: [
        {
          uri: 'ng-forge://ui-adapters',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description: 'Available UI library adapters for ng-forge dynamic forms',
              adapters: adapters.map((a) => ({
                library: a.library,
                package: a.package,
                providerFunction: a.providerFunction,
                fieldTypeCount: a.fieldTypes.length,
              })),
              usage: `
// Installation
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-{library}

// Configuration in app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withMaterialFields()),
  ],
};
`,
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Get specific UI adapter details
  server.resource('UI Adapter Details', 'ng-forge://ui-adapters/{library}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/ui-adapters\/(.+)/);
    const library = match?.[1] as 'material' | 'bootstrap' | 'primeng' | 'ionic';

    if (!library) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'UI library not specified in URI',
          },
        ],
      };
    }

    const adapter = getUIAdapter(library);

    if (!adapter) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `UI adapter '${library}' not found. Available adapters: material, bootstrap, primeng, ionic`,
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              ...adapter,
              installation: `npm install ${adapter.package}`,
              configuration: `
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { ${adapter.providerFunction.replace('()', '')} } from '${adapter.package}';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...${adapter.providerFunction}),
  ],
};
`,
            },
            null,
            2,
          ),
        },
      ],
    };
  });
}
