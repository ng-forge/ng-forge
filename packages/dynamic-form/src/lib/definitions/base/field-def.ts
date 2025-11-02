import { WithInputSignals } from '../../models';
import { Prettify } from '../../models/prettify';

export interface FieldDef<TProps extends Record<string, unknown>> {
  /** Unique field identifier - required for form binding */
  key: string;

  /** Field type for component selection (input, select, checkbox, etc.) */
  type: string;

  /** Human-readable field label */
  label?: string;

  /** Field-specific properties (placeholder, options, etc.) */
  props?: TProps;

  /** Additional CSS classes */
  className?: string;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Whether the field is read-only */
  readonly?: boolean;

  /** Whether the field is hidden */
  hidden?: boolean;

  tabIndex?: number | undefined;

  /** Column sizing configuration for responsive behavior */
  col?: number;
}

type IncludedKeys = 'label' | 'className' | 'hidden' | 'tabIndex';

export type FieldComponent<T extends FieldDef<any>> = Prettify<WithInputSignals<Pick<T, IncludedKeys>>>;
