import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { BsErrorsComponent } from '../../shared/bs-errors.component';
import { BsToggleComponent, BsToggleProps } from './bs-toggle.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-toggle',
  imports: [Field, BsErrorsComponent, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div
      class="form-check form-switch"
      [class.form-check-inline]="props()?.inline"
      [class.form-check-reverse]="props()?.reverse"
      [class.form-switch-sm]="props()?.size === 'sm'"
      [class.form-switch-lg]="props()?.size === 'lg'"
      [attr.hidden]="f().hidden() || null"
    >
      <input
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

      /* Custom size variants for switches */
      .form-switch-sm .form-check-input {
        width: 1.75rem;
        height: 1rem;
        font-size: 0.875rem;
      }

      .form-switch-lg .form-check-input {
        width: 3rem;
        height: 1.75rem;
        font-size: 1.125rem;
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
export default class BsToggleFieldComponent implements BsToggleComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<BsToggleProps>();
}
