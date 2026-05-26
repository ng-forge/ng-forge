import type { TestScenario } from '@ng-forge/examples-shared-testing';
import {
  fullSurfaceStressConfigFlat,
  fullSurfaceStressConfigPaged,
  fullSurfaceStressConfigPagedMostlyHidden,
} from '@ng-forge/examples-shared-testing/perf';

export const perfStressFlatScenario: TestScenario = {
  testId: 'perf-stress-flat',
  title: 'Adapter Perf: Full-API Stress (Material, FLAT)',
  description:
    'Full library API surface — value fields, containers, arrays, sync/HTTP conditions, validators, derivations, property derivations. No PageOrchestrator.',
  config: fullSurfaceStressConfigFlat(),
};

export const perfStressPagedScenario: TestScenario = {
  testId: 'perf-stress-paged',
  title: 'Adapter Perf: Full-API Stress (Material, PAGED)',
  description:
    'Same API surface as the flat scenario, wrapped in pages with cross-page hidden-visibility logic. Adds PageOrchestrator overhead.',
  config: fullSurfaceStressConfigPaged(),
};

export const perfStressPagedHiddenScenario: TestScenario = {
  testId: 'perf-stress-paged-hidden',
  title: 'Adapter Perf: Full-API Stress (Material, PAGED, most pages hidden)',
  description:
    'Same API surface as PAGED, but only the first 2 sections (plus triggers) are visible. Targets PR 8 — without the @if gate every hidden page is mounted and participates in CD; with the gate they are removed from DOM entirely.',
  config: fullSurfaceStressConfigPagedMostlyHidden(),
};
