import { ChangeDetectionStrategy, Component, effect, ElementRef, input, viewChild } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { BsErrorsComponent } from '../../shared/bs-errors.component';
import { BsCheckboxComponent, BsCheckboxProps } from './bs-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-checkbox',
  imports: [Field, BsErrorsComponent, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <div
      class="form-check"
      [class.form-switch]="props()?.switch"
      [class.form-check-inline]="props()?.inline"
      [class.form-check-reverse]="props()?.reverse"
      [attr.hidden]="f().hidden() || null"
    >
      <input
        #checkboxInput
        type="checkbox"
        [field]="f"
        [id]="key()"
        class="form-check-input"
        [class.is-invalid]="f().invalid() && f().touched()"
        [disabled]="f().disabled()"
        [attr.tabindex]="tabIndex()"
        [attr.hidden]="f().hidden() || null"
      />
      <label [for]="key()" class="form-check-label">
        {{ label() | dynamicText | async }}
      </label>
    </div>

    @if (props()?.helpText; as helpText) {
      <div class="form-text" [attr.hidden]="f().hidden() || null">
        {{ helpText | dynamicText | async }}
      </div>
    }

    <df-bs-errors
      [errors]="f().errors()"
      [invalid]="f().invalid()"
      [touched]="f().touched()"
      [attr.hidden]="f().hidden() || null"
    />
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsCheckboxFieldComponent implements BsCheckboxComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<BsCheckboxProps>();

  readonly checkboxInput = viewChild<ElementRef<HTMLInputElement>>('checkboxInput');

  constructor() {
    // Handle indeterminate state
    effect(() => {
      const indeterminate = this.props()?.indeterminate;
      const inputEl = this.checkboxInput()?.nativeElement;

      if (inputEl && indeterminate !== undefined) {
        inputEl.indeterminate = indeterminate;
      }
    });
  }
}
