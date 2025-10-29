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
import { DEFAULT_GROUP_GAPS, GroupComponent, GroupField } from '../../definitions/default/group-field';
import { FieldRegistry } from '../../core/field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { FormUiControl } from '@angular/forms/signals';
import { get } from 'lodash-es';
import { FieldDef } from '../../definitions';

@Component({
  selector: 'lib-group-field',
  template: `
    <fieldset [class]="containerClasses()" [style]="containerStyles()">
      <legend class="lib-group-field__legend">
        {{ field().label }}
      </legend>

      <form class="lib-group-field__content" [style]="contentStyles()" [fieldRenderer]="fields()"></form>
    </fieldset>
  `,
  styleUrl: './group-field.component.scss',
  host: {
    class: 'lib-group-field',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class GroupFieldComponent<T extends Record<string, FieldDef<Record<string, unknown>>>> implements GroupComponent<T> {
  /** Field configuration input */
  field = input.required<GroupField<T>>();

  /** Parent form value signal for accessing field values */
  formValue = input.required<any>();

  private readonly fieldRegistry = inject(FieldRegistry);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  /** Computed CSS classes for the container */
  containerClasses = computed(() => {
    const field = this.field();
    const baseClasses = ['lib-group-field__container', 'lib-group-field__bordered'];

    if (field.className) {
      baseClasses.push(field.className);
    }

    return baseClasses.join(' ');
  });

  /** Computed CSS styles for the container */
  containerStyles = computed(() => {
    return {
      padding: '1.5rem',
      margin: '0',
    };
  });

  /** Computed CSS styles for the content area */
  contentStyles = computed(() => {
    const field = this.field();
    const gap = field.gap || DEFAULT_GROUP_GAPS;

    return {
      display: 'flex',
      'flex-direction': 'column',
      gap: `${gap.vertical || DEFAULT_GROUP_GAPS.vertical} ${gap.horizontal || DEFAULT_GROUP_GAPS.horizontal}`,
    };
  });

  // Convert field setup to observable for field mapping
  fields$ = toObservable(computed(() => this.field().fields));

  // Create field fields following the dynamic form pattern
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
    const groupKey = this.field().key;

    return fields
      .map(async (fieldDef) => {
        const componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type).catch(() => undefined);

        if (!componentType) {
          return undefined;
        }

        const bindings: Binding[] = [];
        const valueProp = this.getValueProp(fieldDef);

        if (valueProp) {
          // Create nested key for group definitions: group.field
          const nestedKey = `${groupKey}.${fieldDef.key}`;
          const fieldSignal = computed(() => {
            const formValue = this.formValue();
            return get(formValue, nestedKey);
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

        return this.vcr.createComponent(componentType, { bindings });
      })
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private getValueProp(fieldDef: any): string | undefined {
    // This mirrors the logic from the main dynamic form
    return 'value'; // Most field fields use 'value' as the property name
  }
}
