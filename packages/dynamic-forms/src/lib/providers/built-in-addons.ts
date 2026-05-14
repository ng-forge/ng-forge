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
      // Validates structural presence: rejects missing / null / non-string-non-callable,
      // and rejects literal empty strings. DynamicText values that resolve to empty
      // at runtime (signal/observable yielding '') are NOT caught here — they're
      // legal as far as the config is concerned, just render an empty span.
      if (text === undefined || text === null) {
        throw new DynamicFormError(`Addon kind 'text' requires a 'text' field (field: '${fieldKey}').`);
      }
      if (typeof text === 'string' && text.length === 0) {
        throw new DynamicFormError(`Addon kind 'text' requires a non-empty 'text' string (field: '${fieldKey}').`);
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
