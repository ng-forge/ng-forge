import { DatepickerField, DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsDatepickerProps extends Record<string, unknown> {
  useNgBootstrap?: boolean;
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  helpText?: DynamicText;
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
