/**
 * `container` as an accepted core field type.
 *
 * It was registered in `FieldRegistryContainers` and wired into core's
 * `BUILT_IN_FIELDS` with a component, a mapper and `valueHandling: 'flatten'`,
 * while the validation schemas rejected it as an unknown field type. TypeScript
 * accepted the config and the validator called it unknown, which sends an agent
 * to delete a legitimate container.
 *
 * Runtime support was established across all four adapters before this schema
 * changed, rather than inferred from the type registry.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig, type UiIntegration } from '../../../../validate/src';

const ADAPTERS: UiIntegration[] = ['material', 'bootstrap', 'primeng', 'ionic'];

const child = { key: 'email', type: 'input', label: 'Email' };

function messagesFor(config: unknown, ui: UiIntegration = 'material') {
  const result = validateFormConfig(ui, config);
  return { valid: result.valid, text: (result.errors ?? []).map((e) => e.message).join('\n') };
}

describe('container is accepted by every adapter', () => {
  it.each(ADAPTERS)('accepts a container with wrappers and children (%s)', (ui) => {
    const result = messagesFor({ fields: [{ key: 'chrome', type: 'container', wrappers: [], fields: [child] }] }, ui);

    expect(result.valid, result.text).toBe(true);
  });

  it.each(ADAPTERS)('accepts a container carrying a real wrapper config (%s)', (ui) => {
    const config = {
      fields: [{ key: 'chrome', type: 'container', wrappers: [{ type: 'css', cssClasses: 'chrome' }], fields: [child] }],
    };

    expect(messagesFor(config, ui).valid).toBe(true);
  });

  it.each(ADAPTERS)('accepts an empty container (%s)', (ui) => {
    expect(messagesFor({ fields: [{ key: 'chrome', type: 'container', wrappers: [], fields: [] }] }, ui).valid).toBe(true);
  });

  it.each(ADAPTERS)('reports container among the valid types when something else is unknown (%s)', (ui) => {
    const result = messagesFor({ fields: [{ key: 'a', type: 'acme-currency', label: 'A' }] }, ui);

    expect(result.text).toContain('Unknown field type "acme-currency"');
    expect(result.text, 'container should now be listed as valid').toContain('container');
  });
});

describe('wrappers is required, which is what makes it a container', () => {
  // Making the property optional would erase the distinction that justifies the
  // type. Note this is NOT the same as saying a container is a group: a
  // container flattens its children into the parent value, a group nests them
  // under its own key, so they are not substitutable.
  it.each(ADAPTERS)('rejects a container with no wrappers property (%s)', (ui) => {
    const result = messagesFor({ fields: [{ key: 'chrome', type: 'container', fields: [child] }] }, ui);

    expect(result.valid, 'a container without wrappers must not validate').toBe(false);
  });

  it('does not tell an agent to swap the container for a group', () => {
    // "a container without wrappers is just a group" invites exactly the wrong
    // fix. `container` is registered valueHandling 'flatten' and `group`
    // 'include', so the swap silently reshapes the submitted value and moves the
    // schema path validators run against.
    const result = messagesFor({ fields: [{ key: 'chrome', type: 'container', fields: [child] }] });

    expect(result.text).not.toMatch(/only thing a container adds/i);
    expect(result.text).not.toMatch(/just a group|group spelled differently/i);
    expect(result.text, 'the remediation should name the real difference').toMatch(/flatten/i);
    expect(result.text).toMatch(/schema path|value shape/i);
  });

  it.each(ADAPTERS)('names the missing property, since a generic message sends an agent to delete the field (%s)', (ui) => {
    // The reason this PR exists is an agent acting on an error it cannot fix.
    // "has invalid properties" is that error; "is MISSING required wrappers" is not.
    const result = messagesFor({ fields: [{ key: 'chrome', type: 'container', fields: [child] }] }, ui);

    expect(result.text).toContain('MISSING required "wrappers" property');
    expect(result.text).toContain('chrome');
  });

  it('rejects a wrappers value that is not an array', () => {
    expect(messagesFor({ fields: [{ key: 'chrome', type: 'container', wrappers: 'css', fields: [] }] }).valid).toBe(false);
  });

  it('rejects a wrapper entry with no type', () => {
    expect(messagesFor({ fields: [{ key: 'chrome', type: 'container', wrappers: [{ cssClasses: 'x' }], fields: [] }] }).valid).toBe(false);
  });

  it('accepts an unrecognised wrapper type, since wrappers are registry-extensible', () => {
    // Enumerating wrapper types here would reject anyone's custom wrapper.
    const config = { fields: [{ key: 'chrome', type: 'container', wrappers: [{ type: 'acme-panel', tone: 'warn' }], fields: [] }] };

    expect(messagesFor(config).valid).toBe(true);
  });
});

describe('container inherits the container base rules', () => {
  it.each(ADAPTERS)('names a missing fields array the way every other container does (%s)', (ui) => {
    const result = messagesFor({ fields: [{ key: 'chrome', type: 'container', wrappers: [] }] }, ui);

    expect(result.valid).toBe(false);
    expect(result.text).toContain('MISSING required "fields" property');
  });

  it('rejects a fields value that is not an array', () => {
    const result = messagesFor({ fields: [{ key: 'chrome', type: 'container', wrappers: [], fields: 'nope' }] });

    expect(result.valid).toBe(false);
    expect(result.text).toContain('invalid "fields"');
  });

  it('rejects a label, as on every other container', () => {
    const config = { fields: [{ key: 'chrome', type: 'container', wrappers: [], fields: [], label: 'Nope' }] };

    expect(messagesFor(config).valid).toBe(false);
  });

  it('nests inside and around other containers', () => {
    const config = {
      fields: [
        {
          key: 'page',
          type: 'page',
          fields: [{ key: 'chrome', type: 'container', wrappers: [], fields: [{ key: 'g', type: 'group', fields: [child] }] }],
        },
      ],
    };

    expect(messagesFor(config).valid).toBe(true);
  });

  it('rejects a page nested inside a container', () => {
    const config = {
      fields: [
        {
          key: 'chrome',
          type: 'container',
          wrappers: [],
          fields: [{ key: 'nested-page', type: 'page', fields: [] }],
        },
      ],
    };

    expect(messagesFor(config).valid).toBe(false);
  });
});

describe('accepting container did not loosen anything else', () => {
  it('still rejects a genuinely unknown field type', () => {
    const result = messagesFor({ fields: [{ key: 'a', type: 'acme-currency', label: 'A' }] });

    expect(result.valid).toBe(false);
    expect(result.text).toContain('Unknown field type');
  });

  it('still rejects a known type with bad properties', () => {
    const result = messagesFor({ fields: [{ key: 'a', type: 'select', label: 'A' }] });

    expect(result.valid, 'select without options should still fail').toBe(false);
  });

  it('still validates a config with no container at all', () => {
    expect(messagesFor({ fields: [child] }).valid).toBe(true);
  });
});
