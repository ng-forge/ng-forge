import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideHostMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { AsyncPipe } from '@angular/common';
import { PrimeSelectProps } from './prime-select.type';
import { PrimeSelectControlComponent } from './prime-select-control.component';

@Component({
  selector: 'df-prime-select',
  imports: [FormField, PrimeSelectControlComponent, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  providers: [provideHostMetaTarget()],
  template: `
    <div class="df-prime-field">
      @if (field.label(); as label) {
        <label [for]="field.key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }

      <df-prime-select-control
        [formField]="formFieldTree()"
        [inputId]="field.key()"
        [options]="options()"
        [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
        [multiple]="isMultiple()"
        [filter]="props()?.filter ?? false"
        [showClear]="props()?.showClear ?? false"
        [styleClass]="selectClasses()"
        [meta]="field.meta()"
        [ariaInvalid]="field.ariaInvalid()"
        [ariaRequired]="field.ariaRequired()"
        [ariaDescribedBy]="field.ariaDescribedBy()"
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
export default class PrimeSelectFieldComponent {
  protected readonly field = inject(NgForgeField);

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<PrimeSelectProps>();

  // The directive holds field as FieldTree<unknown>. Narrow it back to ValueType
  // for the inner control's strict template check; runtime shape matches.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<ValueType>);

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
