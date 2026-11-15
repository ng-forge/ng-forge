import { DynamicText } from '@ng-forge/dynamic-forms';
import { DatepickerField, DatepickerProps } from '@ng-forge/dynamic-forms/integration';

export interface BsDatepickerProps extends DatepickerProps {
  /** @deprecated Has no effect: this field renders a native date input. It will be removed in 2.0. */
  useNgBootstrap?: boolean;
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  hint?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  /** @deprecated Has no effect: this field renders a native date input. It will be removed in 2.0. */
  displayMonths?: number;
  /** @deprecated Has no effect: this field renders a native date input. It will be removed in 2.0. */
  navigation?: 'select' | 'arrows' | 'none';
  /** @deprecated Has no effect: this field renders a native date input. It will be removed in 2.0. */
  outsideDays?: 'visible' | 'collapsed' | 'hidden';
  /** @deprecated Has no effect: this field renders a native date input. It will be removed in 2.0. */
  showWeekNumbers?: boolean;
}

export type BsDatepickerField = DatepickerField<BsDatepickerProps>;
