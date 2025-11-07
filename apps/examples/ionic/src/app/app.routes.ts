import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/examples',
    pathMatch: 'full',
  },
  {
    path: 'examples',
    children: [
      {
        path: '',
        loadComponent: () => import('./examples/index/index.component').then((m) => m.IndexComponent),
      },
      {
        path: 'input',
        loadComponent: () => import('./examples/input-demo.component').then((m) => m.InputDemoComponent),
      },
      {
        path: 'select',
        loadComponent: () => import('./examples/select-demo.component').then((m) => m.SelectDemoComponent),
      },
      {
        path: 'checkbox',
        loadComponent: () => import('./examples/checkbox-demo.component').then((m) => m.CheckboxDemoComponent),
      },
      {
        path: 'toggle',
        loadComponent: () => import('./examples/toggle-demo.component').then((m) => m.ToggleDemoComponent),
      },
      {
        path: 'radio',
        loadComponent: () => import('./examples/radio-demo.component').then((m) => m.RadioDemoComponent),
      },
      {
        path: 'multi-checkbox',
        loadComponent: () => import('./examples/multi-checkbox-demo.component').then((m) => m.MultiCheckboxDemoComponent),
      },
      {
        path: 'textarea',
        loadComponent: () => import('./examples/textarea-demo.component').then((m) => m.TextareaDemoComponent),
      },
      {
        path: 'datepicker',
        loadComponent: () => import('./examples/datepicker-demo.component').then((m) => m.DatepickerDemoComponent),
      },
      {
        path: 'slider',
        loadComponent: () => import('./examples/slider-demo.component').then((m) => m.SliderDemoComponent),
      },
      {
        path: 'button',
        loadComponent: () => import('./examples/button-demo.component').then((m) => m.ButtonDemoComponent),
      },
      {
        path: 'complete-form',
        loadComponent: () => import('./examples/complete-form-demo.component').then((m) => m.CompleteFormDemoComponent),
      },
    ],
  },
];
