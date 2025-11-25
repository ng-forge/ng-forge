import { Route } from '@angular/router';
import { BasicSubmissionComponent } from './basic-submission.component';
import { ButtonDisabledStatesComponent } from './button-disabled-states.component';
import { NextButtonPageValidationComponent } from './next-button-page-validation.component';
import { CustomButtonLogicComponent } from './custom-button-logic.component';

export default [
  {
    path: '',
    loadComponent: () => import('./submission-behavior-index.component').then((m) => m.SubmissionBehaviorIndexComponent),
  },
  {
    path: 'basic-submission',
    component: BasicSubmissionComponent,
  },
  {
    path: 'button-disabled-states',
    component: ButtonDisabledStatesComponent,
  },
  {
    path: 'next-button-page-validation',
    component: NextButtonPageValidationComponent,
  },
  {
    path: 'custom-button-logic',
    component: CustomButtonLogicComponent,
  },
] satisfies Route[];
