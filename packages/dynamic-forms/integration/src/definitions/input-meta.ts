import { FieldMeta } from '@ng-forge/dynamic-forms';

/**
 * Autocomplete values for HTML input elements.
 * Based on the WHATWG HTML specification for autofill.
 *
 * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
 */
export type AutocompleteValue =
  | 'off'
  | 'on'
  | 'name'
  | 'honorific-prefix'
  | 'given-name'
  | 'additional-name'
  | 'family-name'
  | 'honorific-suffix'
  | 'nickname'
  | 'email'
  | 'username'
  | 'new-password'
  | 'current-password'
  | 'one-time-code'
  | 'organization-title'
  | 'organization'
  | 'street-address'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'address-level4'
  | 'address-level3'
  | 'address-level2'
  | 'address-level1'
  | 'country'
  | 'country-name'
  | 'postal-code'
  | 'cc-name'
  | 'cc-given-name'
  | 'cc-additional-name'
  | 'cc-family-name'
  | 'cc-number'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-csc'
  | 'cc-type'
  | 'transaction-currency'
  | 'transaction-amount'
  | 'language'
  | 'bday'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'sex'
  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-area-code'
  | 'tel-local'
  | 'tel-extension'
  | 'impp'
  | 'url'
  | 'photo';

/**
 * Input mode hints for virtual keyboards on mobile devices.
 *
 * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
 */
export type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

/**
 * Enter key hints for virtual keyboards.
 *
 * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-enterkeyhint-attribute
 */
export type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

/**
 * Autocapitalization hints for virtual keyboards.
 *
 * @see https://html.spec.whatwg.org/multipage/interaction.html#attr-autocapitalize
 */
export type Autocapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

/**
 * Meta attributes specific to HTML input elements.
 *
 * Extends FieldMeta with input-specific native attributes that can be passed through
 * to the underlying input element.
 *
 * @example
 * ```typescript
 * // Input field with meta attributes
 * {
 *   type: 'input',
 *   key: 'email',
 *   meta: {
 *     autocomplete: 'email',
 *     inputmode: 'email',
 *     enterkeyhint: 'next',
 *     spellcheck: false,
 *     'data-testid': 'email-input'
 *   }
 * }
 * ```
 *
 * @public
 */
export interface InputMeta extends FieldMeta {
  /**
   * Hint for form autofill behavior.
   */
  autocomplete?: AutocompleteValue;

  /**
   * Hint for virtual keyboard type on mobile devices.
   */
  inputmode?: InputMode;

  /**
   * Hint for the enter key label on virtual keyboards.
   */
  enterkeyhint?: EnterKeyHint;

  /**
   * Whether to enable spellchecking for the input.
   */
  spellcheck?: boolean;

  /**
   * Hint for autocapitalization behavior on virtual keyboards.
   */
  autocapitalize?: Autocapitalize;

  /**
   * Pattern for client-side validation (regex).
   */
  pattern?: string;

  /**
   * Size hint for the input element (character count).
   */
  size?: number;

  /**
   * Maximum number of characters allowed.
   */
  maxlength?: number;

  /**
   * Minimum number of characters required.
   */
  minlength?: number;
}
