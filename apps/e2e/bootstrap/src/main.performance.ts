import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
import { DirectEntryBenchmarkComponent } from './app/testing/performance/direct-entry-benchmark.component';
import { perfMockHttpInterceptor } from '@ng-forge/examples-shared-testing/perf';

performance.mark('ng-forge:bootstrap-start');

bootstrapApplication(DirectEntryBenchmarkComponent, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([perfMockHttpInterceptor])),
    provideDynamicForm(...withBootstrapFields()),
  ],
}).catch((error: unknown) => console.error(error));
