import { APP_ID, ChangeDetectionStrategy, Component, provideZonelessChangeDetection, ViewEncapsulation } from '@angular/core';
import { provideRouter, Route, RouterOutlet } from '@angular/router';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';
import { EXAMPLE_FORM_HOST } from '@ng-forge/examples-shared-ui';
import { SandboxAppFactory } from '@ng-forge/sandbox-harness';
import { NativeFormHostComponent } from './native-form-host.component';

@Component({
  selector: 'sandbox-native-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NativeRootComponent {}

/** The docs' DOM app around the native fields: the example chrome is DOM, the form is an island. */
export const createNativeSandboxApp: SandboxAppFactory = (routes: Route[]) => ({
  config: {
    providers: [
      provideZonelessChangeDetection(),
      provideRouter(routes),
      provideDynamicForm(...withNativeFields()),
      { provide: EXAMPLE_FORM_HOST, useValue: NativeFormHostComponent },
      { provide: APP_ID, useValue: 'sandbox-native' },
    ],
  },
  rootComponent: NativeRootComponent,
});
