import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, ValidationMessages, createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-form';
import { PrimeToggleComponent, PrimeToggleProps } from './prime-toggle.type';
import { AsyncPipe } from '@angular/common';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

/**
 * PrimeNG toggle field component
 */
@Component({
  selector: 'df-prime-toggle',
  imports: [ToggleSwitch, DynamicTextPipe, AsyncPipe, FormsModule],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
      <label [for]="key()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }

      <p-toggleSwitch
        [id]="key()"
        [(ngModel)]="f().value"
        [attr.tabindex]="tabIndex()"
        [trueValue]="true"
        [falseValue]="false"
        [styleClass]="props()?.styleClass ?? ''"
      />

      @if (props()?.hint; as hint) {
      <small class="p-hint">{{ hint | dynamicText | async }}</small>
      } @if (showErrors()) { @for (error of resolvedErrors(); track error.kind) {
      <small class="p-error">{{ error.message }}</small>
      } }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class PrimeToggleFieldComponent implements PrimeToggleComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeToggleProps>();
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
