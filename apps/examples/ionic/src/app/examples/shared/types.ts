import { FormConfig } from '@ng-forge/dynamic-forms';

export interface ExampleScenario {
  id: string;
  title: string;
  description?: string;
  config: FormConfig;
  initialValue?: Record<string, unknown>;
}
