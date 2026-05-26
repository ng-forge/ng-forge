import { TestScenario } from '../../shared/types';
import { fullSurfaceStressConfigFlat, fullSurfaceStressConfigPaged } from '@ng-forge/examples-shared-testing/perf';

export const perfStressFullSurfaceFlatScenario: TestScenario = {
  testId: 'perf-stress-full-surface-flat',
  title: 'Stress: Full API Surface (FLAT, no pages)',
  description:
    'Exercises every library API: value fields, containers (group/row/array with primitive + complex items), all condition types (fieldValue/and/or/not/custom/http), built-in + custom + HTTP validators, cross-field validators, sync + HTTP derivations, property derivations (hidden/disabled/readonly/required). Flat shape — no PageOrchestrator.',
  config: fullSurfaceStressConfigFlat(),
};

export const perfStressFullSurfacePagedScenario: TestScenario = {
  testId: 'perf-stress-full-surface-paged',
  title: 'Stress: Full API Surface (PAGED)',
  description:
    'Same API surface as the flat scenario, with each section wrapped in a page and cross-page hidden-visibility logic. Adds PageOrchestrator + page navigation overhead.',
  config: fullSurfaceStressConfigPaged(),
};
