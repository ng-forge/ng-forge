import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, forwardRef, inject, input, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonInput, IonNote } from '@ionic/angular/standalone';
import { AddonActionContext, AddonActionPreset, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { DfAddonSlot } from '@ng-forge/dynamic-forms/integration';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';
import { DynamicTextPipe, FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms/integration';
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
import { IonInlineButtonAddonComponent } from '../../addons/ion-inline-button-addon.component';
import { IONIC_CONFIG } from '../../models/ionic-config.token';
import { IONIC_INPUT_TYPE_OVERRIDE } from '../../tokens/input-type-override.token';
import { IonInputAddon, IonicInputProps } from './ionic-input.type';

// minlength/maxlength bindings: Signal Forms auto-syncs these on NATIVE
// inputs; <ion-input> is a Stencil web component so we bind directly from
// FieldState (`f().maxLength?.()` — the signal itself is missing when no
// validator is configured).
@Component({
  selector: 'df-ion-input',
  // IonButton intentionally NOT imported — it would collide with
  // IonInlineButtonAddonComponent on `<ion-button>` (NG0300).
  imports: [IonInput, IonNote, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl, DfAddonSlot, IonInlineButtonAddonComponent],
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
      @for (a of decorativePrefixAddons(); track $index) {
        <span slot="start">
          <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
        </span>
      }
      @for (a of buttonPrefixAddons(); track $index) {
        <ion-button df-ion-button-addon slot="start" [addon]="a" [fieldInputs]="fieldInputs()"></ion-button>
      }
      @for (a of buttonSuffixAddons(); track $index) {
        <ion-button df-ion-button-addon slot="end" [addon]="a" [fieldInputs]="fieldInputs()"></ion-button>
      }
      @for (a of decorativeSuffixAddons(); track $index) {
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
        // forwardRef for baselineType only — host.props()?.type gates toggle-password-visibility.
        const host = inject(forwardRef(() => IonicInputFieldComponent));
        return {
          run: (preset: string, ctx: AddonActionContext) => {
            const fieldKey = ctx.field.key;
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
      /* Per-side padding knobs on each slot wrapper (independent prefix/suffix). */
      :host {
        --df-ion-addon-prefix-outer-padding: 0;
        --df-ion-addon-prefix-inner-padding: 0.5rem;
        --df-ion-addon-suffix-inner-padding: 0.5rem;
        --df-ion-addon-suffix-outer-padding: 0;
      }
      /* inline-flex on slot wrappers prevents baseline-pinning of decorative addon glyphs. */
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
      /* Inherit input text color so icons stay readable on dark themes
         (Ionic's default "medium" greys out and fails WCAG on dark inputs). */
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
  /**  Bootstrap / PrimeNG. Consumers can opt into Ionic's native inline 'start' */
  protected readonly labelPlacement = computed(() => this.props()?.labelPlacement ?? this.ionicConfig?.labelPlacement ?? 'stacked');
  protected readonly color = computed(() => this.props()?.color ?? this.ionicConfig?.color);

  /** Override (set by `toggle-password-visibility` preset) wins over `props().type`. */
  protected readonly type = computed(() => this.typeOverride() ?? this.props()?.type ?? 'text');

  /** Per-type split: ion-button addons render inline via the attribute-
   *  selector inline component (so the slotted element is a native
   *  <ion-button> Ionic can style); everything else (icon/text/template/
   *  component types) goes through the universal <df-addon-slot> dispatcher
   *  wrapped in <span slot="start|end"> for safe shadow-DOM projection. */
  protected readonly buttonPrefixAddons = computed(() => this.ngfa.prefixAddons().filter((a) => a.type === 'ion-button'));
  protected readonly buttonSuffixAddons = computed(() => this.ngfa.suffixAddons().filter((a) => a.type === 'ion-button'));
  protected readonly decorativePrefixAddons = computed(() => this.ngfa.prefixAddons().filter((a) => a.type !== 'ion-button'));
  protected readonly decorativeSuffixAddons = computed(() => this.ngfa.suffixAddons().filter((a) => a.type !== 'ion-button'));

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
