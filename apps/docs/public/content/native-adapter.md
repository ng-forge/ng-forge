---
title: Native Mobile (ng-native)
slug: native-adapter
description: 'Experimental ng-forge adapter for ng-native, which renders Angular as real iOS and Android views. Setup, supported field types, differences from the web adapters, and end-to-end testing on an Android emulator.'
---

> [!WARNING]
> **Experimental.** `@ng-forge/dynamic-forms-native` is not published yet and its API may change. [ng-native](https://ng-native.com) itself is in alpha.

[ng-native](https://ng-native.com) renders Angular components as real native views on React Native's Fabric renderer, so the same `FormConfig` you use on the web can drive a native iOS or Android form. ng-forge's core (state, validation, conditional logic, groups and arrays) runs unchanged. The adapter supplies the field components.

## Setup

Register the native fields when you mount the app, the same way the web adapters are registered:

```typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';
import { mount } from '@ng-native/platform';

mount(rootTag, App, getFabricUIManager(), {
  providers: [provideDynamicForm(...withNativeFields())],
});
```

Then render a form. The host element is still `<form dynamic-form>`. On ng-native it becomes a plain native view:

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-sign-up',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="value" (submitted)="save($event)"></form>`,
})
export class SignUp {
  readonly value = signal({});
  readonly config = {
    fields: [
      { key: 'email', type: 'input', label: 'Email', required: true, email: true, props: { type: 'email' } },
      { key: 'newsletter', type: 'toggle', label: 'Newsletter' },
      { key: 'submit', type: 'submit', label: 'Sign up' },
    ],
  } as const satisfies FormConfig;

  save(value: unknown) {
    console.log(value);
  }
}
```

## Field types

| Type                                   | Native element           | Notes                                                                                           |
| -------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| `input`                                | `<text-input>`           | `props.type` picks the keyboard (`email`, `number`, `tel`, `url`) and `password` hides the text |
| `textarea`                             | `<text-input multiline>` | `props.rows` sets the height on Android                                                         |
| `toggle`                               | `<switch>`               |                                                                                                 |
| `button`, `submit`, `next`, `previous` | `<pressable>`            |                                                                                                 |
| array buttons                          | `<pressable>`            | `add-array-item`, `remove-array-item` and the rest                                              |
| `text`                                 | `<text>`                 | Headings (`h1` to `h6`) are announced as headers                                                |

ng-native's `<text-input>` and `<switch>` implement Signal Forms' `FormValueControl` and `FormCheckboxControl`, so each field binds `[formField]` directly. Validation, `disabled`, `readonly` and touched state work the same way as on the web.

Not available yet: `select`, `radio`, `checkbox`, `multi-checkbox`, `slider` and `datepicker`.

## Differences from the web adapters

- **Submit.** On the web, a submit button relies on the browser's `<form>` submit event. Native has no such event, so the native `submit` button dispatches `FormSubmitEvent` itself. Nothing changes in your config.
- **Text fields.** Core's `text` field renders HTML elements, which have no native counterpart, so the adapter registers its own `text` field. In dev mode, core logs that `text` was overwritten. That is expected.
- **Layout.** `row` and `col` use CSS grid on the web. React Native only has flexbox, so the fields of a `row` currently stack vertically.
- **Meta attributes.** `meta` forwards HTML attributes on the web. The native fields set accessibility props (`accessibilityLabel`, `role`) themselves and do not forward `meta`.
- **Element ids.** Each control sets a `testID` for testing tools: `<key>-input`, `<key>-textarea`, `<key>-toggle`, `<key>-button` and `<key>-error`. Group children use `<group>_<child>` as their key, and array items use `<child>_<index>`.

## Styling

The fields use component stylesheets, which ng-native's Metro plugin compiles to native styles. Only flexbox layout is available: grid, `::before`/`::after` and `:hover` are dropped at build time.

> [!NOTE]
> In release builds, ng-native removes component CSS from pre-compiled Angular libraries. Until that is resolved, consume the adapter from source so its styles are compiled with your app.

## Testing

The adapter has an end-to-end suite that runs [Maestro](https://maestro.dev) flows against a release build on an Android emulator in CI. Each scenario opens by deep link, and flows find fields by the `testID` values listed above:

```yaml
appId: com.ngforge.e2e
---
- openLink: ngforge-e2e://test/group-fields/group-value-propagation
- tapOn: { id: name-input }
- inputText: Test User
- copyTextFrom: { id: form-value }
- assertTrue: ${JSON.parse(maestro.copiedText).name == 'Test User'}
```

For component tests without a device, `@ng-native/testing` renders ng-native components in Node against a fake of the native side.

## Related

- **[Building an Adapter](/building-an-adapter)**: the contract every adapter, including this one, is built on.
- **[ng-native](https://ng-native.com)**: the renderer this adapter targets.
