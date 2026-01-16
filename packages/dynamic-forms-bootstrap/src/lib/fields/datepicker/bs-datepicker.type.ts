import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { DatepickerField, DatepickerProps } from '@ng-forge/dynamic-forms/integration';

export interface BsDatepickerProps extends DatepickerProps {
  useNgBootstrap?: boolean;
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  hint?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  // ng-bootstrap specific props (if used)
  displayMonths?: number;
  navigation?: 'select' | 'arrows' | 'none';
  outsideDays?: 'visible' | 'collapsed' | 'hidden';
  showWeekNumbers?: boolean;
}

export type BsDatepickerField = DatepickerField<BsDatepickerProps>;

export type BsDatepickerComponent = ValueFieldComponent<BsDatepickerField>;
