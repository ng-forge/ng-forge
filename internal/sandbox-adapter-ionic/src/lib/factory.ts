import { APP_ID, Component, ViewEncapsulation } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { IonApp, IonRouterOutlet, provideIonicAngular } from '@ionic/angular/standalone';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { SandboxAppFactory } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'sandbox-ionic-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
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
      provideDynamicForm(...withIonicFields()),
      { provide: APP_ID, useValue: 'sandbox-ionic' },
    ],
  },
  rootComponent: IonicRootComponent,
});
