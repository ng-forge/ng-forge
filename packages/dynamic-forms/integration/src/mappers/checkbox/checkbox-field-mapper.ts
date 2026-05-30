import { BaseCheckedField, FieldMeta } from '@ng-forge/dynamic-forms/internal';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { computed, inject, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { buildBaseInputs, DEFAULT_PROPS } from '@ng-forge/dynamic-forms/internal';
import { injectFieldSignalContext } from '@ng-forge/dynamic-forms/internal';
import { omit } from '@ng-forge/dynamic-forms/internal';

/**
 * Maps a checkbox/toggle field definition to component inputs.
 *
 * @param fieldDef The checkbox field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function checkboxFieldMapper(fieldDef: BaseCheckedField<unknown, FieldMeta, boolean>): Signal<Record<string, unknown>> {
  const context = injectFieldSignalContext();
  const defaultProps = inject(DEFAULT_PROPS);

  return computed(() => {
    const omittedFields = omit(fieldDef, ['value']) as FieldDef<unknown>;
    const baseInputs = buildBaseInputs(omittedFields, defaultProps());

    const inputs: Record<string, unknown> = {
      ...baseInputs,
      validationMessages: fieldDef.validationMessages ?? {},
    };

    if (fieldDef.placeholder !== undefined) {
      inputs['placeholder'] = fieldDef.placeholder;
    }

    // Access form inside computed for reactivity and to handle cases where
    // form may not be immediately available (e.g., during array item initialization)
    const formRoot = context.form as Record<string, FieldTree<unknown> | undefined> | undefined;
    const fieldTree = formRoot?.[fieldDef.key];
    if (fieldTree !== undefined) {
      inputs['field'] = fieldTree;
    }

    return inputs;
  });
}
