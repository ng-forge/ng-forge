import {
  Binding,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  inject,
  Injector,
  input,
  inputBinding,
  ViewContainerRef,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { DEFAULT_ROW_GAPS, RowChildField, RowField } from '../../definitions/row-field';
import { FieldRegistry } from '../../core/field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { FormUiControl } from '@angular/forms/signals';
import { get } from 'lodash-es';

@Component({
  selector: 'lib-row-field',
  template: ` <form [class]="containerClasses()" [style]="containerStyles()" [fieldRenderer]="fields()"></form> `,
  styleUrl: './row-field.component.scss',
  host: {
    class: 'lib-row-field',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export class RowFieldComponent {
  field = input.required<RowField>();

  formValue = input.required<any>();

  private readonly fieldRegistry = inject(FieldRegistry);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  /** Computed CSS classes for the container */
  containerClasses = computed(() => {
    const field = this.field();
    const baseClasses = ['lib-row-field__container', 'lib-row-field__responsive'];

    if (field.className) {
      baseClasses.push(field.className);
    }

    const stackAt = field.breakpoints?.stackAt || 'sm';
    baseClasses.push(`lib-row-field__stack-at-${stackAt}`);

    return baseClasses.join(' ');
  });

  containerStyles = computed(() => {
    const field = this.field();
    const gap = field.gap || DEFAULT_ROW_GAPS;

    return {
      '--row-gap-width': gap.horizontal || DEFAULT_ROW_GAPS.horizontal,
      '--row-gap-height': gap.vertical || DEFAULT_ROW_GAPS.vertical,
      display: 'flex',
      'flex-wrap': 'wrap',
      gap: `var(--row-gap-height) var(--row-gap-width)`,
    };
  });

  fields$ = toObservable(computed(() => this.field().fields));

  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields) => {
        if (!fields || fields.length === 0) {
          return of([]);
        }

        return combineLatest(this.mapFields(fields));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp))
    )
  );

  private mapFields(fields: readonly any[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map(async (fieldDef) => {
        const componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type).catch(() => undefined);

        if (!componentType) {
          return undefined;
        }

        const bindings: Binding[] = [];
        const valueProp = this.getValueProp(fieldDef);

        if (valueProp) {
          const fieldSignal = computed(() => {
            const formValue = this.formValue();
            return get(formValue, fieldDef.key);
          });

          bindings.push(inputBinding(valueProp, fieldSignal));
        }

        if (fieldDef.label) {
          bindings.push(inputBinding('label', () => fieldDef.label));
        }

        if (fieldDef.required) {
          bindings.push(inputBinding('required', () => fieldDef.required));
        }

        if (fieldDef.disabled) {
          bindings.push(inputBinding('disabled', () => fieldDef.disabled));
        }

        if (fieldDef.props) {
          Object.entries(fieldDef.props).forEach(([key, value]) => {
            bindings.push(inputBinding(key, () => value));
          });
        }

        const rowChildField = fieldDef as RowChildField;
        if (rowChildField.col) {
          const componentRef = this.vcr.createComponent(componentType, { bindings });
          this.applyColumnStyles(componentRef, rowChildField);
          return componentRef;
        }

        return this.vcr.createComponent(componentType, { bindings });
      })
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private getValueProp(fieldDef: any): string | undefined {
    return 'value';
  }

  private applyColumnStyles(componentRef: ComponentRef<unknown>, field: RowChildField) {
    const element = componentRef.location.nativeElement as HTMLElement;
    const col = field.col;

    if (!col) {
      element.style.flex = '1 1 100%';
      return;
    }

    element.classList.add('lib-row-field__column');

    // Default span
    if (col.span) {
      element.style.setProperty('--col-span', col.span.toString());
      element.style.flex = `0 0 calc(${(col.span / 12) * 100}% - var(--row-gap-width))`;
    }
  }
}
