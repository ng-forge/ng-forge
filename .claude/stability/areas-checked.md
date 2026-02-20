# Stability Assessment — Area Index

Bug registry: [issues-found.md](./issues-found.md)

## Core Library

| #   | Area                       | File                                                                     | Known Bugs                                          | Status       |
| --- | -------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- | ------------ |
| 01  | State & Lifecycle          | [01-state-lifecycle.md](./areas/01-state-lifecycle.md)                   | B7, B10, B28, B29, B30                              | Deep-checked |
| 02  | Field Resolution           | [02-field-resolution.md](./areas/02-field-resolution.md)                 | B12, B60                                            | Deep-checked |
| 03  | Registry                   | [03-registry.md](./areas/03-registry.md)                                 | B22                                                 | Deep-checked |
| 04  | Schema Building            | [04-schema-building.md](./areas/04-schema-building.md)                   | B8/B38                                              | Deep-checked |
| 05  | Derivations                | [05-derivations.md](./areas/05-derivations.md)                           | B1, B4, B5/B17, B11, B20, B21, B33, B36, B61, B67   | Deep-checked |
| 06  | Property Derivations       | [06-property-derivations.md](./areas/06-property-derivations.md)         | B26, B66                                            | Deep-checked |
| 07  | Conditions & Expressions   | [07-conditions-expressions.md](./areas/07-conditions-expressions.md)     | B18, B32, B41, B62, B63, B64, B65, B68, B69, P3, P5 | Deep-checked |
| 08  | Logic Applicator           | [08-logic.md](./areas/08-logic.md)                                       | B69                                                 | Deep-checked |
| 09  | Validation                 | [09-validation.md](./areas/09-validation.md)                             | B6, B9, B39, B64                                    | Deep-checked |
| 10  | Schema Validation (Zod)    | [10-schema-validation.md](./areas/10-schema-validation.md)               | B31, B40                                            | Deep-checked |
| 11  | Containers: Array          | [11-containers-array.md](./areas/11-containers-array.md)                 | B5/B17, B6, B27, B37, B70                           | Deep-checked |
| 12  | Containers: Page           | [12-containers-page.md](./areas/12-containers-page.md)                   | B2, B3, B15, B24                                    | Deep-checked |
| 13  | Containers: Group & Row    | [13-containers-group-row.md](./areas/13-containers-group-row.md)         | B36, B72                                            | Deep-checked |
| 14  | Events & Event Bus         | [14-events.md](./areas/14-events.md)                                     | B16, B25, B59                                       | Deep-checked |
| 15  | HTTP Support               | [15-http.md](./areas/15-http.md)                                         | B4, B13, B14, B19, B41, B61, B71, P5                | Deep-checked |
| 16  | Value Output & Filtering   | [16-value-output.md](./areas/16-value-output.md)                         | B28, P1, P2                                         | Deep-checked |
| 17  | Path Utilities             | [17-path-utils.md](./areas/17-path-utils.md)                             | — (CLEAN)                                           | Deep-checked |
| 18  | Initialization Tracking    | [18-initialization.md](./areas/18-initialization.md)                     | B33, B35, B37                                       | Deep-checked |
| 19  | DI & Providers             | [19-di-providers.md](./areas/19-di-providers.md)                         | — (CLEAN)                                           | Deep-checked |
| 20  | Defaults, Mappers, Helpers | [20-defaults-mappers-helpers.md](./areas/20-defaults-mappers-helpers.md) | B42, B43                                            | Deep-checked |

## Cross-Cutting

| #   | Area          | File                                               | Known Bugs        | Status       |
| --- | ------------- | -------------------------------------------------- | ----------------- | ------------ |
| 21  | SSR Safety    | [21-ssr.md](./areas/21-ssr.md)                     | B18               | Deep-checked |
| 22  | Performance   | [22-performance.md](./areas/22-performance.md)     | P1–P7             | Deep-checked |
| 23  | Accessibility | [23-accessibility.md](./areas/23-accessibility.md) | — (gap confirmed) | Deep-checked |

## UI Adapters

| #   | Area      | File                                             | Known Bugs         | Status       |
| --- | --------- | ------------------------------------------------ | ------------------ | ------------ |
| 24  | Material  | [24-ui-material.md](./areas/24-ui-material.md)   | B44, B46           | Deep-checked |
| 25  | Bootstrap | [25-ui-bootstrap.md](./areas/25-ui-bootstrap.md) | B43, B45, B47      | Deep-checked |
| 26  | PrimeNG   | [26-ui-primeng.md](./areas/26-ui-primeng.md)     | B51, B53           | Deep-checked |
| 27  | Ionic     | [27-ui-ionic.md](./areas/27-ui-ionic.md)         | B48, B49, B50, B52 | Deep-checked |

## MCP Server

| #   | Area       | File                                         | Known Bugs              | Status       |
| --- | ---------- | -------------------------------------------- | ----------------------- | ------------ |
| 28  | MCP Server | [28-mcp-server.md](./areas/28-mcp-server.md) | B54, B55, B56, B57, B58 | Deep-checked |

---

## Summary

- **Total areas:** 28 — all deep-checked (4 sessions)
- **Total confirmed bugs:** B1–B72 + P1–P7 (72 bugs, 7 performance issues)
- **Fixed (PR open):** 24 bugs across 5 PRs — see Fix Status below
- **Confirmed clean:** DI & Providers (area 19), Path Utilities (area 17), Schema Building beyond B8/B38, Registry beyond B22, SSR beyond B18, most UI adapter field components
- **User-reported:** B59 (`arrayEvent()` factory/`EventBus.dispatch()` API mismatch)

## Fix Status

| PR                                                    | Branch                                   | Status | Bugs                                             |
| ----------------------------------------------------- | ---------------------------------------- | ------ | ------------------------------------------------ |
| [#268](https://github.com/ng-forge/ng-forge/pull/268) | `fix/expression-parser-http-correctness` | Open   | B36, B41, B43, B44, B46, B62, B63, B66, B68, B72 |
| [#269](https://github.com/ng-forge/ng-forge/pull/269) | `fix/mcp-conditions-operators`           | Open   | B54, B55, B56, B57                               |
| [#270](https://github.com/ng-forge/ng-forge/pull/270) | `fix/bootstrap-textarea-readonly-hint`   | Open   | B45, B47                                         |
| [#271](https://github.com/ng-forge/ng-forge/pull/271) | `fix/page-navigation-validation`         | Open   | B2, B3, B15, B24                                 |
| [#272](https://github.com/ng-forge/ng-forge/pull/272) | `fix/event-bus-error-isolation`          | Open   | B16, B25                                         |

## Bug Severity Breakdown (all sessions)

`~~strikethrough~~` = fix PR open

| Severity | Bugs                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Critical | B4                                                                                                                                                                    |
| High     | ~~B2~~, ~~B3~~, B5/B17, B6, B7, B10, B11, ~~B15~~, ~~B16~~, ~~B24~~, ~~B25~~, B26, B28, B29, B35, B39, ~~B41~~, ~~B44~~, ~~B45~~, ~~B54~~, ~~B55~~, B59, ~~B62~~      |
| Medium   | B1, B8/B38, B9, B12, B13, B14, B18, B20, B21, B22, B27, B30, B31, B33, B37, B40, ~~B46~~, B48, B49, B51, ~~B56~~, ~~B57~~, B58, B60, B61, ~~B63~~, B64, B65, B67, B71 |
| Low      | B19, B23, B32, ~~B36~~, ~~B42~~, ~~B43~~, ~~B47~~, B50, B52, B53, ~~B66~~, ~~B68~~, B69, B70, ~~B72~~, P7 + plain-Error minor items                                   |

## Notable Confirmed-Clean Areas

- **Memory / cleanup**: All subscriptions use `takeUntilDestroyed`. Clean.
- **Concurrent forms**: Every service is component-scoped. Clean.
- **Expression sandbox security**: Three-layer defense (parse-time syntax, blocked properties, type-specific method whitelist). Clean.
- **`[(value)]` two-way binding**: Correctly triggers derivations. Clean.
- **`excludeValueIfReadonly`**: Works correctly. Clean.
- **DI provider ordering**: All 18 providers correctly ordered; circular dep fixed. Clean.
- **SSR (beyond B18)**: No window/document access without guards, no other module-scope caches. Clean.
- **createField helper / BaseFieldMapper / container mappers**: All clean.
