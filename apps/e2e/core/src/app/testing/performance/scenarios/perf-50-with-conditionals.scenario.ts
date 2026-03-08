import { TestScenario } from '../../shared/types';
import { generateConditionalFields } from '../utils/config-generators';

export const perf50WithConditionalsScenario: TestScenario = {
  testId: 'perf-50-with-conditionals',
  title: 'Performance: 50 Fields with 25 Conditionals',
  description: 'Measures initial render time for 50 fields where 25 have conditional visibility logic',
  config: generateConditionalFields(50, 25),
};
