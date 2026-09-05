/**
 * The catalogue is a published API surface: an id appears in a consumer's config
 * file, so these guard the properties that make that safe.
 */

import { describe, it, expect } from 'vitest';
import { RULES, RULE_IDS, UnknownRuleError, resolveDisabledRules, severityFor } from './catalogue';

describe('rule identifiers', () => {
  it('namespaces every id', () => {
    // The namespace says who owns the rule, and keeps an adapter or a
    // consumer's own plugin from colliding with core.
    for (const id of RULE_IDS) {
      expect(id, `${id} has no namespace`).toMatch(/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/);
    }
  });

  it('has no duplicates', () => {
    expect(new Set(RULE_IDS).size).toBe(RULE_IDS.length);
  });

  it('keys every entry by its own id', () => {
    // A mismatch would make a rule undisableable by the name it reports.
    for (const [key, rule] of Object.entries(RULES)) {
      expect(rule.id, `${key} is keyed by a different id`).toBe(key);
    }
  });

  it('gives every rule a summary and a reason', () => {
    // A reader deciding whether to switch a rule off needs to know what it
    // costs them. A rule with no `why` cannot be judged.
    for (const rule of Object.values(RULES)) {
      expect(rule.summary.length, `${rule.id} has no summary`).toBeGreaterThan(10);
      expect(rule.why.length, `${rule.id} has no reason`).toBeGreaterThan(30);
    }
  });

  it('holds no rule that the type system already enforces', () => {
    // The line that makes opting out coherent. A constraint the compiler
    // enforces cannot be disabled, because the config still would not build,
    // so it must never acquire an id.
    const typeDerived = ['container-no-label', 'template-required', 'label-forbidden', 'wrappers-required'];

    for (const id of RULE_IDS) {
      for (const derived of typeDerived) {
        expect(id, `${id} looks like a type-derived constraint`).not.toContain(derived);
      }
    }
  });
});

describe('resolveDisabledRules', () => {
  it('accepts ids that exist', () => {
    expect(resolveDisabledRules(['core/nesting'])).toEqual(new Set(['core/nesting']));
  });

  it('accepts an empty list', () => {
    expect(resolveDisabledRules([])).toEqual(new Set());
  });

  it('refuses an unknown id rather than ignoring it', () => {
    // Ignoring it leaves the user believing a rule is off when it is not,
    // which is worse than either state chosen deliberately.
    expect(() => resolveDisabledRules(['core/does-not-exist'])).toThrow(UnknownRuleError);
  });

  it('names the unknown id and lists what is valid', () => {
    expect(() => resolveDisabledRules(['core/typo'])).toThrow(/core\/typo/);
    expect(() => resolveDisabledRules(['core/typo'])).toThrow(/Known ids:/);
  });

  it('reports every unknown id at once', () => {
    // Fixing them one run at a time is a poor trade for a config file.
    expect(() => resolveDisabledRules(['core/a', 'core/b'])).toThrow(/core\/a, core\/b/);
  });
});

describe('severityFor', () => {
  it('is an error by default', () => {
    expect(severityFor('core/hidden-minimal', new Set())).toBe('error');
  });

  it('downgrades a disabled rule to a warning rather than silencing it', () => {
    // The consumer is usually an agent. A rule that vanishes teaches it
    // nothing; "this is off in your project" is something it can act on.
    expect(severityFor('core/hidden-minimal', new Set(['core/hidden-minimal']))).toBe('warning');
  });

  it('leaves other rules alone', () => {
    expect(severityFor('core/nesting', new Set(['core/hidden-minimal']))).toBe('error');
  });
});
