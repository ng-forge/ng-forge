// Event classes (from constants)
export {
  AppendArrayItemEvent,
  FormClearEvent,
  FormResetEvent,
  InsertArrayItemEvent,
  MoveArrayItemEvent,
  NextPageEvent,
  PageChangeEvent,
  PopArrayItemEvent,
  PrependArrayItemEvent,
  PreviousPageEvent,
  RemoveAtIndexEvent,
  ShiftArrayItemEvent,
  FormSubmitEvent,
} from './constants';
export type { ArrayItemTemplate, ArrayItemDefinitionTemplate } from './constants';

// Array event builder (public API)
export { arrayEvent } from './array-event';

// Interfaces
export type { FormEvent, FormEventConstructor } from '@ng-forge/dynamic-forms/internal';
export { hasFormValue } from '@ng-forge/dynamic-forms/internal';

// Utilities
export { EventBus } from '@ng-forge/dynamic-forms/internal';
export type { TokenContext } from '@ng-forge/dynamic-forms/internal';
export { resolveTokens } from '@ng-forge/dynamic-forms/internal';
export type { ArrayItemContext } from './interfaces/array-item-context';
