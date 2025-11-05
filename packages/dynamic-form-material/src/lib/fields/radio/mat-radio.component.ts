import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { DynamicText, DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-form';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatRadioComponent, MatRadioProps } from './mat-radio.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-radio',
  imports: [MatRadioGroup, MatRadioButton, MatErrorsComponent, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field(); @if (label()) {
    <div class="radio-label">{{ label() | dynamicText | async }}</div>
    }

    <mat-radio-group [attr.data-testid]="props()?.['data-testid']" [field]="f">
      @for (option of options(); track option.value) {
      <mat-radio-button
        [value]="option.value"
        [disabled]="option.disabled || false"
        [color]="props()?.color || 'primary'"
        [labelPosition]="props()?.labelPosition || 'after'"
      >
        {{ option.label | dynamicText | async }}
      </mat-radio-button>
      }
    </mat-radio-group>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint | dynamicText | async }}</div>
    }
    <mat-error><df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" /></mat-error>
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
    '[id]': '`${key()}`',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatRadioFieldComponent<T> implements MatRadioComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<MatRadioProps>();
}
