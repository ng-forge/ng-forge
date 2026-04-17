import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { ActiveAdapterService } from '../../services/active-adapter.service';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';
import type { AdapterName } from '@ng-forge/sandbox-harness';

type UiAdapterName = Exclude<AdapterName, 'custom'>;
type FieldType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'multi-checkbox'
  | 'slider'
  | 'datepicker'
  | 'submit'
  | 'button'
  | 'next'
  | 'previous'
  | 'addArrayItem'
  | 'prependArrayItem'
  | 'insertArrayItem'
  | 'removeArrayItem'
  | 'popArrayItem'
  | 'shiftArrayItem';

interface AdapterProp {
  prop: string;
  type: string;
  description: string;
}

type AdapterPropsData = Record<FieldType, Record<UiAdapterName, AdapterProp[]>>;

const BUTTON_PROPS: Record<UiAdapterName, AdapterProp[]> = {
  material: [{ prop: 'color', type: "'primary' | 'accent' | 'warn'", description: 'Material theme color' }],
  bootstrap: [
    {
      prop: 'variant',
      type: "'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link'",
      description: 'Bootstrap button color variant',
    },
    { prop: 'outline', type: 'boolean', description: 'Use outline button style' },
    { prop: 'size', type: "'sm' | 'lg'", description: 'Button size' },
    { prop: 'block', type: 'boolean', description: 'Full-width block button' },
  ],
  primeng: [
    {
      prop: 'severity',
      type: "'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast'",
      description: 'PrimeNG button severity',
    },
    { prop: 'text', type: 'boolean', description: 'Text-only button style' },
    { prop: 'outlined', type: 'boolean', description: 'Outlined button style' },
    { prop: 'raised', type: 'boolean', description: 'Raised button with shadow' },
    { prop: 'rounded', type: 'boolean', description: 'Rounded button corners' },
    { prop: 'icon', type: 'string', description: 'PrimeNG icon class' },
    { prop: 'iconPos', type: "'left' | 'right' | 'top' | 'bottom'", description: 'Icon position relative to label' },
  ],
  ionic: [
    { prop: 'expand', type: "'full' | 'block'", description: 'Button expand mode' },
    { prop: 'fill', type: "'clear' | 'outline' | 'solid' | 'default'", description: 'Ionic button fill style' },
    { prop: 'shape', type: "'round'", description: 'Rounded button shape' },
    { prop: 'size', type: "'small' | 'default' | 'large'", description: 'Button size' },
    { prop: 'color', type: 'string', description: 'Ionic color palette name' },
    { prop: 'strong', type: 'boolean', description: 'Use stronger font weight' },
  ],
};

const ADAPTER_PROPS_DATA = {
  input: {
    material: [
      { prop: 'appearance', type: "'fill' | 'outline'", description: 'Material form field appearance variant' },
      { prop: 'hint', type: 'string', description: 'Helper text displayed below the field' },
      { prop: 'subscriptSizing', description: 'Controls space reserved for hint/error', type: "'fixed' | 'dynamic'" },
      { prop: 'floatLabel', type: "'auto' | 'always' | 'never'", description: 'Label float behavior' },
      { prop: 'hideRequiredMarker', type: 'boolean', description: 'Hide the required asterisk' },
    ],
    bootstrap: [
      { prop: 'size', type: "'sm' | 'lg'", description: 'Bootstrap input size variant' },
      { prop: 'floatingLabel', type: 'boolean', description: 'Use Bootstrap floating label style' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
      { prop: 'plaintext', type: 'boolean', description: 'Render as plaintext (read-only appearance)' },
    ],
    primeng: [
      { prop: 'variant', type: "'outlined' | 'filled'", description: 'PrimeNG input style variant' },
      { prop: 'size', type: "'small' | 'large'", description: 'Input size' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    ionic: [
      { prop: 'fill', type: "'solid' | 'outline'", description: 'Ionic input fill style' },
      { prop: 'shape', type: "'round'", description: 'Rounded corners on the input' },
      {
        prop: 'labelPlacement',
        type: "'start' | 'end' | 'fixed' | 'stacked' | 'floating'",
        description: 'Label position relative to the input',
      },
      { prop: 'color', type: 'string', description: 'Ionic color palette name' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
      { prop: 'clearInput', type: 'boolean', description: 'Show clear button inside input' },
      { prop: 'counter', type: 'boolean', description: 'Show character counter' },
    ],
  },
  textarea: {
    material: [
      { prop: 'appearance', type: "'fill' | 'outline'", description: 'Material form field appearance variant' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
      { prop: 'resize', type: "'none' | 'vertical' | 'horizontal' | 'both'", description: 'Resize handle behavior' },
      { prop: 'floatLabel', type: "'auto' | 'always' | 'never'", description: 'Label float behavior' },
      { prop: 'hideRequiredMarker', type: 'boolean', description: 'Hide the required asterisk' },
    ],
    bootstrap: [
      { prop: 'size', type: "'sm' | 'lg'", description: 'Bootstrap textarea size' },
      { prop: 'floatingLabel', type: 'boolean', description: 'Use Bootstrap floating label style' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    primeng: [
      { prop: 'autoResize', type: 'boolean', description: 'Auto-expand to fit content' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    ionic: [
      { prop: 'fill', type: "'solid' | 'outline'", description: 'Ionic textarea fill style' },
      { prop: 'labelPlacement', type: "'start' | 'end' | 'fixed' | 'stacked' | 'floating'", description: 'Label position' },
      { prop: 'autoGrow', type: 'boolean', description: 'Auto-expand textarea height' },
      { prop: 'counter', type: 'boolean', description: 'Show character counter' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
  },
  select: {
    material: [
      { prop: 'appearance', type: "'fill' | 'outline'", description: 'Material form field appearance variant' },
      { prop: 'multiple', type: 'boolean', description: 'Allow multiple selections' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
      { prop: 'panelMaxHeight', type: 'number', description: 'Max height of dropdown panel in pixels' },
      { prop: 'floatLabel', type: "'auto' | 'always' | 'never'", description: 'Label float behavior' },
      { prop: 'hideRequiredMarker', type: 'boolean', description: 'Hide the required asterisk' },
    ],
    bootstrap: [
      { prop: 'size', type: "'sm' | 'lg'", description: 'Select size variant' },
      { prop: 'floatingLabel', type: 'boolean', description: 'Use Bootstrap floating label' },
      { prop: 'multiple', type: 'boolean', description: 'Allow multiple selections' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    primeng: [
      { prop: 'multiple', type: 'boolean', description: 'Allow multiple selections' },
      { prop: 'filter', type: 'boolean', description: 'Show search filter in dropdown' },
      { prop: 'showClear', type: 'boolean', description: 'Show clear button' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    ionic: [
      { prop: 'fill', type: "'solid' | 'outline'", description: 'Ionic select fill style' },
      { prop: 'labelPlacement', type: "'start' | 'end' | 'fixed' | 'stacked' | 'floating'", description: 'Label position' },
      { prop: 'interface', type: "'action-sheet' | 'popover' | 'alert'", description: 'Presentation style of the picker' },
      { prop: 'multiple', type: 'boolean', description: 'Allow multiple selections' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
  },
  radio: {
    material: [
      { prop: 'color', type: 'ThemePalette', description: 'Material theme color' },
      { prop: 'labelPosition', type: "'before' | 'after'", description: 'Position of label relative to radio button' },
      { prop: 'disableRipple', type: 'boolean', description: 'Disable Material ripple effect' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    bootstrap: [
      { prop: 'inline', type: 'boolean', description: 'Display options in a row' },
      { prop: 'reverse', type: 'boolean', description: 'Reverse label and control order' },
      { prop: 'buttonGroup', type: 'boolean', description: 'Render as Bootstrap button group' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    primeng: [{ prop: 'hint', type: 'string', description: 'Helper text below the field' }],
    ionic: [
      { prop: 'labelPlacement', type: "'start' | 'end' | 'fixed' | 'stacked'", description: 'Label position' },
      { prop: 'justify', type: "'start' | 'end' | 'space-between'", description: 'Alignment of label and radio' },
      { prop: 'color', type: 'string', description: 'Ionic color palette name' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
  },
  checkbox: {
    material: [
      { prop: 'color', type: 'ThemePalette', description: 'Material theme color' },
      { prop: 'labelPosition', type: "'before' | 'after'", description: 'Position of label' },
      { prop: 'disableRipple', type: 'boolean', description: 'Disable Material ripple effect' },
      { prop: 'indeterminate', type: 'boolean', description: 'Show indeterminate state' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    bootstrap: [
      { prop: 'switch', type: 'boolean', description: 'Render as Bootstrap switch style' },
      { prop: 'inline', type: 'boolean', description: 'Inline display' },
      { prop: 'reverse', type: 'boolean', description: 'Reverse label and control order' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    primeng: [
      { prop: 'binary', type: 'boolean', description: 'Use binary true/false value mode' },
      { prop: 'trueValue', type: 'unknown', description: 'Value when checked' },
      { prop: 'falseValue', type: 'unknown', description: 'Value when unchecked' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    ionic: [
      { prop: 'labelPlacement', type: "'start' | 'end' | 'fixed' | 'stacked'", description: 'Label position' },
      { prop: 'justify', type: "'start' | 'end' | 'space-between'", description: 'Alignment of label and checkbox' },
      { prop: 'color', type: 'string', description: 'Ionic color palette name' },
      { prop: 'indeterminate', type: 'boolean', description: 'Show indeterminate state' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
  },
  toggle: {
    material: [
      { prop: 'color', type: 'ThemePalette', description: 'Material theme color' },
      { prop: 'labelPosition', type: "'before' | 'after'", description: 'Position of label' },
      { prop: 'disableRipple', type: 'boolean', description: 'Disable Material ripple effect' },
      { prop: 'hideIcon', type: 'boolean', description: 'Hide the icon on the thumb' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    bootstrap: [
      { prop: 'reverse', type: 'boolean', description: 'Reverse label and control order' },
      { prop: 'inline', type: 'boolean', description: 'Inline display' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    primeng: [
      { prop: 'styleClass', type: 'string', description: 'Additional CSS class for the toggle' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    ionic: [
      { prop: 'labelPlacement', type: "'start' | 'end' | 'fixed' | 'stacked'", description: 'Label position' },
      { prop: 'justify', type: "'start' | 'end' | 'space-between'", description: 'Alignment of label and toggle' },
      { prop: 'color', type: 'string', description: 'Ionic color palette name' },
      { prop: 'enableOnOffLabels', type: 'boolean', description: 'Show ON/OFF text labels on toggle' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
  },
  'multi-checkbox': {
    material: [
      { prop: 'color', type: 'ThemePalette', description: 'Material theme color for all checkboxes' },
      { prop: 'labelPosition', type: "'before' | 'after'", description: 'Position of labels' },
      { prop: 'disableRipple', type: 'boolean', description: 'Disable Material ripple effect' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    bootstrap: [
      { prop: 'switch', type: 'boolean', description: 'Render checkboxes as Bootstrap switches' },
      { prop: 'inline', type: 'boolean', description: 'Display options in a row' },
      { prop: 'reverse', type: 'boolean', description: 'Reverse label and control order' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    primeng: [
      { prop: 'styleClass', type: 'string', description: 'Additional CSS class' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    ionic: [
      { prop: 'labelPlacement', type: "'start' | 'end' | 'fixed' | 'stacked'", description: 'Label position for all checkboxes' },
      { prop: 'justify', type: "'start' | 'end' | 'space-between'", description: 'Alignment of labels and checkboxes' },
      { prop: 'color', type: 'string', description: 'Ionic color palette name' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
  },
  slider: {
    material: [
      { prop: 'color', type: "'primary' | 'accent' | 'warn'", description: 'Material theme color' },
      { prop: 'thumbLabel', type: 'boolean', description: 'Show value label on thumb' },
      { prop: 'tickInterval', type: 'number | string', description: 'Interval between tick marks' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    bootstrap: [
      { prop: 'showValue', type: 'boolean', description: 'Display current value next to slider' },
      { prop: 'valuePrefix', type: 'string', description: 'Prefix string for displayed value' },
      { prop: 'valueSuffix', type: 'string', description: 'Suffix string for displayed value' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    primeng: [
      { prop: 'range', type: 'boolean', description: 'Enable dual-handle range mode' },
      { prop: 'orientation', type: "'horizontal' | 'vertical'", description: 'Slider orientation' },
      { prop: 'styleClass', type: 'string', description: 'Additional CSS class' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    ionic: [
      { prop: 'dualKnobs', type: 'boolean', description: 'Enable dual-handle range mode' },
      { prop: 'pin', type: 'boolean', description: 'Show value pin above thumb' },
      { prop: 'ticks', type: 'boolean', description: 'Show tick marks on track' },
      { prop: 'snaps', type: 'boolean', description: 'Snap to step increments' },
      { prop: 'color', type: 'string', description: 'Ionic color palette name' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
  },
  datepicker: {
    material: [
      { prop: 'appearance', type: "'fill' | 'outline'", description: 'Material form field appearance' },
      { prop: 'color', type: "'primary' | 'accent' | 'warn'", description: 'Material theme color' },
      { prop: 'startView', type: "'month' | 'year' | 'multi-year'", description: 'Initial calendar view' },
      { prop: 'touchUi', type: 'boolean', description: 'Use touch-friendly popup UI' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
      { prop: 'floatLabel', type: "'auto' | 'always' | 'never'", description: 'Label float behavior' },
      { prop: 'hideRequiredMarker', type: 'boolean', description: 'Hide the required asterisk' },
    ],
    bootstrap: [
      { prop: 'size', type: "'sm' | 'lg'", description: 'Input size' },
      { prop: 'floatingLabel', type: 'boolean', description: 'Use Bootstrap floating label' },
      { prop: 'displayMonths', type: 'number', description: 'Number of months to display' },
      { prop: 'navigation', type: "'select' | 'arrows' | 'none'", description: 'Calendar navigation style' },
      { prop: 'showWeekNumbers', type: 'boolean', description: 'Show week numbers in calendar' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    primeng: [
      { prop: 'dateFormat', type: 'string', description: 'Date format string (e.g. dd/mm/yy)' },
      { prop: 'inline', type: 'boolean', description: 'Always show calendar inline' },
      { prop: 'showIcon', type: 'boolean', description: 'Show calendar icon button' },
      { prop: 'showButtonBar', type: 'boolean', description: 'Show Today/Clear buttons' },
      { prop: 'selectionMode', type: "'single' | 'multiple' | 'range'", description: 'Date selection mode' },
      { prop: 'touchUI', type: 'boolean', description: 'Use touch-optimized UI' },
      { prop: 'view', type: "'date' | 'month' | 'year'", description: 'Calendar view mode' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
    ionic: [
      {
        prop: 'presentation',
        type: "'date' | 'date-time' | 'time' | 'month' | 'month-year' | 'year'",
        description: 'Display format for the picker',
      },
      { prop: 'preferWheel', type: 'boolean', description: 'Prefer wheel-style picker on mobile' },
      { prop: 'showDefaultButtons', type: 'boolean', description: 'Show Done/Cancel buttons' },
      { prop: 'showClearButton', type: 'boolean', description: 'Show Clear button' },
      { prop: 'multiple', type: 'boolean', description: 'Allow multiple date selection' },
      { prop: 'color', type: 'string', description: 'Ionic color palette name' },
      { prop: 'hint', type: 'string', description: 'Helper text below the field' },
    ],
  },
  submit: BUTTON_PROPS,
  button: BUTTON_PROPS,
  next: BUTTON_PROPS,
  previous: BUTTON_PROPS,
  addArrayItem: BUTTON_PROPS,
  prependArrayItem: BUTTON_PROPS,
  insertArrayItem: BUTTON_PROPS,
  removeArrayItem: BUTTON_PROPS,
  popArrayItem: BUTTON_PROPS,
  shiftArrayItem: BUTTON_PROPS,
} satisfies AdapterPropsData;

interface CustomFieldGuide {
  contract: 'ValueFieldComponent' | 'CheckedFieldComponent';
  fieldInterface: string;
}

const CUSTOM_FIELD_GUIDES: Partial<Record<string, CustomFieldGuide>> = {
  input: { contract: 'ValueFieldComponent', fieldInterface: 'InputField' },
  textarea: { contract: 'ValueFieldComponent', fieldInterface: 'TextareaField' },
  select: { contract: 'ValueFieldComponent', fieldInterface: 'SelectField' },
  radio: { contract: 'ValueFieldComponent', fieldInterface: 'RadioField' },
  checkbox: { contract: 'CheckedFieldComponent', fieldInterface: 'CheckboxField' },
  toggle: { contract: 'CheckedFieldComponent', fieldInterface: 'ToggleField' },
  'multi-checkbox': { contract: 'ValueFieldComponent', fieldInterface: 'MultiCheckboxField' },
  slider: { contract: 'ValueFieldComponent', fieldInterface: 'SliderField' },
  datepicker: { contract: 'ValueFieldComponent', fieldInterface: 'DatepickerField' },
};

@Component({
  selector: 'docs-adapter-props',
  templateUrl: './adapter-props.component.html',
  styleUrl: './adapter-props.component.scss',
  imports: [CodeHighlightDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsAdapterPropsComponent {
  readonly field = input.required<string>();

  private readonly activeAdapter = inject(ActiveAdapterService);

  readonly isCustomAdapter = computed(() => this.activeAdapter.adapter() === 'custom');

  readonly props = computed(() => {
    if (this.isCustomAdapter()) return [];
    const fieldType = this.field() as FieldType;
    const adapter = this.activeAdapter.adapter() as UiAdapterName;
    return ADAPTER_PROPS_DATA[fieldType]?.[adapter] ?? [];
  });

  readonly customGuide = computed(() => (this.isCustomAdapter() ? (CUSTOM_FIELD_GUIDES[this.field()] ?? null) : null));

  readonly customSnippet = computed(() => {
    const guide = this.customGuide();
    if (!guide) return '';
    const isChecked = guide.contract === 'CheckedFieldComponent';
    const mapper = isChecked ? 'checkboxFieldMapper' : 'valueFieldMapper';
    const name = this.field();
    const className = `My${guide.fieldInterface.replace('Field', '')}`;
    return `import { Component, input } from '@angular/core';
import type { ${guide.fieldInterface}, FieldMeta } from '@ng-forge/dynamic-forms/integration';
import { ${mapper} } from '@ng-forge/dynamic-forms/integration';
import type { ${guide.contract}, FieldTypeDefinition } from '@ng-forge/dynamic-forms';

@Component({ selector: 'my-${name}', template: '<!-- your template -->' })
export default class ${className}Component implements ${guide.contract}<${guide.fieldInterface}> {
  readonly field = input.required();
  readonly key = input.required<string>();
  readonly props = input<${guide.fieldInterface}['props']>();
  readonly meta = input<FieldMeta>();
}

export const ${className}Type: FieldTypeDefinition = {
  name: '${name}',
  loadComponent: () => import('./${name}.component'),
  mapper: ${mapper},
};`;
  });
}
