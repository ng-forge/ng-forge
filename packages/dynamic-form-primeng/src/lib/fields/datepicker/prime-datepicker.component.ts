import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-form';
import { PrimeDatepickerComponent, PrimeDatepickerProps } from './prime-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';

/**
 * PrimeNG datepicker field component
 */
@Component({
  selector: 'df-prime-datepicker',
  imports: [DatePicker, Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
        <label [for]="key()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }

      <p-datepicker
        [inputId]="key()"
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        [dateFormat]="props()?.dateFormat || 'mm/dd/yy'"
        [inline]="props()?.inline ?? false"
        [showIcon]="effectiveShowIcon()"
        [showButtonBar]="props()?.showButtonBar ?? false"
        [selectionMode]="props()?.selectionMode || 'single'"
        [touchUI]="effectiveTouchUI()"
        [view]="effectiveView()"
        [styleClass]="datepickerClasses()"
      />

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
export default class PrimeDatepickerFieldComponent implements PrimeDatepickerComponent {
  private primengConfig = inject(PRIMENG_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<Date | null>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<PrimeDatepickerProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly effectiveStyleClass = computed(() =>
    this.props()?.styleClass ?? this.primengConfig?.styleClass
  );

  readonly effectiveShowIcon = computed(() =>
    this.props()?.showIcon ?? this.primengConfig?.datepickerShowIcon ?? true
  );

  readonly effectiveTouchUI = computed(() =>
    this.props()?.touchUI ?? this.primengConfig?.datepickerTouchUI ?? false
  );

  readonly effectiveView = computed(() =>
    this.props()?.view ?? this.primengConfig?.datepickerView ?? 'date'
  );

  readonly datepickerClasses = computed(() => {
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
