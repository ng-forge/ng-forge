# Native e2e (Android)

End-to-end tests for `@ng-forge/dynamic-forms-native`, run with [Maestro](https://maestro.dev) against a release build on an Android emulator. It is the native counterpart of `apps/e2e/{material,bootstrap,primeng,ionic}`: one screen per scenario, opened by deep link the way the web suites open scenarios by hash route.

## Layout

| Path                            | What                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/app/scenarios/`            | Scenario configs, grouped in suites. Test ids match the web suites where they are ports.                           |
| `src/app/scenario.component.ts` | Renders a scenario, plus `form-value`, `submission-count` and `last-submission` as compact JSON for flows to read. |
| `e2e/flows/<suite>/`            | One Maestro flow per scenario.                                                                                     |
| `e2e/common/`                   | Shared subflows: open a scenario by deep link, read the form value or last submission.                             |
| `metro.config.js`               | Resolves core from `dist/packages/dynamic-forms` and the adapter from source.                                      |

A scenario opens with `ngforge-e2e://test/<suite>/<testId>`. Without a link the app shows an index of every scenario.

## Element ids

Maestro's `id` matches React Native's `testID`. The adapter sets:

| Field type                   | `testID`         |
| ---------------------------- | ---------------- |
| input                        | `<key>-input`    |
| textarea                     | `<key>-textarea` |
| toggle                       | `<key>-toggle`   |
| checkbox                     | `<key>-checkbox` |
| radio, multi-checkbox option | `<key>-<value>`  |
| buttons                      | `<key>-button`   |
| text                         | `<key>`          |
| errors                       | `<key>-error`    |

Keys are the ones ng-forge resolves: group children are `<group>_<child>`, array items are `<child>_<index>`.

## Running locally

This app has its own npm install, so Expo and React Native stay out of the monorepo's root install.

```sh
pnpm nx build dynamic-forms          # core is bundled from its build output
cd apps/e2e/native
npm ci
npm run typecheck                    # strict templates, no device needed
npm test                             # component tests in Node with @ng-native/testing
npm run bundle:android               # Metro bundle, no device needed

# With an Android emulator running and Maestro installed:
npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease)
adb install -r android/app/build/outputs/apk/release/app-release.apk
npm run e2e
```

`npx expo run:android` gives a dev build with hot reload for writing flows. `maestro studio` helps find selectors.

## CI

`.github/workflows/e2e-native.yml` builds the release APK, boots a pinned emulator (API 34, `google_apis`, x86_64, Pixel 6) on a KVM-enabled Ubuntu runner, and runs `npm run e2e`. JUnit output and screenshots are uploaded as the `maestro-android` artifact. The workflow is separate from the required PR checks while the adapter is experimental.

## Not covered yet

- Screenshot baselines. Flows take screenshots but do not compare them yet.
- iOS. It needs a macOS runner and a simulator.
- Field types the adapter does not have yet: select, slider, datepicker.
- Column widths on a wide screen. The emulator is phone-sized, where rows stack; the component tests cover columns at tablet width.
