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
// <ion-input> is a custom Ionic web component, so Signal Forms's native-property
// auto-sync (setNativeDomProperty) does not apply. Instead it routes via
// setInputOnDirectives looking up exact camelCase inputs (`minLength`, `maxLength`)
// on the directive class — which we declare below and then forward to ion-input's
// lowercase `[minlength]` / `[maxlength]` attributes. Matches the strategy used by
// the PrimeNG textarea control.
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
      [minlength]="minLength()"
      [maxlength]="maxLength()"
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

  // Length-validator → DOM wiring uses Signal Forms's setInputOnDirectives to copy
  // FieldState.minLength / maxLength onto these camelCase-named inputs automatically.
  // The match must be exact-case — renaming to lowercase would silently break the
  // wiring. See the comment above the @Component decorator.
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);

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
