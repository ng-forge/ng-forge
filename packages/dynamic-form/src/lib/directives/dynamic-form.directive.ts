import { ComponentRef, Directive, ElementRef, inject, input, OnDestroy, Renderer2 } from '@angular/core';
import { FormUiControl } from '@angular/forms/signals';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

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
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form[fieldRenderer]',
})
export class FieldRendererDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLFormElement>);
  private readonly renderer = inject(Renderer2);

  private renderedComponents: ComponentRef<FormUiControl>[] = [];

  // Subject that emits when fields are fully rendered and initialized
  private readonly fieldsInitializedSubject = new Subject<void>();

  // Output that emits when all fields are rendered and initialized
  readonly fieldsInitialized = outputFromObservable(this.fieldsInitializedSubject.asObservable());

  // Input that accepts the ComponentRef fields array
  fieldRenderer = input<ComponentRef<FormUiControl>[] | null>();

  renderFieldsEffect = explicitEffect([this.fieldRenderer], () => this.renderFields());

  private renderFields(): void {
    // Clear existing field components from DOM
    this.clearFields();

    const fields = this.fieldRenderer();

    if (!fields || fields.length === 0) {
      this.fieldsInitializedSubject.next();
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

    // Emit that fields are now rendered and initialized
    // Use setTimeout to ensure DOM is updated and components are properly initialized
    setTimeout(() => {
      this.fieldsInitializedSubject.next();
    }, 0);
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
    this.fieldsInitializedSubject.complete();
  }
}
