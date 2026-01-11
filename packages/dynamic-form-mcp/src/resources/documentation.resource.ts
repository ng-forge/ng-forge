/**
 * Documentation Resource
 *
 * Exposes ng-forge library documentation from generated docs.json.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getDocs, getDoc, getDocsByCategory } from '../registry/index.js';

export function registerDocumentationResource(server: McpServer): void {
  // List all documentation topics
  server.resource('ng-forge Documentation', 'ng-forge://docs', async () => {
    const docs = getDocs();
    const categories = [...new Set(docs.map((d) => d.category))];

    return {
      contents: [
        {
          uri: 'ng-forge://docs',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              description: 'ng-forge dynamic forms documentation',
              totalTopics: docs.length,
              categories: categories.map((cat) => ({
                name: cat,
                topics: docs
                  .filter((d) => d.category === cat)
                  .map((d) => ({
                    id: d.id,
                    title: d.title,
                    uri: `ng-forge://docs/${d.id}`,
                  })),
              })),
              usage: 'Access specific topics via ng-forge://docs/{topic-id}',
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Get specific documentation topic
  server.resource('Documentation Topic', 'ng-forge://docs/{topic}', async (uri: URL) => {
    const match = uri.href.match(/ng-forge:\/\/docs\/(.+)/);
    const topicId = match?.[1];

    if (!topicId) {
      const docs = getDocs();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: 'Topic not specified. Available topics: ' + docs.map((d) => d.id).join(', '),
          },
        ],
      };
    }

    // Check if it's a category request
    const categoryDocs = getDocsByCategory(topicId);
    if (categoryDocs.length > 0 && !getDoc(topicId)) {
      // Return all docs in this category
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: categoryDocs.map((d) => `# ${d.title}\n\n${d.content}`).join('\n\n---\n\n'),
          },
        ],
      };
    }

    const doc = getDoc(topicId);

    if (!doc) {
      const docs = getDocs();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Topic '${topicId}' not found. Available topics: ${docs.map((d) => d.id).join(', ')}`,
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: `# ${doc.title}\n\n${doc.content}`,
        },
      ],
    };
  });
}
