import { ComponentRef, Directive, ElementRef, inject, input, OnDestroy, Renderer2 } from '@angular/core';
import { FormUiControl } from '@angular/forms/signals';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

/**
 * Utility directive that takes ComponentRef definitions and appends them to a form element
 *
 * Usage within DynamicFormComponent:
 * ```html
 * <form [fieldRenderer]="definitions()">
 *   <!-- Fields will be automatically rendered here -->
 * </form>
 * ```
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[fieldRenderer]',
})
export class FieldRendererDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLFormElement>);
  private readonly renderer = inject(Renderer2);

  private renderedComponents: ComponentRef<FormUiControl>[] = [];

  private readonly fieldsInitializedSubject = new Subject<void>();

  readonly fieldsInitialized = outputFromObservable(this.fieldsInitializedSubject.asObservable());

  fieldRenderer = input<ComponentRef<FormUiControl>[] | null>();

  renderFieldsEffect = explicitEffect([this.fieldRenderer], () => this.renderFields());

  private renderFields(): void {
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

    setTimeout(() => {
      this.fieldsInitializedSubject.next();
    }, 0);
  }

  private clearFields(): void {
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
