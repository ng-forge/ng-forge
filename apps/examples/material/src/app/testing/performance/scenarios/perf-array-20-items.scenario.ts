import { TestScenario } from '../../shared/types';
import { generateArrayConfig } from '../utils/config-generators';

export const perfArray20ItemsScenario: TestScenario = {
  testId: 'perf-array-20-items',
  title: 'Performance: Array with 20 Items x 5 Fields',
  description: 'Measures initial render time for an array containing 20 items, each with 5 input fields',
  config: generateArrayConfig(20, 5),
};
