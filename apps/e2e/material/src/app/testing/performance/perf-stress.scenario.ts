import type { TestScenario } from '@ng-forge/examples-shared-testing';
import {
  enormousIntricateConfig,
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

export const perfEnormousScenario: TestScenario = {
  testId: 'perf-enormous',
  title: 'Adapter Perf: Enterprise Insurance Application (Material, 21 pages, 200+ fields)',
  description:
    'Realistic large multi-page user form (Applicant, Address, Employment, Spouse, Dependents, Coverage, Beneficiaries, Medical, Vehicles, Claims, Financial, Additional insured, Review). 200+ fields, every validator kind, sync + HTTP + cross-field derivations, nested group>row containers, repeatable arrays, and cross-page conditional logic driven by earlier answers.',
  config: enormousIntricateConfig(),
};

// Variants proving the configurable preload window (FormOptions.pagePreloadWindow).
const enormousBase = enormousIntricateConfig() as unknown as Record<string, unknown>;

export const perfEnormousPreload0Scenario: TestScenario = {
  testId: 'perf-enormous-preload0',
  title: 'Enterprise Application — preload window 0 (only current page mounts)',
  description: 'Same form, FormOptions.pagePreloadWindow = 0. Only the current page mounts; navigation mounts the next page on arrival.',
  config: { ...enormousBase, options: { ...((enormousBase['options'] as object) ?? {}), pagePreloadWindow: 0 } } as never,
};

export const perfEnormousPreload3Scenario: TestScenario = {
  testId: 'perf-enormous-preload3',
  title: 'Enterprise Application — preload window 3 (±3 pages preloaded)',
  description: 'Same form, FormOptions.pagePreloadWindow = 3. Current page ±3 preloaded for jump navigation.',
  config: { ...enormousBase, options: { ...((enormousBase['options'] as object) ?? {}), pagePreloadWindow: 3 } } as never,
};

// Reproduces the pre-fix behaviour (every page mounted) for before/after A/B.
export const perfEnormousPreloadAllScenario: TestScenario = {
  testId: 'perf-enormous-preload-all',
  title: 'Enterprise Application — preload window 99 (all pages mount, pre-fix behaviour)',
  description:
    'Same form, FormOptions.pagePreloadWindow = 99 — every page mounts eagerly, reproducing the old orchestrator behaviour for comparison.',
  config: { ...enormousBase, options: { ...((enormousBase['options'] as object) ?? {}), pagePreloadWindow: 99 } } as never,
};

export const perfStressPagedHiddenScenario: TestScenario = {
  testId: 'perf-stress-paged-hidden',
  title: 'Adapter Perf: Full-API Stress (Material, PAGED, most pages hidden)',
  description:
    'Same API surface as PAGED, but only the first 2 sections (plus triggers) are visible. Targets PR 8 — without the @if gate every hidden page is mounted and participates in CD; with the gate they are removed from DOM entirely.',
  config: fullSurfaceStressConfigPagedMostlyHidden(),
};
