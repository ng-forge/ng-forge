import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { FieldContextRegistryService } from '../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { evaluateNonFieldHidden } from '../core/logic/non-field-logic-resolver';
import { ContainerLogicConfig } from '../definitions/base/container-logic-config';
import { LogicConfig } from '../models/logic';

interface FieldWithHiddenLogic {
  key?: string;
  hidden?: boolean;
  logic?: readonly (ContainerLogicConfig | LogicConfig)[];
}

/**
 * Applies hidden logic to a mapper's input record.
 *
 * @param inputs The mutable input record to potentially add `hidden` to
 * @param fieldDef The field definition containing `hidden` and `logic`
 * @param rootFormRegistry The root form registry for accessing form state
 * @param fieldContextRegistry Builds the display-only evaluation context (externalData + fieldPath)
 * @param functionRegistry Supplies registered custom functions for `custom` conditions
 */
export function applyHiddenLogic(
  inputs: Record<string, unknown>,
  fieldDef: FieldWithHiddenLogic,
  rootFormRegistry: RootFormRegistryService,
  fieldContextRegistry: FieldContextRegistryService,
  functionRegistry: FunctionRegistryService,
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
      // Full context (externalData + customFunctions), built lazily inside the mapper's
      // computed so external-data signal reads stay reactive. Mirrors the page path.
      evaluationContext: () => fieldContextRegistry.createDisplayOnlyContext(fieldDef.key ?? '', functionRegistry.getCustomFunctions()),
    });
  }
}
