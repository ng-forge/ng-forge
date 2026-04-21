/**
 * UI Adapter Registry Data
 *
 * Canonical source of UI adapter metadata for the MCP server.
 * Previously generated as ui-adapters.json by generate-registry.ts.
 */

import type { UIAdapterInfo } from './index.js';

export const UI_ADAPTERS: UIAdapterInfo[] = [
  {
    library: 'material',
    package: '@ng-forge/dynamic-forms-material',
    providerFunction: 'withMaterialFields()',
    fieldTypes: [
      {
        type: 'input',
        componentName: 'MatInputFieldComponent',
        additionalProps: {
          appearance: {
            name: 'appearance',
            type: "'fill' | 'outline'",
            description: 'Material form field appearance',
            required: false,
            default: 'outline',
          },
          subscriptSizing: {
            name: 'subscriptSizing',
            type: "'fixed' | 'dynamic'",
            description: 'Error/hint text sizing',
            required: false,
            default: 'dynamic',
          },
          floatLabel: {
            name: 'floatLabel',
            type: "'auto' | 'always' | 'never'",
            description: 'Label float behavior',
            required: false,
            default: 'auto',
          },
          hideRequiredMarker: {
            name: 'hideRequiredMarker',
            type: 'boolean',
            description: 'Hide the required asterisk',
            required: false,
            default: false,
          },
          hint: {
            name: 'hint',
            type: 'DynamicText',
            description: 'Hint text below the field',
            required: false,
          },
        },
      },
      {
        type: 'select',
        componentName: 'MatSelectFieldComponent',
        additionalProps: {
          appearance: {
            name: 'appearance',
            type: "'fill' | 'outline'",
            description: 'Material form field appearance',
            required: false,
            default: 'outline',
          },
          floatLabel: {
            name: 'floatLabel',
            type: "'auto' | 'always' | 'never'",
            description: 'Label float behavior',
            required: false,
            default: 'auto',
          },
          hideRequiredMarker: {
            name: 'hideRequiredMarker',
            type: 'boolean',
            description: 'Hide the required asterisk',
            required: false,
            default: false,
          },
          hint: {
            name: 'hint',
            type: 'DynamicText',
            description: 'Hint text below the field',
            required: false,
          },
        },
      },
      {
        type: 'checkbox',
        componentName: 'MatCheckboxFieldComponent',
        additionalProps: {
          color: {
            name: 'color',
            type: "'primary' | 'accent' | 'warn'",
            description: 'Checkbox color theme',
            required: false,
            default: 'primary',
          },
        },
      },
      {
        type: 'datepicker',
        componentName: 'MatDatepickerFieldComponent',
        additionalProps: {
          appearance: {
            name: 'appearance',
            type: "'fill' | 'outline'",
            description: 'Material form field appearance',
            required: false,
            default: 'outline',
          },
          subscriptSizing: {
            name: 'subscriptSizing',
            type: "'fixed' | 'dynamic'",
            description: 'Error/hint text sizing',
            required: false,
            default: 'dynamic',
          },
          floatLabel: {
            name: 'floatLabel',
            type: "'auto' | 'always' | 'never'",
            description: 'Label float behavior',
            required: false,
            default: 'auto',
          },
          hideRequiredMarker: {
            name: 'hideRequiredMarker',
            type: 'boolean',
            description: 'Hide the required asterisk',
            required: false,
            default: false,
          },
          startView: {
            name: 'startView',
            type: "'month' | 'year' | 'multi-year'",
            description: 'Initial calendar view',
            required: false,
            default: 'month',
          },
          touchUi: {
            name: 'touchUi',
            type: 'boolean',
            description: 'Use touch-friendly calendar UI',
            required: false,
            default: false,
          },
          hint: {
            name: 'hint',
            type: 'DynamicText',
            description: 'Hint text below the field',
            required: false,
          },
        },
      },
      {
        type: 'textarea',
        componentName: 'MatTextareaFieldComponent',
        additionalProps: {
          appearance: {
            name: 'appearance',
            type: "'fill' | 'outline'",
            description: 'Material form field appearance',
            required: false,
            default: 'outline',
          },
          subscriptSizing: {
            name: 'subscriptSizing',
            type: "'fixed' | 'dynamic'",
            description: 'Error/hint text sizing',
            required: false,
            default: 'dynamic',
          },
          floatLabel: {
            name: 'floatLabel',
            type: "'auto' | 'always' | 'never'",
            description: 'Label float behavior',
            required: false,
            default: 'auto',
          },
          hideRequiredMarker: {
            name: 'hideRequiredMarker',
            type: 'boolean',
            description: 'Hide the required asterisk',
            required: false,
            default: false,
          },
          hint: {
            name: 'hint',
            type: 'DynamicText',
            description: 'Hint text below the field',
            required: false,
          },
          rows: {
            name: 'rows',
            type: 'number',
            description: 'Visible row count',
            required: false,
          },
          cols: {
            name: 'cols',
            type: 'number',
            description: 'Visible column count',
            required: false,
          },
          resize: {
            name: 'resize',
            type: "'none' | 'both' | 'horizontal' | 'vertical'",
            description: 'Resize handle behavior',
            required: false,
            default: 'vertical',
          },
          maxLength: {
            name: 'maxLength',
            type: 'number',
            description: 'Maximum character length',
            required: false,
          },
        },
      },
    ],
  },
  {
    library: 'bootstrap',
    package: '@ng-forge/dynamic-forms-bootstrap',
    providerFunction: 'withBootstrapFields()',
    fieldTypes: [
      {
        type: 'input',
        componentName: 'BootstrapInputComponent',
        additionalProps: {
          size: {
            name: 'size',
            type: "'sm' | 'lg'",
            description: 'Bootstrap input size',
            required: false,
          },
          floating: {
            name: 'floating',
            type: 'boolean',
            description: 'Use floating labels',
            required: false,
            default: false,
          },
        },
      },
      {
        type: 'select',
        componentName: 'BootstrapSelectComponent',
        additionalProps: {
          size: {
            name: 'size',
            type: "'sm' | 'lg'",
            description: 'Bootstrap select size',
            required: false,
          },
        },
      },
    ],
  },
  {
    library: 'primeng',
    package: '@ng-forge/dynamic-forms-primeng',
    providerFunction: 'withPrimeNGFields()',
    fieldTypes: [
      {
        type: 'input',
        componentName: 'PrimeInputComponent',
        additionalProps: {
          variant: {
            name: 'variant',
            type: "'outlined' | 'filled'",
            description: 'Input variant style',
            required: false,
            default: 'outlined',
          },
        },
      },
      {
        type: 'select',
        componentName: 'PrimeDropdownComponent',
        additionalProps: {
          filter: {
            name: 'filter',
            type: 'boolean',
            description: 'Enable dropdown filtering',
            required: false,
            default: false,
          },
          showClear: {
            name: 'showClear',
            type: 'boolean',
            description: 'Show clear button',
            required: false,
            default: false,
          },
        },
      },
      {
        type: 'datepicker',
        componentName: 'PrimeDatepickerComponent',
        additionalProps: {
          showIcon: {
            name: 'showIcon',
            type: 'boolean',
            description: 'Show calendar icon',
            required: false,
            default: true,
          },
          dateFormat: {
            name: 'dateFormat',
            type: 'string',
            description: 'Date format pattern',
            required: false,
            default: 'mm/dd/yy',
          },
        },
      },
    ],
  },
  {
    library: 'ionic',
    package: '@ng-forge/dynamic-forms-ionic',
    providerFunction: 'withIonicFields()',
    fieldTypes: [
      {
        type: 'input',
        componentName: 'IonicInputComponent',
        additionalProps: {
          fill: {
            name: 'fill',
            type: "'solid' | 'outline'",
            description: 'Input fill style',
            required: false,
            default: 'solid',
          },
          labelPlacement: {
            name: 'labelPlacement',
            type: "'fixed' | 'stacked' | 'floating'",
            description: 'Label placement style',
            required: false,
            default: 'floating',
          },
        },
      },
      {
        type: 'select',
        componentName: 'IonicSelectComponent',
        additionalProps: {
          interface: {
            name: 'interface',
            type: "'alert' | 'action-sheet' | 'popover'",
            description: 'Selection interface style',
            required: false,
            default: 'alert',
          },
        },
      },
      {
        type: 'toggle',
        componentName: 'IonicToggleComponent',
        additionalProps: {
          enableOnOffLabels: {
            name: 'enableOnOffLabels',
            type: 'boolean',
            description: 'Show on/off labels',
            required: false,
            default: false,
          },
        },
      },
    ],
  },
];
