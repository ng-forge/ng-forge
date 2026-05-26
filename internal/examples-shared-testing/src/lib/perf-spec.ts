// Test-time-only perf entrypoint. Used by Playwright specs; intentionally does
// NOT re-export anything from `./perf/index` because that module pulls in the
// HTTP interceptor (with @angular/common/http runtime imports), which forces
// Angular JIT into the test runner. Specs only need the bench harness, types,
// and assertion helper.
export {
  BENCH_HARNESS_SOURCE,
  PERF_THRESHOLDS,
  benchOptionsInitScript,
  type BenchResult,
  type BenchStat,
  type BenchOptions,
} from './perf/bench-harness';
export { runPerfBench, assertPerf, type AssertPerfOpts } from './perf/perf-spec-helper';
