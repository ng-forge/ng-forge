import type { TestScenario } from '@ng-forge/examples-shared-testing';
import { fullSurfaceStressConfigFlat, fullSurfaceStressConfigPaged } from '@ng-forge/examples-shared-testing/perf';

export const perfStressFlatScenario: TestScenario = {
  testId: 'perf-stress-flat',
  title: 'Adapter Perf: Full-API Stress (PrimeNG, FLAT)',
  description:
    'Full library API surface — value fields, containers, arrays, sync/HTTP conditions, validators, derivations, property derivations. No PageOrchestrator.',
  config: fullSurfaceStressConfigFlat(),
};

export const perfStressPagedScenario: TestScenario = {
  testId: 'perf-stress-paged',
  title: 'Adapter Perf: Full-API Stress (PrimeNG, PAGED)',
  description:
    'Same API surface as the flat scenario, wrapped in pages with cross-page hidden-visibility logic. Adds PageOrchestrator overhead.',
  config: fullSurfaceStressConfigPaged(),
};
