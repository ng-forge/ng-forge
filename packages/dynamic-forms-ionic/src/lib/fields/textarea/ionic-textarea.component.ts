import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FormField } from '@angular/forms/signals';
import { IonNote, IonTextarea } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { IonicTextareaProps } from './ionic-textarea.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-textarea',
  imports: [IonTextarea, IonNote, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let textareaId = ngf.key() + '-textarea';

    <ion-textarea
      ngForgeControl
      [id]="textareaId"
      [formField]="f"
      [label]="(ngf.label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
      [rows]="props()?.rows ?? 4"
      [autoGrow]="props()?.autoGrow ?? false"
      [counter]="props()?.counter ?? false"
      [minlength]="minLength()"
      [maxlength]="maxLength()"
      [color]="props()?.color"
      [fill]="props()?.fill ?? 'outline'"
      [shape]="props()?.shape"
      [readonly]="f().readonly()"
      [helperText]="ngf.errorsToDisplay().length === 0 ? ((props()?.hint | dynamicText | async) ?? undefined) : undefined"
      [attr.tabindex]="ngf.tabIndex()"
    />
    @if (ngf.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</ion-note>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class IonicTextareaFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly ngf = injectNgForgeField<string>();

  readonly props = input<IonicTextareaProps>();

  // Length-validator → DOM wiring uses Signal Forms's setInputOnDirectives to copy
  // FieldState.minLength / maxLength onto these camelCase-named inputs automatically.
  // ion-textarea's underlying property is lowercase, so we forward via [minlength] /
  // [maxlength] template bindings below. See the matching pattern in ionic-input.
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);

  constructor() {
    // ion-textarea encapsulates a native <textarea> in shadow DOM and does not automatically
    // propagate aria-describedby to it. This effect imperatively syncs the attribute
    // after a microtask to ensure Ionic has resolved the internal element.
    explicitEffect([this.ngf.ariaDescribedBy], ([describedBy]) => {
      queueMicrotask(() => {
        const ionTextarea = this.elementRef.nativeElement.querySelector('ion-textarea') as HTMLIonTextareaElement | null;
        if (ionTextarea?.getInputElement) {
          ionTextarea.getInputElement().then((textareaEl) => {
            if (!textareaEl) return;
            if (describedBy) {
              textareaEl.setAttribute('aria-describedby', describedBy);
            } else {
              textareaEl.removeAttribute('aria-describedby');
            }
          });
        }
      });
    });
  }
}
