import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import { AddonTypeDefinition } from '@ng-forge/dynamic-forms/internal';

/** Built-in addon types shipped by core. */
export const BUILT_IN_ADDON_TYPES: readonly AddonTypeDefinition[] = [
  {
    type: 'text',
    loadComponent: () => import('../addons/text-addon.component').then((m) => m.TextAddonComponent),
    validate: (addon, fieldKey) => {
      const text = (addon as { text?: unknown }).text;
      // Validates structural presence: rejects missing / null / non-string-non-callable,
      // and rejects literal empty strings. DynamicText values that resolve to empty
      // at runtime (signal/observable yielding '') are NOT caught here — they're
      // legal as far as the config is concerned, just render an empty span.
      if (text === undefined || text === null) {
        throw new DynamicFormError(`Addon type 'text' requires a 'text' field (field: '${fieldKey}').`);
      }
      if (typeof text === 'string' && text.length === 0) {
        throw new DynamicFormError(`Addon type 'text' requires a non-empty 'text' string (field: '${fieldKey}').`);
      }
    },
  },
  {
    type: 'template',
    loadComponent: () => import('../addons/template-addon.component').then((m) => m.TemplateAddonComponent),
    validate: (addon, fieldKey) => {
      const key = (addon as { templateKey?: unknown }).templateKey;
      if (typeof key !== 'string' || key.length === 0) {
        throw new DynamicFormError(`Addon type 'template' requires a non-empty 'templateKey' string (field: '${fieldKey}').`);
      }
    },
  },
  {
    type: 'component',
    // The shape carries a function loader — not serialisable; dropped by the
    // validator when the form config originated from JSON.
    jsonSafe: false,
    loadComponent: () => import('../addons/component-addon.component').then((m) => m.ComponentAddonComponent),
    validate: (addon, fieldKey) => {
      const loader = (addon as { component?: unknown }).component;
      if (typeof loader !== 'function') {
        throw new DynamicFormError(`Addon type 'component' requires a 'component' loader function (field: '${fieldKey}').`);
      }
    },
  },
] as const;
