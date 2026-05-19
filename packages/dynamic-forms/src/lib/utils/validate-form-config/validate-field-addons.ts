import { AnyAddon } from '../../models/addon/addon-def';
import { AddonKindDefinition } from '../../models/addon/addon-kind';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { AddonWarning } from './addon-warning';

/**
 * Walk a field's addons; return the survivors plus a list of warnings for
 * anything dropped.
 *
 * Pure: receives the registries as arguments (so the function is reusable
 * outside Angular's DI — tests, server-side validation, etc.).
 *
 * @param field        The field to validate.
 * @param fieldRegistry Snapshot of `FIELD_REGISTRY` map.
 * @param kindRegistry  Snapshot of `ADDON_KIND_REGISTRY` map.
 * @param source       Whether the config originated from JSON (lenient drop
 *                      of code-only kinds) or inline TypeScript.
 */
export function validateFieldAddons(
  field: FieldDef<unknown>,
  fieldRegistry: ReadonlyMap<string, FieldTypeDefinition>,
  kindRegistry: ReadonlyMap<string, AddonKindDefinition>,
  source: 'json' | 'inline',
): { addons: AnyAddon[]; warnings: AddonWarning[] } {
  const warnings: AddonWarning[] = [];
  const incoming = field.addons;
  if (!incoming?.length) {
    return { addons: [], warnings };
  }

  const fieldType = field.type;
  const fieldDef = fieldRegistry.get(fieldType);
  if (!fieldDef) {
    warnings.push({ type: 'unknown-field-type', fieldKey: field.key, fieldType });
    return { addons: [], warnings };
  }

  const addonSupport = fieldDef.addons;
  if (!addonSupport) {
    warnings.push({ type: 'field-type-no-addon-support', fieldKey: field.key, fieldType });
    return { addons: [], warnings };
  }

  const allowedSlots = addonSupport.slots;
  const allowedKinds = addonSupport.allowedKinds;
  const registeredKinds = Array.from(kindRegistry.keys());

  const survivors: AnyAddon[] = [];
  for (const addon of incoming) {
    // Slot allowed?
    if (!allowedSlots.includes(addon.slot)) {
      warnings.push({
        type: 'unknown-slot',
        fieldKey: field.key,
        fieldType,
        slot: String(addon.slot),
        allowedSlots,
      });
      continue;
    }

    // Kind registered? `AnyAddon.kind` is already a string-literal union via
    // DynamicFormAddonRegistry; no need to cast.
    const kindDef = kindRegistry.get(addon.kind);
    if (!kindDef) {
      warnings.push({
        type: 'unknown-kind',
        fieldKey: field.key,
        kind: addon.kind,
        registeredKinds,
      });
      continue;
    }

    // Kind whitelisted (if `allowedKinds` was set)?
    if (allowedKinds && !allowedKinds.includes(kindDef.kind)) {
      warnings.push({
        type: 'kind-not-allowed',
        fieldKey: field.key,
        fieldType,
        kind: kindDef.kind,
        allowedKinds,
      });
      continue;
    }

    // Code-only kind dropped from JSON-source configs. A kind opts out of
    // JSON-safety via `AddonKindDefinition.jsonSafe: false` (defaults to true).
    if (source === 'json' && kindDef.jsonSafe === false) {
      warnings.push({
        type: 'code-only-kind-in-json',
        fieldKey: field.key,
        kind: kindDef.kind,
      });
      continue;
    }

    // Inline `action`/`hidden`/`disabled`/`loading` functions dropped from
    // JSON-source configs — functions don't survive serialization, and
    // letting them through would crash at resolve-time. `preset`/`actionRef`/
    // `action` multi-set is also stripped down to the first variant so JSON
    // authoring tools that send both don't trigger the runtime precedence
    // warning.
    if (source === 'json') {
      let sanitized = addon as unknown as Record<string, unknown>;
      let stripped = false;
      const ensureCopy = () => {
        if (!stripped) sanitized = { ...sanitized };
        stripped = true;
      };
      const dropReactiveFn = (key: 'hidden' | 'disabled' | 'loading') => {
        if (typeof sanitized[key] === 'function') {
          ensureCopy();
          delete sanitized[key];
          warnings.push({
            type: 'code-only-action-in-json',
            fieldKey: field.key,
            reason: `function '${key}' on kind '${kindDef.kind}' (use a signal/observable in code, or omit in JSON)`,
          });
        }
      };
      if (typeof sanitized.action === 'function') {
        ensureCopy();
        delete sanitized.action;
        warnings.push({
          type: 'code-only-action-in-json',
          fieldKey: field.key,
          reason: `inline 'action' function on kind '${kindDef.kind}'`,
        });
      }
      dropReactiveFn('hidden');
      dropReactiveFn('disabled');
      dropReactiveFn('loading');

      // Multi-set XOR — keep the first variant, strip the rest. Mirrors the
      // runtime precedence (preset > actionRef > action) so the chosen
      // handler matches what the dispatcher would have picked.
      const variants = (['preset', 'actionRef', 'action'] as const).filter((k) => sanitized[k] !== undefined);
      if (variants.length > 1) {
        ensureCopy();
        for (const k of variants.slice(1)) delete sanitized[k];
        warnings.push({
          type: 'code-only-action-in-json',
          fieldKey: field.key,
          reason: `multiple click variants on kind '${kindDef.kind}' (${variants.join(', ')}); kept '${variants[0]}'`,
        });
      }

      if (stripped) {
        survivors.push(sanitized as unknown as AnyAddon);
        continue;
      }
    }

    // Per-kind shape validator (throws on violation).
    if (kindDef.validate) {
      try {
        kindDef.validate(addon, field.key);
      } catch (error) {
        warnings.push({
          type: 'shape-violation',
          fieldKey: field.key,
          kind: kindDef.kind,
          reason: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
    }

    survivors.push(addon);
  }

  return { addons: survivors, warnings };
}

/**
 * Recursively walk a field tree, validating each field's addons. Returns a
 * sanitized copy of the input field array plus accumulated warnings.
 */
export function walkAndValidateAddons(
  fields: readonly FieldDef<unknown>[],
  fieldRegistry: ReadonlyMap<string, FieldTypeDefinition>,
  kindRegistry: ReadonlyMap<string, AddonKindDefinition>,
  source: 'json' | 'inline',
): { fields: FieldDef<unknown>[]; warnings: AddonWarning[] } {
  const allWarnings: AddonWarning[] = [];
  const sanitized = fields.map((field) => {
    let next: FieldDef<unknown> = field;

    if (field.addons?.length) {
      const { addons, warnings } = validateFieldAddons(field, fieldRegistry, kindRegistry, source);
      allWarnings.push(...warnings);
      next = { ...next, addons };
    }

    // Recurse into containers — every container field type carries its
    // children on a `fields` array.
    const children = (next as { fields?: unknown }).fields;
    if (Array.isArray(children)) {
      const { fields: visited, warnings } = walkAndValidateAddons(
        children as readonly FieldDef<unknown>[],
        fieldRegistry,
        kindRegistry,
        source,
      );
      allWarnings.push(...warnings);
      next = { ...next, fields: visited } as FieldDef<unknown>;
    }

    return next;
  });

  return { fields: sanitized, warnings: allWarnings };
}
