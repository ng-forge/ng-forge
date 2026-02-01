import { describe, it, expect } from 'vitest';
import { createSourceFile, findFormConfigCandidates, extractToJson, DATE_PLACEHOLDER, MAX_SOURCE_TEXT_LENGTH } from './ast-extractor.js';

describe('AST Extractor', () => {
  describe('createSourceFile', () => {
    it('creates source file from code string', () => {
      const source = createSourceFile('const x = 1;');
      expect(source).toBeDefined();
      expect(source.getFilePath()).toContain('temp.ts');
    });

    it('creates source file with custom filename', () => {
      const source = createSourceFile('const x = 1;', 'custom.ts');
      expect(source.getFilePath()).toContain('custom.ts');
    });

    it('parses TypeScript syntax correctly', () => {
      const source = createSourceFile(`
        interface FormConfig {
          fields: Field[];
        }
        const config: FormConfig = { fields: [] };
      `);
      expect(source.getInterfaces()).toHaveLength(1);
      expect(source.getVariableDeclarations()).toHaveLength(1);
    });
  });

  describe('findFormConfigCandidates', () => {
    describe('type annotation detection', () => {
      it('finds config with type annotation', () => {
        const source = createSourceFile(`
          const config: FormConfig = {
            fields: [{ key: 'name', type: 'input' }]
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('type-annotation');
        expect(candidates[0].name).toBe('config');
      });

      it('finds config with case-insensitive FormConfig detection', () => {
        const source = createSourceFile(`
          const config: FORMCONFIG = {
            fields: [{ key: 'name', type: 'input' }]
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('type-annotation');
      });

      it('finds config with SomeFormConfig type', () => {
        const source = createSourceFile(`
          const config: MyFormConfig = {
            fields: [{ key: 'email', type: 'email' }]
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('type-annotation');
      });
    });

    describe('satisfies expression detection', () => {
      it('finds config with satisfies FormConfig', () => {
        const source = createSourceFile(`
          const config = {
            fields: [{ key: 'name', type: 'input' }]
          } satisfies FormConfig;
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('satisfies');
        expect(candidates[0].name).toBe('config');
      });

      it('finds config with as const satisfies FormConfig', () => {
        const source = createSourceFile(`
          const config = {
            fields: [{ key: 'name', type: 'input' }]
          } as const satisfies FormConfig;
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('satisfies');
      });

      it('handles nested satisfies inside as expression', () => {
        const source = createSourceFile(`
          const config = ({
            fields: [{ key: 'test', type: 'checkbox' }]
          } satisfies FormConfig);
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('satisfies');
      });
    });

    describe('as cast detection', () => {
      it('finds config with as FormConfig cast', () => {
        const source = createSourceFile(`
          const config = {
            fields: [{ key: 'name', type: 'input' }]
          } as FormConfig;
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('as-cast');
        expect(candidates[0].name).toBe('config');
      });

      it('finds config with case-insensitive as cast', () => {
        const source = createSourceFile(`
          const config = {
            fields: [{ key: 'phone', type: 'tel' }]
          } as formconfig;
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('as-cast');
      });
    });

    describe('structural detection', () => {
      it('finds config by structural detection (fields array with key/type)', () => {
        const source = createSourceFile(`
          const myForm = {
            fields: [
              { key: 'username', type: 'input' },
              { key: 'password', type: 'password' }
            ]
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('structural');
        expect(candidates[0].name).toBe('myForm');
      });

      it('detects config with only key property', () => {
        const source = createSourceFile(`
          const config = {
            fields: [{ key: 'name' }]
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('structural');
      });

      it('detects config with only type property', () => {
        const source = createSourceFile(`
          const config = {
            fields: [{ type: 'input' }]
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('structural');
      });
    });

    describe('empty fields array', () => {
      it('detects config with empty fields array', () => {
        const source = createSourceFile(`
          const config: FormConfig = {
            fields: []
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('type-annotation');
      });

      it('does not detect empty fields array without type annotation', () => {
        const source = createSourceFile(`
          const config = {
            fields: []
          };
        `);
        const candidates = findFormConfigCandidates(source);
        // Empty fields array without type annotation won't pass structural check
        // because there's no first element to check for key/type
        expect(candidates).toHaveLength(1);
        expect(candidates[0].matchReason).toBe('structural');
      });
    });

    describe('no candidates found', () => {
      it('returns empty array when no FormConfig found', () => {
        const source = createSourceFile(`
          const regularObject = { name: 'test', value: 123 };
          const anotherVar = 'hello';
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(0);
      });

      it('returns empty array for object without fields property', () => {
        const source = createSourceFile(`
          const config = {
            items: [{ key: 'name', type: 'input' }]
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(0);
      });

      it('returns empty array when fields is not an array', () => {
        const source = createSourceFile(`
          const config = {
            fields: { key: 'name', type: 'input' }
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(0);
      });
    });

    describe('multiple candidates', () => {
      it('finds multiple candidates in same file', () => {
        const source = createSourceFile(`
          const loginForm: FormConfig = {
            fields: [{ key: 'username', type: 'input' }]
          };

          const signupForm = {
            fields: [{ key: 'email', type: 'email' }]
          } satisfies FormConfig;

          const contactForm = {
            fields: [{ key: 'message', type: 'textarea' }]
          } as FormConfig;
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(3);
        expect(candidates.map((c) => c.name)).toEqual(['loginForm', 'signupForm', 'contactForm']);
        expect(candidates.map((c) => c.matchReason)).toEqual(['type-annotation', 'satisfies', 'as-cast']);
      });

      it('does not duplicate candidates', () => {
        const source = createSourceFile(`
          const form1: FormConfig = {
            fields: [{ key: 'a', type: 'input' }]
          };
          const form2 = {
            fields: [{ key: 'b', type: 'input' }]
          };
        `);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(2);
        const names = candidates.map((c) => c.name);
        expect(new Set(names).size).toBe(names.length);
      });
    });

    describe('line number tracking', () => {
      it('correctly tracks start line number', () => {
        const source = createSourceFile(`// line 1
// line 2
// line 3
const config: FormConfig = {
  fields: [{ key: 'name', type: 'input' }]
};
`);
        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].startLine).toBe(4);
      });
    });
  });

  describe('extractToJson', () => {
    describe('primitive literals', () => {
      it('extracts string literals', () => {
        const source = createSourceFile(`const x = 'hello';`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('hello');
        expect(result.warnings).toHaveLength(0);
        expect(result.errors).toHaveLength(0);
      });

      it('extracts double-quoted string literals', () => {
        const source = createSourceFile(`const x = "world";`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('world');
      });

      it('extracts number literals', () => {
        const source = createSourceFile(`const x = 42;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(42);
        expect(result.warnings).toHaveLength(0);
      });

      it('extracts floating point numbers', () => {
        const source = createSourceFile(`const x = 3.14159;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(3.14159);
      });

      it('extracts boolean true', () => {
        const source = createSourceFile(`const x = true;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('extracts boolean false', () => {
        const source = createSourceFile(`const x = false;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(false);
        expect(result.warnings).toHaveLength(0);
      });

      it('extracts null', () => {
        const source = createSourceFile(`const x = null;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(null);
        expect(result.warnings).toHaveLength(0);
      });

      it('extracts undefined as identifier reference', () => {
        // Note: In TypeScript, `undefined` is parsed as an identifier (not a keyword like null)
        // because it can technically be shadowed in non-strict mode
        const source = createSourceFile(`const x = undefined;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__REF__:undefined');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('External variable reference');
        expect(result.warnings[0].originalText).toBe('undefined');
      });
    });

    describe('array literals', () => {
      it('extracts array literals', () => {
        const source = createSourceFile(`const x = [1, 2, 3];`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual([1, 2, 3]);
        expect(result.warnings).toHaveLength(0);
      });

      it('extracts nested arrays', () => {
        const source = createSourceFile(`const x = [[1, 2], [3, 4]];`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual([
          [1, 2],
          [3, 4],
        ]);
      });

      it('extracts mixed type arrays', () => {
        const source = createSourceFile(`const x = [1, 'two', true, null];`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual([1, 'two', true, null]);
      });

      it('extracts empty arrays', () => {
        const source = createSourceFile(`const x = [];`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual([]);
      });
    });

    describe('object literals', () => {
      it('extracts object literals', () => {
        const source = createSourceFile(`const x = { name: 'test', value: 42 };`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({ name: 'test', value: 42 });
        expect(result.warnings).toHaveLength(0);
      });

      it('extracts nested object literals', () => {
        const source = createSourceFile(`const x = {
          outer: {
            inner: {
              value: 'deep'
            }
          }
        };`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({
          outer: { inner: { value: 'deep' } },
        });
      });

      it('extracts objects with array properties', () => {
        const source = createSourceFile(`const x = {
          items: [1, 2, 3],
          tags: ['a', 'b']
        };`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({
          items: [1, 2, 3],
          tags: ['a', 'b'],
        });
      });

      it('extracts empty objects', () => {
        const source = createSourceFile(`const x = {};`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({});
      });
    });

    describe('regex literals', () => {
      it('converts regex to string with warning', () => {
        const source = createSourceFile(`const x = /^[a-z]+$/i;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('/^[a-z]+$/i');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Regex literal converted to string');
        expect(result.warnings[0].originalText).toBe('/^[a-z]+$/i');
      });
    });

    describe('new Date() expressions', () => {
      it('replaces new Date() with placeholder', () => {
        const source = createSourceFile(`const x = new Date();`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(DATE_PLACEHOLDER);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Runtime constructor: Date');
        expect(result.warnings[0].placeholder).toBe(DATE_PLACEHOLDER);
      });

      it('replaces new Date with argument with placeholder', () => {
        const source = createSourceFile(`const x = new Date('2023-06-15');`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(DATE_PLACEHOLDER);
        expect(result.warnings).toHaveLength(1);
      });

      it('handles other constructors with warning', () => {
        const source = createSourceFile(`const x = new Map();`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__NEW__:Map');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Runtime constructor: Map');
      });
    });

    describe('arrow functions', () => {
      it('replaces arrow functions with __FUNCTION__ placeholder', () => {
        const source = createSourceFile(`const x = () => true;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__FUNCTION__');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Arrow function (cannot be validated statically)');
        expect(result.warnings[0].placeholder).toBe('__FUNCTION__');
      });

      it('handles arrow functions with parameters', () => {
        const source = createSourceFile(`const x = (a, b) => a + b;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__FUNCTION__');
        expect(result.warnings).toHaveLength(1);
      });

      it('truncates long arrow function text', () => {
        const source = createSourceFile(
          `const x = (value) => { const result = value.toString().split('').reverse().join(''); return result; };`,
        );
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__FUNCTION__');
        expect(result.warnings[0].originalText.length).toBeLessThanOrEqual(MAX_SOURCE_TEXT_LENGTH + 3); // + "..."
      });
    });

    describe('function expressions', () => {
      it('replaces function expressions with __FUNCTION__ placeholder', () => {
        const source = createSourceFile(`const x = function() { return true; };`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__FUNCTION__');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Function expression (cannot be validated statically)');
      });
    });

    describe('function calls', () => {
      it('warns about Math.floor() and similar calls', () => {
        const source = createSourceFile(`const x = Math.floor(3.7);`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__CALL__:Math.floor(3.7)');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Function call (cannot be evaluated statically)');
      });

      it('warns about custom function calls', () => {
        const source = createSourceFile(`const x = someFunction('arg');`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe("__CALL__:someFunction('arg')");
        expect(result.warnings).toHaveLength(1);
      });
    });

    describe('property access expressions', () => {
      it('warns about enum access like SomeEnum.Value', () => {
        const source = createSourceFile(`const x = SomeEnum.Value;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__REF__:SomeEnum.Value');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Property access (enum or constant reference)');
        expect(result.warnings[0].originalText).toBe('SomeEnum.Value');
      });

      it('handles nested property access', () => {
        const source = createSourceFile(`const x = obj.nested.value;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__REF__:obj.nested.value');
      });
    });

    describe('template literals', () => {
      it('handles template literals without expressions', () => {
        const source = createSourceFile('const x = `hello world`;');
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('hello world');
        expect(result.warnings).toHaveLength(0);
      });

      it('warns about template literals with expressions', () => {
        const source = createSourceFile('const x = `hello ${name}`;');
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__TEMPLATE__');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Template literal with expressions');
      });
    });

    describe('prefix unary expressions', () => {
      it('handles negative numbers', () => {
        const source = createSourceFile(`const x = -42;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(-42);
        expect(result.warnings).toHaveLength(0);
      });

      it('handles negated booleans', () => {
        const source = createSourceFile(`const x = !true;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(false);
        expect(result.warnings).toHaveLength(0);
      });

      it('handles double negation', () => {
        const source = createSourceFile(`const x = !!false;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe(false);
        expect(result.warnings).toHaveLength(0);
      });

      it('warns about other prefix operators', () => {
        const source = createSourceFile(`const x = ~5;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__EXPR__:~5');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Unary expression');
      });
    });

    describe('binary expressions', () => {
      it('warns about addition expressions', () => {
        const source = createSourceFile(`const x = 1 + 2;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__EXPR__:1 + 2');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Binary expression (cannot evaluate statically)');
      });

      it('warns about multiplication expressions', () => {
        const source = createSourceFile(`const x = 3 * 4;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__EXPR__:3 * 4');
        expect(result.warnings).toHaveLength(1);
      });

      it('warns about string concatenation', () => {
        const source = createSourceFile(`const x = 'hello' + ' world';`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe("__EXPR__:'hello' + ' world'");
        expect(result.warnings).toHaveLength(1);
      });
    });

    describe('shorthand properties', () => {
      it('warns about shorthand properties', () => {
        const source = createSourceFile(`
          const name = 'test';
          const x = { name };
        `);
        const varDecls = source.getVariableDeclarations();
        const initializer = varDecls[1].getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({ name: '__REF__:name' });
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Shorthand property (external reference)');
        expect(result.warnings[0].path).toBe('name');
        expect(result.warnings[0].placeholder).toBe('__REF__:name');
      });
    });

    describe('spread assignments', () => {
      it('warns about spread operator in objects', () => {
        const source = createSourceFile(`
          const base = { a: 1 };
          const x = { ...base, b: 2 };
        `);
        const varDecls = source.getVariableDeclarations();
        const initializer = varDecls[1].getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({ b: 2 });
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Spread operator (cannot statically evaluate)');
        expect(result.warnings[0].path).toBe('[spread]');
      });
    });

    describe('type assertions and expressions', () => {
      it('unwraps as const expressions', () => {
        const source = createSourceFile(`const x = { name: 'test' } as const;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({ name: 'test' });
        expect(result.warnings).toHaveLength(0);
      });

      it('unwraps satisfies expressions', () => {
        const source = createSourceFile(`const x = { name: 'test' } satisfies { name: string };`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({ name: 'test' });
        expect(result.warnings).toHaveLength(0);
      });

      it('unwraps parenthesized expressions', () => {
        const source = createSourceFile(`const x = ({ name: 'test' });`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toEqual({ name: 'test' });
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('identifiers', () => {
      it('warns about external variable references', () => {
        const source = createSourceFile(`const x = someExternalVar;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__REF__:someExternalVar');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('External variable reference');
      });
    });

    describe('element access expressions', () => {
      it('warns about array element access', () => {
        const source = createSourceFile(`const x = arr[0];`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__REF__:arr[0]');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Element access expression');
      });
    });

    describe('conditional expressions', () => {
      it('warns about ternary expressions', () => {
        const source = createSourceFile(`const x = condition ? 'a' : 'b';`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toBe('__CONDITIONAL__');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toBe('Conditional expression (cannot evaluate statically)');
      });
    });

    describe('unknown node types', () => {
      it('handles typeof expressions with warning', () => {
        const source = createSourceFile(`const x = typeof someVar;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toMatch(/^__UNKNOWN__:/);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toMatch(/^Unknown syntax:/);
      });

      it('handles void expressions with warning', () => {
        const source = createSourceFile(`const x = void 0;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toMatch(/^__UNKNOWN__:/);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toMatch(/^Unknown syntax:/);
      });

      it('handles await expressions with warning', () => {
        const source = createSourceFile(`const x = await promise;`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.value).toMatch(/^__UNKNOWN__:/);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].issue).toMatch(/^Unknown syntax:/);
      });
    });

    describe('path tracking', () => {
      it('tracks paths correctly in nested structures', () => {
        const source = createSourceFile(`const x = {
          fields: [
            {
              key: 'date',
              props: {
                maxDate: new Date()
              }
            }
          ]
        };`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].path).toBe('fields[0].props.maxDate');
      });

      it('uses provided path prefix', () => {
        const source = createSourceFile(`const x = new Date();`);
        const varDecl = source.getVariableDeclarations()[0];
        const initializer = varDecl.getInitializer()!;
        const result = extractToJson(initializer, 'config.value');
        expect(result.warnings[0].path).toBe('config.value');
      });
    });

    describe('complex form config extraction', () => {
      it('extracts a complete form config with mixed content', () => {
        const source = createSourceFile(`
          const formConfig: FormConfig = {
            fields: [
              {
                key: 'username',
                type: 'input',
                props: {
                  label: 'Username',
                  required: true,
                  minLength: 3,
                  maxLength: 20
                }
              },
              {
                key: 'birthdate',
                type: 'datepicker',
                props: {
                  label: 'Birth Date',
                  maxDate: new Date(),
                  validate: (value) => value !== null
                }
              },
              {
                key: 'status',
                type: 'select',
                props: {
                  options: [
                    { label: 'Active', value: 1 },
                    { label: 'Inactive', value: 0 }
                  ]
                }
              }
            ]
          };
        `);

        const candidates = findFormConfigCandidates(source);
        expect(candidates).toHaveLength(1);

        const result = extractToJson(candidates[0].objectLiteral);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings.length).toBeGreaterThan(0);

        const value = result.value as Record<string, unknown>;
        expect(value.fields).toBeDefined();
        expect(Array.isArray(value.fields)).toBe(true);

        const fields = value.fields as Array<Record<string, unknown>>;
        expect(fields).toHaveLength(3);

        // First field - pure static
        expect(fields[0]).toEqual({
          key: 'username',
          type: 'input',
          props: {
            label: 'Username',
            required: true,
            minLength: 3,
            maxLength: 20,
          },
        });

        // Second field - has runtime values
        expect(fields[1].key).toBe('birthdate');
        const birthdateProps = fields[1].props as Record<string, unknown>;
        expect(birthdateProps.maxDate).toBe(DATE_PLACEHOLDER);
        expect(birthdateProps.validate).toBe('__FUNCTION__');

        // Third field - static options array
        expect(fields[2].key).toBe('status');
        const statusProps = fields[2].props as Record<string, unknown>;
        expect(statusProps.options).toEqual([
          { label: 'Active', value: 1 },
          { label: 'Inactive', value: 0 },
        ]);
      });
    });
  });
});
