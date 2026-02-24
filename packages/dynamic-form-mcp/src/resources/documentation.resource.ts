/**
 * Documentation Resource
 *
 * Exposes ng-forge documentation as links to the online docs site.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getDocPages, getDocPage, getDocPagesByCategory } from '../registry/index.js';

export function registerDocumentationResource(server: McpServer): void {
  // List all documentation topics with their online URLs
  server.resource('ng-forge Documentation', 'ng-forge://docs', async () => {
    const docs = getDocPages();
    const categories = [...new Set(docs.map((d) => d.category))];

    return {
      contents: [
        {
          uri: 'ng-forge://docs',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description: 'ng-forge dynamic forms documentation — links to online docs at ng-forge.com',
              docsHome: 'https://ng-forge.com/dynamic-forms/',
              llmsTxt: 'https://ng-forge.com/dynamic-forms/llms.txt',
              totalTopics: docs.length,
              categories: categories.map((cat) => ({
                name: cat,
                topics: docs
                  .filter((d) => d.category === cat)
                  .map((d) => ({
                    id: d.id,
                    title: d.title,
                    url: d.url,
                  })),
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Get specific documentation topic URL
  server.resource('Documentation Topic', 'ng-forge://docs/{topic}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/docs\/(.+)/);
    const topicId = match?.[1];

    if (!topicId) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text:
              'Topic not specified. Available topics: ' +
              getDocPages()
                .map((d) => d.id)
                .join(', '),
          },
        ],
      };
    }

    // Check if it's a category request
    const categoryDocs = getDocPagesByCategory(topicId);
    if (categoryDocs.length > 0 && !getDocPage(topicId)) {
      const lines = categoryDocs.map((d) => `- [${d.title}](${d.url})`);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: `# ${topicId}\n\n${lines.join('\n')}`,
          },
        ],
      };
    }

    const doc = getDocPage(topicId);

    if (!doc) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Topic '${topicId}' not found. Available topics: ${getDocPages()
              .map((d) => d.id)
              .join(', ')}`,
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: `# ${doc.title}\n\nDocumentation: ${doc.url}`,
        },
      ],
    };
  });
}
