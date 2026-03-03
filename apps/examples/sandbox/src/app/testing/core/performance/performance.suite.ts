import { TestSuite } from '../shared/types';
import { perf100FlatFieldsScenario } from './scenarios/perf-100-flat-fields.scenario';
import { perf200FlatFieldsScenario } from './scenarios/perf-200-flat-fields.scenario';
import { perf100MixedFieldsScenario } from './scenarios/perf-100-mixed-fields.scenario';
import { perf50WithConditionalsScenario } from './scenarios/perf-50-with-conditionals.scenario';
import { perfArray20ItemsScenario } from './scenarios/perf-array-20-items.scenario';
import { perf10Pages10FieldsScenario } from './scenarios/perf-10-pages-10-fields.scenario';
import { perfConfigSwapScenario } from './scenarios/perf-config-swap.scenario';

export const performanceSuite: TestSuite = {
  id: 'performance',
  title: 'Performance Tests',
  description: 'Performance benchmarks for large form rendering',
  path: '/test/performance',
  scenarios: [
    perf100FlatFieldsScenario,
    perf200FlatFieldsScenario,
    perf100MixedFieldsScenario,
    perf50WithConditionalsScenario,
    perfArray20ItemsScenario,
    perf10Pages10FieldsScenario,
    perfConfigSwapScenario,
  ],
};

export function getPerformanceScenario(testId: string) {
  return performanceSuite.scenarios.find((s) => s.testId === testId);
}
