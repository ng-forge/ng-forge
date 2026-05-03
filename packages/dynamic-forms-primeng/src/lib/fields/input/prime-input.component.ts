import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { PrimeInputProps } from './prime-input.type';
import { AsyncPipe } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';

@Component({
  selector: 'df-prime-input',
  imports: [InputText, DynamicTextPipe, AsyncPipe, FormField],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  providers: [provideMetaTarget('input')],
  template: `
    <div class="df-prime-field">
      @if (field.label()) {
        <label [for]="inputId()" class="df-prime-label">{{ field.label() | dynamicText | async }}</label>
      }
      <input
        pInputText
        [id]="inputId()"
        [formField]="formFieldTree()"
        [type]="props()?.type ?? 'text'"
        [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="field.tabIndex()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
        [class]="inputClasses()"
      />
      @if (field.errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="field.errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="df-prime-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</small>
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
export default class PrimeInputFieldComponent {
  private readonly primeNGConfig = inject(PRIMENG_CONFIG, { optional: true });

  protected readonly field = inject(NgForgeField);

  readonly props = input<PrimeInputProps>();

  // Narrow FieldTree<unknown> to FieldTree<string> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<string>);

  protected readonly effectiveSize = computed(() => this.props()?.size ?? this.primeNGConfig?.size);
  protected readonly effectiveVariant = computed(() => this.props()?.variant ?? this.primeNGConfig?.variant);

  protected readonly inputClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    const size = this.effectiveSize();
    if (size === 'small') {
      classes.push('p-inputtext-sm');
    } else if (size === 'large') {
      classes.push('p-inputtext-lg');
    }
    if (this.effectiveVariant() === 'filled') {
      classes.push('p-filled');
    }
    return classes.join(' ');
  });

  protected readonly inputId = computed(() => `${this.field.key()}-input`);
}
