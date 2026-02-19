# Stability Assessment — Area Index

Bug registry: [issues-found.md](./issues-found.md)

## Core Library

| #   | Area                       | File                                                                     | Known Bugs                              | Status            |
| --- | -------------------------- | ------------------------------------------------------------------------ | --------------------------------------- | ----------------- |
| 01  | State & Lifecycle          | [01-state-lifecycle.md](./areas/01-state-lifecycle.md)                   | B7, B10, B28, B29, B30                  | Partially checked |
| 02  | Field Resolution           | [02-field-resolution.md](./areas/02-field-resolution.md)                 | B12                                     | Partially checked |
| 03  | Registry                   | [03-registry.md](./areas/03-registry.md)                                 | B22                                     | Partially checked |
| 04  | Schema Building            | [04-schema-building.md](./areas/04-schema-building.md)                   | B8/B38                                  | Partially checked |
| 05  | Derivations                | [05-derivations.md](./areas/05-derivations.md)                           | B1, B4, B5/B17, B11, B20, B21, B33, B36 | Partially checked |
| 06  | Property Derivations       | [06-property-derivations.md](./areas/06-property-derivations.md)         | B26                                     | Partially checked |
| 07  | Conditions & Expressions   | [07-conditions-expressions.md](./areas/07-conditions-expressions.md)     | B18, B32, B41, P3, P5                   | Partially checked |
| 08  | Logic Applicator           | [08-logic.md](./areas/08-logic.md)                                       | B3 ext                                  | Partially checked |
| 09  | Validation                 | [09-validation.md](./areas/09-validation.md)                             | B6, B9, B39                             | Partially checked |
| 10  | Schema Validation (Zod)    | [10-schema-validation.md](./areas/10-schema-validation.md)               | B31, B40                                | Partially checked |
| 11  | Containers: Array          | [11-containers-array.md](./areas/11-containers-array.md)                 | B5/B17, B6, B27, B37                    | Partially checked |
| 12  | Containers: Page           | [12-containers-page.md](./areas/12-containers-page.md)                   | B2, B3, B15, B24                        | Partially checked |
| 13  | Containers: Group & Row    | [13-containers-group-row.md](./areas/13-containers-group-row.md)         | B36                                     | Partially checked |
| 14  | Events & Event Bus         | [14-events.md](./areas/14-events.md)                                     | B16, B25                                | Partially checked |
| 15  | HTTP Support               | [15-http.md](./areas/15-http.md)                                         | B4, B13, B14, B19, B41, P5              | Partially checked |
| 16  | Value Output & Filtering   | [16-value-output.md](./areas/16-value-output.md)                         | B28, P1, P2                             | Partially checked |
| 17  | Path Utilities             | [17-path-utils.md](./areas/17-path-utils.md)                             | Minor (Error type)                      | Not yet checked   |
| 18  | Initialization Tracking    | [18-initialization.md](./areas/18-initialization.md)                     | B33, B35, B37                           | Partially checked |
| 19  | DI & Providers             | [19-di-providers.md](./areas/19-di-providers.md)                         | —                                       | Partially checked |
| 20  | Defaults, Mappers, Helpers | [20-defaults-mappers-helpers.md](./areas/20-defaults-mappers-helpers.md) | Minor (Error type)                      | Not yet checked   |

## Cross-Cutting

| #   | Area          | File                                               | Known Bugs        | Status            |
| --- | ------------- | -------------------------------------------------- | ----------------- | ----------------- |
| 21  | SSR Safety    | [21-ssr.md](./areas/21-ssr.md)                     | B18               | Partially checked |
| 22  | Performance   | [22-performance.md](./areas/22-performance.md)     | P1–P6             | Partially checked |
| 23  | Accessibility | [23-accessibility.md](./areas/23-accessibility.md) | — (gap confirmed) | Checked           |

## UI Adapters

| #   | Area      | File                                             | Known Bugs      | Status            |
| --- | --------- | ------------------------------------------------ | --------------- | ----------------- |
| 24  | Material  | [24-ui-material.md](./areas/24-ui-material.md)   | —               | Not yet checked   |
| 25  | Bootstrap | [25-ui-bootstrap.md](./areas/25-ui-bootstrap.md) | —               | Not yet checked   |
| 26  | PrimeNG   | [26-ui-primeng.md](./areas/26-ui-primeng.md)     | —               | Not yet checked   |
| 27  | Ionic     | [27-ui-ionic.md](./areas/27-ui-ionic.md)         | toggle/readonly | Partially checked |

## MCP Server

| #   | Area       | File                                         | Known Bugs | Status          |
| --- | ---------- | -------------------------------------------- | ---------- | --------------- |
| 28  | MCP Server | [28-mcp-server.md](./areas/28-mcp-server.md) | —          | Not yet checked |

---

## Summary

- **Total areas:** 28
- **Total confirmed bugs:** B1–B35 (35 bugs, plus B36–B41 from session 1 = 41 total)
- **Performance bottlenecks:** P1–P6
- **Confirmed clean:** Memory/cleanup, concurrent forms, expression sandbox security, `excludeValueIfReadonly`, `[(value)]` two-way binding
