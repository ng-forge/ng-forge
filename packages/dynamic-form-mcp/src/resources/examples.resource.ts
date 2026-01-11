/**
 * Examples Resource
 *
 * Provides curated FormConfig examples for common use cases.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import examplesData from '../registry/examples.json' with { type: 'json' };

interface FormConfigExample {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Record<string, unknown>;
}

const examples = examplesData as FormConfigExample[];

function getExample(id: string): FormConfigExample | undefined {
  return examples.find((e) => e.id === id);
}

function getExamplesByCategory(category: string): FormConfigExample[] {
  return examples.filter((e) => e.category === category);
}

export function registerExamplesResource(server: McpServer): void {
  // List all examples
  server.resource('Curated FormConfig Examples', 'ng-forge://examples', async () => {
    const categories = [...new Set(examples.map((e) => e.category))];

    return {
      contents: [
        {
          uri: 'ng-forge://examples',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description: 'Curated ng-forge FormConfig examples for common use cases',
              totalExamples: examples.length,
              categories: categories.map((cat) => ({
                name: cat,
                examples: examples
                  .filter((e) => e.category === cat)
                  .map((e) => ({
                    id: e.id,
                    name: e.name,
                    description: e.description,
                    uri: `ng-forge://examples/${e.id}`,
                  })),
              })),
              usage: 'Access specific examples via ng-forge://examples/{example-id}',
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Get specific example
  server.resource('FormConfig Example', 'ng-forge://examples/{id}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/examples\/(.+)/);
    const exampleId = match?.[1];

    if (!exampleId) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'Example ID not specified. Available examples: ' + examples.map((e) => e.id).join(', '),
          },
        ],
      };
    }

    // Check if it's a category request
    const categoryExamples = getExamplesByCategory(exampleId);
    if (categoryExamples.length > 0 && !getExample(exampleId)) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                category: exampleId,
                examples: categoryExamples.map((e) => ({
                  id: e.id,
                  name: e.name,
                  description: e.description,
                  config: e.config,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const example = getExample(exampleId);

    if (!example) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Example '${exampleId}' not found. Available examples: ${examples.map((e) => e.id).join(', ')}`,
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
              id: example.id,
              name: example.name,
              description: example.description,
              category: example.category,
              config: example.config,
            },
            null,
            2,
          ),
        },
      ],
    };
  });
}
