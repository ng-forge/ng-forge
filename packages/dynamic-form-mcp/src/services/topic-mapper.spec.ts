/**
 * Topic Mapper Tests
 *
 * Tests for the topic-to-section mapper that maps MCP topics
 * to llms-full.txt section paths.
 */

import { describe, it, expect } from 'vitest';
import { getTopicSections, isMcpOnlyTopic } from './topic-mapper.js';

describe('Topic Mapper', () => {
  describe('getTopicSections', () => {
    it('returns section paths for mapped field type topics', () => {
      const result = getTopicSections('input');

      expect(result).toEqual(['schema-fields/field-types']);
    });

    it('returns section paths for mapped container topics', () => {
      const result = getTopicSections('group');

      expect(result).toEqual(['prebuilt/form-groups']);
    });

    it('returns multiple paths for multi-section topics', () => {
      const result = getTopicSections('array');

      expect(result).toHaveLength(2);
      expect(result).toEqual(['prebuilt/form-arrays/simplified', 'prebuilt/form-arrays/complete']);
    });

    it('returns simplified-array section path', () => {
      const result = getTopicSections('simplified-array');

      expect(result).toEqual(['prebuilt/form-arrays/simplified']);
    });

    it('returns section paths for concept topics', () => {
      const result = getTopicSections('validation');

      expect(result).toEqual(['validation/basics']);
    });

    it('returns null for MCP-only topics', () => {
      expect(getTopicSections('golden-path')).toBeNull();
      expect(getTopicSections('pitfalls')).toBeNull();
      expect(getTopicSections('workflow')).toBeNull();
      expect(getTopicSections('field-placement')).toBeNull();
      expect(getTopicSections('logic-matrix')).toBeNull();
      expect(getTopicSections('context-api')).toBeNull();
      expect(getTopicSections('multi-page-gotchas')).toBeNull();
      expect(getTopicSections('array-buttons')).toBeNull();
    });

    it('returns undefined for unknown topics', () => {
      expect(getTopicSections('nonexistent-topic')).toBeUndefined();
    });
  });

  describe('isMcpOnlyTopic', () => {
    it('returns true for MCP-only topics', () => {
      expect(isMcpOnlyTopic('golden-path')).toBe(true);
      expect(isMcpOnlyTopic('pitfalls')).toBe(true);
      expect(isMcpOnlyTopic('workflow')).toBe(true);
    });

    it('returns false for mapped topics', () => {
      expect(isMcpOnlyTopic('input')).toBe(false);
      expect(isMcpOnlyTopic('validation')).toBe(false);
      expect(isMcpOnlyTopic('array')).toBe(false);
    });

    it('returns false for unknown topics', () => {
      expect(isMcpOnlyTopic('nonexistent')).toBe(false);
    });
  });
});
