import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { evaluateNonFieldHidden } from '../core/logic/non-field-logic-resolver';
import { ContainerLogicConfig } from '../definitions/base/container-logic-config';
import { LogicConfig } from '../models/logic';
import type { EvaluationContext } from '../models/expressions/evaluation-context';

interface FieldWithHiddenLogic {
  hidden?: boolean;
  logic?: readonly (ContainerLogicConfig | LogicConfig)[];
}

/**
 * Applies hidden logic to a mapper's input record.
 *
 * @param inputs The mutable input record to potentially add `hidden` to
 * @param fieldDef The field definition containing `hidden` and `logic`
 * @param rootFormRegistry The root form registry for accessing form state
 * @param evaluationContext Full evaluation-context factory (externalData + customFunctions),
 *        built by the mapper via `injectNonFieldEvaluationContext` and invoked lazily here so
 *        external-data signal reads stay reactive. Mirrors the page path.
 */
export function applyHiddenLogic(
  inputs: Record<string, unknown>,
  fieldDef: FieldWithHiddenLogic,
  rootFormRegistry: RootFormRegistryService,
  evaluationContext?: () => EvaluationContext,
): void {
  const rootForm = rootFormRegistry.rootForm();
  if (rootForm && (fieldDef.hidden === true || fieldDef.logic?.some((l) => l.type === 'hidden'))) {
    // Cast is safe: evaluateNonFieldHidden only reads the array, never mutates it.
    // The readonly + union type from container/leaf field definitions is compatible at runtime.
    inputs['hidden'] = evaluateNonFieldHidden({
      form: rootForm,
      fieldLogic: fieldDef.logic as LogicConfig[] | undefined,
      explicitValue: fieldDef.hidden,
      evaluationContext,
    });
  }
}
