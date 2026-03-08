import { TestScenario } from '../../shared/types';
import { generateMixedFields } from '../utils/config-generators';

export const perf100MixedFieldsScenario: TestScenario = {
  testId: 'perf-100-mixed-fields',
  title: 'Performance: 100 Mixed Field Types',
  description: 'Measures initial render time for 100 fields of mixed types (input, select, checkbox, radio, textarea, slider)',
  config: generateMixedFields(100),
};
