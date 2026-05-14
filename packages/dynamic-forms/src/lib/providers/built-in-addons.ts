import { DynamicFormError } from '../errors/dynamic-form-error';
import { AddonKindDefinition } from '../models/addon/addon-kind';

/**
 * Built-in addon kinds shipped by core.
 *
 * Universally adapter-independent: `text`, `template`, `component`. Adapters
 * register their own kinds (e.g., `pi-icon`, `pi-button`) via
 * `withCustomAddon(...)` features.
 */
export const BUILT_IN_ADDON_KINDS: readonly AddonKindDefinition[] = [
  {
    kind: 'text',
    loadComponent: () => import('../addons/text-addon.component').then((m) => m.TextAddonComponent),
    validate: (addon, fieldKey) => {
      const text = (addon as { text?: unknown }).text;
      // Empty strings are rejected too — a text addon with no rendered glyph
      // would render an empty span. The validator drops the addon with a
      // lenient warning so the form keeps rendering.
      if (typeof text !== 'string' || text.length === 0) {
        throw new DynamicFormError(`Addon kind 'text' requires a non-empty 'text' field (field: '${fieldKey}').`);
      }
    },
  },
  {
    kind: 'template',
    loadComponent: () => import('../addons/template-addon.component').then((m) => m.TemplateAddonComponent),
    validate: (addon, fieldKey) => {
      const key = (addon as { templateKey?: unknown }).templateKey;
      if (typeof key !== 'string' || key.length === 0) {
        throw new DynamicFormError(`Addon kind 'template' requires a non-empty 'templateKey' string (field: '${fieldKey}').`);
      }
    },
  },
  {
    kind: 'component',
    // The shape carries a function loader — not serialisable; dropped by the
    // validator when the form config originated from JSON.
    jsonSafe: false,
    loadComponent: () => import('../addons/component-addon.component').then((m) => m.ComponentAddonComponent),
    validate: (addon, fieldKey) => {
      const loader = (addon as { component?: unknown }).component;
      if (typeof loader !== 'function') {
        throw new DynamicFormError(`Addon kind 'component' requires a 'component' loader function (field: '${fieldKey}').`);
      }
    },
  },
] as const;
