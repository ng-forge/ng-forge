import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, provideIonicAngular } from '@ionic/angular/standalone';
import { Route } from '@angular/router';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { createSandboxApp } from './create-sandbox-app';

// Ionic requires its own root template with IonApp/IonRouterOutlet
@Component({
  selector: 'sandbox-ionic-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
class IonicRootComponent {}

export function createIonicApp(routes: Route[]) {
  return createSandboxApp(
    'ionic',
    routes,
    [provideIonicAngular({ mode: 'md' }), provideDynamicForm(...withIonicFields())],
    IonicRootComponent,
    'sandbox-ionic',
  );
}
