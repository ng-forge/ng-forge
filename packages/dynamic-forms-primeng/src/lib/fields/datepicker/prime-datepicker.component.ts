import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { PrimeDatepickerProps } from './prime-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { PrimeDatepickerControlComponent } from './prime-datepicker-control.component';

@Component({
  selector: 'df-prime-datepicker',
  imports: [PrimeDatepickerControlComponent, FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('input')],
  template: `
    <div class="df-prime-field">
      @if (field.label()) {
        <label [for]="field.key()" class="df-prime-label">{{ field.label() | dynamicText | async }}</label>
      }

      <df-prime-datepicker-control
        [formField]="field.field()"
        [inputId]="field.key()"
        [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
        [tabIndex]="field.tabIndex()"
        [dateFormat]="props()?.dateFormat || 'mm/dd/yy'"
        [inline]="props()?.inline ?? false"
        [showIcon]="props()?.showIcon ?? true"
        [showButtonBar]="props()?.showButtonBar ?? false"
        [selectionMode]="props()?.selectionMode || 'single'"
        [touchUI]="props()?.touchUI ?? false"
        [view]="props()?.view || 'date'"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
        [defaultDate]="startAt()"
        [styleClass]="datepickerClasses()"
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
export default class PrimeDatepickerFieldComponent {
  protected readonly field = injectNgForgeField<string>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<PrimeDatepickerProps>();

  protected readonly datepickerClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    return classes.join(' ');
  });
}
