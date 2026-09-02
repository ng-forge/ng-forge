/**
 * `container` must be reachable without already knowing its name.
 *
 * Exact lookup worked from the day the type was registered, because unknown
 * topics fall through to the field-type registry. Every surface an agent uses to
 * FIND a type — the topic list, the tool description, the search index, the
 * container overview — was a hand-maintained list that nobody extended, so the
 * type was effectively invisible unless you already knew to ask for it.
 *
 * These tests pin discoverability rather than the wording of any one entry.
 */

import { describe, it, expect } from 'vitest';
import { TOPICS, TOPIC_DESCRIPTIONS } from './data/lookup-topics.js';
import { getFieldTypesByCategory } from '../registry/index.js';

const CONTAINER_TYPES = getFieldTypesByCategory('container').map((f) => f.type);

describe('container is discoverable', () => {
  it('is registered as a container field type', () => {
    expect(CONTAINER_TYPES).toContain('container');
  });

  it('has a topic description, so the topic list renders it with text', () => {
    // formatTopicItem falls back to a bare bullet when the description is
    // missing, which is how `container` would have looked even once listed.
    for (const type of CONTAINER_TYPES) {
      expect(TOPIC_DESCRIPTIONS[type] || TOPICS[type], `${type} has neither a description nor a topic`).toBeTruthy();
    }
  });

  it('names every container type in the overview, with its value handling', () => {
    const overview = TOPICS['containers'];
    expect(overview, 'the containers overview topic should exist').toBeTruthy();

    for (const type of CONTAINER_TYPES) {
      expect(overview.full, `containers overview omits "${type}"`).toContain(`| ${type} `);
    }
  });

  it('tells an agent that a container and a group are not interchangeable', () => {
    // The remediation for a missing `wrappers` used to say a container without
    // it "is just a group", which invites a swap that silently reshapes the
    // submitted value: container flattens, group nests under its own key.
    const overview = TOPICS['containers'].full;

    expect(overview).toMatch(/flatten/i);
    expect(overview).toMatch(/nest/i);
    expect(overview, 'the overview should show the resulting value shapes').toContain('billing');
  });

  it('does not claim rows accept nested rows or hidden fields', () => {
    // The validator rejects both. The overview used to list them as allowed.
    const rowLine = TOPICS['containers'].full.split('\n').find((l) => l.startsWith('| row '));

    expect(rowLine).toBeTruthy();
    expect(rowLine, 'row must not be advertised as accepting nested rows/hidden').toMatch(/NOT pages, nested rows, hidden/);
  });
});
