import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { PrimeInputProps } from './prime-input.type';
import { AsyncPipe } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';

@Component({
  selector: 'df-prime-input',
  imports: [InputText, DynamicTextPipe, AsyncPipe, FormField, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    <div class="df-prime-field">
      @if (ngf.label()) {
        <label [for]="inputId()" class="df-prime-label">{{ ngf.label() | dynamicText | async }}</label>
      }
      <input
        pInputText
        ngForgeControl
        [id]="inputId()"
        [formField]="ngf.field()"
        [type]="props()?.type ?? 'text'"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="ngf.tabIndex()"
        [attr.aria-invalid]="ngf.ariaInvalid()"
        [attr.aria-required]="ngf.ariaRequired()"
        [attr.aria-describedby]="ngf.ariaDescribedBy()"
        [class]="inputClasses()"
      />
      @if (ngf.errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="df-prime-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</small>
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

  protected readonly ngf = injectNgForgeField<string>();

  readonly props = input<PrimeInputProps>();

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

  protected readonly inputId = computed(() => `${this.ngf.key()}-input`);
}
