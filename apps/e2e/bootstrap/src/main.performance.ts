import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
import { DirectEntryBenchmarkComponent } from './app/testing/performance/direct-entry-benchmark.component';

performance.mark('ng-forge:bootstrap-start');

bootstrapApplication(DirectEntryBenchmarkComponent, {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection(), provideDynamicForm(...withBootstrapFields())],
}).catch((error: unknown) => console.error(error));
