import { APP_ID, ApplicationConfig, Component, provideZonelessChangeDetection, Type, ViewEncapsulation } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { IonApp, IonRouterOutlet, provideIonicAngular } from '@ionic/angular/standalone';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';

@Component({
  selector: 'docs-ionic-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
})
class IonicRootComponent {}

export function createIonicDocsApp(routes: Route[]): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(routes),
        provideIonicAngular({ mode: 'md' }),
        provideDynamicForm(...withIonicFields()),
        { provide: APP_ID, useValue: 'docs-ionic' },
      ],
    },
    rootComponent: IonicRootComponent,
  };
}
