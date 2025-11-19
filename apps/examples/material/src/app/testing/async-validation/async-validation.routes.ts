import { HttpGetValidatorTestComponent } from './http-get-validator.component';
import { HttpPostValidatorTestComponent } from './http-post-validator.component';
import { AsyncResourceValidatorTestComponent } from './async-resource-validator.component';
import { HttpErrorHandlingTestComponent } from './http-error-handling.component';
import { MultipleValidatorsTestComponent } from './multiple-validators.component';
import { AsyncValidationPageComponent } from './async-validation-page.component';

export default [
  {
    path: '',
    component: AsyncValidationPageComponent,
  },
  {
    path: 'http-get-validator',
    component: HttpGetValidatorTestComponent,
  },
  {
    path: 'http-post-validator',
    component: HttpPostValidatorTestComponent,
  },
  {
    path: 'async-resource-validator',
    component: AsyncResourceValidatorTestComponent,
  },
  {
    path: 'http-error-handling',
    component: HttpErrorHandlingTestComponent,
  },
  {
    path: 'multiple-validators',
    component: MultipleValidatorsTestComponent,
  },
];
