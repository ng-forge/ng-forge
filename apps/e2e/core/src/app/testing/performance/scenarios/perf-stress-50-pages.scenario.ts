import { TestScenario } from '../../shared/types';
import { standardStressConfig } from '@ng-forge/examples-shared-testing/perf';

export const perfStress50PagesScenario: TestScenario = {
  testId: 'perf-stress-50-pages',
  title: 'Stress: 50 Pages × 10 Fields + HTTP/Async/Derivations',
  description:
    'Heavy stress: 50 pages with cross-page AND visibility, min/maxLength on every field, plus HTTP validators, HTTP conditions, HTTP derivations, sync derivation chain, cross-field validators and property derivations on page 1.',
  config: standardStressConfig(),
};
