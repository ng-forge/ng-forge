import type { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { checkboxFieldMapper, valueFieldMapper } from '@ng-forge/dynamic-form';
import { MatField } from '../types/types';

/**
 * Material Design field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const MATERIAL_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: MatField.Input,
    loadComponent: () => import('../fields/input/mat-input.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Select,
    loadComponent: () => import('../fields/select/mat-select.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Checkbox,
    loadComponent: () => import('../fields/checkbox/mat-checkbox.component'),
    mapper: checkboxFieldMapper,
  },
  {
    name: MatField.Submit,
    loadComponent: () => import('../fields/submit/mat-submit.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Textarea,
    loadComponent: () => import('../fields/textarea/mat-textarea.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Radio,
    loadComponent: () => import('../fields/radio/mat-radio.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/mat-multi-checkbox.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Datepicker,
    loadComponent: () => import('../fields/datepicker/mat-datepicker.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Slider,
    loadComponent: () => import('../fields/slider/mat-slider.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Toggle,
    loadComponent: () => import('../fields/toggle/mat-toggle.component'),
    mapper: checkboxFieldMapper,
  },
];
