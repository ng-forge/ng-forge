import { checkboxFieldMapper, FieldTypeDefinition, valueFieldMapper } from '@ng-forge/dynamic-form';
import { PrimeField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/prime-button.mapper';
import { nextButtonFieldMapper, previousButtonFieldMapper, submitButtonFieldMapper } from '../fields/button/prime-specific-button.mapper';

/**
 * PrimeNG field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const PRIMENG_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: PrimeField.Input,
    loadComponent: () => import('../fields/input/prime-input.component'),
    mapper: valueFieldMapper,
  },
  {
    name: PrimeField.Select,
    loadComponent: () => import('../fields/select/prime-select.component'),
    mapper: valueFieldMapper,
  },
  {
    name: PrimeField.Checkbox,
    loadComponent: () => import('../fields/checkbox/prime-checkbox.component'),
    mapper: checkboxFieldMapper,
  },
  {
    name: PrimeField.Button,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: buttonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.Submit,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: submitButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.Next,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: nextButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.Previous,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: previousButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.Textarea,
    loadComponent: () => import('../fields/textarea/prime-textarea.component'),
    mapper: valueFieldMapper,
  },
  {
    name: PrimeField.Radio,
    loadComponent: () => import('../fields/radio/prime-radio.component'),
    mapper: valueFieldMapper,
  },
  {
    name: PrimeField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/prime-multi-checkbox.component'),
    mapper: valueFieldMapper,
  },
  {
    name: PrimeField.Datepicker,
    loadComponent: () => import('../fields/datepicker/prime-datepicker.component'),
    mapper: valueFieldMapper,
  },
  {
    name: PrimeField.Slider,
    loadComponent: () => import('../fields/slider/prime-slider.component'),
    mapper: valueFieldMapper,
  },
  {
    name: PrimeField.Toggle,
    loadComponent: () => import('../fields/toggle/prime-toggle.component'),
    mapper: checkboxFieldMapper,
  },
];
