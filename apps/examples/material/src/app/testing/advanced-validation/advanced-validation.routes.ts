export default [
  {
    path: 'custom-validator',
    loadComponent: () => import('./custom-validator-test.component').then((m) => m.CustomValidatorTestComponent),
    data: { title: 'Custom Validator Test' },
  },
  {
    path: 'cross-field-validator',
    loadComponent: () => import('./cross-field-validator-test.component').then((m) => m.CrossFieldValidatorTestComponent),
    data: { title: 'Cross-Field Validation Test' },
  },
  {
    path: 'range-validation',
    loadComponent: () => import('./range-validation-test.component').then((m) => m.RangeValidationTestComponent),
    data: { title: 'Range Validation Test' },
  },
  {
    path: 'conditional-validator',
    loadComponent: () => import('./conditional-validator-test.component').then((m) => m.ConditionalValidatorTestComponent),
    data: { title: 'Conditional Validator Test' },
  },
  {
    path: 'multiple-validators',
    loadComponent: () => import('./multiple-validators-test.component').then((m) => m.MultipleValidatorsTestComponent),
    data: { title: 'Multiple Validators Test' },
  },
];
