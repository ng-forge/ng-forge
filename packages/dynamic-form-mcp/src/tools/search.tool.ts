/**
 * Unified Search Tool
 *
 * Free-text keyword search across all TOPICS and PATTERNS.
 * Bridges the discoverability gap — find content without knowing exact topic names.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TOPICS, TOPIC_ALIASES, TOPIC_DESCRIPTIONS } from './data/lookup-topics.js';
import { PATTERNS } from './examples.tool.js';

interface SearchEntry {
  id: string;
  category: 'topic' | 'pattern';
  subcategory: string;
  description: string;
  aliases: string[];
  /** Lowercased searchable content (description + brief content) */
  content: string;
  /** Tool call string */
  toolCall: string;
}

let searchIndex: SearchEntry[] | null = null;

/**
 * Categorize a topic key into a subcategory for display.
 */
function getTopicSubcategory(key: string): string {
  const fieldTypes = ['input', 'select', 'slider', 'radio', 'checkbox', 'textarea', 'datepicker', 'toggle', 'text', 'hidden'];
  const containers = ['group', 'row', 'array', 'simplified-array', 'page'];
  const concepts = [
    'validation',
    'validation-messages',
    'conditional',
    'derivation',
    'property-derivation',
    'options-format',
    'expression-variables',
    'async-validators',
    'buttons',
    'external-data',
  ];

  if (fieldTypes.includes(key)) return 'Field Type';
  if (containers.includes(key)) return 'Container';
  if (concepts.includes(key)) return 'Concept';
  return 'Pattern';
}

/**
 * Build the search index from TOPICS and PATTERNS.
 */
function buildIndex(): SearchEntry[] {
  if (searchIndex) return searchIndex;

  const entries: SearchEntry[] = [];

  // Build reverse alias map: topic -> aliases
  const aliasMap: Record<string, string[]> = {};
  for (const [alias, target] of Object.entries(TOPIC_ALIASES)) {
    if (!aliasMap[target]) aliasMap[target] = [];
    aliasMap[target].push(alias);
  }

  // Index TOPICS
  for (const key of Object.keys(TOPICS)) {
    const topic = TOPICS[key];
    const description = TOPIC_DESCRIPTIONS[key] || '';
    const aliases = aliasMap[key] || [];

    entries.push({
      id: key,
      category: 'topic',
      subcategory: getTopicSubcategory(key),
      description,
      aliases,
      content: `${description} ${topic.brief}`.toLowerCase(),
      toolCall: `ngforge_lookup topic="${key}"`,
    });
  }

  // Index PATTERNS
  for (const [key, pattern] of Object.entries(PATTERNS)) {
    entries.push({
      id: key,
      category: 'pattern',
      subcategory: 'Example',
      description: pattern.description,
      aliases: [],
      content: `${pattern.description} ${pattern.brief}`.toLowerCase(),
      toolCall: `ngforge_examples pattern="${key}"`,
    });
  }

  searchIndex = entries;
  return entries;
}

/**
 * Score a search entry against query tokens.
 */
function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  let score = 0;
  const idLower = entry.id.toLowerCase();

  for (const token of tokens) {
    // Exact ID match
    if (idLower === token) {
      score += 10;
    } else if (idLower.includes(token)) {
      score += 6;
    }

    // Alias exact match
    for (const alias of entry.aliases) {
      const aliasLower = alias.toLowerCase();
      if (aliasLower === token) {
        score += 8;
      } else if (aliasLower.includes(token)) {
        score += 4;
      }
    }

    // Description match
    if (entry.description.toLowerCase().includes(token)) {
      score += 3;
    }

    // Content match (brief text)
    if (entry.content.includes(token)) {
      score += 1;
    }
  }

  return score;
}

/**
 * Format search results.
 */
function formatResults(results: Array<{ entry: SearchEntry; score: number }>): string {
  if (results.length === 0) {
    return `# No Results Found

Try broader terms or check available topics:
- \`ngforge_lookup topic="list"\` — all documentation topics
- \`ngforge_examples pattern="list"\` — all code examples

**Common searches:** validation, conditional, array, derivation, hidden, options, multi-page`;
  }

  const lines: string[] = ['# Search Results', ''];

  for (let i = 0; i < results.length; i++) {
    const { entry } = results[i];
    const categoryLabel = entry.category === 'topic' ? `Topic · ${entry.subcategory}` : `Example · ${entry.subcategory}`;

    lines.push(`${i + 1}. **${entry.id}** (${categoryLabel})`);
    lines.push(`   ${entry.description}`);
    lines.push(`   → \`${entry.toolCall}\``);
    lines.push('');
  }

  lines.push('---');
  lines.push('**Tip:** Use `ngforge_lookup topic="workflow"` for the recommended tool usage guide.');

  return lines.join('\n');
}

export function registerSearchTool(server: McpServer): void {
  server.tool(
    'ngforge_search',
    `SEARCH: Free-text keyword search across all documentation and examples - "Find topics about X"

Search by natural language or keywords. Returns matching topics and examples with direct tool calls.

Examples:
- "conditional required" → finds conditional logic and validation topics
- "array template" → finds simplified-array topic and minimal-array example
- "hide field" → finds conditional visibility documentation
- "options dropdown" → finds select field and options-format topics

Use this when you don't know the exact topic name.

New to ng-forge? Start with: ngforge_lookup topic="workflow"`,
    {
      query: z.string().describe('Natural language or keywords to search for'),
    },
    async ({ query }) => {
      const index = buildIndex();
      const tokens = query
        .toLowerCase()
        .split(/[\s,;.!?]+/)
        .filter((t) => t.length > 0);

      if (tokens.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: formatResults([]),
            },
          ],
        };
      }

      // Score all entries
      const scored = index
        .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return {
        content: [{ type: 'text' as const, text: formatResults(scored) }],
      };
    },
  );
}
