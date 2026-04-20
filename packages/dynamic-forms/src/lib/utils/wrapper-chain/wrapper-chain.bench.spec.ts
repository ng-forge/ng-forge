/**
 * Performance benchmarks for the wrapper-chain rendering pipeline.
 *
 * Why this file exists
 * --------------------
 * `renderStep` calls `detectChanges()` per wrapper (O(chain length)), explicitly
 * flagged in the source as "refactor if it bites". This file publishes baseline
 * numbers so we can tell whether that detect-per-wrapper cost actually bites.
 *
 * Methodology
 * -----------
 * Vitest's `bench()` API is not configured in this repo (browser mode + custom
 * Angular vite plugin). We roll our own with `performance.now()`:
 *   - Warmup: WARMUP_ITERS runs, results discarded (JIT steady-state)
 *   - Measure: MEASURE_ITERS runs, collect per-iteration ms
 *   - Report: min / median / p95 / mean / ops-per-second
 *
 * Two flush helpers
 * -----------------
 *   - `flush()` uses `setTimeout(0)` — browser-clamped to ~4 ms. Use only
 *     for cold-cache paths that genuinely need a macrotask boundary.
 *   - `microFlush()` uses `await Promise.resolve()` — sub-microsecond. Use
 *     for steady-state paths (pre-populated cache, gate toggles, idempotent
 *     re-emits). The controller's `toObservable` effect fires inside
 *     `flushEffects()`, so a microtask is enough once the cache is warm.
 *
 * The "rebuild / flicker / idempotent" bench includes a scheduler-overhead
 * control row (signal set + microFlush, no controller) so any per-iteration
 * floor in the controller paths can be attributed correctly.
 *
 * Scenarios covered
 * -----------------
 *   1. Mount cost by chain depth (0, 1, 3, 6 wrappers) — pure `renderWrapperChain`
 *   2. Per-input push via `fieldInputs` signal emission (depth=3)
 *   3. Rebuild (structural change) vs no-op flicker (gate toggle)
 *   4. Cache-hit `loadWrapperComponents` sync path
 *   5. Realistic worst case: 10 "rows" × 3-deep wrapper chain (mount-only proxy)
 *
 * Reading the output
 * ------------------
 * Results are logged via `console.log` as markdown tables. Capture with:
 *   `nx test dynamic-forms --testNamePattern="wrapper-chain perf baseline"`
 * Numbers vary by machine; treat as _relative_ guideposts, not absolute SLAs.
 *
 * The tests themselves assert nothing beyond "the bench ran". Regression gates
 * belong in a separate follow-up once baseline numbers land in CI.
 */
import { describe, it, beforeEach, vi } from 'vitest';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  Injector,
  Type,
  ViewContainerRef,
  inject,
  input,
  runInInjectionContext,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { delay } from '@ng-forge/utils';
import {
  FieldWrapperContract,
  WRAPPER_COMPONENT_CACHE,
  WRAPPER_REGISTRY,
  WrapperConfig,
  WrapperTypeDefinition,
} from '../../models/wrapper-type';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { NoopLogger } from '../../providers/features/logger/noop-logger';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { createWrapperChainController } from './wrapper-chain-controller';
import { loadWrapperComponents, renderWrapperChain } from './wrapper-chain';
import { firstValueFrom } from 'rxjs';

// ---- Tuning knobs ----------------------------------------------------------
// The browser-mode testTimeout is 1000ms. Each `it` block covers one scenario;
// we want enough samples for stable medians without blowing the budget.
const WARMUP_ITERS = 10;
const MEASURE_ITERS = 40;
// Nested-array worst case. Keep row count modest — each "row" builds + tears
// down a full 3-wrapper chain per iteration.
const NESTED_ROWS = 10;
const NESTED_DEPTH = 3;

// ---- Fixtures (copied from sibling specs for reuse) ------------------------

function silentLogger(): Logger {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

@Component({
  selector: 'bench-leaf',
  template: `<span class="leaf">leaf</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BenchLeaf {
  readonly label = input<string>();
}

@Component({
  selector: 'bench-wrap-a',
  template: `<div class="wrap-a"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BenchWrapA implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly title = input<string>();
  readonly fieldInputs = input<WrapperFieldInputs>();
}

@Component({
  selector: 'bench-wrap-b',
  template: `<div class="wrap-b"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BenchWrapB implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly fieldInputs = input<WrapperFieldInputs>();
}

@Component({
  selector: 'bench-wrap-c',
  template: `<div class="wrap-c"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BenchWrapC implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly fieldInputs = input<WrapperFieldInputs>();
}

@Component({
  selector: 'bench-host',
  template: `<div><ng-container #slot></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BenchHost {
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });
  readonly envInjector = inject(EnvironmentInjector);
}

// ---- Helpers ---------------------------------------------------------------

interface Stats {
  readonly label: string;
  readonly samples: number;
  readonly minMs: number;
  readonly medianMs: number;
  readonly p95Ms: number;
  readonly meanMs: number;
  readonly opsPerSec: number;
}

function stats(label: string, times: number[]): Stats {
  const sorted = [...times].sort((a, b) => a - b);
  const n = sorted.length;
  const median = sorted[Math.floor(n / 2)];
  const p95 = sorted[Math.min(n - 1, Math.floor(n * 0.95))];
  const mean = times.reduce((a, b) => a + b, 0) / n;
  const min = sorted[0];
  return {
    label,
    samples: n,
    minMs: min,
    medianMs: median,
    p95Ms: p95,
    meanMs: mean,
    opsPerSec: 1000 / mean,
  };
}

function fmt(n: number, digits = 3): string {
  return n.toFixed(digits);
}

function printTable(title: string, rows: Stats[]): void {
  // Logged as markdown so `nx test`'s captured stdout renders cleanly.
  const lines = [
    ``,
    `### ${title}`,
    ``,
    `| Scenario | N | min (ms) | median (ms) | p95 (ms) | mean (ms) | ops/sec |`,
    `| --- | ---: | ---: | ---: | ---: | ---: | ---: |`,
    ...rows.map(
      (r) =>
        `| ${r.label} | ${r.samples} | ${fmt(r.minMs)} | ${fmt(r.medianMs)} | ${fmt(r.p95Ms)} | ${fmt(r.meanMs)} | ${fmt(r.opsPerSec, 0)} |`,
    ),
    ``,
  ];

  console.log(lines.join('\n'));
}

/**
 * Time `fn` across warmup + measure iterations. `fn` is synchronous and
 * responsible for any setup/teardown inside each iteration — we time only
 * the call itself.
 */
function bench(label: string, fn: () => void): Stats {
  for (let i = 0; i < WARMUP_ITERS; i++) fn();
  const times: number[] = [];
  for (let i = 0; i < MEASURE_ITERS; i++) {
    const t0 = performance.now();
    fn();
    const t1 = performance.now();
    times.push(t1 - t0);
  }
  return stats(label, times);
}

async function benchAsync(label: string, fn: () => Promise<void>): Promise<Stats> {
  for (let i = 0; i < WARMUP_ITERS; i++) await fn();
  const times: number[] = [];
  for (let i = 0; i < MEASURE_ITERS; i++) {
    const t0 = performance.now();
    await fn();
    const t1 = performance.now();
    times.push(t1 - t0);
  }
  return stats(label, times);
}

function makeWrapperChain(depth: number): { config: WrapperConfig; component: Type<unknown> }[] {
  const WRAPS = [BenchWrapA, BenchWrapB, BenchWrapC];
  return Array.from({ length: depth }, (_, i) => ({
    config: { type: `w${i}` } as WrapperConfig,
    component: WRAPS[i % WRAPS.length],
  }));
}

function makeBenchHost(): BenchHost {
  TestBed.configureTestingModule({ imports: [BenchHost] });
  const fixture = TestBed.createComponent(BenchHost);
  fixture.detectChanges();
  return fixture.componentInstance;
}

// Multiple-flush loop mirrors the one in wrapper-chain-controller.spec.ts —
// gives the toObservable effect + async loader + forkJoin + subscribe time
// to settle deterministically. Uses `setTimeout(0)`, which the browser clamps
// to ~4 ms; two iterations of `flush(2)` therefore carry an ~8 ms scheduler
// floor before any controller work happens. Use for cold-cache / initial-mount
// paths where a macrotask boundary is genuinely needed.
async function flush(cycles = 4): Promise<void> {
  for (let i = 0; i < cycles; i++) {
    await delay(0);
    TestBed.flushEffects();
  }
}

// Microtask-based flush — no setTimeout clamp. Safe for steady-state paths
// where everything is synchronous past the toObservable effect boundary
// (pre-populated wrapper cache, gate toggles, idempotent re-emissions). Drops
// the scheduler floor from ~8 ms to sub-ms so the measurement reflects actual
// controller work rather than `setTimeout(0)` minimum latency.
async function microFlush(cycles = 2): Promise<void> {
  for (let i = 0; i < cycles; i++) {
    await Promise.resolve();
    TestBed.flushEffects();
  }
}

// ---- Benchmarks ------------------------------------------------------------

describe('wrapper-chain perf baseline', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: DynamicFormLogger, useValue: new NoopLogger() }],
    });
  });

  // 10s timeouts: async scenarios flush effects multiple times per iteration,
  // pushing the test well beyond the default 1000ms. Vitest's `retry: 2` from
  // vite.config.ts makes timeout failures triple in wall-clock impact.
  const BENCH_TIMEOUT_MS = 10_000;

  it('mount cost by chain depth (renderWrapperChain, synchronous)', () => {
    const host = makeBenchHost();
    const envInjector = host.envInjector;
    const logger = silentLogger();
    const depths = [0, 1, 3, 6];
    const results: Stats[] = [];

    for (const depth of depths) {
      const loadedWrappers = makeWrapperChain(depth);
      const result = bench(`mount depth=${depth}`, () => {
        const refs = renderWrapperChain({
          outerContainer: host.slot(),
          loadedWrappers,
          environmentInjector: envInjector,
          logger,
          renderInnermost: (slot) => slot.createComponent(BenchLeaf, { environmentInjector: envInjector }),
        });
        // Tear down — `host.slot().clear()` cascades destroy through every
        // nested ref so we measure full mount+teardown symmetrically across depths.
        host.slot().clear();
        // Keep refs referenced so the optimizer can't DCE the loop body.
        if (refs.length < 0) throw new Error('unreachable');
      });
      results.push(result);
    }

    printTable(`Mount cost by chain depth (N=${MEASURE_ITERS}, warmup=${WARMUP_ITERS})`, results);
  });

  it(
    'per-input push cost (fieldInputs signal → all wrappers)',
    async () => {
      // Measures `pushFieldInputsOnChange`: when the mapper outputs signal
      // emits once, the controller walks every ref and calls `setInputIfDeclared`.
      // Cost scales with chain depth but does NOT rebuild — this is the
      // hot path for every keystroke in a wrapped field.
      const registry = new Map<string, WrapperTypeDefinition>();
      const cache = new Map<string, Type<unknown>>([
        ['a', BenchWrapA],
        ['b', BenchWrapB],
        ['c', BenchWrapC],
      ]);
      for (const [name, cls] of cache) {
        registry.set(name, { wrapperName: name, loadComponent: async () => ({ default: cls }) });
      }

      TestBed.configureTestingModule({
        providers: [
          { provide: WRAPPER_REGISTRY, useValue: registry },
          { provide: WRAPPER_COMPONENT_CACHE, useValue: cache },
          { provide: DynamicFormLogger, useValue: new NoopLogger() },
        ],
      });
      const fixture = TestBed.createComponent(BenchHost);
      fixture.detectChanges();
      const host = fixture.componentInstance;
      const envInjector = TestBed.inject(EnvironmentInjector);
      const injector = TestBed.inject(Injector);

      const results: Stats[] = [];

      for (const depth of [1, 3, 6]) {
        const wrappers: WrapperConfig[] = makeWrapperChain(depth).map(
          (_, i) =>
            ({
              type: ['a', 'b', 'c'][i % 3],
            }) as WrapperConfig,
        );
        const wrappersSig = signal<readonly WrapperConfig[]>(wrappers);
        const fieldInputs = signal<WrapperFieldInputs>({ key: 'k', label: 'initial' });
        const slotSig = signal(host.slot()).asReadonly();

        // Mount once
        runInInjectionContext(fixture.componentRef.injector, () => {
          createWrapperChainController({
            vcr: slotSig,
            wrappers: wrappersSig,
            fieldInputs,
            renderInnermost: (s) => s.createComponent(BenchLeaf, { environmentInjector: envInjector, injector }),
          });
        });
        await flush();

        // Time the push: mutate the signal, flush effects, measure.
        // Effect flush is required — the push fires via `explicitEffect`.
        let counter = 0;
        const stat = await benchAsync(`push depth=${depth}`, async () => {
          fieldInputs.set({ key: 'k', label: `v${counter++}` });
          TestBed.flushEffects();
        });
        results.push(stat);

        host.slot().clear();
        // Fresh TestBed per depth would be safer but we don't reset here —
        // the controller is bound to `fixture.componentRef.injector` which
        // we reuse. Clearing the slot is enough to drop mounted refs.
      }

      printTable(`Per-input push cost (fieldInputs signal emit; mounted chain unchanged)`, results);

      fixture.destroy();
    },
    BENCH_TIMEOUT_MS,
  );

  it(
    'rebuild vs flicker vs idempotent re-emit (controller)',
    async () => {
      const registry = new Map<string, WrapperTypeDefinition>();
      const cache = new Map<string, Type<unknown>>([
        ['a', BenchWrapA],
        ['b', BenchWrapB],
        ['c', BenchWrapC],
      ]);
      for (const [name, cls] of cache) {
        registry.set(name, { wrapperName: name, loadComponent: async () => ({ default: cls }) });
      }

      TestBed.configureTestingModule({
        providers: [
          { provide: WRAPPER_REGISTRY, useValue: registry },
          { provide: WRAPPER_COMPONENT_CACHE, useValue: cache },
          { provide: DynamicFormLogger, useValue: new NoopLogger() },
        ],
      });
      const fixture = TestBed.createComponent(BenchHost);
      fixture.detectChanges();
      const host = fixture.componentInstance;
      const envInjector = TestBed.inject(EnvironmentInjector);
      const injector = TestBed.inject(Injector);

      const chainA: WrapperConfig[] = [{ type: 'a' } as WrapperConfig, { type: 'b' } as WrapperConfig, { type: 'c' } as WrapperConfig];
      const chainB: WrapperConfig[] = [{ type: 'c' } as WrapperConfig, { type: 'a' } as WrapperConfig, { type: 'b' } as WrapperConfig];

      const wrappersSig: WritableSignal<readonly WrapperConfig[]> = signal(chainA);
      const gate = signal(true);
      const slotSig = signal(host.slot()).asReadonly();

      runInInjectionContext(fixture.componentRef.injector, () => {
        createWrapperChainController({
          vcr: slotSig,
          wrappers: wrappersSig,
          gate,
          renderInnermost: (s) => s.createComponent(BenchLeaf, { environmentInjector: envInjector, injector }),
        });
      });
      await flush();

      const results: Stats[] = [];

      // microFlush everywhere — cache is pre-populated so resolveLoadedWrappers
      // takes the `of(...)` sync path. No macrotask boundary required; using
      // `flush(2)` here would add ~8 ms of setTimeout floor per iteration and
      // drown the signal-through-controller cost we actually want to measure.

      // (a) Structural rebuild: alternate chainA ⇄ chainB. Each set triggers
      // teardown of the prior chain + fresh mount.
      let toggle = true;
      const rebuildStat = await benchAsync('rebuild (structural change)', async () => {
        toggle = !toggle;
        wrappersSig.set(toggle ? chainA : chainB);
        await microFlush();
      });
      results.push(rebuildStat);

      // (b) Gate flicker: off → on. Should NOT rebuild (controller preserves
      // the mounted chain). This is the path the comment promises is "free".
      const flickerStat = await benchAsync('flicker (gate false→true)', async () => {
        gate.set(false);
        await microFlush();
        gate.set(true);
        await microFlush();
      });
      results.push(flickerStat);

      // (c) Idempotent re-emit: set the same structural chain (different array
      // ref, same contents). isSameWrapperChain in the state computed's
      // `equal` fn dedupes — the observable should not even emit.
      const idempotentStat = await benchAsync('idempotent re-emit (same chain)', async () => {
        wrappersSig.set([...chainA] as readonly WrapperConfig[]);
        await microFlush();
      });
      results.push(idempotentStat);

      // (d) Scheduler-overhead control: same `microFlush()` pattern, no
      // controller in the loop. Proves any remaining floor in (a)–(c) is
      // real controller work, not measurement scaffolding.
      const controlSig = signal(0);
      const controlStat = await benchAsync('control: signal.set + microFlush (no controller)', async () => {
        controlSig.set(controlSig() + 1);
        await microFlush();
      });
      results.push(controlStat);

      printTable(`Rebuild / flicker / idempotent paths (depth=3, N=${MEASURE_ITERS})`, results);

      fixture.destroy();
    },
    BENCH_TIMEOUT_MS,
  );

  it(
    'cache-hit loadWrapperComponents (sync fast path)',
    async () => {
      // When every wrapper is already in the component cache, the controller's
      // `resolveLoadedWrappers` takes a synchronous `of(loaded)` shortcut.
      // This measures `loadWrapperComponents` in isolation — not through the
      // controller, so no flush/subscribe overhead.
      const registry = new Map<string, WrapperTypeDefinition>();
      const cache = new Map<string, Type<unknown>>();
      const depths = [1, 3, 6];
      const results: Stats[] = [];
      const logger = silentLogger();

      // Prepopulate cache for all depths we'll exercise.
      for (let i = 0; i < 6; i++) {
        const name = `cached${i}`;
        registry.set(name, { wrapperName: name, loadComponent: async () => ({ default: [BenchWrapA, BenchWrapB, BenchWrapC][i % 3] }) });
        cache.set(name, [BenchWrapA, BenchWrapB, BenchWrapC][i % 3]);
      }

      for (const depth of depths) {
        const configs: WrapperConfig[] = Array.from({ length: depth }, (_, i) => ({ type: `cached${i}` }) as WrapperConfig);
        const stat = await benchAsync(`cache-hit depth=${depth}`, async () => {
          // firstValueFrom handles sync of(...) the same as async forkJoin
          await firstValueFrom(loadWrapperComponents(configs, registry, cache, logger));
        });
        results.push(stat);
      }

      printTable(`loadWrapperComponents cache-hit path (pure RxJS sync of(...))`, results);
    },
    BENCH_TIMEOUT_MS,
  );

  it('nested worst case: array of wrapped rows (mount-only proxy)', () => {
    // Simulates "array of N rows, each a row-wrapper-wrapped field".
    // We don't spin up a real ArrayField — we just build NESTED_ROWS
    // independent chains of depth NESTED_DEPTH into separate slots on the
    // same host. The host has ONE slot; we build sequentially and clear
    // between iterations so each bench sample covers build+teardown of
    // all rows.
    const host = makeBenchHost();
    const envInjector = host.envInjector;
    const logger = silentLogger();
    const loadedWrappers = makeWrapperChain(NESTED_DEPTH);

    const stat = bench(`${NESTED_ROWS} rows × depth=${NESTED_DEPTH} (mount+teardown)`, () => {
      for (let row = 0; row < NESTED_ROWS; row++) {
        renderWrapperChain({
          outerContainer: host.slot(),
          loadedWrappers,
          environmentInjector: envInjector,
          logger,
          renderInnermost: (slot) => slot.createComponent(BenchLeaf, { environmentInjector: envInjector }),
        });
      }
      host.slot().clear();
    });

    printTable(`Nested array worst case (realistic usage proxy)`, [stat]);
  });
});
