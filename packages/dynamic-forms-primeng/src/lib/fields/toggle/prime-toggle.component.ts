import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { PrimeToggleProps } from './prime-toggle.type';
import { AsyncPipe } from '@angular/common';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'df-prime-toggle',
  imports: [ToggleSwitch, DynamicTextPipe, AsyncPipe, FormField],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  providers: [provideMetaTarget('input[type="checkbox"]')],
  template: `
    <div class="df-prime-field">
      @if (field.label()) {
        <label [for]="field.key()" class="df-prime-label">{{ field.label() | dynamicText | async }}</label>
      }

      <p-toggleSwitch
        [id]="field.key()"
        [formField]="formFieldTree()"
        [attr.tabindex]="field.tabIndex()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
        [trueValue]="true"
        [falseValue]="false"
        [styleClass]="toggleClasses()"
      />

      @if (field.errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="field.errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="p-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class PrimeToggleFieldComponent {
  protected readonly field = inject(NgForgeField);

  readonly props = input<PrimeToggleProps>();

  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<boolean>);

  protected readonly toggleClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    return classes.join(' ');
  });
}
