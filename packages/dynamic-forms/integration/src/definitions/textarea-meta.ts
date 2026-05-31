import { FieldMeta } from '@ng-forge/dynamic-forms/internal';
import { Autocapitalize, AutocompleteValue, EnterKeyHint } from './input-meta';

/**
 * Text wrapping behavior for textarea elements.
 *
 * @see https://html.spec.whatwg.org/multipage/form-elements.html#attr-textarea-wrap
 */
export type TextareaWrap = 'hard' | 'soft' | 'off';

/** Meta attributes specific to HTML textarea elements. */
export interface TextareaMeta extends FieldMeta {
  /**
   * How text should wrap when submitted.
   * - 'hard': Line breaks are inserted to wrap text at cols width
   * - 'soft': Text is wrapped for display but not in submitted value
   * - 'off': No wrapping, horizontal scrolling if needed
   */
  wrap?: TextareaWrap;

  /** Whether to enable spellchecking for the textarea. */
  spellcheck?: boolean;

  /** Hint for form autofill behavior. */
  autocomplete?: AutocompleteValue;

  /** Hint for autocapitalization behavior on virtual keyboards. */
  autocapitalize?: Autocapitalize;

  /** Hint for the enter key label on virtual keyboards. */
  enterkeyhint?: EnterKeyHint;

  /** Maximum number of characters allowed. */
  maxlength?: number;

  /** Minimum number of characters required. */
  minlength?: number;
}
