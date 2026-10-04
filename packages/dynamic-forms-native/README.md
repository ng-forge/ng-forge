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
| `checkbox`                             | `<pressable>` with a box, role `checkbox`         |
| `radio`                                | one `<pressable>` per option, role `radio`        |
| `multi-checkbox`                       | one `<pressable>` per option, role `checkbox`     |
| `button`, `submit`, `next`, `previous` | `<pressable>`                                     |
| array buttons                          | `<pressable>`                                     |
| `text` (overrides core)                | `<text>`                                          |

ng-native's `<text-input>` and `<switch>` implement Signal Forms' `FormValueControl` and `FormCheckboxControl`, so those fields bind `[formField]` directly. React Native has no checkbox or radio view, so `NativeCheckboxControlComponent` and `NativeChoiceGroupComponent` implement the same contracts on top of `<pressable>`. A tap commits the choice, so they also mark the field touched.

## How it differs from the web adapters

- **Submit dispatches an event.** Core's submit mapper relies on a DOM `<form>` submit event, which does not exist here, so `submit` uses `nativeSubmitButtonFieldMapper` to dispatch `FormSubmitEvent` itself.
- **`text` is overridden.** Core's text field renders `<p>`, `<h1>`-`<h6>` and `<span>`, which render as empty views on ng-native. Core logs `Field type "text" is already registered. Overwriting.` in dev mode.
- **No meta forwarding.** `NgForgeControl` works on DOM attributes. Accessibility comes from `accessibilityLabel` and `role` set by each field.
- **Wrappers.** `withNativeFields()` also replaces two core wrappers. `row` becomes a wrapping flex row, with each `df-col-N` as a percentage width from 577px up; below that fields stack, as core's web rows do. `field-errors` renders container-level messages as `<text>`.
- **Element ids.** Fields set `testID` (`<key>-input`, `<key>-textarea`, `<key>-toggle`, `<key>-checkbox`, `<key>-button`, `<key>-error`, and `<key>-<value>` per radio or multi-checkbox option) for Maestro and the testing library.

## Known gaps

- **Styles of a built package.** `@ng-native/metro` compiles component CSS for the app's own components and for the packages an app lists in `withAngularNative(config, { libraryStyles: ['@ng-forge/dynamic-forms-native'] })`. `apps/e2e/native` consumes the adapter from source, so a built package with `libraryStyles` is not tested yet.
- **Missing field types:** select and datepicker need a modal or picker, which ng-native does not have yet. slider needs a native slider component.

## Tests

Both live in [`apps/e2e/native`](../../apps/e2e/native/README.md), which has its own install:

- Component tests in Node with `@ng-native/testing` (`npm test`), no emulator needed. They need Vitest 5, so they stay out of the workspace's Vitest 4 setup.
- End to end on an Android emulator with Maestro (`npm run e2e`).
