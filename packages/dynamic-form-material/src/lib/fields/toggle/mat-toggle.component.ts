import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatToggleComponent, MatToggleProps } from './mat-toggle.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-toggle',
  imports: [MatSlideToggle, MatErrorsComponent, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-slide-toggle
      [field]="f"
      [color]="props()?.color || 'primary'"
      [labelPosition]="props()?.labelPosition || 'after'"
      [hideIcon]="props()?.hideIcon || false"
      [disableRipple]="props()?.disableRipple || false"
      [disabled]="f.disabled()"
      [attr.tabindex]="tabIndex()"
      class="toggle-container"
    >
      {{ label() | dynamicText | async }}
    </mat-slide-toggle>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint | dynamicText | async }}</div>
    }
    <mat-error><df-mat-errors [errors]="f.errors()" [invalid]="f.invalid()" [touched]="f.touched()" /></mat-error>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatToggleFieldComponent implements MatToggleComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<MatToggleProps>();
}
