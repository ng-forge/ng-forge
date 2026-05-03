import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Checkbox } from 'primeng/checkbox';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { PrimeCheckboxProps } from './prime-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-prime-checkbox',
  imports: [Checkbox, DynamicTextPipe, AsyncPipe, FormField],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  providers: [provideMetaTarget('input[type="checkbox"]')],
  template: `
    @let f = formFieldTree(); @let checkboxId = field.key() + '-checkbox';

    <div class="flex items-center">
      <p-checkbox
        [formField]="f"
        [inputId]="checkboxId"
        [binary]="props()?.binary ?? true"
        [trueValue]="props()?.trueValue ?? true"
        [falseValue]="props()?.falseValue ?? false"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
        [styleClass]="checkboxClasses()"
        [attr.tabindex]="field.tabIndex()"
      />
      @if (field.label(); as labelText) {
        <label [for]="checkboxId" class="ml-2">{{ labelText | dynamicText | async }}</label>
      }
    </div>

    @if (field.errorsToDisplay()[0]; as error) {
      <small class="p-error" [id]="field.errorId()" role="alert">{{ error.message }}</small>
    } @else if (props()?.hint; as hint) {
      <small class="p-hint" [id]="field.hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</small>
    }
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeCheckboxFieldComponent {
  protected readonly field = inject(NgForgeField);

  readonly props = input<PrimeCheckboxProps>();

  // Narrow FieldTree<unknown> back to FieldTree<boolean> for the inner control's
  // strict template type-check; runtime shape is correct.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<boolean>);

  protected readonly checkboxClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    // Note: p-invalid is handled by [invalid] input binding, not manual class
    return classes.join(' ');
  });
}
