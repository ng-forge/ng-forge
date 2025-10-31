import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormCheckboxControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatToggleComponent, MatToggleProps } from './mat-toggle.type';

@Component({
  selector: 'df-mat-toggle',
  imports: [FormsModule, MatSlideToggle, MatErrorsComponent],
  template: `
    <mat-slide-toggle
      [(ngModel)]="checked"
      [disabled]="disabled()"
      [required]="required() || false"
      [color]="props()?.color || 'primary'"
      [labelPosition]="props()?.labelPosition || 'after'"
      [hideIcon]="props()?.hideIcon || false"
      [disableRipple]="props()?.disableRipple || false"
      [attr.tabindex]="tabIndex()"
      (blur)="touched.set(true)"
      class="toggle-container"
    >
      {{ label() }}
    </mat-slide-toggle>

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
    class: 'className()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatToggleFieldComponent implements FormCheckboxControl, MatToggleComponent {
  readonly checked = model<boolean>(false);

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

  readonly props = input<MatToggleProps>();
}
