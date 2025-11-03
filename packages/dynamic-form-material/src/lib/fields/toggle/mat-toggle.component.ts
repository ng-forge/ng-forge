import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatToggleComponent, MatToggleProps } from './mat-toggle.type';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'df-mat-toggle',
  imports: [MatSlideToggle, MatErrorsComponent, Field, MatError],
  template: `
    @let f = field();

    <mat-slide-toggle
      [field]="f"
      [color]="props()?.color || 'primary'"
      [labelPosition]="props()?.labelPosition || 'after'"
      [hideIcon]="props()?.hideIcon || false"
      [disableRipple]="props()?.disableRipple || false"
      [disabled]="f().disabled()"
      [attr.tabindex]="tabIndex()"
      class="toggle-container"
    >
      {{ label() }}
    </mat-slide-toggle>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint }}</div>
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
    '[class]': 'className()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatToggleFieldComponent implements MatToggleComponent {
  readonly field = input.required<FieldTree<boolean>>();

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<MatToggleProps>();
}
