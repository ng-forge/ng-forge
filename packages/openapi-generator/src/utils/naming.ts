/**
 * Convert a camelCase, snake_case, or kebab-case string to a human-readable label.
 * Examples: "firstName" → "First Name", "pet_name" → "Pet Name", "is-active" → "Is Active"
 */
export function toLabel(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Convert an enum value to a human-readable label.
 * Handles SCREAMING_SNAKE_CASE, snake_case, kebab-case, and camelCase.
 * Examples: "in_progress" → "In Progress", "PENDING_REVIEW" → "Pending Review", "myVariant" → "My Variant"
 */
export function toEnumLabel(value: string): string {
  // Handle SCREAMING_SNAKE_CASE: lowercase before processing
  if (/^[A-Z][A-Z0-9_-]*$/.test(value)) {
    if (value.length <= 3 && !/[_-]/.test(value)) {
      return value;
    }
    value = value.toLowerCase();
  }
  return toLabel(value);
}

/**
 * Convert a string to PascalCase.
 * Examples: "create pet" → "CreatePet", "POST:/pets" → "PostPets"
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Split camelCase boundaries
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert a string to camelCase.
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert a string to kebab-case.
 * Examples: "CreatePet" → "create-pet"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '');
}

/**
 * Replace path parameters like `{id}` with a prefix + param name.
 * Uses indexOf loop instead of regex to avoid polynomial backtracking (CodeQL).
 */
function cleanPathParams(path: string, prefix: string): string {
  let result = '';
  let i = 0;
  while (i < path.length) {
    const openIdx = path.indexOf('{', i);
    if (openIdx === -1) {
      result += path.slice(i);
      break;
    }
    const closeIdx = path.indexOf('}', openIdx + 1);
    if (closeIdx === -1) {
      result += path.slice(i);
      break;
    }
    result += path.slice(i, openIdx) + prefix + path.slice(openIdx + 1, closeIdx);
    i = closeIdx + 1;
  }
  return result;
}

/**
 * Generate a form config variable name from endpoint info.
 * Example: "POST /pets" → "createPetFormConfig", "GET /pets/{id}" → "getPetByIdFormConfig"
 */
export function toFormConfigName(method: string, path: string, operationId?: string): string {
  if (operationId) {
    return toCamelCase(operationId) + 'FormConfig';
  }
  const cleaned = cleanPathParams(path, 'By ');
  return toCamelCase(`${method} ${cleaned}`) + 'FormConfig';
}

/**
 * Generate a file name from endpoint info.
 * Example: "POST /pets" → "create-pet.form.ts"
 */
export function toFormFileName(method: string, path: string, operationId?: string): string {
  if (operationId) {
    return toKebabCase(operationId) + '.form.ts';
  }
  const cleaned = cleanPathParams(path, 'by-');
  return toKebabCase(`${method} ${cleaned}`) + '.form.ts';
}

/**
 * Generate an interface name from endpoint info.
 * Example: "POST /pets" → "CreatePetFormValue"
 */
export function toInterfaceName(method: string, path: string, operationId?: string): string {
  if (operationId) {
    return toPascalCase(operationId) + 'FormValue';
  }
  const cleaned = cleanPathParams(path, 'By ');
  return toPascalCase(`${method} ${cleaned}`) + 'FormValue';
}
