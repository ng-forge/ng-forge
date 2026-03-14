import { TestSuite } from '../shared/types';
import { ariaAttributesScenario } from './scenarios/aria-attributes.scenario';
import { errorAnnouncementsScenario } from './scenarios/error-announcements.scenario';
import { keyboardNavigationScenario } from './scenarios/keyboard-navigation.scenario';
import { focusManagementScenario } from './scenarios/focus-management.scenario';

/**
 * Accessibility Tests Suite
 * Tests WCAG AA compliance for form accessibility
 */
export const accessibilitySuite: TestSuite = {
  id: 'accessibility',
  title: 'Accessibility Tests',
  description: 'Tests for WCAG AA compliance including ARIA attributes, keyboard navigation, and screen reader support',
  path: '/test/accessibility',
  scenarios: [ariaAttributesScenario, errorAnnouncementsScenario, keyboardNavigationScenario, focusManagementScenario],
};

/**
 * Get a scenario by its testId
 */
export function getAccessibilityScenario(testId: string) {
  return accessibilitySuite.scenarios.find((s) => s.testId === testId);
}
