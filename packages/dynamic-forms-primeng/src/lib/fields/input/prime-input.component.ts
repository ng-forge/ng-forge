import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, Signal, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { AnyAddon, DfAddonSlot, DynamicTextPipe, resolveDynamicValue, WrapperFieldInputs } from '@ng-forge/dynamic-forms';
import { injectNgForgeField, NgForgeControl, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';
import { PRIME_INPUT_TYPE_OVERRIDE } from '../../tokens/input-type-override.token';
import { createPrimeInputValueWriter, PRIME_INPUT_VALUE_WRITER } from '../../tokens/input-value-writer.token';
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
  hostDirectives: [NgForgeFieldHost],
  template: `
    <ng-template #control>
      <input
        pInputText
        ngForgeControl
        [id]="inputId()"
        [formField]="ngf.field()"
        [type]="effectiveType()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="ngf.tabIndex()"
        [class]="inputClasses()"
      />
    </ng-template>
    <div class="df-prime-field">
      @if (ngf.label()) {
        <label [for]="inputId()" class="df-prime-label">{{ ngf.label() | dynamicText | async }}</label>
      }
      @if (hasAddons()) {
        <p-inputgroup>
          @for (a of prefixAddons(); track $index) {
            <p-inputgroup-addon><df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" /></p-inputgroup-addon>
          }
          <ng-container *ngTemplateOutlet="control" />
          @for (a of suffixAddons(); track $index) {
            <p-inputgroup-addon><df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" /></p-inputgroup-addon>
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
      provide: PRIME_INPUT_VALUE_WRITER,
      useFactory: createPrimeInputValueWriter,
    },
  ],
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class PrimeInputFieldComponent {
  private readonly primeNGConfig = inject(PRIMENG_CONFIG, { optional: true });
  private readonly hostInjector = inject(Injector);

  protected readonly ngf = injectNgForgeField<string>();

  readonly props = input<PrimeInputProps>();

  /**
   * Addons rendered as siblings in a `<p-inputgroup>` wrapper. Mapped from
   * `FieldDef.addons` by the runtime field mapper.
   */
  readonly addons = input<ReadonlyArray<PrimeInputAddon> | undefined>();

  /**
   * Wrapper-style host bag pushed by `DfFieldOutlet`. Forwarded to each
   * `<df-addon-slot>` so kind components can read field state and resolve
   * the form path without re-injecting `FIELD_SIGNAL_CONTEXT`.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  /** Per-instance type override populated by toggle-password-visibility preset. */
  private readonly typeOverride = inject(PRIME_INPUT_TYPE_OVERRIDE);
  /** Per-instance value writer consumed by clear/reset/paste presets on button addons. */
  private readonly valueWriter = inject(PRIME_INPUT_VALUE_WRITER);

  constructor() {
    // Bind the writer to a sink that reads the current field signal at
    // click time. The sink is held inside the writer (set via `bind()`,
    // not by mutating a public field) so the writer surface stays clean.
    this.valueWriter.bind((value) =>
      this.ngf
        .field()()
        .value.set(value as string),
    );
  }

  protected readonly size = computed(() => this.props()?.size ?? this.primeNGConfig?.size);
  protected readonly variant = computed(() => this.props()?.variant ?? this.primeNGConfig?.variant);
  /**
   * Effective `type` attribute — override (set by addon presets like
   * `'toggle-password-visibility'`) wins over the configured `props().type`.
   */
  protected readonly effectiveType = computed(() => this.typeOverride() ?? this.props()?.type ?? 'text');

  /**
   * Per-addon `hidden` signal cache. `resolveDynamicValue` wraps Observable
   * inputs in `toSignal` — and a fresh call inside a `computed` would create
   * a new subscription on every re-evaluation. Caching keyed by addon
   * identity guarantees each Observable is subscribed at most once per
   * addon, and the host injector keeps the subscription alive for the life
   * of the component. The cache itself is a `computed`, so it rebuilds when
   * the addons array changes by identity.
   */
  private readonly hiddenSignalCache = computed<ReadonlyMap<PrimeInputAddon, Signal<boolean>>>(() => {
    const addons = this.addons() ?? [];
    const map = new Map<PrimeInputAddon, Signal<boolean>>();
    for (const a of addons) {
      map.set(a, resolveDynamicValue(a.hidden, false, this.hostInjector));
    }
    return map;
  });

  /**
   * Computed views over the addons array, filtered by slot AND by resolved
   * `hidden` state. An addon with `hidden: true` (or a hidden Signal that
   * currently evaluates to true) is excluded — so the `<p-inputgroup>`
   * wrapper drops out entirely when every addon is hidden, instead of
   * rendering an empty group around the bare input.
   */
  protected readonly visibleAddons = computed(() => {
    const addons = this.addons() ?? [];
    const cache = this.hiddenSignalCache();
    return addons.filter((a) => {
      const isHidden = cache.get(a)?.() ?? false;
      return !isHidden;
    });
  });
  protected readonly hasAddons = computed(() => this.visibleAddons().length > 0);
  protected readonly prefixAddons = computed(() => this.visibleAddons().filter((a) => a.slot === 'prefix') as ReadonlyArray<AnyAddon>);
  protected readonly suffixAddons = computed(() => this.visibleAddons().filter((a) => a.slot === 'suffix') as ReadonlyArray<AnyAddon>);

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
