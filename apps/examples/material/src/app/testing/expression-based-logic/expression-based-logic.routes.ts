import { Route } from '@angular/router';

export const expressionBasedLogicRoutes: Route[] = [
  {
    path: 'hidden-logic',
    loadComponent: () => import('./hidden-logic-test.component').then((m) => m.HiddenLogicTestComponent),
  },
  {
    path: 'disabled-logic',
    loadComponent: () => import('./disabled-logic-test.component').then((m) => m.DisabledLogicTestComponent),
  },
  {
    path: 'and-logic',
    loadComponent: () => import('./and-logic-test.component').then((m) => m.AndLogicTestComponent),
  },
  {
    path: 'readonly-logic',
    loadComponent: () => import('./readonly-logic-test.component').then((m) => m.ReadonlyLogicTestComponent),
  },
  {
    path: 'or-logic',
    loadComponent: () => import('./or-logic-test.component').then((m) => m.OrLogicTestComponent),
  },
  {
    path: 'nested-and-within-or',
    loadComponent: () => import('./nested-and-within-or-test.component').then((m) => m.NestedAndWithinOrTestComponent),
  },
  {
    path: 'nested-or-within-and',
    loadComponent: () => import('./nested-or-within-and-test.component').then((m) => m.NestedOrWithinAndTestComponent),
  },
];
