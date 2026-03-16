import {
  AfterViewChecked,
  ApplicationRef,
  ChangeDetectorRef,
  createComponent,
  Directive,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  OnDestroy,
  Type,
} from '@angular/core';
import { LiveExampleComponent } from '../components/live-example/live-example.component';
import { AdapterPickerComponent } from '../components/adapter-picker/adapter-picker.component';
import { DocsIntegrationViewComponent } from '../components/integration-view/integration-view.component';
import { DocsConfigurationViewComponent } from '../components/configuration-view/configuration-view.component';
import { CascadeVisualComponent } from '../components/cascade-visual/cascade-visual.component';

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
];

/**
 * Scans rendered HTML content for custom element selectors and replaces them
 * with dynamically created Angular component instances.
 *
 * Usage: `<div contentComponents [innerHTML]="html"></div>`
 */
@Directive({
  selector: '[contentComponents]',
})
export class ContentComponentsDirective implements AfterViewChecked, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly componentRefs: Array<ReturnType<typeof createComponent>> = [];
  private lastHtml = '';

  ngAfterViewChecked(): void {
    const currentHtml = this.el.nativeElement.innerHTML;
    if (currentHtml === this.lastHtml) return;
    this.lastHtml = currentHtml;
    this.processContent();
  }

  ngOnDestroy(): void {
    this.destroyComponents();
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

        // Set inputs
        for (const [key, value] of Object.entries(inputs)) {
          componentRef.setInput(key, value);
        }

        this.appRef.attachView(componentRef.hostView);
        this.componentRefs.push(componentRef);
      });
    }

    if (this.componentRefs.length > 0) {
      this.cdr.markForCheck();
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
