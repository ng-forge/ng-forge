import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import type { FieldWrapperContract, WrapperFieldInputs } from '@ng-forge/dynamic-forms';

/**
 * Demo "section" wrapper used by the docs live examples.
 *
 * Adds a titled card around whatever is rendered in the `#fieldComponent` slot.
 * Registered with the sandbox adapters (see the sandbox-adapter-* factories)
 * so the wrappers docs can demonstrate a custom wrapper end-to-end.
 *
 * Shape of the `section` wrapper config (from the docs' perspective):
 * ```typescript
 * { type: 'section', title: 'Contact details' }
 * ```
 */
@Component({
  selector: 'demo-section-wrapper',
  template: `
    <div class="demo-section">
      @if (title()) {
        <div class="demo-section__header">{{ title() }}</div>
      }
      <div class="demo-section__body">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
  styleUrl: './section-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SectionWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly title = input<string>();
  /** Accepted for contract consistency; this demo wrapper doesn't read it. */
  readonly fieldInputs = input<WrapperFieldInputs>();
}

export { SectionWrapperComponent };

/**
 * Config shape for the `section` demo wrapper, used by consumers to type
 * wrapper entries.
 */
export interface SectionWrapper {
  readonly type: 'section';
  readonly title?: string;
}

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryWrappers {
    section: SectionWrapper;
  }
}
