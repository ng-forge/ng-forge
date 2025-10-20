import {
  Component,
  input,
  output,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewContainerRef,
  viewChildren,
  ComponentRef,
  AfterViewInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from './models/field-config';
import { FormOptions } from './models/form-options';
import { FormBuilder } from './core/form-builder';
import { FieldRegistry } from './core/field-registry';

/**
 * Main component for rendering dynamic forms
 */
@Component({
  selector: 'dynamic-form',
  template: `
    <form [class]="formClassName()">
      @for (field of allFields(); track field.id || field.key) {
        <ng-container #fieldContainer></ng-container>
      }
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class DynamicFormComponent<TModel = unknown> implements OnDestroy, AfterViewInit {
  // Injected services
  private formBuilder = inject(FormBuilder);
  private fieldRegistry = inject(FieldRegistry);

  // View children
  fieldContainers = viewChildren('fieldContainer', { read: ViewContainerRef });

  // Inputs
  fields = input.required<FieldConfig<TModel>[]>();
  model = input.required<TModel>();
  options = input<FormOptions>();

  // Outputs
  modelChange = output<TModel>();
  formSubmit = output<TModel>();

  // Internal state
  private modelSignal = signal<TModel>({} as TModel);
  private componentRefs: ComponentRef<unknown>[] = [];
  
  signalForm = computed(() => {
    // Update model signal when input changes
    const newModel = this.model();
    this.modelSignal.set(newModel);
    
    // Emit model changes
    this.modelChange.emit(newModel);
    
    // Build form when fields or model change
    const fields = this.allFields();
    const options = this.options();
    
    return this.formBuilder.buildForm(fields, this.modelSignal, options);
  });

  // Computed values
  allFields = computed(() => {
    return this.fields().filter((field) => !field.hide);
  });

  formClassName = computed(() => {
    return this.options()?.formClassName ?? 'dynamic-form';
  });

  ngAfterViewInit(): void {
    // Render components after view init
    this.renderFields();
  }

  ngOnDestroy(): void {
    // Clean up component refs
    this.componentRefs.forEach((ref) => ref.destroy());
    this.componentRefs = [];
  }

  /**
   * Render dynamic field components
   */
  private async renderFields(): Promise<void> {
    const containers = this.fieldContainers();
    const fields = this.allFields();
    
    if (containers.length === 0 || fields.length === 0) {
      return;
    }

    // Clear existing components
    this.componentRefs.forEach((ref) => ref.destroy());
    this.componentRefs = [];
    containers.forEach(container => container.clear());

    // Render each field
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const container = containers[i];

      if (!container) continue;

      try {
        const component = await this.fieldRegistry.loadTypeComponent(field.type);
        const componentRef = container.createComponent(component);
        const instance = componentRef.instance as any;

        // Configure field component
        this.configureFieldComponent(instance, field);

        this.componentRefs.push(componentRef);
      } catch (error) {
        console.error(`Failed to render field type "${field.type}":`, error);
      }
    }
  }

  /**
   * Configure a field component instance
   */
  private configureFieldComponent(instance: any, field: FieldConfig<TModel>): void {
    const form = this.signalForm();
    
    // Set field properties as input signals
    if (field.props) {
      Object.entries(field.props).forEach(([key, value]) => {
        if (key in instance && typeof instance[key]?.set === 'function') {
          instance[key].set(value);
        } else if (key in instance) {
          instance[key] = value;
        }
      });
    }

    // Connect to signal form for form controls
    if (field.key && form) {
      const fieldControl = this.getFieldFromTree(form, field.key);
      if (fieldControl && 'value' in instance) {
        // Connect value signal
        if (typeof instance.value?.set === 'function') {
          instance.value.set(fieldControl.value());
        }
      }
    }

    // Connect submit buttons to form submission if no custom onClick provided
    if (field.type === 'submit') {
      const hasCustomOnClick = field.props && (field.props as any).onClick;
      if (!hasCustomOnClick && 'onClick' in instance && typeof instance.onClick?.set === 'function') {
        (instance.onClick as any).set(() => this.onSubmit());
      }
    }
  }

  /**
   * Get a field from the field tree using dot notation
   */
  private getFieldFromTree(tree: any, key: string): any {
    const keys = key.split('.');
    let field: any = tree;
    
    for (const k of keys) {
      field = field[k];
      if (!field) break;
    }
    
    return field;
  }

  /**
   * Handle form submission
   */
  private onSubmit(): void {
    this.formSubmit.emit(this.modelSignal());
  }
}
