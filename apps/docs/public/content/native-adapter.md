---
title: Native Platform
slug: native-adapter
description: 'How the experimental ng-native adapter renders ng-forge forms as real iOS and Android views, and in the browser through @ng-native/web. Field types, differences from the web adapters, styling and testing.'
---

> [!WARNING]
> **Experimental.** `@ng-forge/dynamic-forms-native` is not published yet and its API may change. [ng-native](https://ng-native.com) itself is in alpha.

[ng-native](https://ng-native.com) renders Angular components as real native views on React Native's Fabric renderer, so the same `FormConfig` you use on the web drives a native iOS or Android form. [`@ng-native/web`](https://ng-native.com/packages/web) renders the same components into the DOM, so one adapter covers phones and the browser. The live examples on these pages run on it.

ng-forge's core (state, validation, conditional logic, groups and arrays) runs unchanged. The adapter supplies the field components. Setup is on [Getting Started](/getting-started).

## Field types

| Type                                   | Native element           | Notes                                                                                           |
| -------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| `input`                                | `<text-input>`           | `props.type` picks the keyboard (`email`, `number`, `tel`, `url`) and `password` hides the text |
| `textarea`                             | `<text-input multiline>` | `props.rows` sets the height                                                                    |
| `toggle`                               | `<switch>`               |                                                                                                 |
| `checkbox`                             | `<pressable>`            | Announced as a checkbox                                                                         |
| `radio`                                | `<pressable>` per option | Announced as radio buttons; disabled options ignore taps                                        |
| `multi-checkbox`                       | `<pressable>` per option | Announced as checkboxes; the value is an array                                                  |
| `button`, `submit`, `next`, `previous` | `<pressable>`            |                                                                                                 |
| array buttons                          | `<pressable>`            | `add-array-item`, `remove-array-item` and the rest                                              |
| `text`                                 | `<text>`                 | Headings (`h1` to `h6`) are announced as headers                                                |

ng-native's `<text-input>` and `<switch>` implement Signal Forms' `FormValueControl` and `FormCheckboxControl`, so those fields bind `[formField]` directly. React Native has no checkbox or radio view, so the adapter builds them from pressable rows that implement the same contracts. Validation, `disabled`, `readonly` and touched state work the same way as on the web. Checkboxes and options mark the field touched when tapped.

Not available yet: `select`, `datepicker`, `slider` and addons. A live example that needs one says so instead of rendering.

## Differences from the web adapters

- **Submit.** On the web, a submit button relies on the browser's `<form>` submit event. Native has no such event, so the native `submit` button dispatches `FormSubmitEvent` itself. Nothing changes in your config.
- **Text fields.** Core's `text` field renders HTML elements, which have no native counterpart, so the adapter registers its own `text` field. In dev mode, core logs that `text` was overwritten. That is expected.
- **Layout.** `row` and `col` use CSS grid on the web. React Native only has flexbox, so the adapter replaces the `row` wrapper with a wrapping flex row, and `col` becomes a percentage width. As on the web, rows stack their fields below 577px wide, so phones show one field per line and tablets show columns. `col` outside a `row` sets the field's width but does not place fields side by side.
- **Container errors.** The adapter also replaces the `field-errors` wrapper, so validation messages on groups and arrays render as native text.
- **Meta attributes.** `meta` forwards HTML attributes on the web. The native fields set accessibility props (`accessibilityLabel`, `role`) themselves and do not forward `meta`.
- **Element ids.** Each control sets a `testID` for testing tools: `<key>-input`, `<key>-textarea`, `<key>-toggle`, `<key>-checkbox`, `<key>-button`, `<key>-error`, and `<key>-<value>` for each radio or multi-checkbox option. Group children use `<group>_<child>` as their key, and array items use `<child>_<index>`. In the browser, `@ng-native/web` renders `testID` as `data-testid`.

## Styling

The fields use component stylesheets. On a device, ng-native's Metro plugin compiles them to native styles, and only flexbox layout is available: grid, `::before`/`::after` and `:hover` are dropped at build time. In the browser the same CSS applies as written.

> [!NOTE]
> Metro compiles the CSS of a pre-built library only when your app lists it: `withAngularNative(config, { libraryStyles: ['@ng-forge/dynamic-forms-native'] })`.

## Testing

The adapter's end-to-end suite runs the same scenarios on two hosts in CI: [Maestro](https://maestro.dev) flows against a release build on an Android emulator, and Playwright specs in Chromium through `@ng-native/web`. Each scenario opens by deep link on the device and by hash route in the browser, and both find fields by the `testID` values listed above:

```yaml
appId: com.ngforge.e2e
---
- openLink: ngforge-e2e://test/group-fields/group-value-propagation
- tapOn: { id: name-input }
- inputText: Test User
- copyTextFrom: { id: form-value }
- assertTrue: ${JSON.parse(maestro.copiedText).name == 'Test User'}
```

```typescript
await page.goto('/#/test/group-fields/group-value-propagation');
await page.getByTestId('name-input').fill('Test User');
```

For component tests without a device or a browser, `@ng-native/testing` renders ng-native components in Node against a fake of the native side.

## Related

- **[Building an Adapter](/building-an-adapter)**: the contract every adapter, including this one, is built on.
- **[ng-native](https://ng-native.com)**: the renderer this adapter targets.
