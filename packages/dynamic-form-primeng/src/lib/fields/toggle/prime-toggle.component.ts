import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { PrimeErrorsComponent } from '../../shared/prime-errors.component';
import { PrimeToggleComponent, PrimeToggleProps } from './prime-toggle.type';
import { AsyncPipe } from '@angular/common';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

/**
 * PrimeNG toggle field component
 */
@Component({
  selector: 'df-prime-toggle',
  imports: [ToggleSwitch, PrimeErrorsComponent, DynamicTextPipe, AsyncPipe, FormsModule],
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
        [disabled]="f().disabled()"
        [attr.tabindex]="tabIndex()"
        [trueValue]="props()?.trueValue ?? true"
        [falseValue]="props()?.falseValue ?? false"
        [styleClass]="props()?.styleClass ?? ''"
      />

      @if (props()?.hint; as hint) {
      <small class="p-hint">{{ hint | dynamicText | async }}</small>
      }

      <df-prime-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
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
}
