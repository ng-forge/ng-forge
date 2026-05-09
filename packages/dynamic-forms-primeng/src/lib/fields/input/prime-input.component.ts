import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import {
  AnyAddon,
  DfAddonSlot,
  DynamicText,
  DynamicTextPipe,
  resolveDynamicValue,
  ValidationMessages,
  WrapperFieldInputs,
} from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { PrimeInputAddon, PrimeInputComponent, PrimeInputProps } from './prime-input.type';
import { AsyncPipe } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';
import { PRIME_INPUT_TYPE_OVERRIDE } from '../../tokens/input-type-override.token';
import { createPrimeInputValueWriter, PRIME_INPUT_VALUE_WRITER } from '../../tokens/input-value-writer.token';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-prime-input',
  imports: [InputText, InputGroupModule, InputGroupAddonModule, DfAddonSlot, DynamicTextPipe, AsyncPipe, FormField],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
        <label [for]="inputId()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }
      @if (hasAddons()) {
        <p-inputgroup>
          @for (a of prefixAddons(); track $index) {
            <p-inputgroup-addon><df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" /></p-inputgroup-addon>
          }
          <input
            #inputRef
            pInputText
            [id]="inputId()"
            [formField]="f"
            [type]="effectiveType()"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid()"
            [attr.aria-required]="ariaRequired()"
            [attr.aria-describedby]="ariaDescribedBy()"
            [class]="inputClasses()"
          />
          @for (a of suffixAddons(); track $index) {
            <p-inputgroup-addon><df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" /></p-inputgroup-addon>
          }
        </p-inputgroup>
      } @else {
        <input
          #inputRef
          pInputText
          [id]="inputId()"
          [formField]="f"
          [type]="effectiveType()"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="tabIndex()"
          [attr.aria-invalid]="ariaInvalid()"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-describedby]="ariaDescribedBy()"
          [class]="inputClasses()"
        />
      }
      @if (errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="df-prime-hint" [id]="hintId()">{{ hint | dynamicText | async }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  // Provide a per-instance PRIME_INPUT_TYPE_OVERRIDE so a `pi-button` addon
  // configured with `preset: 'toggle-password-visibility'` can flip the
  // input's type at runtime. Initial value undefined → effectiveType falls
  // back to props().type.
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
export default class PrimeInputFieldComponent implements PrimeInputComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private primeNGConfig = inject(PRIMENG_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeInputProps>();
  readonly meta = input<InputMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();
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
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input' });
    // Patch the sentinel writer now that DI has resolved. Calls happen at
    // click-time (button addon onClick), by which point `field` is bound.
    this.valueWriter.write = (value) => this.field()().value.set(value as string);
  }

  readonly effectiveSize = computed(() => this.props()?.size ?? this.primeNGConfig?.size);
  readonly effectiveVariant = computed(() => this.props()?.variant ?? this.primeNGConfig?.variant);
  /**
   * Effective `type` attribute — override (set by addon presets like
   * `'toggle-password-visibility'`) wins over the configured `props().type`.
   */
  readonly effectiveType = computed(() => this.typeOverride() ?? this.props()?.type ?? 'text');

  /**
   * Computed views over the addons array, filtered by slot AND by resolved
   * `hidden` state. An addon with `hidden: true` (or a hidden Signal that
   * currently evaluates to true) is excluded — so the `<p-inputgroup>`
   * wrapper drops out entirely when every addon is hidden, instead of
   * rendering an empty group around the bare input.
   */
  protected readonly visibleAddons = computed(() => {
    const addons = this.addons() ?? [];
    return addons.filter((a) => !resolveDynamicValue(a.hidden, false)());
  });
  protected readonly hasAddons = computed(() => this.visibleAddons().length > 0);
  protected readonly prefixAddons = computed(() => this.visibleAddons().filter((a) => a.slot === 'prefix') as ReadonlyArray<AnyAddon>);
  protected readonly suffixAddons = computed(() => this.visibleAddons().filter((a) => a.slot === 'suffix') as ReadonlyArray<AnyAddon>);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly inputClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }

    const size = this.effectiveSize();
    if (size === 'small') {
      classes.push('p-inputtext-sm');
    } else if (size === 'large') {
      classes.push('p-inputtext-lg');
    }

    if (this.effectiveVariant() === 'filled') {
      classes.push('p-filled');
    }

    // Note: p-invalid is handled by [invalid] input binding, not manual class
    return classes.join(' ');
  });

  readonly inputId = computed(() => `${this.key()}-input`);

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Unique ID for the hint element, used for aria-describedby */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** Base ID for error elements, used for aria-describedby */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** aria-invalid: true when field is invalid AND touched, false otherwise */
  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** aria-required: true if field is required, null otherwise (to remove attribute) */
  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  /** aria-describedby: links to hint and error messages for screen readers */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
