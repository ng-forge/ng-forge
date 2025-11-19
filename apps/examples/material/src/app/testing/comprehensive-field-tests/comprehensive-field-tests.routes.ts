import { Routes } from '@angular/router';
import { ComprehensiveFieldsTestComponent } from './comprehensive-fields.component';
import { ValidationTestComponent } from './validation-test.component';
import { GridLayoutTestComponent } from './grid-layout-test.component';
import { StateManagementTestComponent } from './state-management-test.component';

export const COMPREHENSIVE_FIELD_TESTS_ROUTES: Routes = [
  {
    path: 'comprehensive-fields',
    component: ComprehensiveFieldsTestComponent,
  },
  {
    path: 'validation',
    component: ValidationTestComponent,
  },
  {
    path: 'grid-layout',
    component: GridLayoutTestComponent,
  },
  {
    path: 'state-management',
    component: StateManagementTestComponent,
  },
];
