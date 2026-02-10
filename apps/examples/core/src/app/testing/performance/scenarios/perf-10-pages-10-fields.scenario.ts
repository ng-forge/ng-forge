import { TestScenario } from '../../shared/types';
import { generatePagedConfig } from '../utils/config-generators';

export const perf10Pages10FieldsScenario: TestScenario = {
  testId: 'perf-10-pages-10-fields',
  title: 'Performance: 10 Pages x 10 Fields',
  description: 'Measures initial render time for a multi-page form with 10 pages, each containing 10 input fields',
  config: generatePagedConfig(10, 10),
};
