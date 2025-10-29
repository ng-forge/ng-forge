import { FieldDef } from '../../definitions';
import { Injector, linkedSignal, runInInjectionContext, WritableSignal } from '@angular/core';
import { get, isEqual, set } from 'lodash-es';
import { explicitEffect } from 'ngxtension/explicit-effect';

export interface FieldSignalContext<TModel = any> {
  injector: Injector;
  value: WritableSignal<Partial<TModel> | undefined>;
  defaultValues: () => TModel;
}

export function createFieldSignal<TModel = any>(
  fieldKey: string,
  defaultValue: unknown,
  context: FieldSignalContext<TModel>
): WritableSignal<unknown> {
  return runInInjectionContext(context.injector, () => {
    const fieldSignal = linkedSignal({
      source: context.value,
      computation: (valueData: Partial<TModel> | undefined) => {
        const defaults = context.defaultValues();
        const mergedData = { ...defaults, ...valueData };
        return get(mergedData, fieldKey) ?? defaultValue;
      },
      equal: isEqual,
    });

    explicitEffect([fieldSignal], ([fieldValue]: [unknown]) => {
      const currentModel = context.value() || ({} as TModel);
      const currentFieldValue = get(currentModel, fieldKey);

      if (!isEqual(fieldValue, currentFieldValue)) {
        const newModel = { ...currentModel };
        set(newModel, fieldKey, fieldValue);
        context.value.set(newModel as Partial<TModel>);
      }
    });

    return fieldSignal;
  });
}

export function getFieldSignal<TModel = any>(
  fieldKey: string,
  defaultValue: unknown,
  context: FieldSignalContext<TModel>,
  fieldSignals: Map<string, WritableSignal<unknown>>
): WritableSignal<unknown> {
  if (!fieldSignals.has(fieldKey)) {
    const fieldSignal = createFieldSignal(fieldKey, defaultValue, context);
    fieldSignals.set(fieldKey, fieldSignal);
  }
  return fieldSignals.get(fieldKey)!;
}

export function getFieldDefaultValue(field: FieldDef<any>): unknown {
  if ('defaultValue' in field && field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  return undefined;
}
