/**
 * App-to-port mapping for example applications.
 * This is the single source of truth for port configuration.
 */
export const APP_PORTS = {
  'material-examples': 4201,
  'primeng-examples': 4202,
  'ionic-examples': 4203,
  'bootstrap-examples': 4204,
  'core-examples': 4205,
} as const;

export type ExampleApp = keyof typeof APP_PORTS;
