import { describe, expect, it } from 'vitest';
import { FIELD_TYPES } from './field-types';

function field(type: string) {
  const result = FIELD_TYPES.find((candidate) => candidate.type === type);
  if (!result) {
    throw new Error(`missing registry entry for ${type}`);
  }
  return result;
}

describe('container placement metadata', () => {
  it('agrees with every child entry about placement inside a container', () => {
    const container = field('container');

    for (const childType of container.canContain ?? []) {
      expect(field(childType).allowedIn, `${childType}.allowedIn must include container`).toContain('container');
    }
  });

  it('agrees with every parent entry about containing a container', () => {
    const container = field('container');
    const parents = (container.allowedIn ?? []).filter((parent) => parent !== 'top-level' && parent !== 'container');

    for (const parentType of parents) {
      expect(field(parentType).canContain, `${parentType}.canContain must include container`).toContain('container');
    }
  });
});
