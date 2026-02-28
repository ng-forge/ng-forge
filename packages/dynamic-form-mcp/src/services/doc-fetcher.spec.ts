/**
 * Doc Fetcher Tests
 *
 * Tests for the documentation fetcher service that retrieves
 * and caches live documentation from ng-forge.com.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchDocIndex, fetchAllSections, fetchDocSection, clearCache, setCacheTtl } from './doc-fetcher.js';

describe('Doc Fetcher', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
    clearCache();
    setCacheTtl(10 * 60 * 1000); // Reset to default
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mockResponse(text: string, ok = true): Response {
    return {
      ok,
      text: () => Promise.resolve(text),
    } as unknown as Response;
  }

  describe('fetchDocIndex', () => {
    it('returns content from llms.txt on success', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse('# Doc Index\nSome content'));

      const result = await fetchDocIndex();

      expect(result).toBe('# Doc Index\nSome content');
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch.mock.calls[0][0]).toContain('llms.txt');
    });

    it('returns null on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchDocIndex();

      expect(result).toBeNull();
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse('', false));

      const result = await fetchDocIndex();

      expect(result).toBeNull();
    });

    it('caches result and does not re-fetch within TTL', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse('cached content'));

      const first = await fetchDocIndex();
      const second = await fetchDocIndex();

      expect(first).toBe('cached content');
      expect(second).toBe('cached content');
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it('re-fetches after cache expires', async () => {
      setCacheTtl(0); // Expire immediately
      mockFetch.mockResolvedValueOnce(mockResponse('first'));
      mockFetch.mockResolvedValueOnce(mockResponse('second'));

      const first = await fetchDocIndex();
      const second = await fetchDocIndex();

      expect(first).toBe('first');
      expect(second).toBe('second');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchAllSections', () => {
    it('parses sections from llms-full.txt format', async () => {
      const content = [
        '--- schema-fields/field-types ---',
        'Field types content here',
        '--- validation/basics ---',
        'Validation content here',
      ].join('\n');
      mockFetch.mockResolvedValueOnce(mockResponse(content));

      const result = await fetchAllSections();

      expect(result).toBeInstanceOf(Map);
      expect(result!.size).toBe(2);
      expect(result!.get('schema-fields/field-types')).toBe('Field types content here');
      expect(result!.get('validation/basics')).toBe('Validation content here');
    });

    it('returns null on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchAllSections();

      expect(result).toBeNull();
    });

    it('caches parsed sections', async () => {
      const content = '--- path/one ---\nContent one';
      mockFetch.mockResolvedValueOnce(mockResponse(content));

      const first = await fetchAllSections();
      const second = await fetchAllSections();

      expect(first).toBe(second);
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it('handles multiple sections correctly', async () => {
      const content = ['--- section/a ---', 'Content A', '--- section/b ---', 'Content B', '--- section/c ---', 'Content C'].join('\n');
      mockFetch.mockResolvedValueOnce(mockResponse(content));

      const result = await fetchAllSections();

      expect(result!.size).toBe(3);
      expect(result!.get('section/a')).toBe('Content A');
      expect(result!.get('section/b')).toBe('Content B');
      expect(result!.get('section/c')).toBe('Content C');
    });

    it('skips empty sections', async () => {
      const content = ['--- section/a ---', 'Content A', '--- section/empty ---', '', '--- section/b ---', 'Content B'].join('\n');
      mockFetch.mockResolvedValueOnce(mockResponse(content));

      const result = await fetchAllSections();

      expect(result!.has('section/empty')).toBe(false);
      expect(result!.size).toBe(2);
    });
  });

  describe('fetchDocSection', () => {
    it('returns specific section by path', async () => {
      const content = ['--- target/path ---', 'Target content', '--- other/path ---', 'Other content'].join('\n');
      mockFetch.mockResolvedValueOnce(mockResponse(content));

      const result = await fetchDocSection('target/path');

      expect(result).toBe('Target content');
    });

    it('returns null for unknown section path', async () => {
      const content = '--- known/path ---\nKnown content';
      mockFetch.mockResolvedValueOnce(mockResponse(content));

      const result = await fetchDocSection('unknown/path');

      expect(result).toBeNull();
    });

    it('returns null when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchDocSection('any/path');

      expect(result).toBeNull();
    });
  });

  describe('timeout behavior', () => {
    it('returns null when fetch is aborted', async () => {
      mockFetch.mockImplementationOnce(() => {
        const error = new DOMException('The operation was aborted', 'AbortError');
        return Promise.reject(error);
      });

      const result = await fetchDocIndex();

      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('forces re-fetch after clearing', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse('first'));
      mockFetch.mockResolvedValueOnce(mockResponse('second'));

      const first = await fetchDocIndex();
      clearCache();
      const second = await fetchDocIndex();

      expect(first).toBe('first');
      expect(second).toBe('second');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
