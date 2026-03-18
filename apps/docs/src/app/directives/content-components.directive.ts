import {
  ApplicationRef,
  createComponent,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  PLATFORM_ID,
  Type,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ActiveAdapterService } from '../services/active-adapter.service';
import { LiveExampleComponent } from '../components/live-example/live-example.component';
import { AdapterPickerComponent } from '../components/adapter-picker/adapter-picker.component';
import { DocsIntegrationViewComponent } from '../components/integration-view/integration-view.component';
import { DocsConfigurationViewComponent } from '../components/configuration-view/configuration-view.component';
import { CascadeVisualComponent } from '../components/cascade-visual/cascade-visual.component';
import { NestingRulesComponent } from '../components/nesting-rules/nesting-rules.component';
import { LogicFlowComponent } from '../components/logic-flow/logic-flow.component';
import { DerivationFlowComponent } from '../components/derivation-flow/derivation-flow.component';

interface ComponentRegistration {
  selector: string;
  component: Type<unknown>;
  extractInputs?: (element: Element) => Record<string, unknown>;
}

const COMPONENT_REGISTRY: ComponentRegistration[] = [
  {
    selector: 'docs-live-example',
    component: LiveExampleComponent,
    extractInputs: (el) => ({ scenario: el.getAttribute('scenario') ?? '' }),
  },
  {
    selector: 'docs-adapter-picker',
    component: AdapterPickerComponent,
  },
  {
    selector: 'docs-integration-view',
    component: DocsIntegrationViewComponent,
  },
  {
    selector: 'docs-configuration-view',
    component: DocsConfigurationViewComponent,
  },
  {
    selector: 'docs-cascade-visual',
    component: CascadeVisualComponent,
  },
  {
    selector: 'docs-nesting-rules',
    component: NestingRulesComponent,
  },
  {
    selector: 'docs-logic-flow',
    component: LogicFlowComponent,
  },
  {
    selector: 'docs-derivation-flow',
    component: DerivationFlowComponent,
  },
];

/**
 * Reactively scans rendered HTML content for custom element selectors
 * and replaces them with dynamically created Angular component instances.
 *
 * Stores the original HTML so it can re-apply and reprocess when the
 * adapter changes (same content, different dynamic component state).
 *
 * Usage: `<div contentComponents [contentHtml]="html"></div>`
 */
@Directive({
  selector: '[contentComponents]',
})
export class ContentComponentsDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly activeAdapter = inject(ActiveAdapterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly componentRefs: Array<ReturnType<typeof createComponent>> = [];
  private originalHtml = '';

  /** The SafeHtml content — directive applies it to innerHTML and processes dynamic components. */
  readonly contentHtml = input<SafeHtml | null>(null);

  constructor() {
    explicitEffect([this.contentHtml, this.activeAdapter.adapter], ([html]) => {
      if (!html) return;
      // Store original HTML on first receive (before any DOM mutations)
      const htmlString = (html as { changingThisBreaksApplicationSecurity?: string }).changingThisBreaksApplicationSecurity as
        | string
        | undefined;
      if (htmlString) {
        this.originalHtml = htmlString;
      }

      if (!this.isBrowser) {
        // During SSR, set innerHTML directly for SEO — no dynamic component processing needed
        if (this.originalHtml) {
          this.el.nativeElement.innerHTML = this.originalHtml;
        }
        return;
      }

      // Re-apply original HTML to restore custom element tags, then process
      requestAnimationFrame(() => {
        if (this.originalHtml) {
          this.el.nativeElement.innerHTML = this.originalHtml;
        }
        this.processContent();
      });
    });

    this.destroyRef.onDestroy(() => this.destroyComponents());
  }

  private processContent(): void {
    this.destroyComponents();

    for (const registration of COMPONENT_REGISTRY) {
      const elements = this.el.nativeElement.querySelectorAll(registration.selector);
      elements.forEach((element: Element) => {
        const inputs = registration.extractInputs?.(element) ?? {};
        const hostElement = document.createElement('div');
        hostElement.setAttribute('data-dynamic-component', registration.selector);
        element.replaceWith(hostElement);

        const componentRef = createComponent(registration.component, {
          hostElement,
          environmentInjector: this.envInjector,
          elementInjector: this.injector,
        });

        for (const [key, value] of Object.entries(inputs)) {
          componentRef.setInput(key, value);
        }

        this.appRef.attachView(componentRef.hostView);
        this.componentRefs.push(componentRef);
      });
    }
  }

  private destroyComponents(): void {
    for (const ref of this.componentRefs) {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    }
    this.componentRefs.length = 0;
  }
}
