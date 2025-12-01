import { FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Represents a single example scenario with its form configuration
 */
export interface ExampleScenario {
  /** Unique identifier used for routing */
  id: string;
  /** Display title for the example */
  title: string;
  /** Optional description explaining what the example demonstrates */
  description?: string;
  /** The form configuration to render */
  config: FormConfig;
  /** Optional initial value for the form */
  initialValue?: Record<string, unknown>;
}
