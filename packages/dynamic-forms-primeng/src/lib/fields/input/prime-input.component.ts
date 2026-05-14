import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DfAddonSlot, DynamicTextPipe, WrapperFieldInputs } from '@ng-forge/dynamic-forms';
import {
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
  hostDirectives: [NgForgeFieldHost, { directive: NgForgeAddons, inputs: ['addons'] }],
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

  protected readonly ngf = injectNgForgeField<string>();
  protected readonly ngfa = injectNgForgeAddons<PrimeInputAddon>();

  readonly props = input<PrimeInputProps>();

  /**
   * Wrapper-style host bag pushed by `DfFieldOutlet`. Declared at the
   * component level so `setInputIfDeclared` (which uses
   * `reflectComponentType`) can write it — `reflectComponentType` misses
   * host-directive-forwarded inputs.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  /** Per-instance type override populated by toggle-password-visibility preset. */
  private readonly typeOverride = inject(PRIME_INPUT_TYPE_OVERRIDE);
  /** Per-instance value writer consumed by clear/reset/paste presets on button addons. */
  private readonly valueWriter = inject(PRIME_INPUT_VALUE_WRITER);

  constructor() {
    this.valueWriter.bind((value) =>
      this.ngf
        .field()()
        .value.set(value as string),
    );
  }

  protected readonly size = computed(() => this.props()?.size ?? this.primeNGConfig?.size);
  protected readonly variant = computed(() => this.props()?.variant ?? this.primeNGConfig?.variant);

  /** Override (set by `toggle-password-visibility` preset) wins over `props().type`. */
  protected readonly effectiveType = computed(() => this.typeOverride() ?? this.props()?.type ?? 'text');

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
