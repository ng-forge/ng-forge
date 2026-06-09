import type { OpenAPIV3 } from 'openapi-types';
import { generateInterface } from './interface-generator';
import type { InterfaceGeneratorOptions } from './interface-generator';

const defaultOptions: InterfaceGeneratorOptions = {
  method: 'POST',
  path: '/pets',
  operationId: 'createPet',
};

describe('generateInterface', () => {
  it('should generate interface with string, number, boolean fields', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
        active: { type: 'boolean' },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('export interface CreatePetFormValue {');
    expect(result).toContain('  name: string;');
    expect(result).toContain('  age?: number;');
    expect(result).toContain('  active?: boolean;');
    expect(result).toContain('}');
  });

  it('should mark required fields without question mark', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  name: string;');
    expect(result).toContain('  email: string;');
    expect(result).toContain('  phone?: string;');
  });

  it('should map enum to union type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain("  status?: 'active' | 'inactive' | 'pending';");
  });

  it('should generate nested interface for object properties', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          required: ['street'],
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('export interface CreatePetFormValueAddress {');
    expect(result).toContain('  street: string;');
    expect(result).toContain('  city?: string;');
    expect(result).toContain('  address?: CreatePetFormValueAddress;');
  });

  it('should generate nested interface for array of objects', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('export interface CreatePetFormValueTagsItem {');
    expect(result).toContain('  id?: number;');
    expect(result).toContain('  name?: string;');
    expect(result).toContain('  tags?: CreatePetFormValueTagsItem[];');
  });

  it('should handle array of primitives', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  tags?: string[];');
  });

  it('should handle array of enums', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: { type: 'string', enum: ['admin', 'user'] },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain("  roles?: ('admin' | 'user')[];");
  });

  it('should handle number type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        price: { type: 'number' },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  price?: number;');
  });

  it('should use path-based name when operationId is not provided', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    const result = generateInterface(schema, { method: 'POST', path: '/pets' });

    expect(result).toContain('export interface PostPetsFormValue {');
  });

  it('should use unknown for unrecognized types', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        data: {} as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  data?: unknown;');
  });

  it('should handle numeric enums without quoting', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        priority: { type: 'integer', enum: [1, 2, 3] },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  priority?: 1 | 2 | 3;');
  });

  it('should handle nullable types', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true } as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  name?: string | null;');
  });

  it('should include null in an enum union when nullable is true', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        country: { type: 'string', enum: ['US', 'UK', 'CA'], nullable: true } as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);
    expect(result).toContain("country?: 'US' | 'UK' | 'CA' | null;");
  });

  it('should include null in a numeric enum union when nullable is true', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        priority: { type: 'integer', enum: [1, 2, 3], nullable: true } as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);
    expect(result).toContain('priority?: 1 | 2 | 3 | null;');
  });

  it('should handle OpenAPI 3.1 type:[T, null] on primitive properties', () => {
    // 3.1-style nullable on string
    const schema = {
      type: 'object',
      properties: {
        middleName: { type: ['string', 'null'] },
        age: { type: ['integer', 'null'] },
      },
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);
    expect(result).toContain('middleName?: string | null;');
    expect(result).toContain('age?: number | null;');
  });

  it('should handle OpenAPI 3.1 type:[T, null] combined with enum', () => {
    const schema = {
      type: 'object',
      properties: {
        country: { type: ['string', 'null'], enum: ['US', 'UK', null] },
      },
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);
    // null enum value should be dropped from the literal union; nullability expressed as `| null`
    expect(result).toContain("country?: 'US' | 'UK' | null;");
  });

  it('should handle oneOf with { type: "null" } as nullable union', () => {
    const schema = {
      type: 'object',
      properties: {
        nick: { oneOf: [{ type: 'string' }, { type: 'null' }] },
      },
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);
    expect(result).toContain('nick?: string | null;');
  });

  it('should handle anyOf with { type: "null" } as nullable union', () => {
    const schema = {
      type: 'object',
      properties: {
        count: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
      },
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);
    expect(result).toContain('count?: number | null;');
  });

  // `allOf` is intersection: a value must satisfy every branch. If one branch is
  // `A | null`, the intersection with non-null `A` eliminates null. The generator
  // parenthesises each union branch before joining with `&` so TypeScript's built-in
  // distribution + simplification yields the strict semantic answer.
  it('should parenthesise union branches in allOf so TS reduces null correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        composed: {
          allOf: [{ type: 'string' }, { type: 'string', nullable: true }],
        },
      },
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);
    // `string & (string | null)` → TypeScript reduces to `string` at use-site.
    // We emit the pre-reduction form so intent remains visible in the source.
    expect(result).toContain('composed?: string & (string | null);');
  });

  it('should emit plain intersection when no allOf branch is nullable', () => {
    const schema = {
      type: 'object',
      properties: {
        composed: {
          allOf: [
            { type: 'object', properties: { a: { type: 'string' } } },
            { type: 'object', properties: { b: { type: 'number' } } },
          ],
        },
      },
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);
    // No nullable branches → no parens needed — existing composition pattern unchanged.
    expect(result).not.toContain('(');
    expect(result).toContain(' & ');
  });

  it('should handle oneOf as union type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        value: {
          oneOf: [{ type: 'string' }, { type: 'number' }],
        } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  value?: string | number;');
  });

  it('should handle anyOf as union type', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        value: {
          anyOf: [{ type: 'string' }, { type: 'boolean' }],
        } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  value?: string | boolean;');
  });

  it('should handle allOf as intersection type for nested properties', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        data: {
          allOf: [
            { type: 'object', properties: { id: { type: 'integer' } } },
            { type: 'object', properties: { name: { type: 'string' } } },
          ],
        } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    // allOf on a nested property still produces an intersection
    expect(result).toMatch(/data\?:.*&/);
  });

  it('should merge properties from top-level allOf schema', () => {
    const schema: OpenAPIV3.SchemaObject = {
      allOf: [
        {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
        },
        {
          type: 'object',
          properties: {
            department: { type: 'string', enum: ['engineering', 'marketing', 'sales'] },
            salary: { type: 'number' },
          },
        },
      ],
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('export interface CreatePetFormValue {');
    expect(result).toContain('  name: string;');
    expect(result).toContain('  email?: string;');
    expect(result).toContain("  department?: 'engineering' | 'marketing' | 'sales';");
    expect(result).toContain('  salary?: number;');
  });

  it('should combine required arrays from all allOf constituents', () => {
    const schema: OpenAPIV3.SchemaObject = {
      allOf: [
        {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
        {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string' } },
        },
      ],
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  id: number;');
    expect(result).toContain('  name: string;');
  });

  it('should include all variant properties for oneOf with discriminator', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      required: ['channel'],
      properties: {
        channel: { type: 'string' },
      },
      oneOf: [
        {
          type: 'object',
          properties: {
            channel: { type: 'string', enum: ['email'] },
            emailAddress: { type: 'string' },
            subject: { type: 'string' },
          },
        },
        {
          type: 'object',
          properties: {
            channel: { type: 'string', enum: ['sms'] },
            phoneNumber: { type: 'string' },
            message: { type: 'string' },
          },
        },
      ],
      discriminator: {
        propertyName: 'channel',
      },
    } as unknown as OpenAPIV3.SchemaObject;

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('export interface CreatePetFormValue {');
    // Discriminator should be required with union type
    expect(result).toContain("  channel: 'email' | 'sms';");
    // Variant properties should be optional
    expect(result).toContain('  emailAddress?: string;');
    expect(result).toContain('  subject?: string;');
    expect(result).toContain('  phoneNumber?: string;');
    expect(result).toContain('  message?: string;');
  });

  it('should generate distinct interface names for oneOf discriminator variants on a property', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      required: ['method'],
      properties: {
        method: {
          oneOf: [
            {
              type: 'object',
              properties: {
                type: { type: 'string' },
                cardNumber: { type: 'string' },
              },
            },
            {
              type: 'object',
              properties: {
                type: { type: 'string' },
                iban: { type: 'string' },
              },
            },
          ],
          discriminator: {
            propertyName: 'type',
            mapping: {
              card: '#/components/schemas/Card',
              bank: '#/components/schemas/Bank',
            },
          },
        } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    // Should have distinct interface names
    expect(result).toContain('export interface CreatePetFormValueMethodCard {');
    expect(result).toContain('export interface CreatePetFormValueMethodBank {');
    // Should produce a union type
    expect(result).toContain('method: CreatePetFormValueMethodCard | CreatePetFormValueMethodBank;');
  });

  it('should skip $ref properties', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        ref: { $ref: '#/components/schemas/Other' } as unknown as OpenAPIV3.SchemaObject,
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  name?: string;');
    expect(result).not.toContain('ref');
  });

  // Issue #485: binary properties are skipped by the field mapper, so the
  // FormValue interface must skip them too — otherwise it describes a property
  // the form can never produce.
  it('should skip binary file properties so the interface matches the generated form', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      required: ['name', 'avatar'],
      properties: {
        name: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  name: string;');
    expect(result).not.toContain('avatar');
  });

  it('should skip arrays of binary files', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  title?: string;');
    expect(result).not.toContain('files');
  });

  it('should skip binary properties inside nested object interfaces', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            blob: { type: 'string', format: 'binary' },
          },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toContain('  label?: string;');
    expect(result).not.toContain('blob');
  });

  it('should include @generated header', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toMatch(/^\/\/ @generated by @ng-forge\/openapi-generator \n/);
  });

  it('should include @generated header with nested interfaces', () => {
    const schema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: { street: { type: 'string' } },
        },
      },
    };

    const result = generateInterface(schema, defaultOptions);

    expect(result).toMatch(/^\/\/ @generated by @ng-forge\/openapi-generator \n/);
  });

  // Issue #419: dereferenced specs with $ref cycles produce literal cyclic JS object
  // graphs at runtime. Verify cycle detection emits `unknown` instead of recursing forever.
  describe('circular schema references (issue #419)', () => {
    it('terminates on the reporter pattern (Banner.logs[Log] + Log.consentBanner.allOf:[Banner], nullable)', () => {
      const banner: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      const log: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          id: { type: 'number' },
          consentBanner: {
            nullable: true,
            allOf: [banner],
          } as unknown as OpenAPIV3.SchemaObject,
        },
      };
      (banner.properties as Record<string, OpenAPIV3.SchemaObject>)['logs'] = { type: 'array', items: log };

      const result = generateInterface(banner, defaultOptions);

      // Outer interface generated successfully
      expect(result).toContain('export interface CreatePetFormValue');
      // Back-edge into Banner is broken with `unknown`
      expect(result).toContain('unknown');
      // No stack overflow, no half-written output
      expect(result).toMatch(/^\/\/ @generated/);
    });

    it('terminates on direct two-way array cycle (A.bs: B[]; B.as: A[])', () => {
      const a: OpenAPIV3.SchemaObject = { type: 'object', properties: {} };
      const b: OpenAPIV3.SchemaObject = { type: 'object', properties: {} };
      (a.properties as Record<string, OpenAPIV3.SchemaObject>)['bs'] = { type: 'array', items: b };
      (b.properties as Record<string, OpenAPIV3.SchemaObject>)['as'] = { type: 'array', items: a };

      expect(() => generateInterface(a, defaultOptions)).not.toThrow();
      const result = generateInterface(a, defaultOptions);
      expect(result).toContain('unknown');
    });

    it('terminates on self-referencing tree (Node.children: Node[])', () => {
      const node: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      (node.properties as Record<string, OpenAPIV3.SchemaObject>)['children'] = { type: 'array', items: node };

      expect(() => generateInterface(node, defaultOptions)).not.toThrow();
      const result = generateInterface(node, defaultOptions);
      expect(result).toContain('unknown');
    });

    it('still emits full interfaces for sibling references to the same shared schema', () => {
      const address: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: { street: { type: 'string' }, city: { type: 'string' } },
      };
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: { home: address, work: address },
      };

      const result = generateInterface(schema, defaultOptions);

      // Both branches expand; no false-positive cycle.
      expect(result).not.toContain('unknown');
      expect(result.match(/street/g)?.length).toBe(2);
    });

    it('terminates on a oneOf cycle with discriminator (variant points back to parent)', () => {
      const node: OpenAPIV3.SchemaObject = { type: 'object', properties: { kind: { type: 'string', enum: ['leaf'] } } };
      const tree: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          child: {
            oneOf: [node],
            discriminator: { propertyName: 'kind', mapping: { leaf: '#/components/schemas/Node' } },
          } as unknown as OpenAPIV3.SchemaObject,
        },
      };
      // Wire the back-edge: the Node variant has a property pointing back to Tree.
      (node.properties as Record<string, OpenAPIV3.SchemaObject>)['parent'] = tree;

      expect(() => generateInterface(tree, defaultOptions)).not.toThrow();
      const result = generateInterface(tree, defaultOptions);
      expect(result).toContain('unknown');
    });

    it('terminates on a oneOf cycle without discriminator (member points to itself)', () => {
      // The cycle lives on a property's schema so schemaToTsType actually
      // enters the oneOf branch — a top-level oneOf-only schema is handled by
      // resolveSchemaProperties and never reaches schemaToTsType.
      const cycle: OpenAPIV3.SchemaObject = { oneOf: [] } as unknown as OpenAPIV3.SchemaObject;
      (cycle as unknown as { oneOf: OpenAPIV3.SchemaObject[] }).oneOf = [cycle];
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: { foo: cycle },
      };

      expect(() => generateInterface(schema, defaultOptions)).not.toThrow();
      const result = generateInterface(schema, defaultOptions);
      expect(result).toContain('unknown');
    });

    it('terminates on an allOf chain spanning >2 objects (A.allOf:[B], B.allOf:[A])', () => {
      const a: OpenAPIV3.SchemaObject = { type: 'object', properties: { aName: { type: 'string' } } };
      const b: OpenAPIV3.SchemaObject = { type: 'object', properties: { bName: { type: 'string' } } };
      (a as unknown as { allOf: OpenAPIV3.SchemaObject[] }).allOf = [b];
      (b as unknown as { allOf: OpenAPIV3.SchemaObject[] }).allOf = [a];

      expect(() => generateInterface(a, defaultOptions)).not.toThrow();
      const result = generateInterface(a, defaultOptions);
      // Outer interface emitted; chain terminated without stack overflow.
      expect(result).toContain('export interface');
    });
  });
});
