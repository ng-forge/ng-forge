> Prerequisites: [Installation](../../installation)

Configure ng-forge dynamic forms behavior at the application level using provider features.

## Overview

ng-forge uses a feature-based configuration pattern similar to Angular's `provideRouter()`. Features are optional add-ons that modify the library's behavior globally.

```typescript
import { provideDynamicForm, withLogger, LogLevel } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(
      ...withMaterialFields(),
      withLogger({ level: LogLevel.Debug }), // Provider feature
    ),
  ],
};
```

**Two Levels of Configuration:**

| Level        | Scope    | Where                  | Examples                                                 |
| ------------ | -------- | ---------------------- | -------------------------------------------------------- |
| **Provider** | App-wide | `provideDynamicForm()` | `withLogger()`, future features                          |
| **Form**     | Per-form | `FormConfig`           | `options`, `customFnConfig`, `defaultValidationMessages` |

This page covers **provider-level** features. For form-level configuration, see [Submission](../core/submission), [Custom Validators](../core/validation/custom-validators), and [i18n](../core/i18n).

## Logging

Control how ng-forge logs diagnostic information using `withLogger()`.

### Basic Usage

```typescript
import { provideDynamicForm, withLogger, LogLevel } from '@ng-forge/dynamic-forms';

provideDynamicForm(...withMaterialFields(), withLogger({ level: LogLevel.Debug }));
```

### Log Levels

| Level            | Value | Logs                     |
| ---------------- | ----- | ------------------------ |
| `LogLevel.Off`   | 0     | Nothing                  |
| `LogLevel.Error` | 1     | Errors only              |
| `LogLevel.Warn`  | 2     | Errors + Warnings        |
| `LogLevel.Info`  | 3     | Errors + Warnings + Info |
| `LogLevel.Debug` | 4     | Everything               |

Each level includes all messages from more severe levels.

### Default Behavior

Without `withLogger()`, ng-forge uses smart defaults:

- **Development mode** (`isDevMode() === true`): `LogLevel.Warn`
- **Production mode**: Logging disabled (silent)

### Common Configurations

**Verbose debugging during development:**

```typescript
provideDynamicForm(...withMaterialFields(), withLogger({ level: LogLevel.Debug }));
```

**Disable all logging:**

```typescript
provideDynamicForm(...withMaterialFields(), withLogger({ level: LogLevel.Off }));
```

**Errors only in production:**

```typescript
provideDynamicForm(...withMaterialFields(), withLogger({ level: LogLevel.Error }));
```

### Custom Logger

Integrate with external logging services (Sentry, DataDog, LogRocket, etc.) by providing a custom logger implementation:

```typescript
import { DynamicFormLogger } from '@ng-forge/dynamic-forms';

const sentryLogger: DynamicFormLogger = {
  debug: (message, ...args) => {
    // Optionally send to Sentry breadcrumbs
  },
  info: (message, ...args) => {
    Sentry.addBreadcrumb({ message, level: 'info', data: args[0] });
  },
  warn: (message, ...args) => {
    Sentry.addBreadcrumb({ message, level: 'warning', data: args[0] });
  },
  error: (message, ...args) => {
    Sentry.captureMessage(message, { level: 'error', extra: { args } });
  },
};

provideDynamicForm(...withMaterialFields(), withLogger({ logger: sentryLogger }));
```

When providing a custom logger, the `level` option is ignored—your implementation controls filtering.

### DynamicFormLogger Interface

```typescript
interface DynamicFormLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
```

### Injecting the Logger

For advanced use cases, inject the logger directly:

```typescript
import { inject } from '@angular/core';
import { DYNAMIC_FORM_LOGGER } from '@ng-forge/dynamic-forms';

@Component({...})
export class MyComponent {
  private logger = inject(DYNAMIC_FORM_LOGGER);

  someMethod() {
    this.logger.debug('Custom debug message', { data: 'value' });
  }
}
```

## What Gets Logged

ng-forge logs diagnostic information to help with debugging:

| Level     | Examples                                                                 |
| --------- | ------------------------------------------------------------------------ |
| **Error** | Missing field components, schema errors, validator registration failures |
| **Warn**  | Missing validation messages, field type overwrites, deprecated usage     |
| **Info**  | Form lifecycle events (future)                                           |
| **Debug** | Expression evaluation, validator execution, field rendering (future)     |

## API Reference

### withLogger()

```typescript
function withLogger(options?: LoggerFeatureOptions): DynamicFormFeature<'logger'>;
```

**Options:**

| Property | Type                | Description                                                    |
| -------- | ------------------- | -------------------------------------------------------------- |
| `level`  | `LogLevel`          | Log level threshold. Messages below this level are filtered.   |
| `logger` | `DynamicFormLogger` | Custom logger implementation. If provided, `level` is ignored. |

### LogLevel

```typescript
enum LogLevel {
  Off = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
}
```

### DynamicFormLogger

```typescript
interface DynamicFormLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
```

### DYNAMIC_FORM_LOGGER

```typescript
const DYNAMIC_FORM_LOGGER: InjectionToken<DynamicFormLogger>;
```

Injection token for accessing the configured logger directly.

## Next Steps

- **[Field Types](../core/field-types)** - Explore available field types
- **[Validation](../core/validation)** - Configure validation rules
- **[Custom Validators](../core/validation/custom-validators)** - Register custom validation functions
