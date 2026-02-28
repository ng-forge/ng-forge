/**
 * Documentation Resource
 *
 * Exposes ng-forge documentation as MCP resources.
 * Fetches live content from ng-forge.com with fallback to static links.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getDocPages, getDocPage, getDocPagesByCategory } from '../registry/index.js';
import { fetchDocIndex, fetchAllSections } from '../services/doc-fetcher.js';

export function registerDocumentationResource(server: McpServer): void {
  // List all documentation topics — live llms.txt with fallback to static index
  server.resource('ng-forge Documentation', 'ng-forge://docs', async () => {
    // Try fetching live llms.txt first
    const liveIndex = await fetchDocIndex();

    if (liveIndex) {
      return {
        contents: [
          {
            uri: 'ng-forge://docs',
            mimeType: 'text/markdown',
            text: liveIndex,
          },
        ],
      };
    }

    // Fallback to static documentation listing
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

  // Get specific documentation topic — live content with fallback to URL reference
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

    // Try fetching live section content from llms-full.txt
    const sections = await fetchAllSections();
    if (sections) {
      // Try exact match first, then partial match
      const liveContent = sections.get(topicId) ?? findSectionByPartialMatch(sections, topicId);
      if (liveContent) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'text/markdown',
              text: liveContent,
            },
          ],
        };
      }
    }

    // Fallback: check if it's a category request
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

    // Fallback: static doc page reference
    const doc = getDocPage(topicId);
    if (doc) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: `# ${doc.title}\n\nDocumentation: ${doc.url}`,
          },
        ],
      };
    }

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
  });
}

/**
 * Find a section by partial path match (e.g., "validation" matches "validation/basics").
 * Returns concatenated content of all matching sections.
 */
function findSectionByPartialMatch(sections: Map<string, string>, query: string): string | null {
  const matches: string[] = [];
  const normalizedQuery = query.toLowerCase();

  for (const [path, content] of sections) {
    if (path.toLowerCase().includes(normalizedQuery)) {
      matches.push(content);
    }
  }

  return matches.length > 0 ? matches.join('\n\n---\n\n') : null;
}
