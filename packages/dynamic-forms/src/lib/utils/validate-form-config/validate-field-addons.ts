import { AnyAddon } from '@ng-forge/dynamic-forms/internal';
import { AddonTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { AddonWarning } from './addon-warning';

/**
 * Walk a field's addons; return the survivors plus a list of warnings for
 * anything dropped.
 *
 * @param field        The field to validate.
 * @param fieldRegistry Snapshot of `FIELD_REGISTRY` map.
 * @param typeRegistry  Snapshot of `ADDON_TYPE_REGISTRY` map.
 * @param source       Whether the config originated from JSON (lenient drop
 *                      of code-only types) or inline TypeScript.
 */
export function validateFieldAddons(
  field: FieldDef<unknown>,
  fieldRegistry: ReadonlyMap<string, FieldTypeDefinition>,
  typeRegistry: ReadonlyMap<string, AddonTypeDefinition>,
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
  const allowedTypes = addonSupport.allowedTypes;
  const registeredTypes = Array.from(typeRegistry.keys());

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

    // Type registered? `AnyAddon.type` is already a string-literal union via
    // DynamicFormAddonRegistry; no need to cast.
    const typeDef = typeRegistry.get(addon.type);
    if (!typeDef) {
      warnings.push({
        type: 'unknown-type',
        fieldKey: field.key,
        addonType: addon.type,
        registeredTypes,
      });
      continue;
    }

    // Type whitelisted (if `allowedTypes` was set)?
    if (allowedTypes && !allowedTypes.includes(typeDef.type)) {
      warnings.push({
        type: 'type-not-allowed',
        fieldKey: field.key,
        fieldType,
        addonType: typeDef.type,
        allowedTypes,
      });
      continue;
    }

    // Code-only type dropped from JSON-source configs. A type opts out of
    // JSON-safety via `AddonTypeDefinition.jsonSafe: false` (defaults to true).
    if (source === 'json' && typeDef.jsonSafe === false) {
      warnings.push({
        type: 'code-only-type-in-json',
        fieldKey: field.key,
        addonType: typeDef.type,
      });
      continue;
    }

    // Multi-set XOR + JSON-source function stripping. Both runs operate on
    // a working copy via `ensureCopy()` so the original config isn't
    // mutated — the survivor pushed at the bottom is either the original
    // addon (no strips) or the sanitized copy.
    let sanitized = addon as unknown as Record<string, unknown>;
    let stripped = false;
    const ensureCopy = () => {
      if (!stripped) sanitized = { ...sanitized };
      stripped = true;
    };

    // Snapshot which click variants the original config declared BEFORE
    // any stripping. Computing variants AFTER function-strip would
    // underreport the multi-variant warning (`action` would silently
    // vanish from the reported list).
    const declaredVariants = (['preset', 'actionRef', 'action'] as const).filter((k) => sanitized[k] !== undefined);

    // JSON-source function strip — inline `action`/`hidden`/`disabled`/
    // `loading` functions can't round-trip through serialization, so they
    // get dropped here with a warning. Inline-source configs keep them.
    if (source === 'json') {
      const dropReactiveFn = (key: 'hidden' | 'disabled' | 'loading') => {
        if (typeof sanitized[key] === 'function') {
          ensureCopy();
          delete sanitized[key];
          warnings.push({
            type: 'code-only-action-in-json',
            fieldKey: field.key,
            reason: `function '${key}' on type '${typeDef.type}' (use a signal/observable in code, or omit in JSON)`,
          });
        }
      };
      if (typeof sanitized.action === 'function') {
        ensureCopy();
        delete sanitized.action;
        warnings.push({
          type: 'code-only-action-in-json',
          fieldKey: field.key,
          reason: `inline 'action' function on type '${typeDef.type}'`,
        });
      }
      dropReactiveFn('hidden');
      dropReactiveFn('disabled');
      dropReactiveFn('loading');
    }

    // Multi-set XOR — applies to BOTH inline and JSON sources. TypeScript
    // discriminated unions already reject multi-set at compile time, but
    // configs that bypass type-checking (loose `any`, runtime composition,
    // JSON parsing) still need defence-in-depth. Keep the first variant,
    // strip the rest; mirrors the runtime precedence
    // (preset > actionRef > action) so the chosen handler matches what
    // the dispatcher would have picked.
    if (declaredVariants.length > 1) {
      ensureCopy();
      for (const k of declaredVariants.slice(1)) delete sanitized[k];
      warnings.push({
        type: 'code-only-action-in-json',
        fieldKey: field.key,
        reason: `multiple click variants on type '${typeDef.type}' (${declaredVariants.join(', ')}); kept '${declaredVariants[0]}'`,
      });
    }

    if (stripped) {
      survivors.push(sanitized as unknown as AnyAddon);
      continue;
    }

    // Per-type shape validator (throws on violation).
    if (typeDef.validate) {
      try {
        typeDef.validate(addon, field.key);
      } catch (error) {
        warnings.push({
          type: 'shape-violation',
          fieldKey: field.key,
          addonType: typeDef.type,
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
  typeRegistry: ReadonlyMap<string, AddonTypeDefinition>,
  source: 'json' | 'inline',
): { fields: FieldDef<unknown>[]; warnings: AddonWarning[] } {
  const allWarnings: AddonWarning[] = [];
  const sanitized = fields.map((field) => {
    let next: FieldDef<unknown> = field;

    if (field.addons?.length) {
      const { addons, warnings } = validateFieldAddons(field, fieldRegistry, typeRegistry, source);
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
        typeRegistry,
        source,
      );
      allWarnings.push(...warnings);
      next = { ...next, fields: visited } as FieldDef<unknown>;
    }

    return next;
  });

  return { fields: sanitized, warnings: allWarnings };
}
