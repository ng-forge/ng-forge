import { TestScenario } from '../../shared/types';
import { generateFlatFields } from '../utils/config-generators';

export const perf100FlatFieldsScenario: TestScenario = {
  testId: 'perf-100-flat-fields',
  title: 'Performance: 100 Flat Input Fields',
  description: 'Measures initial render time for 100 flat input fields',
  config: generateFlatFields(100),
};
