import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RawFormsBenchmarkComponent } from './app/testing/performance/raw-forms-benchmark.component';

performance.mark('ng-forge:bootstrap-start');

bootstrapApplication(RawFormsBenchmarkComponent, {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection()],
}).catch((error: unknown) => console.error(error));
