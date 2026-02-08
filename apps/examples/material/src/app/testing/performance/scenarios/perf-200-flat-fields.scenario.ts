import { TestScenario } from '../../shared/types';
import { generateFlatFields } from '../utils/config-generators';

export const perf200FlatFieldsScenario: TestScenario = {
  testId: 'perf-200-flat-fields',
  title: 'Performance: 200 Flat Input Fields',
  description: 'Measures initial render time for 200 flat input fields',
  config: generateFlatFields(200),
};
