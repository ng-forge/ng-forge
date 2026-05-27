import { DerivationLogicConfig } from '../../models/logic/logic-config';
import { extractExpressionDependencies, extractStringDependencies } from '../cross-field/cross-field-detector';

/**
 * Extracts the union of field dependencies declared by a derivation config.
 *
 * @internal
 */
export function extractDependenciesFromConfig(config: DerivationLogicConfig): string[] {
  const deps = new Set<string>();

  if (config.dependsOn && config.dependsOn.length > 0) {
    config.dependsOn.forEach((dep) => deps.add(dep));
  } else {
    if (config.expression) {
      extractStringDependencies(config.expression).forEach((dep) => deps.add(dep));
    }
    // Inline `fn` mirrors `functionName` semantics: without explicit dependsOn,
    // assume the function may depend on anything in the form.
    if (config.functionName || (config as { fn?: unknown }).fn) {
      deps.add('*');
    }
  }

  if (config.condition && config.condition !== true) {
    extractExpressionDependencies(config.condition).forEach((dep) => deps.add(dep));
  }

  return Array.from(deps);
}
