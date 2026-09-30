# @ng-forge/dynamic-forms-native

Experimental. Not published (`private` in `package.json`, excluded from `nx release`).

An ng-forge adapter for [ng-native](https://ng-native.com), which renders Angular components as real iOS and Android views on React Native's Fabric renderer.

```ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';

mount(rootTag, App, getFabricUIManager(), {
  providers: [provideDynamicForm(...withNativeFields())],
});
```

## Field types

| Type                                   | Native element                                    |
| -------------------------------------- | ------------------------------------------------- |
| `input`                                | `<text-input>`, keyboard chosen from `props.type` |
| `textarea`                             | `<text-input multiline>`                          |
| `toggle`                               | `<switch>`                                        |
| `button`, `submit`, `next`, `previous` | `<pressable>`                                     |
| array buttons                          | `<pressable>`                                     |
| `text` (overrides core)                | `<text>`                                          |

ng-native's `<text-input>` and `<switch>` implement Signal Forms' `FormValueControl` and `FormCheckboxControl`, so each field binds `[formField]` directly with no adapter glue.

## How it differs from the web adapters

- **Submit dispatches an event.** Core's submit mapper relies on a DOM `<form>` submit event, which does not exist here, so `submit` uses `nativeSubmitButtonFieldMapper` to dispatch `FormSubmitEvent` itself.
- **`text` is overridden.** Core's text field renders `<p>`, `<h1>`-`<h6>` and `<span>`, which render as empty views on ng-native. Core logs `Field type "text" is already registered. Overwriting.` in dev mode.
- **No meta forwarding.** `NgForgeControl` works on DOM attributes. Accessibility comes from `accessibilityLabel` and `role` set by each field.
- **Element ids.** Fields set `testID` (`<key>-input`, `<key>-toggle`, `<key>-button`, `<key>-error`) for Maestro and the testing library.

## Known gaps

- **Styles are stripped from a built package in release builds.** `@ng-native/metro` removes component CSS from partially compiled libraries in release builds, because library CSS is usually written for browsers. Consumed from source, as `apps/e2e/native` does, the CSS is compiled to native styles. Publishing this package would need styles that survive linking, for example inline style objects, or an opt-in from ng-native.
- **No row or column layout.** Core's grid is CSS grid, and React Native only has flexbox. Rows render with their fields stacked.
- **Missing field types:** select, radio, multi-checkbox, slider, datepicker. ng-native has no picker primitives.
- **No unit tests in the Nx workspace yet.** `@ng-native/testing` needs Vitest 5, and the workspace is on Vitest 4. `experiments/ng-native-adapter` shows the setup. Coverage today comes from `apps/e2e/native`.

## Tests

End to end on an Android emulator with Maestro: see [`apps/e2e/native`](../../apps/e2e/native/README.md).
