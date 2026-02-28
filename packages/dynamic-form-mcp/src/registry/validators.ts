/**
 * Validator Registry Data
 *
 * Canonical source of validator metadata for the MCP server.
 * Previously generated as validators.json by generate-registry.ts.
 */

import type { ValidatorInfo } from './index.js';

export const VALIDATORS: ValidatorInfo[] = [
  {
    type: 'required',
    category: 'built-in',
    description: 'Validates that a field has a non-empty value',
    parameters: {},
    example: `{ type: 'required' }
// or shorthand: required: true`,
  },
  {
    type: 'email',
    category: 'built-in',
    description: 'Validates email format',
    parameters: {},
    example: `{ type: 'email' }
// or shorthand: email: true`,
  },
  {
    type: 'min',
    category: 'built-in',
    description: 'Validates minimum numeric value',
    parameters: {
      value: {
        name: 'value',
        type: 'number',
        description: 'Minimum allowed value',
        required: true,
      },
    },
    example: `{ type: 'min', value: 0 }
// or shorthand: min: 0`,
  },
  {
    type: 'max',
    category: 'built-in',
    description: 'Validates maximum numeric value',
    parameters: {
      value: {
        name: 'value',
        type: 'number',
        description: 'Maximum allowed value',
        required: true,
      },
    },
    example: `{ type: 'max', value: 100 }
// or shorthand: max: 100`,
  },
  {
    type: 'minLength',
    category: 'built-in',
    description: 'Validates minimum string length',
    parameters: {
      value: {
        name: 'value',
        type: 'number',
        description: 'Minimum string length',
        required: true,
      },
    },
    example: `{ type: 'minLength', value: 3 }
// or shorthand: minLength: 3`,
  },
  {
    type: 'maxLength',
    category: 'built-in',
    description: 'Validates maximum string length',
    parameters: {
      value: {
        name: 'value',
        type: 'number',
        description: 'Maximum string length',
        required: true,
      },
    },
    example: `{ type: 'maxLength', value: 100 }
// or shorthand: maxLength: 100`,
  },
  {
    type: 'pattern',
    category: 'built-in',
    description: 'Validates against a regular expression pattern',
    parameters: {
      value: {
        name: 'value',
        type: 'string | RegExp',
        description: 'Regular expression pattern',
        required: true,
      },
    },
    example: `{ type: 'pattern', value: '^[A-Z][a-z]+$' }
// or shorthand: pattern: '^[A-Z][a-z]+$'`,
  },
  {
    type: 'custom',
    category: 'custom',
    description:
      "Custom synchronous validator using registered function or expression. IMPORTANT: The validator returns { kind: 'errorKind' } on failure. The actual error MESSAGE is defined in 'validationMessages' at the FIELD level, NOT in the validator config.",
    parameters: {
      functionName: {
        name: 'functionName',
        type: 'string',
        description: 'Name of registered validator function',
        required: false,
      },
      expression: {
        name: 'expression',
        type: 'string',
        description: 'JavaScript expression to evaluate',
        required: false,
      },
      kind: {
        name: 'kind',
        type: 'string',
        description: 'Error kind returned when validation fails. This kind maps to a message in field-level validationMessages.',
        required: false,
      },
      params: {
        name: 'params',
        type: 'Record<string, unknown>',
        description: 'Parameters to pass to validator function',
        required: false,
      },
    },
    example: `// Expression-based custom validator with error message
// The validator:
{
  type: 'custom',
  expression: 'fieldValue === formValue.password',
  kind: 'passwordMismatch'  // Just the error KIND, not the message
}

// COMPLETE FIELD with validationMessages at FIELD level:
{
  key: 'confirmPassword',
  type: 'input',
  label: 'Confirm Password',
  props: { type: 'password' },
  validators: [
    { type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }
  ],
  validationMessages: {
    passwordMismatch: 'Passwords do not match'  // Message goes HERE at field level
  }
}`,
  },
  {
    type: 'async',
    category: 'async',
    description:
      'Async validator using registered async function (resource-based). Register the function via customFnConfig.asyncValidators.',
    parameters: {
      functionName: {
        name: 'functionName',
        type: 'string',
        description: 'Name of registered async validator function',
        required: true,
      },
      params: {
        name: 'params',
        type: 'Record<string, unknown>',
        description: 'Parameters to pass to validator function',
        required: false,
      },
    },
    example: `{
  type: 'async',
  functionName: 'checkUsernameAvailability'
}`,
  },
  {
    type: 'customAsync',
    category: 'async',
    description: "DEPRECATED — use type: 'async' instead. Async validator using registered async function.",
    parameters: {
      functionName: {
        name: 'functionName',
        type: 'string',
        description: 'Name of registered async validator function',
        required: true,
      },
      params: {
        name: 'params',
        type: 'Record<string, unknown>',
        description: 'Parameters to pass to validator function',
        required: false,
      },
    },
    example: `// DEPRECATED — use type: 'async' instead
{
  type: 'customAsync',
  functionName: 'checkUsernameAvailability'
}`,
  },
  {
    type: 'customHttp',
    category: 'http',
    description: "DEPRECATED — use type: 'http' with functionName instead. HTTP-based validator with automatic request cancellation.",
    parameters: {
      functionName: {
        name: 'functionName',
        type: 'string',
        description: 'Name of registered HTTP validator configuration',
        required: true,
      },
      params: {
        name: 'params',
        type: 'Record<string, unknown>',
        description: 'Parameters to pass to HTTP validator',
        required: false,
      },
    },
    example: `// DEPRECATED — use type: 'http' with functionName instead
{
  type: 'customHttp',
  functionName: 'validateEmailExists'
}`,
  },
  {
    type: 'http',
    category: 'http',
    description:
      'HTTP validator — supports two modes: (1) Declarative (fully JSON-serializable, no function registration) using http + responseMapping properties, or (2) Function-based using functionName to reference a registered HTTP validator function. Query param values and (optionally) body values are expressions evaluated against the form context. Response mapping uses validWhen (truthy = valid) and errorKind (maps to field-level validationMessages).',
    parameters: {
      functionName: {
        name: 'functionName',
        type: 'string',
        description: 'Name of registered HTTP validator function (function-based mode). Mutually exclusive with http + responseMapping.',
        required: false,
      },
      http: {
        name: 'http',
        type: 'HttpRequestConfig',
        description:
          'HTTP request configuration: { url, method?, queryParams?, body?, evaluateBodyExpressions?, headers?, debounceMs? }. queryParams values are expressions. When evaluateBodyExpressions is true, top-level string values in body are evaluated as expressions (shallow only). Required for declarative mode.',
        required: false,
      },
      responseMapping: {
        name: 'responseMapping',
        type: 'HttpValidationResponseMapping',
        description:
          'Response mapping: { validWhen, errorKind, errorParams? }. validWhen is an expression evaluated with { response } scope — truthy means valid. errorKind maps to field-level validationMessages. Required for declarative mode.',
        required: false,
      },
      params: {
        name: 'params',
        type: 'Record<string, unknown>',
        description: 'Parameters to pass to HTTP validator function (function-based mode only).',
        required: false,
      },
    },
    example: `// HTTP validator (fully JSON-serializable)
{
  type: 'http',
  http: {
    url: '/api/validate-username',
    method: 'GET',
    queryParams: {
      username: 'fieldValue'
    }
  },
  responseMapping: {
    validWhen: 'response.available',
    errorKind: 'usernameTaken',
    errorParams: {
      suggestion: 'response.suggestion'
    }
  }
}

// COMPLETE FIELD with validationMessages at FIELD level:
{
  key: 'username',
  type: 'input',
  label: 'Username',
  validators: [
    {
      type: 'http',
      http: {
        url: '/api/validate-username',
        method: 'GET',
        queryParams: { username: 'fieldValue' }
      },
      responseMapping: {
        validWhen: 'response.available',
        errorKind: 'usernameTaken',
        errorParams: { suggestion: 'response.suggestion' }
      }
    }
  ],
  validationMessages: {
    usernameTaken: 'Username is taken. Try {{suggestion}}'
  }
}`,
  },
];
