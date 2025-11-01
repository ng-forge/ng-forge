import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatRadioComponent, MatRadioProps } from './mat-radio.type';
import { RadioOption } from '@ng-forge/dynamic-form';

@Component({
  selector: 'df-mat-radio',
  imports: [MatRadioGroup, MatRadioButton, MatErrorsComponent, Field],
  template: `
    @let f = field(); @if (label()) {
    <div class="radio-label">{{ label() }}</div>
    }

    <mat-radio-group [field]="f">
      @for (option of options(); track option.value) {
      <mat-radio-button
        [value]="option.value"
        [disabled]="option.disabled || false"
        [color]="props()?.color || 'primary'"
        [labelPosition]="props()?.labelPosition || 'after'"
      >
        {{ option.label }}
      </mat-radio-button>
      }
    </mat-radio-group>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint }}</div>
    }
    <df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    '[class]': 'className() || ""',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatRadioFieldComponent<T> implements MatRadioComponent<T> {
  readonly field = input.required<FieldTree<T>>();

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<RadioOption<T>[]>([]);
  readonly props = input<MatRadioProps>();
}
