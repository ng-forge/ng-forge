import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-form';
import { AsyncPipe } from '@angular/common';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { PrimeSelectComponent, PrimeSelectProps } from './prime-select.type';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';

@Component({
  selector: 'df-prime-select',
  imports: [Field, Select, MultiSelect, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label(); as label) {
        <label [for]="key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }
      @if (isMultiple()) {
        <p-multiSelect
          [field]="f"
          [inputId]="key()"
          [options]="options()"
          optionLabel="label"
          optionValue="value"
          [placeholder]="(props()?.placeholder | dynamicText | async) ?? ''"
          [filter]="props()?.filter ?? false"
          [showClear]="props()?.showClear ?? false"
          [styleClass]="selectClasses()"
        />
      } @else {
        <p-select
          [field]="f"
          [inputId]="key()"
          [options]="options()"
          optionLabel="label"
          optionValue="value"
          [placeholder]="(props()?.placeholder | dynamicText | async) ?? ''"
          [filter]="props()?.filter ?? false"
          [showClear]="props()?.showClear ?? false"
          [styleClass]="selectClasses()"
        />
      }
      @if (props()?.hint; as hint) {
        <small class="df-prime-hint">{{ hint | dynamicText | async }}</small>
      }
      @for (error of errorsToDisplay(); track error.kind) {
        <small class="p-error">{{ error.message }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class PrimeSelectFieldComponent<T> implements PrimeSelectComponent<T> {
  private primengConfig = inject(PRIMENG_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<PrimeSelectProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly isMultiple = computed(() => this.props()?.multiple ?? false);

  readonly effectiveVariant = computed(() =>
    this.props()?.variant ?? this.primengConfig?.variant ?? 'outlined'
  );

  readonly effectiveSize = computed(() =>
    this.props()?.size ?? this.primengConfig?.size
  );

  readonly effectiveStyleClass = computed(() =>
    this.props()?.styleClass ?? this.primengConfig?.styleClass
  );

  readonly selectClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.effectiveStyleClass();
    if (styleClass) {
      classes.push(styleClass);
    }

    // Add p-invalid class when there are errors to display
    if (this.errorsToDisplay().length > 0) {
      classes.push('p-invalid');
    }

    return classes.join(' ');
  });
}
