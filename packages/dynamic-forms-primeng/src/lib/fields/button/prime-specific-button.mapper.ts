import { Binding, computed, inject, inputBinding, isSignal } from '@angular/core';
import {
  AddArrayItemEvent,
  ARRAY_CONTEXT,
  baseFieldMapper,
  FIELD_SIGNAL_CONTEXT,
  FieldDef,
  NextPageEvent,
  PreviousPageEvent,
  RemoveArrayItemEvent,
  SubmitEvent,
} from '@ng-forge/dynamic-forms';
import { AddArrayItemButtonField, RemoveArrayItemButtonField } from './prime-button.type';

/**
 * Mapper for submit button - preconfigures SubmitEvent and disables when form is invalid
 */
export function submitButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Inject field signal context to access form state
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);

  bindings.push(inputBinding('event', () => SubmitEvent));

  // Add disabled binding - disabled if explicitly set OR if form is invalid
  // form is a callable signal, calling form() returns the form instance with valid()/invalid() methods
  const formInstance = fieldSignalContext.form;
  bindings.push(
    inputBinding('disabled', () =>
      computed(() => {
        const explicitlyDisabled = fieldDef.disabled || false;
        // Call formInstance() to get the current form state and check invalid()
        return explicitlyDisabled || formInstance().invalid();
      }),
    ),
  );

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for next page button - preconfigures NextPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 */
export function nextButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  bindings.push(inputBinding('event', () => NextPageEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for previous page button - preconfigures PreviousPageEvent
 * Note: Does not auto-disable based on validation. Users can explicitly disable if needed.
 */
export function previousButtonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  bindings.push(inputBinding('event', () => PreviousPageEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  return bindings;
}

/**
 * Mapper for add array item button - preconfigures AddArrayItemEvent with array context.
 *
 * Supports two modes:
 * 1. Inside array template: Uses ARRAY_CONTEXT to determine target array
 * 2. Outside array: Uses `arrayKey` property from field definition
 */
export function addArrayItemButtonFieldMapper(fieldDef: AddArrayItemButtonField): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Try to get array context (available when inside an array)
  // Use optional injection so it doesn't fail when outside an array
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  // Determine the target array key
  // Priority: explicit arrayKey from fieldDef > arrayKey from context
  const targetArrayKey = fieldDef.arrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    console.warn(
      `[Dynamic Forms] addArrayItem button "${fieldDef.key}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  bindings.push(inputBinding('event', () => AddArrayItemEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  // Add array context for token resolution (fallback - component prefers injected ARRAY_CONTEXT)
  // Read signal value if index is a signal (supports differential updates)
  const getIndex = () => {
    if (!arrayContext) return -1;
    return isSignal(arrayContext.index) ? arrayContext.index() : arrayContext.index;
  };

  bindings.push(
    inputBinding('eventContext', () => ({
      key: fieldDef.key,
      index: getIndex(),
      arrayKey: targetArrayKey ?? '',
      formValue: arrayContext?.formValue ?? {},
    })),
  );

  // Set default eventArgs for AddArrayItemEvent (arrayKey)
  // The array component will use its own template automatically
  // User can override by providing eventArgs in field definition
  const defaultEventArgs = ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  bindings.push(inputBinding('eventArgs', () => eventArgs));

  return bindings;
}

/**
 * Mapper for remove array item button - preconfigures RemoveArrayItemEvent with array context.
 *
 * Supports two modes:
 * 1. Inside array template: Uses ARRAY_CONTEXT to determine target array and removes item at current index
 * 2. Outside array: Uses `arrayKey` property from field definition, removes last item by default
 */
export function removeArrayItemButtonFieldMapper(fieldDef: RemoveArrayItemButtonField): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Try to get array context (available when inside an array)
  // Use optional injection so it doesn't fail when outside an array
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  // Determine the target array key
  // Priority: explicit arrayKey from fieldDef > arrayKey from context
  const targetArrayKey = fieldDef.arrayKey ?? arrayContext?.arrayKey;

  if (!targetArrayKey) {
    console.warn(
      `[Dynamic Forms] removeArrayItem button "${fieldDef.key}" has no array context. ` +
        'Either place it inside an array field, or provide an explicit arrayKey property.',
    );
  }

  bindings.push(inputBinding('event', () => RemoveArrayItemEvent));

  // Add disabled binding only if explicitly set by user
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  // Add array context for token resolution (fallback - component prefers injected ARRAY_CONTEXT)
  // Read signal value if index is a signal (supports differential updates)
  const getIndex = () => {
    if (!arrayContext) return -1; // -1 means remove last (no specific index)
    return isSignal(arrayContext.index) ? arrayContext.index() : arrayContext.index;
  };

  bindings.push(
    inputBinding('eventContext', () => ({
      key: fieldDef.key,
      index: getIndex(),
      arrayKey: targetArrayKey ?? '',
      formValue: arrayContext?.formValue ?? {},
    })),
  );

  // Set default eventArgs for RemoveArrayItemEvent (arrayKey, index if inside array)
  // When outside array, only pass arrayKey (removes last by default)
  // User can override by providing eventArgs in field definition
  const defaultEventArgs = arrayContext ? ['$arrayKey', '$index'] : ['$arrayKey'];
  const eventArgs = 'eventArgs' in fieldDef && fieldDef.eventArgs !== undefined ? fieldDef.eventArgs : defaultEventArgs;

  bindings.push(inputBinding('eventArgs', () => eventArgs));

  return bindings;
}
