import { ComponentRef, Directive, effect, ElementRef, inject, input, OnDestroy, Renderer2 } from '@angular/core';
import { FormUiControl } from '@angular/forms/signals';

/**
 * Utility directive that takes ComponentRef fields and appends them to a form element
 *
 * Usage within DynamicFormComponent:
 * ```html
 * <form [fieldRenderer]="fields()">
 *   <!-- Fields will be automatically rendered here -->
 * </form>
 * ```
 */
@Directive({
  selector: 'form[fieldRenderer]',
})
export class FieldRendererDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLFormElement>);
  private readonly renderer = inject(Renderer2);

  private renderedComponents: ComponentRef<FormUiControl>[] = [];

  // Input that accepts the ComponentRef fields array
  fieldRenderer = input<ComponentRef<FormUiControl>[] | null>();

  constructor() {
    // Watch for changes to fields and render them
    effect(() => {
      this.renderFields();
    });
  }

  private renderFields(): void {
    // Clear existing field components from DOM
    this.clearFields();

    const fields = this.fieldRenderer();

    if (!fields || fields.length === 0) {
      return;
    }

    // Render each field component directly into the form
    fields.forEach((fieldComponent) => {
      if (fieldComponent && fieldComponent.location) {
        // Append the field component's DOM element to the form
        this.renderer.appendChild(this.elementRef.nativeElement, fieldComponent.location.nativeElement);

        // Keep track for cleanup
        this.renderedComponents.push(fieldComponent);
      }
    });
  }

  private clearFields(): void {
    // Remove field components from DOM (but don't destroy them - they're managed by the parent)
    this.renderedComponents.forEach((fieldComponent) => {
      if (fieldComponent.location?.nativeElement?.parentNode === this.elementRef.nativeElement) {
        this.renderer.removeChild(this.elementRef.nativeElement, fieldComponent.location.nativeElement);
      }
    });

    this.renderedComponents = [];
  }

  ngOnDestroy(): void {
    this.clearFields();
  }
}
