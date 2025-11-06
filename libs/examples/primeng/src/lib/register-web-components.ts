import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { PrimeInputExampleComponent } from './input-example.component';

// Map of component to custom element name
const PRIMENG_EXAMPLES = [{ component: PrimeInputExampleComponent, name: 'prime-input-example' }] as const;

/**
 * Registers all PrimeNG example components as web components.
 * Call this function to make all components available in the DOM.
 */
export async function registerPrimeNGExamples() {
  // Create an Angular application for the web components
  const app = await createApplication();
  const injector = app.injector;

  // Register each component as a custom element
  PRIMENG_EXAMPLES.forEach(({ component, name }) => {
    if (!customElements.get(name)) {
      const element = createCustomElement(component, { injector });
      customElements.define(name, element);
    }
  });
}

/**
 * Register a single PrimeNG example component by name.
 * @param name The custom element name (e.g., 'prime-input-example')
 */
export async function registerPrimeExample(name: string) {
  const example = PRIMENG_EXAMPLES.find((ex) => ex.name === name);
  if (!example) {
    throw new Error(`PrimeNG example "${name}" not found`);
  }

  if (!customElements.get(name)) {
    const app = await createApplication();
    const element = createCustomElement(example.component, { injector: app.injector });
    customElements.define(name, element);
  }
}
