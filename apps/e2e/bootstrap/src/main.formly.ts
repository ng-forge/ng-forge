import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Validators } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { importProvidersFrom } from '@angular/core';
import { perfMockHttpInterceptor, setBenchHttpClient } from '@ng-forge/examples-shared-testing/perf';
import { HttpClient } from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';
import { FormlyBenchmarkComponent, FormlyRepeatTypeComponent } from './app/testing/performance/formly-benchmark.component';

performance.mark('ng-forge:bootstrap-start');

bootstrapApplication(FormlyBenchmarkComponent, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([perfMockHttpInterceptor])),
    provideAppInitializer(() => setBenchHttpClient(inject(HttpClient))),
    importProvidersFrom(
      FormlyBootstrapModule,
      FormlyModule.forRoot({
        types: [{ name: 'repeat', component: FormlyRepeatTypeComponent }],
        validators: [{ name: 'email', validation: Validators.email }],
        validationMessages: [
          { name: 'required', message: 'This field is required' },
          { name: 'minLength', message: 'Enter at least two characters' },
          { name: 'email', message: 'Enter a valid email address' },
        ],
      }),
    ),
  ],
}).catch((error: unknown) => console.error(error));
