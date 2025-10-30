import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatRadioComponent, MatRadioProps } from './mat-radio.type';
import { RadioOption } from '@ng-forge/dynamic-form';

@Component({
  selector: 'df-mat-radio',
  imports: [FormsModule, MatRadioGroup, MatRadioButton, MatErrorsComponent],
  template: `
    @if (label()) {
    <div class="radio-label">{{ label() }}</div>
    }

    <mat-radio-group [(ngModel)]="value" [disabled]="disabled()" [required]="required() || false" (blur)="touched.set(true)">
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
    <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
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
export class MatRadioFieldComponent<T> implements FormValueControl<T>, MatRadioComponent<T> {
  readonly value = model.required<T>();
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<RadioOption<T>[]>([]);
  readonly props = input<MatRadioProps>();
}
