/**
 * Registers the native field types with FormConfig, the same way the other adapters do.
 */
import type { FormEvent } from '@ng-forge/dynamic-forms';
import type { NativeInputField } from '../fields/input/native-input.type';
import type { NativeTextareaField } from '../fields/textarea/native-textarea.type';
import type { NativeToggleField } from '../fields/toggle/native-toggle.type';
import type {
  NativeAddArrayItemButtonField,
  NativeButtonField,
  NativeInsertArrayItemButtonField,
  NativeNextButtonField,
  NativePopArrayItemButtonField,
  NativePrependArrayItemButtonField,
  NativePreviousButtonField,
  NativeRemoveArrayItemButtonField,
  NativeShiftArrayItemButtonField,
  NativeSubmitButtonField,
} from '../fields/button/native-button.type';

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: NativeInputField;
    textarea: NativeTextareaField;
    toggle: NativeToggleField;
    button: NativeButtonField<FormEvent>;
    submit: NativeSubmitButtonField;
    next: NativeNextButtonField;
    previous: NativePreviousButtonField;
    'add-array-item': NativeAddArrayItemButtonField;
    'prepend-array-item': NativePrependArrayItemButtonField;
    'insert-array-item': NativeInsertArrayItemButtonField;
    'remove-array-item': NativeRemoveArrayItemButtonField;
    'pop-array-item': NativePopArrayItemButtonField;
    'shift-array-item': NativeShiftArrayItemButtonField;
  }
}
