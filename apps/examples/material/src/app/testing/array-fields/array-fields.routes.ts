export default [
  {
    path: '',
    loadComponent: () => import('./array-fields-index.component').then((m) => m.ArrayFieldsIndexComponent),
  },
  {
    path: 'array-add',
    loadComponent: () => import('./array-add-test.component').then((m) => m.ArrayAddTestComponent),
    data: { title: 'Array Add Test' },
  },
  {
    path: 'array-remove',
    loadComponent: () => import('./array-remove-test.component').then((m) => m.ArrayRemoveTestComponent),
    data: { title: 'Array Remove Test' },
  },
  {
    path: 'array-values',
    loadComponent: () => import('./array-values-test.component').then((m) => m.ArrayValuesTestComponent),
    data: { title: 'Array Values Test' },
  },
  {
    path: 'array-initial-values',
    loadComponent: () => import('./array-initial-values-test.component').then((m) => m.ArrayInitialValuesTestComponent),
    data: { title: 'Array Initial Values Test' },
  },
  {
    path: 'array-item-validation',
    loadComponent: () => import('./array-item-validation-test.component').then((m) => m.ArrayItemValidationTestComponent),
    data: { title: 'Array Item Validation Test' },
  },
  {
    path: 'array-min-length',
    loadComponent: () => import('./array-min-length-test.component').then((m) => m.ArrayMinLengthTestComponent),
    data: { title: 'Array Min Length Test' },
  },
  {
    path: 'array-max-length',
    loadComponent: () => import('./array-max-length-test.component').then((m) => m.ArrayMaxLengthTestComponent),
    data: { title: 'Array Max Length Test' },
  },
  {
    path: 'array-nested',
    loadComponent: () => import('./array-nested-test.component').then((m) => m.ArrayNestedTestComponent),
    data: { title: 'Array Nested Test' },
  },
  {
    path: 'array-multiple-ops',
    loadComponent: () => import('./array-multiple-ops-test.component').then((m) => m.ArrayMultipleOpsTestComponent),
    data: { title: 'Array Multiple Operations Test' },
  },
];
