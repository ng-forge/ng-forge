/**
 * Structural lint for the published skill.
 *
 * Asserts Anthropic's skill-authoring checklist mechanically, so the things
 * that silently degrade an agent's ability to use a skill (a vague trigger, a
 * dead reference link, a long file with no contents index) fail in CI instead
 * of being noticed months later.
 *
 * https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'dynamic-forms');
const REFERENCES_DIR = join(SKILL_DIR, 'references');

/** Anthropic's documented limits. */
const MAX_SKILL_BODY_LINES = 500;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const TOC_LINE_THRESHOLD = 100;

let skillMd: string;
let frontmatter: Record<string, string>;
let body: string;
let referenceFiles: string[];

/** Minimal YAML front matter reader: flat `key: value` pairs only. */
function parseFrontmatter(source: string): { frontmatter: Record<string, string>; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source);
  if (!match) {
    throw new Error('SKILL.md has no YAML front matter');
  }

  const fields: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) {
      fields[kv[1]] = kv[2].trim();
    }
  }

  return { frontmatter: fields, body: match[2] };
}

beforeAll(async () => {
  skillMd = await readFile(join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  ({ frontmatter, body } = parseFrontmatter(skillMd));
  referenceFiles = (await readdir(REFERENCES_DIR)).filter((f) => f.endsWith('.md'));
});

describe('frontmatter', () => {
  it('declares a name and a description', () => {
    expect(frontmatter.name).toBeTruthy();
    expect(frontmatter.description).toBeTruthy();
  });

  it('uses a name that satisfies the platform constraints', () => {
    expect(frontmatter.name.length).toBeLessThanOrEqual(MAX_NAME_LENGTH);
    expect(frontmatter.name).toMatch(/^[a-z0-9-]+$/);
  });

  it('avoids reserved words in the name', () => {
    expect(frontmatter.name).not.toMatch(/anthropic|claude/i);
  });

  it('keeps the description within the platform limit', () => {
    expect(frontmatter.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });

  it('writes the description in third person', () => {
    // First and second person break skill discovery, because the description
    // is injected into the system prompt alongside every other skill's.
    expect(frontmatter.description).not.toMatch(/\b(I can|I will|you can use this|use me to)\b/i);
  });

  it('says both what the skill does and when to use it', () => {
    expect(frontmatter.description).toMatch(/\buse when\b/i);
  });

  it('includes trigger terms a user would actually type', () => {
    const description = frontmatter.description.toLowerCase();
    for (const term of ['form', 'validation', 'angular']) {
      expect(description, `description is missing the trigger term "${term}"`).toContain(term);
    }
  });
});

describe('body', () => {
  it('stays under the documented line budget', () => {
    expect(body.split('\n').length).toBeLessThanOrEqual(MAX_SKILL_BODY_LINES);
  });

  it('tells the agent to verify its own output', () => {
    expect(body).toContain('dynamic-forms-cli');
  });

  it('states the library version it documents', () => {
    expect(body).toMatch(/\d+\.\d+\.\d+/);
  });
});

describe('references', () => {
  it('ships the expected reference files', () => {
    expect(referenceFiles.sort()).toEqual(['field-types.md', 'patterns.md', 'pitfalls.md', 'rules.md']);
  });

  it('links every reference file from SKILL.md', () => {
    for (const file of referenceFiles) {
      expect(skillMd, `references/${file} is never linked from SKILL.md`).toContain(`references/${file}`);
    }
  });

  it('has no dead reference links in SKILL.md', () => {
    const linked = [...skillMd.matchAll(/references\/([\w.-]+\.md)/g)].map((m) => m[1]);
    expect(linked.length).toBeGreaterThan(0);

    for (const target of new Set(linked)) {
      expect(referenceFiles, `SKILL.md links references/${target}, which does not exist`).toContain(target);
    }
  });

  it('keeps references one level deep', async () => {
    // Claude partially reads files reached through a chain, so a reference
    // that points at another reference can be read incompletely.
    for (const file of referenceFiles) {
      const contents = await readFile(join(REFERENCES_DIR, file), 'utf-8');
      expect(contents, `references/${file} points at another reference file`).not.toMatch(/\]\(\.?\/?references\//);
    }
  });

  it('gives long reference files a contents index', async () => {
    for (const file of referenceFiles) {
      const contents = await readFile(join(REFERENCES_DIR, file), 'utf-8');
      if (contents.split('\n').length <= TOC_LINE_THRESHOLD) continue;

      const hasHeadingToc = contents.includes('## Contents');
      const hasLinkedTable = /^\| \[`/m.test(contents);

      expect(hasHeadingToc || hasLinkedTable, `references/${file} is long but has no contents index`).toBe(true);
    }
  });

  it('uses forward slashes in every path it mentions', () => {
    expect(skillMd).not.toMatch(/[\w-]+\\[\w-]+\.md/);
  });
});
