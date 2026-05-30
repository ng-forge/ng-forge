import { ConditionalExpression } from '../../models/expressions/conditional-expression';

/**
 * Logic configuration for container fields (page, group, row, array).
 * Containers only support the 'hidden' logic type since they are layout containers,
 * not form controls (they can't be readonly, disabled, or required).
 */
export interface ContainerLogicConfig {
  /** Only 'hidden' is supported for container fields */
  type: 'hidden';

  /**
   * Condition that determines when this container is hidden.
   * Can be a boolean or a conditional expression evaluated against form values.
   */
  condition: ConditionalExpression | boolean;
}
