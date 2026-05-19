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

    <div class="df-ion-input-row">
      @for (a of buttonPrefixAddons(); track $index) {
        <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
      }
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
        @for (a of decorativePrefixAddons(); track $index) {
          <span slot="start">
            <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
          </span>
        }
        @for (a of decorativeSuffixAddons(); track $index) {
          <span slot="end">
            <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
          </span>
        }
      </ion-input>
      @for (a of buttonSuffixAddons(); track $index) {
        <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
      }
    </div>
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
         Per-side padding on each slot wrapper — each knob is independent so
         consumers can tune the prefix's gap from the field border (outer)
         and from the input text (inner) without affecting the suffix.
         Padding (not margin) on the slot wrapper survives Ionic's shadow-
         DOM flex layout reliably. */
      :host {
        --df-ion-addon-prefix-outer-padding: 0;
        --df-ion-addon-prefix-inner-padding: 0.5rem;
        --df-ion-addon-suffix-inner-padding: 0.5rem;
        --df-ion-addon-suffix-outer-padding: 0;
      }
      /* ion-button addons render OUTSIDE <ion-input> in a flex row — Ionic's
         shadow CSS forces ion-button projected through start/end slots to
         zero-size / non-interactable. Decorative addons (icon/text/template/
         component) stay inside the slots. */
      .df-ion-input-row {
        display: flex;
        align-items: center;
        gap: var(--df-ion-addon-prefix-inner-padding);
      }
      .df-ion-input-row > ion-input {
        flex: 1 1 auto;
        min-width: 0;
      }
      /* The slot wrapper itself centers correctly via align-self, but the
         icon glyph inside is baseline-pinned at the top of an inline line-
         box (df-addon-slot defaults to display: block; line-height: normal).
         Force the entire wrapper chain into inline-flex so the icon centers
         on its own midline, not the inline baseline. */
      :host ::ng-deep ion-input [slot='start'],
      :host ::ng-deep ion-input [slot='end'] {
        display: inline-flex;
        align-items: center;
        align-self: center;
        line-height: 1;
      }
      :host ::ng-deep ion-input [slot='start'] df-addon-slot,
      :host ::ng-deep ion-input [slot='end'] df-addon-slot,
      :host ::ng-deep ion-input [slot='start'] df-ion-icon-addon,
      :host ::ng-deep ion-input [slot='end'] df-ion-icon-addon {
        display: inline-flex;
        align-items: center;
        line-height: 1;
      }
      :host ::ng-deep ion-input [slot='start'] {
        padding-inline-start: var(--df-ion-addon-prefix-outer-padding);
        padding-inline-end: var(--df-ion-addon-prefix-inner-padding);
      }
      :host ::ng-deep ion-input [slot='end'] {
        padding-inline-start: var(--df-ion-addon-suffix-inner-padding);
        padding-inline-end: var(--df-ion-addon-suffix-outer-padding);
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

  /** Interactive `ion-button` addons render OUTSIDE <ion-input> because Ionic's
   *  shadow CSS forces ion-button projected into the start/end slots to
   *  zero-size / non-interactable. Decorative kinds stay inside the slots. */
  protected readonly buttonPrefixAddons = computed(() => this.ngfa.prefixAddons().filter((a) => a.kind === 'ion-button'));
  protected readonly buttonSuffixAddons = computed(() => this.ngfa.suffixAddons().filter((a) => a.kind === 'ion-button'));
  protected readonly decorativePrefixAddons = computed(() => this.ngfa.prefixAddons().filter((a) => a.kind !== 'ion-button'));
  protected readonly decorativeSuffixAddons = computed(() => this.ngfa.suffixAddons().filter((a) => a.kind !== 'ion-button'));

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
