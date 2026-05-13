import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { NgForgeField, NgForgeHostControl, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { AsyncPipe } from '@angular/common';
import { PrimeSelectProps } from './prime-select.type';
import { PrimeSelectControlComponent } from './prime-select-control.component';

@Component({
  selector: 'df-prime-select',
  imports: [FormField, PrimeSelectControlComponent, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }, NgForgeHostControl],
  template: `
    <div class="df-prime-field">
      @if (ngf.label(); as label) {
        <label [for]="ngf.key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }

      <df-prime-select-control
        [formField]="ngf.field()"
        [inputId]="ngf.key()"
        [options]="options()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [multiple]="isMultiple()"
        [filter]="props()?.filter ?? false"
        [showClear]="props()?.showClear ?? false"
        [styleClass]="selectClasses()"
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
export default class PrimeSelectFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<PrimeSelectProps>();

  protected readonly isMultiple = computed(() => this.props()?.multiple ?? false);

  protected readonly selectClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    // Note: p-invalid is handled by [invalid] input binding, not manual class
    return classes.join(' ');
  });
}
