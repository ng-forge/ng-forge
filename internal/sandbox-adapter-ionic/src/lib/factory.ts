import { APP_ID, ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { IonApp, IonRouterOutlet, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cashOutline,
  closeOutline,
  eyeOutline,
  paperPlaneOutline,
  refreshOutline,
  saveOutline,
  searchOutline,
} from 'ionicons/icons';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { DEMO_WRAPPERS } from '@ng-forge/examples-shared-ui';
import { SandboxAppFactory } from '@ng-forge/sandbox-harness';

// Ionic Stencil's <ion-icon> tree-shakes by default — icons must be registered
// explicitly via addIcons() before they render. The set below covers the icons
// referenced by the docs addon examples and the field-type live demos.
addIcons({
  'add-outline': addOutline,
  'cash-outline': cashOutline,
  'close-outline': closeOutline,
  'eye-outline': eyeOutline,
  'paper-plane-outline': paperPlaneOutline,
  'refresh-outline': refreshOutline,
  'save-outline': saveOutline,
  'search-outline': searchOutline,
});

@Component({
  selector: 'sandbox-ionic-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class IonicRootComponent {}

export const createIonicSandboxApp: SandboxAppFactory = (routes: Route[]) => ({
  config: {
    providers: [
      provideZonelessChangeDetection(),
      provideAnimations(),
      provideHttpClient(),
      provideRouter(routes),
      provideIonicAngular({ mode: 'md' }),
      provideDynamicForm(...withIonicFields(), ...DEMO_WRAPPERS),
      { provide: APP_ID, useValue: 'sandbox-ionic' },
    ],
  },
  rootComponent: IonicRootComponent,
});
