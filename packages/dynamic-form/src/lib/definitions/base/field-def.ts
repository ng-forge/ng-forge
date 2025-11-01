import { ConditionalRules } from '../../models/field-config';
import { WithInputSignals } from '../../models/component-type';
import { Prettify } from '../../models/prettify';

export interface FieldDef<TProps extends Record<string, unknown>> {
  /** Unique field identifier - required for form binding */
  readonly key: string;

  /** Field type for component selection (input, select, checkbox, etc.) */
  readonly type: string;

  /** Human-readable field label */
  readonly label?: string;

  /** Field-specific properties (placeholder, options, etc.) */
  readonly props?: TProps;

  /** Conditional field behavior */
  readonly conditionals?: ConditionalRules;

  /** Additional CSS classes */
  readonly className?: string;

  /** Whether the field is disabled */
  readonly disabled?: boolean;

  /** Whether the field is read-only */
  readonly readonly?: boolean;

  /** Whether the field is hidden */
  readonly hidden?: boolean;

  readonly tabIndex?: number | undefined;

  /** Column sizing configuration for responsive behavior */
  readonly col?: number;
}

type IncludedKeys = 'label' | 'className' | 'hidden' | 'tabIndex';

export type FieldComponent<T extends FieldDef<any>> = Prettify<WithInputSignals<Pick<T, IncludedKeys>>>;
