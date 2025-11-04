import { computed } from '@angular/core';
import { Binding, inputBinding } from '@angular/core';
import { baseFieldMapper, NextPageEvent, PreviousPageEvent, SubmitEvent } from '@ng-forge/dynamic-form';
import { FieldDef } from '@ng-forge/dynamic-form';
import { FieldMapperOptions } from '@ng-forge/dynamic-form';

/**
 * Mapper for submit button - preconfigures SubmitEvent and disables when form is invalid
 */
export function submitButtonFieldMapper(fieldDef: FieldDef<any>, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Preconfigure the SubmitEvent
  bindings.push(inputBinding('event', () => SubmitEvent));

  // Add disabled binding - disabled if explicitly set OR if form is invalid
  if (options?.fieldSignalContext) {
    const form = options.fieldSignalContext.form;
    bindings.push(
      inputBinding('disabled', () =>
        computed(() => {
          const explicitlyDisabled = fieldDef.disabled || false;
          const formInvalid = !form().valid();
          return explicitlyDisabled || formInvalid;
        })()
      )
    );
  } else {
    // Fallback if no form context is available
    if (fieldDef.disabled !== undefined) {
      bindings.push(inputBinding('disabled', () => fieldDef.disabled));
    }
  }

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for next page button - preconfigures NextPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 */
export function nextButtonFieldMapper(fieldDef: FieldDef<any>, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Preconfigure the NextPageEvent
  bindings.push(inputBinding('event', () => NextPageEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for previous page button - preconfigures PreviousPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 */
export function previousButtonFieldMapper(fieldDef: FieldDef<any>, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Preconfigure the PreviousPageEvent
  bindings.push(inputBinding('event', () => PreviousPageEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  // Add hidden binding since baseFieldMapper excludes it
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}
