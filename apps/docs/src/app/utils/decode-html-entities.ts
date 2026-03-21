/** Common HTML entity map for decoding markup back to plain text. */
const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const ENTITY_PATTERN = /&(?:amp|lt|gt|quot|#39);/g;

/** Decode HTML entities in a single pass to avoid double-unescaping. */
export function decodeHtmlEntities(text: string): string {
  return text.replace(ENTITY_PATTERN, (entity) => ENTITY_MAP[entity] ?? entity);
}
