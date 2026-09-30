import {
  AppendArrayItemEvent,
  ArrayAllowedChildren,
  FormEvent,
  FormSubmitEvent,
  InsertArrayItemEvent,
  NextPageEvent,
  PopArrayItemEvent,
  PrependArrayItemEvent,
  PreviousPageEvent,
  RemoveAtIndexEvent,
  ShiftArrayItemEvent,
} from '@ng-forge/dynamic-forms';
import { ButtonField } from '@ng-forge/dynamic-forms/integration';

export interface NativeButtonProps {
  variant?: 'primary' | 'secondary';
}

type ActionField<TEvent extends FormEvent, TType extends string> = Omit<
  ButtonField<NativeButtonProps, TEvent>,
  'event' | 'type' | 'eventArgs'
> & {
  type: TType;
};

export type NativeButtonField<TEvent extends FormEvent> = ButtonField<NativeButtonProps, TEvent>;
export type NativeSubmitButtonField = ActionField<FormSubmitEvent, 'submit'>;
export type NativeNextButtonField = ActionField<NextPageEvent, 'next'>;
export type NativePreviousButtonField = ActionField<PreviousPageEvent, 'previous'>;
export type NativeAddArrayItemButtonField = ActionField<AppendArrayItemEvent, 'add-array-item' | 'addArrayItem'> & {
  arrayKey?: string;
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
};
export type NativePrependArrayItemButtonField = ActionField<PrependArrayItemEvent, 'prepend-array-item' | 'prependArrayItem'> & {
  arrayKey?: string;
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
};
export type NativeInsertArrayItemButtonField = ActionField<InsertArrayItemEvent, 'insert-array-item' | 'insertArrayItem'> & {
  arrayKey?: string;
  index: number;
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
};
export type NativeRemoveArrayItemButtonField = ActionField<RemoveAtIndexEvent, 'remove-array-item' | 'removeArrayItem'> & {
  arrayKey?: string;
  index?: number;
};
export type NativePopArrayItemButtonField = ActionField<PopArrayItemEvent, 'pop-array-item' | 'popArrayItem'> & {
  arrayKey: string;
};
export type NativeShiftArrayItemButtonField = ActionField<ShiftArrayItemEvent, 'shift-array-item' | 'shiftArrayItem'> & {
  arrayKey: string;
};
