import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { PrimeDatepickerProps } from './prime-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { PrimeDatepickerControlComponent } from './prime-datepicker-control.component';

@Component({
  selector: 'df-prime-datepicker',
  imports: [PrimeDatepickerControlComponent, FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    <div class="df-prime-field">
      @if (ngf.label()) {
        <label [for]="ngf.key()" class="df-prime-label">{{ ngf.label() | dynamicText | async }}</label>
      }

      <df-prime-datepicker-control
        [formField]="ngf.field()"
        [inputId]="ngf.key()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [tabIndex]="ngf.tabIndex()"
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
        [meta]="ngf.meta()"
        [ariaInvalid]="ngf.ariaInvalid()"
        [ariaRequired]="ngf.ariaRequired()"
        [ariaDescribedBy]="ngf.ariaDescribedBy()"
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
export default class PrimeDatepickerFieldComponent {
  protected readonly ngf = injectNgForgeField<string>();

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
