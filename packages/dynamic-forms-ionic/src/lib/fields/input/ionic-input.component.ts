import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FormField } from '@angular/forms/signals';
import { IonInput, IonNote } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { IonicInputProps } from './ionic-input.type';
import { AsyncPipe } from '@angular/common';
import { IONIC_CONFIG } from '../../models/ionic-config.token';

// Length-validator → DOM wiring (minlength/maxlength):
//
// On NATIVE form elements (<input>/<textarea>), Signal Forms's [formField] directive
// auto-syncs minLength/maxLength HTML attributes via setNativeDomProperty (gated by
// elementAcceptsNativeProperty). See the source in @angular/forms/signals.
//
// <ion-input> is a custom Ionic web component, not a native form element, so Signal
// Forms's auto-sync does NOT apply here — it instead routes via setInputOnDirectives
// looking up an exact camelCase input ('maxLength'). <ion-input>'s property is the
// lowercase 'maxlength', which doesn't match. We therefore bind directly from the
// FieldState signals.
//
// `f().maxLength?.()` — the optional `?.()` is required: FieldState.maxLength is
// `Signal<number | undefined> | undefined` (the entire signal is missing if the
// field has no maxLength validator). Same for minLength.
//
// PrimeNG textarea uses the alternate strategy: its control component declares
// camelCase `maxLength` / `minLength` inputs so Signal Forms's setInputOnDirectives
// auto-wires. See packages/dynamic-forms-primeng/src/lib/fields/textarea/.
@Component({
  selector: 'df-ion-input',
  imports: [IonInput, IonNote, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let inputId = ngf.key() + '-input';

    <ion-input
      ngForgeControl
      [id]="inputId"
      [type]="props()?.type ?? 'text'"
      [formField]="f"
      [label]="(ngf.label() | dynamicText | async) ?? undefined"
      [labelPlacement]="labelPlacement()"
      [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
      [clearInput]="props()?.clearInput ?? false"
      [counter]="props()?.counter ?? false"
      [minlength]="f().minLength?.()"
      [maxlength]="f().maxLength?.()"
      [color]="color()"
      [fill]="fill()"
      [shape]="shape()"
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
export default class IonicInputFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private ionicConfig = inject(IONIC_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<string>();

  readonly props = input<IonicInputProps>();

  protected readonly fill = computed(() => this.props()?.fill ?? this.ionicConfig?.fill ?? 'solid');
  protected readonly shape = computed(() => this.props()?.shape ?? this.ionicConfig?.shape);
  protected readonly labelPlacement = computed(() => this.props()?.labelPlacement ?? this.ionicConfig?.labelPlacement ?? 'start');
  protected readonly color = computed(() => this.props()?.color ?? this.ionicConfig?.color);

  constructor() {
    // ion-input encapsulates a native <input> in shadow DOM and does not automatically
    // propagate aria-describedby to it. This effect imperatively syncs the attribute
    // after a microtask to ensure Ionic has resolved the internal element.
    explicitEffect([this.ngf.ariaDescribedBy], ([describedBy]) => {
      queueMicrotask(() => {
        const ionInput = this.elementRef.nativeElement.querySelector('ion-input') as HTMLIonInputElement | null;
        if (ionInput?.getInputElement) {
          ionInput.getInputElement().then((inputEl) => {
            if (!inputEl) return;
            if (describedBy) {
              inputEl.setAttribute('aria-describedby', describedBy);
            } else {
              inputEl.removeAttribute('aria-describedby');
            }
          });
        }
      });
    });
  }
}
