import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { evaluateNonFieldHidden } from '../core/logic/non-field-logic-resolver';
import { ContainerLogicConfig } from '../definitions/base/container-logic-config';
import { LogicConfig } from '../models/logic';

interface FieldWithHiddenLogic {
  hidden?: boolean;
  logic?: readonly (ContainerLogicConfig | LogicConfig)[];
}

/**
 * Applies hidden logic to a mapper's input record.
 *
 * Evaluates the field's `hidden` property and `logic` array to determine
 * if the component should be hidden. Only runs evaluation when there's
 * actually something to evaluate (explicit `hidden: true` or logic with type 'hidden').
 *
 * @param inputs The mutable input record to potentially add `hidden` to
 * @param fieldDef The field definition containing `hidden` and `logic`
 * @param rootFormRegistry The root form registry for accessing form state
 */
export function applyHiddenLogic(
  inputs: Record<string, unknown>,
  fieldDef: FieldWithHiddenLogic,
  rootFormRegistry: RootFormRegistryService,
): void {
  const rootForm = rootFormRegistry.rootForm();
  if (rootForm && (fieldDef.hidden === true || fieldDef.logic?.some((l) => l.type === 'hidden'))) {
    // Cast is safe: evaluateNonFieldHidden only reads the array, never mutates it.
    // The readonly + union type from container/leaf field definitions is compatible at runtime.
    inputs['hidden'] = evaluateNonFieldHidden({
      form: rootForm,
      fieldLogic: fieldDef.logic as LogicConfig[] | undefined,
      explicitValue: fieldDef.hidden,
      formValue: rootFormRegistry.formValue(),
    });
  }
}
