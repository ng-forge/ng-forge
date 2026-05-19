import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, forwardRef, inject, input, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonInput, IonNote } from '@ionic/angular/standalone';
import {
  AddonActionContext,
  AddonActionPreset,
  DfAddonSlot,
  DynamicFormLogger,
  DynamicTextPipe,
  FIELD_SIGNAL_CONTEXT,
  WrapperFieldInputs,
} from '@ng-forge/dynamic-forms';
import {
  ADDON_PRESET_HANDLER,
  AddonPresetHandler,
  injectNgForgeAddons,
  injectNgForgeField,
  NgForgeAddons,
  NgForgeControl,
  NgForgeFieldHost,
} from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { runIonicPresetAction } from '../../addons/preset-actions';
import { IONIC_CONFIG } from '../../models/ionic-config.token';
import { IONIC_INPUT_TYPE_OVERRIDE } from '../../tokens/input-type-override.token';
import { IonInputAddon, IonicInputProps } from './ionic-input.type';

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
//
// Addons (prefix / suffix):
//
// <ion-input> projects shadow-DOM slots `start` and `end`. We translate the
// universal `prefix` / `suffix` slot model by rendering a wrapper element
// with `slot="start"` / `slot="end"` as a direct child of <ion-input>; the
// addon itself (carrying its own `slot` attribute via <df-addon-slot>) sits
// inside the wrapper where its slot attribute is harmless.
@Component({
  selector: 'df-ion-input',
  imports: [IonInput, IonNote, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl, DfAddonSlot],
  hostDirectives: [NgForgeFieldHost, NgForgeAddons],
  template: `
    @let f = ngf.field();
    @let inputId = ngf.key() + '-input';

    <ion-input
      ngForgeControl
      [id]="inputId"
      [type]="type()"
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
    >
      @for (a of ngfa.prefixAddons(); track $index) {
        <span slot="start">
          <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
        </span>
      }
      @for (a of ngfa.suffixAddons(); track $index) {
        <span slot="end">
          <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
        </span>
      }
    </ion-input>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</ion-note>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../../styles/_form-field.scss',
  providers: [
    {
      provide: IONIC_INPUT_TYPE_OVERRIDE,
      useFactory: () => signal<string | undefined>(undefined),
    },
    {
      // Adapter-specific preset semantics for `ion-button` addons (clear /
      // reset / paste / copy / toggle-password-visibility). The directive
      // (`NgForgeAddonAction`) delegates here when an addon configures a
      // `preset`. Per-ion-input-instance so the `typeOverride` signal is
      // scoped to one field.
      provide: ADDON_PRESET_HANDLER,
      useFactory: (): AddonPresetHandler => {
        const typeOverride = inject(IONIC_INPUT_TYPE_OVERRIDE);
        const fsc = inject(FIELD_SIGNAL_CONTEXT, { optional: true });
        const logger = inject(DynamicFormLogger);
        const host = inject(forwardRef(() => IonicInputFieldComponent));
        return {
          run: (preset: string, ctx: AddonActionContext) => {
            const fieldKey = ctx.field.key;
            // The handler contract is `preset: string`; cast back to the
            // narrow union at the runner's signature boundary.
            return runIonicPresetAction(preset as AddonActionPreset, ctx, {
              typeOverride,
              fieldValueSetter: ctx.setValue,
              fieldDefaultValueGetter:
                fsc && fieldKey ? () => (fsc.defaultValues() as Record<string, unknown> | undefined)?.[fieldKey] : undefined,
              baselineType: () => host.props()?.type,
              logger,
            });
          },
        };
      },
    },
  ],
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
      /* ion-input projects shadow-DOM slots start and end. The default gap
         between the slot wrapper and the input text is too tight for icons.
         Padding (not margin) on the slot wrapper survives Ionic's shadow-DOM
         flex layout reliably. Exposed as a CSS custom property so consumers
         can override; default 0.5rem matches Ionic's padding-medium scale. */
      :host {
        --df-ion-addon-padding: 0.5rem;
      }
      :host ::ng-deep ion-input [slot='start'] {
        display: inline-flex;
        align-items: center;
        padding-inline-end: var(--df-ion-addon-padding);
      }
      :host ::ng-deep ion-input [slot='end'] {
        display: inline-flex;
        align-items: center;
        padding-inline-start: var(--df-ion-addon-padding);
      }
      /* Make sure ion-icon inside addon-slots is readable on dark surfaces.
         Ionic medium (low-contrast grey) is the default for icon buttons,
         which fails WCAG on dark inputs. Inherit the input text color so
         icons match whatever foreground Ionic resolves for the current
         theme. */
      :host ::ng-deep ion-input ion-icon {
        color: inherit;
      }
    `,
  ],
})
export default class IonicInputFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private ionicConfig = inject(IONIC_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<string>();
  protected readonly ngfa = injectNgForgeAddons<IonInputAddon>();

  readonly props = input<IonicInputProps>();

  /**
   * Wrapper-style host bag pushed by `DfFieldOutlet`. Declared at the
   * component level so `setInputIfDeclared` (which uses
   * `reflectComponentType`) can write it.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  /** Per-instance type override populated by `toggle-password-visibility` preset. */
  private readonly typeOverride = inject(IONIC_INPUT_TYPE_OVERRIDE);

  protected readonly fill = computed(() => this.props()?.fill ?? this.ionicConfig?.fill ?? 'solid');
  protected readonly shape = computed(() => this.props()?.shape ?? this.ionicConfig?.shape);
  /** Default 'stacked' (label above the input) for adapter parity with Material /
   *  Bootstrap / PrimeNG. Consumers can opt into Ionic's native inline 'start'
   *  or 'fixed' via props.labelPlacement or the IONIC_CONFIG token. */
  protected readonly labelPlacement = computed(() => this.props()?.labelPlacement ?? this.ionicConfig?.labelPlacement ?? 'stacked');
  protected readonly color = computed(() => this.props()?.color ?? this.ionicConfig?.color);

  /** Override (set by `toggle-password-visibility` preset) wins over `props().type`. */
  protected readonly type = computed(() => this.typeOverride() ?? this.props()?.type ?? 'text');

  /** Set when the component is destroyed — guards async aria-describedby sync against teardown. */
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
    // ion-input encapsulates a native <input> in shadow DOM and does not automatically
    // propagate aria-describedby to it. This effect imperatively syncs the attribute
    // after a microtask to ensure Ionic has resolved the internal element.
    explicitEffect([this.ngf.ariaDescribedBy], ([describedBy]) => {
      queueMicrotask(() => {
        if (this.destroyed) return;
        const ionInput = this.elementRef.nativeElement.querySelector('ion-input') as HTMLIonInputElement | null;
        if (ionInput?.getInputElement) {
          ionInput.getInputElement().then((inputEl) => {
            if (this.destroyed || !inputEl) return;
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
