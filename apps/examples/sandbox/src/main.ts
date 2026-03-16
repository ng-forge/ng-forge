import { bootstrapApplication } from '@angular/platform-browser';
import { APP_ID, provideZonelessChangeDetection } from '@angular/core';
import { provideAdapterRegistry, SandboxHarness } from '@ng-forge/sandbox-harness';
import { HostComponent } from './app/host.component';
import { SANDBOX_ADAPTERS } from './app/adapter-registrations';

bootstrapApplication(HostComponent, {
  providers: [
    provideZonelessChangeDetection(),
    { provide: APP_ID, useValue: 'sandbox-host' },
    provideAdapterRegistry(SANDBOX_ADAPTERS),
    SandboxHarness,
  ],
}).catch((err) => console.error(err));
