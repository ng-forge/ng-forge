# Experiment: an ng-forge adapter for ng-native

A throwaway prototype to see how much work an adapter for [ng-native](https://ng-native.com) (Angular rendered onto React Native's Fabric, `@ng-native/*` 0.1.2, alpha) would take. It is not a package, and it is kept out of the Nx graph through `.nxignore`.

## Run it

```sh
cd experiments/ng-native-adapter
npm run pack:lib                  # builds @ng-forge/dynamic-forms and packs it here as a tarball
npm install --legacy-peer-deps
npm test
```

The tests run on `@ng-native/testing`, which uses the real ng-native renderer, style engine and components, with only `nativeFabricUIManager` faked. No simulator is needed. Nothing here has been run on a device.

## What the prototype covers

| Piece                                                 | File                                     | Size      |
| ----------------------------------------------------- | ---------------------------------------- | --------- |
| `input` on `<text-input>`                             | `src/adapter/native-input.component.ts`  | ~45 lines |
| `toggle` on `<switch>`                                | `src/adapter/native-toggle.component.ts` | ~30 lines |
| `button`, `submit`, `add-array-item` on `<pressable>` | `src/adapter/native-button.component.ts` | ~20 lines |
| `text` override on `<text>`                           | `src/adapter/native-text.component.ts`   | ~20 lines |
| submit mapper                                         | `src/adapter/native-submit.mapper.ts`    | 5 lines   |

The following pass, with no changes to ng-forge: render, typing, validation on blur with `role="alert"` errors, `[(value)]`, `(submitted)`, `group`, `array` with `add-array-item`, and conditional `hidden` (top level and nested, both directions).

## What was smooth

- **No control glue.** ng-native's `TextInput` is a `FormValueControl<string>` and its `Switch` is a `FormCheckboxControl`, so `[formField]="ngf.field()"` binds directly. There is no ControlValueAccessor or wrapper.
- **The adapter contract holds without a DOM.** `NgForgeFieldHost`, `NgForgeActionHost`, the built-in mappers, `DynamicTextPipe`, `errorsToDisplay()` and `action.dispatch()` all work unchanged. The host bindings on the field host (`id`, `data-testid`, `class`, `attr.hidden`) are harmless.
- **Core behavior works.** The form state machine, groups, arrays and conditional hiding all work. Hiding works because `DfFieldOutlet` removes hidden fields from the tree instead of relying on CSS.

## Friction, most important first

1. **Submit relies on a DOM `<form>` submit event.** The built-in `submitButtonFieldMapper` leaves `event` unset and relies on a native `<button type="submit">` bubbling to the `<form>` host. A `<pressable>` has nothing to bubble to. Workaround: a 5-line mapper that adds `event: FormSubmitEvent`. Possible core change: have the submit mapper always emit the event. DOM adapters already skip dispatch for `type="submit"`, so they would not double submit.
2. **The core `text` field renders `<p>`, `<h1>`–`<h6>` and `<span>`.** ng-native has no counterpart for these, so the text is silently lost (it becomes an empty view). An adapter can override `text` because the last registration wins. However, core logs `Field type "text" is already registered. Overwriting.` for every form. Possible core change: let adapters replace built-in display types without the warning.
3. **Layout is all CSS grid.** `row`, `col`, `df-col-*` classes, and container or page hiding through `display: none` all live in core SCSS, and React Native has no grid. Rows render, but their children stack vertically. Fixing this needs either flex-based rules through ng-native's CSS engine or a native row wrapper. This is the largest open piece, and it is untested here.
4. **Tooling.** `@ng-native/testing` needs Vitest 5, while the repo is on 4.1. Under Vitest 4, `require('react-native')` loads Flow source and crashes. Partially compiled libraries (`@ng-forge/*`, `ngxtension`) must also be listed in the plugin's `inline` option. Hosting a real adapter inside the monorepo would need a Vitest bump or an isolated project like this one.
5. **Meta forwarding does not apply.** `NgForgeControl` uses `querySelectorAll` and DOM attributes. The prototype does not forward `meta`, and RN accessibility props (`accessibilityLabel`, `role`) are set by hand.
6. **Core still has unguarded DOM calls.** These include `document.activeElement` in `field-component-slot.ts` (on detach), `classList.add` in `wrapper-chain.ts`, and `requestAnimationFrame` in `side-effect-scheduler.ts`. None of them fired in these scenarios, but wrappers, field parking or config swaps would probably reach them.

## Not covered

- Select, radio, multi-checkbox, slider and datepicker. ng-native has no picker primitives, so these would need a modal list or a third-party Fabric component.
- Paged forms (`@defer (on idle)`), field windowing, the core `field-errors` wrapper (it renders a `<div>` with raw text), and custom wrappers.
- Anything on a real iOS or Android device.

## Verdict

Value fields are genuinely easy, easier than the Material or PrimeNG adapters, because ng-native's controls already speak Signal Forms. Two small core changes would remove the rough edges: submit dispatching an event, and quietly overridable display fields. The real cost of a full adapter is layout (rows and columns) and the picker-style fields.
