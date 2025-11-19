import { Route } from '@angular/router';

export default [
  {
    path: 'datepicker-basic',
    loadComponent: () => import('./datepicker-basic.component').then((m) => m.DatepickerBasicComponent),
  },
  {
    path: 'datepicker-constraints',
    loadComponent: () => import('./datepicker-constraints.component').then((m) => m.DatepickerConstraintsComponent),
  },
  {
    path: 'datepicker-validation',
    loadComponent: () => import('./datepicker-validation.component').then((m) => m.DatepickerValidationComponent),
  },
  {
    path: 'datepicker-clear',
    loadComponent: () => import('./datepicker-clear.component').then((m) => m.DatepickerClearComponent),
  },
  {
    path: 'datepicker-disabled',
    loadComponent: () => import('./datepicker-disabled.component').then((m) => m.DatepickerDisabledComponent),
  },
  {
    path: 'datepicker-initial-value',
    loadComponent: () => import('./datepicker-initial-value.component').then((m) => m.DatepickerInitialValueComponent),
  },
  {
    path: 'slider-basic',
    loadComponent: () => import('./slider-basic.component').then((m) => m.SliderBasicComponent),
  },
  {
    path: 'slider-bounds',
    loadComponent: () => import('./slider-bounds.component').then((m) => m.SliderBoundsComponent),
  },
  {
    path: 'slider-steps',
    loadComponent: () => import('./slider-steps.component').then((m) => m.SliderStepsComponent),
  },
  {
    path: 'slider-disabled',
    loadComponent: () => import('./slider-disabled.component').then((m) => m.SliderDisabledComponent),
  },
  {
    path: 'slider-value-display',
    loadComponent: () => import('./slider-value-display.component').then((m) => m.SliderValueDisplayComponent),
  },
  {
    path: 'toggle-basic',
    loadComponent: () => import('./toggle-basic.component').then((m) => m.ToggleBasicComponent),
  },
  {
    path: 'toggle-keyboard',
    loadComponent: () => import('./toggle-keyboard.component').then((m) => m.ToggleKeyboardComponent),
  },
  {
    path: 'toggle-disabled',
    loadComponent: () => import('./toggle-disabled.component').then((m) => m.ToggleDisabledComponent),
  },
  {
    path: 'toggle-validation',
    loadComponent: () => import('./toggle-validation.component').then((m) => m.ToggleValidationComponent),
  },
  {
    path: 'multi-checkbox-basic',
    loadComponent: () => import('./multi-checkbox-basic.component').then((m) => m.MultiCheckboxBasicComponent),
  },
  {
    path: 'multi-checkbox-array',
    loadComponent: () => import('./multi-checkbox-array.component').then((m) => m.MultiCheckboxArrayComponent),
  },
  {
    path: 'multi-checkbox-deselect',
    loadComponent: () => import('./multi-checkbox-deselect.component').then((m) => m.MultiCheckboxDeselectComponent),
  },
  {
    path: 'multi-checkbox-disabled-options',
    loadComponent: () => import('./multi-checkbox-disabled-options.component').then((m) => m.MultiCheckboxDisabledOptionsComponent),
  },
  {
    path: 'multi-checkbox-validation',
    loadComponent: () => import('./multi-checkbox-validation.component').then((m) => m.MultiCheckboxValidationComponent),
  },
] satisfies Route[];
