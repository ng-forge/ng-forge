import { APP_ID, ApplicationConfig, Component, provideZonelessChangeDetection, Type } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { Route } from '@angular/router';
import { IonApp, IonRouterOutlet, provideIonicAngular } from '@ionic/angular/standalone';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { wrapRoutesWithAdapter } from './adapter-routes';

@Component({
  selector: 'sandbox-ionic-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
class IonicRootComponent {}

export function createIonicApp(routes: Route[]): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(wrapRoutesWithAdapter('ionic', routes), withHashLocation()),
        provideIonicAngular({ mode: 'md' }),
        provideDynamicForm(...withIonicFields()),
        { provide: APP_ID, useValue: 'sandbox-ionic' },
      ],
    },
    rootComponent: IonicRootComponent,
  };
}
