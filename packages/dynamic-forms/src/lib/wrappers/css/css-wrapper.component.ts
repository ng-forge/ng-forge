import { ChangeDetectionStrategy, Component, computed, inject, isSignal, Signal, ViewContainerRef, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FieldWrapperContract } from '../../models/wrapper-type';
import { WRAPPER_CONTEXT, WrapperContext } from '../../models/field-signal-context.token';
import { DynamicText } from '../../models/types/dynamic-text';
import { CssWrapper } from './css-wrapper.type';

/**
 * Built-in CSS wrapper component.
 *
 * Applies CSS classes from the `cssClasses` config property to the host element,
 * wrapping the inner content (next wrapper or children) in its ViewContainerRef slot.
 *
 * @example
 * ```typescript
 * {
 *   type: 'container',
 *   key: 'styled',
 *   wrappers: [{ type: 'css', cssClasses: 'card p-4' }],
 *   fields: [...]
 * }
 * ```
 */
@Component({
  selector: 'df-css-wrapper',
  template: `<ng-container #fieldComponent></ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'resolvedClasses()',
  },
})
export default class CssWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  private readonly context = inject<WrapperContext<CssWrapper>>(WRAPPER_CONTEXT);

  readonly resolvedClasses: Signal<string>;

  constructor() {
    const raw = this.context.config.cssClasses;
    this.resolvedClasses = resolveDynamicTextToSignal(raw);
  }
}

/**
 * Converts a DynamicText value to a Signal<string>.
 *
 * Must be called in an injection context (constructor or field initializer)
 * because `toSignal()` requires it for Observable cleanup.
 */
function resolveDynamicTextToSignal(value: DynamicText | undefined): Signal<string> {
  let signal: Signal<string>;

  if (!value) {
    signal = computed(() => '');
  } else if (typeof value === 'string') {
    signal = computed(() => value);
  } else if (isSignal(value)) {
    signal = value;
  } else {
    signal = toSignal(value, { initialValue: '' });
  }

  return signal;
}

export { CssWrapperComponent };
