import { ResetDefaultsTestComponent } from './reset-defaults-test.component';
import { ResetSelectTestComponent } from './reset-select-test.component';
import { ResetCheckboxTestComponent } from './reset-checkbox-test.component';
import { ResetValidationTestComponent } from './reset-validation-test.component';
import { ClearAllTestComponent } from './clear-all-test.component';
import { ClearSelectTestComponent } from './clear-select-test.component';
import { ClearCheckboxTestComponent } from './clear-checkbox-test.component';
import { ResetVsClearTestComponent } from './reset-vs-clear-test.component';
import { RequiredResetClearTestComponent } from './required-reset-clear-test.component';
import { ResetNestedTestComponent } from './reset-nested-test.component';
import { MultipleCyclesTestComponent } from './multiple-cycles-test.component';

export default [
  {
    path: 'reset-defaults',
    component: ResetDefaultsTestComponent,
  },
  {
    path: 'reset-select',
    component: ResetSelectTestComponent,
  },
  {
    path: 'reset-checkbox',
    component: ResetCheckboxTestComponent,
  },
  {
    path: 'reset-validation',
    component: ResetValidationTestComponent,
  },
  {
    path: 'clear-all',
    component: ClearAllTestComponent,
  },
  {
    path: 'clear-select',
    component: ClearSelectTestComponent,
  },
  {
    path: 'clear-checkbox',
    component: ClearCheckboxTestComponent,
  },
  {
    path: 'reset-vs-clear',
    component: ResetVsClearTestComponent,
  },
  {
    path: 'required-reset-clear',
    component: RequiredResetClearTestComponent,
  },
  {
    path: 'reset-nested',
    component: ResetNestedTestComponent,
  },
  {
    path: 'multiple-cycles',
    component: MultipleCyclesTestComponent,
  },
];
