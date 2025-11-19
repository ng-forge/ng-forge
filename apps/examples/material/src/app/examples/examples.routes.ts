import { Route } from '@angular/router';

export const exampleRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./index/index.component').then((m) => m.IndexComponent),
  },
  {
    path: 'input',
    loadComponent: () => import('./input-demo.component').then((m) => m.InputDemoComponent),
  },
  {
    path: 'select',
    loadComponent: () => import('./select-demo.component').then((m) => m.SelectDemoComponent),
  },
  {
    path: 'checkbox',
    loadComponent: () => import('./checkbox-demo.component').then((m) => m.CheckboxDemoComponent),
  },
  {
    path: 'toggle',
    loadComponent: () => import('./toggle-demo.component').then((m) => m.ToggleDemoComponent),
  },
  {
    path: 'radio',
    loadComponent: () => import('./radio-demo.component').then((m) => m.RadioDemoComponent),
  },
  {
    path: 'multi-checkbox',
    loadComponent: () => import('./multi-checkbox-demo.component').then((m) => m.MultiCheckboxDemoComponent),
  },
  {
    path: 'textarea',
    loadComponent: () => import('./textarea-demo.component').then((m) => m.TextareaDemoComponent),
  },
  {
    path: 'datepicker',
    loadComponent: () => import('./datepicker-demo.component').then((m) => m.DatepickerDemoComponent),
  },
  {
    path: 'slider',
    loadComponent: () => import('./slider-demo.component').then((m) => m.SliderDemoComponent),
  },
  {
    path: 'button',
    loadComponent: () => import('./button-demo.component').then((m) => m.ButtonDemoComponent),
  },
  {
    path: 'complete-form',
    loadComponent: () => import('./complete-form-demo.component').then((m) => m.CompleteFormDemoComponent),
  },
  {
    path: 'user-registration',
    loadComponent: () => import('./user-registration-demo.component').then((m) => m.UserRegistrationDemoComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./login-demo.component').then((m) => m.LoginDemoComponent),
  },
  {
    path: 'paginated-form',
    loadComponent: () => import('./paginated-form-demo.component').then((m) => m.PaginatedFormDemoComponent),
  },
  {
    path: 'array',
    loadComponent: () => import('./array-demo.component').then((m) => m.ArrayDemoComponent),
  },
  {
    path: 'group',
    loadComponent: () => import('./group-demo.component').then((m) => m.GroupDemoComponent),
  },
  {
    path: 'row',
    loadComponent: () => import('./row-demo.component').then((m) => m.RowDemoComponent),
  },
  {
    path: 'conditional-logic-showcase',
    loadComponent: () => import('./conditional-logic-showcase-demo.component').then((m) => m.ConditionalLogicShowcaseDemoComponent),
  },
  {
    path: 'expression-validators-demo',
    loadComponent: () => import('./expression-validators-demo.component').then((m) => m.ExpressionValidatorsDemoComponent),
  },
];
