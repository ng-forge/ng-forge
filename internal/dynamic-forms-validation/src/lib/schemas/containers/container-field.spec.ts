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
  // A container without a wrappers array is a group spelled differently. Making
  // the property optional would erase the distinction that justifies the type.
  it.each(ADAPTERS)('rejects a container with no wrappers property (%s)', (ui) => {
    const result = messagesFor({ fields: [{ key: 'chrome', type: 'container', fields: [child] }] }, ui);

    expect(result.valid, 'a container without wrappers must not validate').toBe(false);
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
});

describe('container forbids a page child, like every other host', () => {
  // Container was the only host with no nesting rule, so it was the only one
  // that accepted a page. `ContainerAllowedChildren` excludes `PageField`, and
  // multi-page mode reads pages from the config root, so a page nested here has
  // no navigation path at runtime.
  const withPage = {
    fields: [
      {
        key: 'chrome',
        type: 'container',
        wrappers: [],
        fields: [{ key: 'step1', type: 'page', fields: [child] }],
      },
    ],
  };

  it.each(ADAPTERS)('rejects a page inside a container (%s)', (ui) => {
    const result = messagesFor(withPage, ui);

    expect(result.valid, 'a page inside a container should be rejected').toBe(false);
    expect(result.text).toContain('NOT allowed inside');
  });

  it.each(ADAPTERS)('still allows a container inside a container (%s)', (ui) => {
    // The bound: the type lists ContainerField among its own allowed children,
    // so forbidding `page` must not spill into forbidding that.
    const nested = {
      fields: [
        {
          key: 'outer',
          type: 'container',
          wrappers: [],
          fields: [{ key: 'inner', type: 'container', wrappers: [], fields: [child] }],
        },
      ],
    };

    expect(messagesFor(nested, ui).valid, messagesFor(nested, ui).text).toBe(true);
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
