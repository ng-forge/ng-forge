import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
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
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { runPrimePresetAction } from '../../addons/preset-actions';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';
import { PRIME_INPUT_TYPE_OVERRIDE } from '../../tokens/input-type-override.token';
import { PrimeInputAddon, PrimeInputProps } from './prime-input.type';

@Component({
  selector: 'df-prime-input',
  imports: [
    InputText,
    InputGroupModule,
    InputGroupAddonModule,
    DfAddonSlot,
    DynamicTextPipe,
    AsyncPipe,
    FormField,
    NgForgeControl,
    NgTemplateOutlet,
  ],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost, NgForgeAddons],
  template: `
    <ng-template #control>
      <input
        pInputText
        ngForgeControl
        [id]="inputId()"
        [formField]="ngf.field()"
        [type]="type()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="ngf.tabIndex()"
        [class]="inputClasses()"
      />
    </ng-template>
    <div class="df-prime-field">
      @if (ngf.label()) {
        <label [for]="inputId()" class="df-prime-label">{{ ngf.label() | dynamicText | async }}</label>
      }
      @if (ngfa.hasAddons()) {
        <p-inputgroup>
          @for (a of ngfa.prefixAddons(); track $index) {
            <p-inputgroup-addon>
              <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
            </p-inputgroup-addon>
          }
          <ng-container *ngTemplateOutlet="control" />
          @for (a of ngfa.suffixAddons(); track $index) {
            <p-inputgroup-addon>
              <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
            </p-inputgroup-addon>
          }
        </p-inputgroup>
      } @else {
        <ng-container *ngTemplateOutlet="control" />
      }
      @if (ngf.errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="df-prime-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: PRIME_INPUT_TYPE_OVERRIDE,
      useFactory: () => signal<string | undefined>(undefined),
    },
    {
      // Adapter-specific preset semantics for `prime-button` addons (clear /
      // reset / paste / copy / toggle-password-visibility). The directive
      // (`NgForgeAddonAction`) delegates here when an addon configures a
      // `preset`. Per-prime-input-instance so the `typeOverride` signal is
      // scoped to one field.
      provide: ADDON_PRESET_HANDLER,
      useFactory: (): AddonPresetHandler => {
        const typeOverride = inject(PRIME_INPUT_TYPE_OVERRIDE);
        const fsc = inject(FIELD_SIGNAL_CONTEXT, { optional: true });
        const logger = inject(DynamicFormLogger);
        const host = inject(forwardRef(() => PrimeInputFieldComponent));
        return {
          run: (preset: string, ctx: AddonActionContext) => {
            const fieldKey = ctx.field.key;
            // Derive the writer from the host's own field as the source of
            // truth — see `mat-input.component.ts` for the rationale. Keeps
            // presets working when `ctx.setValue` arrives late via the
            // forwarded fieldInputs bag.
            const fieldValueSetter =
              ctx.setValue ??
              ((next: unknown) =>
                host.ngf
                  .field()()
                  .value.set(next as never));
            // The handler contract is `preset: string`; cast back to the
            // narrow union at the runner's signature boundary.
            return runPrimePresetAction(preset as AddonActionPreset, ctx, {
              typeOverride,
              fieldValueSetter,
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
      /* Make p-inputgroup-addon inherit the input's theme tokens so it
         matches the input surface in any PrimeNG theme (light/dark/custom).
         PrimeNG's default tokens for inputgroup-addon don't always track the
         input's surface — explicit binding via input-text vars keeps them
         visually unified. */
      /* PrimeNG ships its inputgroup CSS via runtime style injection (requires
         providePrimeNG()). When the host app doesn't wire that — like an
         embedded live-example renderer — fall back to layout primitives so
         the input group still flexes horizontally and the addon containers
         have their own chrome. Uses PrimeNG's dedicated inputgroup-addon
         tokens; idempotent if PrimeNG's runtime CSS later loads on top. */
      :host ::ng-deep p-inputgroup {
        display: flex;
        align-items: stretch;
        width: 100%;
      }
      :host ::ng-deep p-inputgroup > input,
      :host ::ng-deep p-inputgroup > .p-inputtext {
        flex: 1 1 auto;
        width: 1%;
      }
      /* Per-side padding on the addon containers (independent knobs). The
         vertical axis still inherits PrimeNG's --p-inputgroup-addon-padding
         when defined. */
      :host {
        --df-prime-addon-prefix-outer-padding: 0.75rem;
        --df-prime-addon-prefix-inner-padding: 0.75rem;
        --df-prime-addon-suffix-inner-padding: 0.75rem;
        --df-prime-addon-suffix-outer-padding: 0.75rem;
      }
      /* Border + background fallbacks chain: prefer PrimeNG's addon tokens
         (loaded when providePrimeNG() runs); fall back to the input-text
         tokens; fall back to a tinted currentColor that always resolves so
         the chrome stays visible even when PrimeNG's runtime CSS isn't
         present in this sub-app's shadow root (multi-demo pages can race
         the style injection — one shadow root wins, the other ends up
         without the inputgroup-addon stylesheet). */
      :host {
        --df-prime-addon-fallback-border-color: color-mix(in srgb, currentColor 20%, transparent);
        --df-prime-addon-fallback-background: color-mix(in srgb, currentColor 4%, transparent);
      }
      :host ::ng-deep p-inputgroup-addon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--p-inputgroup-addon-background, var(--p-content-background, var(--df-prime-addon-fallback-background)));
        color: var(--p-inputgroup-addon-color, var(--p-inputtext-color, currentColor));
        border: 1px solid
          var(--p-inputgroup-addon-border-color, var(--p-inputtext-border-color, var(--df-prime-addon-fallback-border-color)));
      }
      :host ::ng-deep p-inputgroup > p-inputgroup-addon:first-child {
        padding-left: var(--df-prime-addon-prefix-outer-padding);
        padding-right: var(--df-prime-addon-prefix-inner-padding);
      }
      :host ::ng-deep p-inputgroup > p-inputgroup-addon:last-child {
        padding-left: var(--df-prime-addon-suffix-inner-padding);
        padding-right: var(--df-prime-addon-suffix-outer-padding);
      }
      /* prime-button addons sit inside a p-inputgroup-addon for visual parity
         with prime-icon (shared grey container). Flatten the inner p-button
         so it doesn't render its own background/border on top of the addon
         chrome — done via PrimeNG's own button CSS variables so the cascade
         reaches the actual <button> element inside <p-button> (selector-
         based overrides hit specificity ties with PrimeNG's own rules).
         Consumers can override these vars if they want a different look. */
      :host ::ng-deep p-inputgroup-addon df-prime-button-addon {
        --p-button-secondary-background: transparent;
        --p-button-secondary-border-color: transparent;
        --p-button-secondary-color: var(--p-inputtext-color);
        --p-button-secondary-hover-background: var(--p-content-hover-background, rgba(127, 127, 127, 0.08));
        --p-button-secondary-hover-border-color: transparent;
        --p-button-secondary-hover-color: var(--p-inputtext-color);
        --p-button-secondary-active-background: var(--p-content-hover-background, rgba(127, 127, 127, 0.16));
        --p-button-secondary-active-border-color: transparent;
        --p-focus-ring-color: transparent;
        --p-focus-ring-shadow: none;
      }
      :host ::ng-deep p-inputgroup-addon df-prime-button-addon .p-button {
        box-shadow: none;
      }
    `,
  ],
})
export default class PrimeInputFieldComponent {
  private readonly primeNGConfig = inject(PRIMENG_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<string>();
  protected readonly ngfa = injectNgForgeAddons<PrimeInputAddon>();

  readonly props = input<PrimeInputProps>();

  /**
   * Wrapper-style host bag pushed by `DfFieldOutlet`. Declared at the
   * component level so `setInputIfDeclared` (which uses
   * `reflectComponentType`) can write it.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  /** Per-instance type override populated by `toggle-password-visibility` preset. */
  private readonly typeOverride = inject(PRIME_INPUT_TYPE_OVERRIDE);

  protected readonly size = computed(() => this.props()?.size ?? this.primeNGConfig?.size);
  protected readonly variant = computed(() => this.props()?.variant ?? this.primeNGConfig?.variant);

  /** Override (set by `toggle-password-visibility` preset) wins over `props().type`. */
  protected readonly type = computed(() => this.typeOverride() ?? this.props()?.type ?? 'text');

  protected readonly inputClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    const size = this.size();
    if (size === 'small') {
      classes.push('p-inputtext-sm');
    } else if (size === 'large') {
      classes.push('p-inputtext-lg');
    }
    if (this.variant() === 'filled') {
      classes.push('p-filled');
    }
    return classes.join(' ');
  });

  protected readonly inputId = computed(() => `${this.ngf.key()}-input`);
}
