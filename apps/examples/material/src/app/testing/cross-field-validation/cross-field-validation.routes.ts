import { PasswordValidationTestComponent } from './password-validation.component';
import { ConditionalFieldsTestComponent } from './conditional-fields.component';
import { DependentFieldsTestComponent } from './dependent-fields.component';
import { EnableDisableTestComponent } from './enable-disable.component';

export default [
  {
    path: 'password-validation',
    component: PasswordValidationTestComponent,
    data: { testId: 'password-validation' },
  },
  {
    path: 'conditional-fields',
    component: ConditionalFieldsTestComponent,
    data: { testId: 'conditional-validation' },
  },
  {
    path: 'dependent-fields',
    component: DependentFieldsTestComponent,
    data: { testId: 'dependent-fields' },
  },
  {
    path: 'enable-disable',
    component: EnableDisableTestComponent,
    data: { testId: 'enable-disable' },
  },
];
