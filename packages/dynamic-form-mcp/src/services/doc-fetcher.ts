/**
 * Documentation Fetcher Service
 *
 * Fetches and caches live documentation from ng-forge.com.
 * Uses native fetch (Node >=20) with in-memory caching and TTL.
 *
 * Fetches:
 * - llms.txt: Documentation index
 * - llms-full.txt: Full documentation content, parsed into sections
 */

const BASE_URL = 'https://ng-forge.com/dynamic-forms';
const LLMS_TXT_URL = `${BASE_URL}/llms.txt`;
const LLMS_FULL_TXT_URL = `${BASE_URL}/llms-full.txt`;
const FETCH_TIMEOUT_MS = 10_000;

/** Default cache TTL: 10 minutes */
const DEFAULT_TTL_MS = 10 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let indexCache: CacheEntry<string> | null = null;
let sectionsCache: CacheEntry<Map<string, string>> | null = null;
let cacheTtlMs = DEFAULT_TTL_MS;

function isFresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return entry !== null && Date.now() - entry.timestamp < cacheTtlMs;
}

async function fetchWithTimeout(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
}

function parseSections(raw: string): Map<string, string> {
  const sections = new Map<string, string>();
  const sectionRegex = /^--- (.+?) ---$/gm;
  const matches = [...raw.matchAll(sectionRegex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const path = match[1];
    const startIndex = (match.index ?? 0) + match[0].length;
    const nextMatch = matches[i + 1];
    const endIndex = nextMatch ? (nextMatch.index ?? raw.length) : raw.length;
    const content = raw.slice(startIndex, endIndex).trim();

    if (content) {
      sections.set(path, content);
    }
  }

  return sections;
}

/**
 * Fetch the llms.txt documentation index.
 * Returns null if fetch fails.
 */
export async function fetchDocIndex(): Promise<string | null> {
  if (isFresh(indexCache)) {
    return indexCache.data;
  }

  const text = await fetchWithTimeout(LLMS_TXT_URL);
  if (text) {
    indexCache = { data: text, timestamp: Date.now() };
  }
  return text;
}

/**
 * Fetch all documentation sections from llms-full.txt.
 * Returns null if fetch fails.
 */
export async function fetchAllSections(): Promise<Map<string, string> | null> {
  if (isFresh(sectionsCache)) {
    return sectionsCache.data;
  }

  const raw = await fetchWithTimeout(LLMS_FULL_TXT_URL);
  if (!raw) {
    return null;
  }

  const sections = parseSections(raw);
  sectionsCache = { data: sections, timestamp: Date.now() };
  return sections;
}

/**
 * Fetch a specific documentation section by path.
 * Returns null if fetch fails or section not found.
 */
export async function fetchDocSection(path: string): Promise<string | null> {
  const sections = await fetchAllSections();
  return sections?.get(path) ?? null;
}

/**
 * Clear all caches. Useful for testing or forcing a refresh.
 */
export function clearCache(): void {
  indexCache = null;
  sectionsCache = null;
}

/**
 * Set cache TTL in milliseconds.
 */
export function setCacheTtl(ttlMs: number): void {
  cacheTtlMs = ttlMs;
}
