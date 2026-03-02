import { bootstrapApplication } from '@angular/platform-browser';
import { APP_ID, provideZonelessChangeDetection } from '@angular/core';
import { HostComponent } from './app/host.component';

bootstrapApplication(HostComponent, {
  providers: [provideZonelessChangeDetection(), { provide: APP_ID, useValue: 'sandbox-host' }],
}).catch((err) => console.error(err));
