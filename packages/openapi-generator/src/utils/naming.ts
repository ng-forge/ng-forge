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
 * Generate a form config variable name from endpoint info.
 * Example: "POST /pets" → "createPetFormConfig", "GET /pets/{id}" → "getPetByIdFormConfig"
 */
export function toFormConfigName(method: string, path: string, operationId?: string): string {
  if (operationId) {
    return toCamelCase(operationId) + 'FormConfig';
  }
  const cleaned = path.replace(/\{(\w+)\}/g, 'By $1');
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
  const cleaned = path.replace(/\{(\w+)\}/g, 'by-$1');
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
  const cleaned = path.replace(/\{(\w+)\}/g, 'By $1');
  return toPascalCase(`${method} ${cleaned}`) + 'FormValue';
}
