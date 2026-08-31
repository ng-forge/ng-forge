import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { delay } from '@ng-forge/utils';
import { FIELD_REGISTRY, FieldTypeDefinition, FormConfig } from '@ng-forge/dynamic-forms/internal';
import { checkboxFieldMapper, optionsFieldMapper, valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { DynamicForm } from '../../dynamic-form.component';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { WEB_MCP_ENABLED } from '../../providers/features/web-mcp/web-mcp.token';

/** Shape of the tool descriptors the model context receives. */
interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (args: unknown, client: unknown) => Promise<string>;
}

const NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

/**
 * Stands in for the browser's model context, enforcing the parts of the draft
 * registration algorithm that a plain recording spy silently accepts:
 * registration is asynchronous, a duplicate or malformed name rejects, the
 * descriptor has to be serializable, and an aborted signal unregisters the tool.
 *
 * Those are exactly the failures a fire-and-forget `registerTool()` call cannot
 * see, so the fake has to be strict for the tests to mean anything.
 *
 * @see https://webmachinelearning.github.io/webmcp/
 */
class FakeModelContext {
  readonly tools = new Map<string, RegisteredTool>();
  /** Every name ever registered, in order, so re-registration is observable. */
  readonly registrations: string[] = [];

  async registerTool(tool: RegisteredTool, options?: { signal?: AbortSignal }): Promise<void> {
    if (options?.signal?.aborted) throw new DOMException('Registration aborted', 'AbortError');
    if (!NAME_PATTERN.test(tool.name)) throw new TypeError(`Invalid tool name "${tool.name}"`);
    if (this.tools.has(tool.name)) throw new DOMException(`Tool "${tool.name}" is already registered`, 'InvalidStateError');

    // The descriptor crosses an agent boundary, so it must serialize.
    JSON.stringify(tool.inputSchema);

    this.tools.set(tool.name, tool);
    this.registrations.push(tool.name);
    options?.signal?.addEventListener('abort', () => this.tools.delete(tool.name));
  }

  /** The agent-facing listing: descriptors without their implementations. */
  getTools(): Omit<RegisteredTool, 'execute'>[] {
    return [...this.tools.values()].map(({ name, description, inputSchema, annotations }) => ({
      name,
      description,
      inputSchema,
      annotations,
    }));
  }

  executeTool(name: string, args: unknown): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`No tool registered as "${name}". Registered: ${[...this.tools.keys()].join(', ') || '(none)'}`);
    return Promise.resolve(tool.execute(args, {}));
  }
}

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
    scope: ['text-input', 'numeric'],
  },
  {
    name: 'checkbox',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-checkbox.harness').then((m) => m.default),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
  },
  {
    name: 'select',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-select.harness').then((m) => m.default),
    mapper: optionsFieldMapper as FieldTypeDefinition['mapper'],
    scope: 'single-select',
  },
];

describe('WebMCP integration', () => {
  let context: FakeModelContext;
  let originalModelContext: unknown;

  const toolNames = () => context.getTools().map((tool) => tool.name);
  const schemaOf = (name: string) => context.getTools().find((tool) => tool.name === name)?.inputSchema;
  const call = (name: string, args: unknown) => context.executeTool(name, args);

  /**
   * Strips the identity symbols the array field attaches to its items, which are
   * runtime bookkeeping rather than form value.
   */
  const plain = (value: unknown) => JSON.parse(JSON.stringify(value));

  const mount = async (config: FormConfig, providers: unknown[] = []) => {
    TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [
        { provide: WEB_MCP_ENABLED, useValue: true },
        {
          provide: FIELD_REGISTRY,
          useFactory: () => {
            const registry = new Map<string, FieldTypeDefinition>();
            BUILT_IN_FIELDS.forEach((fieldType) => registry.set(fieldType.name, fieldType));
            TEST_FIELD_TYPES.forEach((fieldType) => registry.set(fieldType.name, fieldType));
            return registry;
          },
        },
        ...(providers as never[]),
      ],
    });

    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', config);
    fixture.detectChanges();
    TestBed.flushEffects();

    await settle(fixture);
    return fixture;
  };

  /** The registrar is dynamically imported and registration is async. */
  const settle = async (fixture: { detectChanges: () => void }) => {
    await delay(20);
    fixture.detectChanges();
    TestBed.flushEffects();
    await delay(20);
  };

  beforeEach(() => {
    context = new FakeModelContext();
    originalModelContext = (document as unknown as Record<string, unknown>)['modelContext'];

    // `document.modelContext` is the current surface; `navigator.modelContext`
    // is deprecated as of Chrome 150.
    (document as unknown as Record<string, unknown>)['modelContext'] = context;
  });

  afterEach(() => {
    (document as unknown as Record<string, unknown>)['modelContext'] = originalModelContext;
    TestBed.resetTestingModule();
  });

  describe('registration', () => {
    it('registers nothing when the config does not opt in', async () => {
      await mount({ fields: [{ key: 'name', type: 'input', label: 'Name' }] } as unknown as FormConfig);

      expect(toolNames()).toEqual([]);
    });

    it('registers nothing when the feature is not provided', async () => {
      await mount(
        {
          options: { webMcp: { name: 'profile', description: 'Profile form.' } },
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        } as unknown as FormConfig,
        [{ provide: WEB_MCP_ENABLED, useValue: false }],
      );

      expect(toolNames()).toEqual([]);
    });

    it('registers only a fill tool by default', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      expect(toolNames()).toEqual(['fill_profile']);
    });

    it('registers a submit tool only when the form allows it', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      expect(toolNames()).toEqual(['fill_profile', 'submit_profile']);
    });

    it('picks up webMcp given through the formOptions input', async () => {
      TestBed.configureTestingModule({
        imports: [DynamicForm],
        providers: [
          { provide: WEB_MCP_ENABLED, useValue: true },
          {
            provide: FIELD_REGISTRY,
            useFactory: () => {
              const registry = new Map<string, FieldTypeDefinition>();
              BUILT_IN_FIELDS.forEach((fieldType) => registry.set(fieldType.name, fieldType));
              TEST_FIELD_TYPES.forEach((fieldType) => registry.set(fieldType.name, fieldType));
              return registry;
            },
          },
        ],
      });

      const fixture = TestBed.createComponent(DynamicForm);
      fixture.componentRef.setInput('dynamic-form', { fields: [{ key: 'name', type: 'input' }] } as unknown as FormConfig);
      fixture.componentRef.setInput('formOptions', { webMcp: { name: 'viaInput', description: 'Set through the input.' } });
      fixture.detectChanges();
      TestBed.flushEffects();
      await settle(fixture);

      expect(toolNames()).toEqual(['fill_viaInput']);
    });

    it('flags returned form values as untrusted content', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      expect(context.getTools().map((tool) => tool.annotations)).toEqual([{ untrustedContentHint: true }, { untrustedContentHint: true }]);
    });

    it('builds the tool schema from the config, with titles and option labels', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'name', type: 'input', label: 'Full name', required: true },
          {
            key: 'status',
            type: 'select',
            label: 'Status',
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Live', value: 'live' },
            ],
          },
        ],
      } as unknown as FormConfig);

      expect(schemaOf('fill_profile')).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Full name' },
          status: {
            type: 'string',
            title: 'Status',
            enum: ['draft', 'live'],
            anyOf: [
              { const: 'draft', title: 'Draft' },
              { const: 'live', title: 'Live' },
            ],
          },
        },
        additionalProperties: false,
      });
    });

    it('reports a registration failure instead of pretending the tool is live', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'not a valid name', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input' }],
      } as unknown as FormConfig);

      expect(toolNames()).toEqual([]);
      expect(fixture.componentInstance.webMcpStatus()).toBe('failed');
    });

    it('reports unsupported when the page exposes no model context', async () => {
      (document as unknown as Record<string, unknown>)['modelContext'] = undefined;

      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input' }],
      } as unknown as FormConfig);

      expect(fixture.componentInstance.webMcpStatus()).toBe('unsupported');
    });
  });

  describe('registration follows the config', () => {
    it('replaces the tools when the config changes', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'first', description: 'First form.', allowSubmit: true } },
        fields: [{ key: 'a', type: 'input' }],
      } as unknown as FormConfig);

      expect(toolNames()).toEqual(['fill_first', 'submit_first']);

      fixture.componentRef.setInput('dynamic-form', {
        options: { webMcp: { name: 'second', description: 'Second form.' } },
        fields: [{ key: 'b', type: 'input' }],
      } as unknown as FormConfig);
      fixture.detectChanges();
      TestBed.flushEffects();
      await settle(fixture);

      expect(toolNames()).toEqual(['fill_second']);
    });

    it('revokes the submit tool when allowSubmit is turned off', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        fields: [{ key: 'a', type: 'input' }],
      } as unknown as FormConfig);

      expect(toolNames()).toContain('submit_profile');

      fixture.componentRef.setInput('dynamic-form', {
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'a', type: 'input' }],
      } as unknown as FormConfig);
      fixture.detectChanges();
      TestBed.flushEffects();
      await settle(fixture);

      expect(toolNames()).toEqual(['fill_profile']);
    });

    it('unregisters everything when webMcp is removed', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'a', type: 'input' }],
      } as unknown as FormConfig);

      fixture.componentRef.setInput('dynamic-form', { fields: [{ key: 'a', type: 'input' }] } as unknown as FormConfig);
      fixture.detectChanges();
      TestBed.flushEffects();
      await settle(fixture);

      expect(toolNames()).toEqual([]);
      expect(fixture.componentInstance.webMcpStatus()).toBe('idle');
    });

    it('rebuilds the schema when the fields change under the same tool name', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'a', type: 'input' }],
      } as unknown as FormConfig);

      fixture.componentRef.setInput('dynamic-form', {
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'b', type: 'input' }],
      } as unknown as FormConfig);
      fixture.detectChanges();
      TestBed.flushEffects();
      await settle(fixture);

      expect(Object.keys((schemaOf('fill_profile') as { properties: object }).properties)).toEqual(['b']);
    });

    it('unregisters when the form is destroyed', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'a', type: 'input' }],
      } as unknown as FormConfig);

      fixture.destroy();

      expect(toolNames()).toEqual([]);
    });
  });

  describe('argument validation', () => {
    const validationForm = {
      options: { webMcp: { name: 'profile', description: 'Profile form.' } },
      fields: [
        { key: 'name', type: 'input', label: 'Name', value: 'Ada' },
        { key: 'age', type: 'input', props: { type: 'number' }, value: 30 },
        {
          key: 'status',
          type: 'select',
          value: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Live', value: 'live' },
          ],
        },
      ],
    } as unknown as FormConfig;

    it('rejects an unknown field without touching the form', async () => {
      const fixture = await mount(validationForm);

      const result = await call('fill_profile', { name: 'Grace', nope: 1 });

      expect(result).toContain('Nothing was applied.');
      expect(result).toContain('Unknown field "nope"');
      expect(fixture.componentInstance.formValue()).toMatchObject({ name: 'Ada' });
    });

    it('rejects a value of the wrong runtime type', async () => {
      const fixture = await mount(validationForm);

      const result = await call('fill_profile', { age: 'thirty' });

      expect(result).toContain('expects number');
      expect(fixture.componentInstance.formValue()).toMatchObject({ age: 30 });
    });

    it('rejects a value outside a select’s options', async () => {
      const fixture = await mount(validationForm);

      const result = await call('fill_profile', { status: 'archived' });

      expect(result).toContain('not one of');
      expect(fixture.componentInstance.formValue()).toMatchObject({ status: 'draft' });
    });

    it('rejects null on a field that is not nullable', async () => {
      await mount(validationForm);

      expect(await call('fill_profile', { name: null })).toContain('Nothing was applied.');
    });

    it('reports every problem in one response', async () => {
      await mount(validationForm);

      const result = await call('fill_profile', { nope: 1, age: 'thirty' });

      expect(result).toContain('Unknown field "nope"');
      expect(result).toContain('expects number');
    });

    it('rejects a write to a field the config marks unwritable', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'name', type: 'input', value: 'Ada' },
          { key: 'internalId', type: 'input', value: 'x1', webMcp: { writable: false } },
        ],
      } as unknown as FormConfig);

      const result = await call('fill_profile', { internalId: 'hacked' });

      expect(result).toContain('Nothing was applied.');
      expect(fixture.componentInstance.formValue()).toMatchObject({ internalId: 'x1' });
    });

    it('rejects a write to a field the form has disabled right now', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'kind', type: 'input', value: 'basic' },
          {
            key: 'detail',
            type: 'input',
            value: 'keep',
            logic: [{ type: 'disabled', condition: { type: 'fieldValue', fieldPath: 'kind', operator: 'equals', value: 'basic' } }],
          },
        ],
      } as unknown as FormConfig);

      const result = await call('fill_profile', { detail: 'changed' });

      expect(result).toContain('disabled');
      expect(fixture.componentInstance.formValue()).toMatchObject({ detail: 'keep' });
    });
  });

  describe('fill', () => {
    it('reports current state without changing anything when called empty', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'name', type: 'input', label: 'Name', value: 'Ada' },
          { key: 'nickname', type: 'input', label: 'Nickname' },
        ],
      } as unknown as FormConfig);

      const result = await call('fill_profile', {});

      expect(result).toContain('No changes made.');
      expect(result).toContain('Still empty: nickname');
      expect(fixture.componentInstance.formValue()).toEqual({ name: 'Ada', nickname: '' });
    });

    it('does not hand back the whole model on an empty call', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'ssn', type: 'input', value: '111-22-3333' }],
      } as unknown as FormConfig);

      expect(await call('fill_profile', {})).not.toContain('111-22-3333');
    });

    it('returns the whole readable model when the form opts into it', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', readback: 'all' } },
        fields: [{ key: 'city', type: 'input', value: 'London' }],
      } as unknown as FormConfig);

      expect(await call('fill_profile', {})).toContain('London');
    });

    it('redacts a password even when the whole model is returned', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', readback: 'all' } },
        fields: [
          { key: 'user', type: 'input', value: 'ada' },
          { key: 'password', type: 'input', props: { type: 'password' }, value: 'hunter2' },
        ],
      } as unknown as FormConfig);

      const result = await call('fill_profile', { password: 'newsecret' });

      expect(result).not.toContain('hunter2');
      expect(result).not.toContain('newsecret');
      expect(result).toContain('not readable by agents');
    });

    it('applies values to the live form', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      const result = await call('fill_profile', { name: 'Ada' });

      expect(result).toContain('Applied: name.');
      expect(fixture.componentInstance.formValue()).toEqual({ name: 'Ada' });
    });

    it('leaves untouched fields alone when given a partial patch', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'first', type: 'input', label: 'First', value: 'Ada' },
          { key: 'last', type: 'input', label: 'Last', value: 'Lovelace' },
        ],
      } as unknown as FormConfig);

      await call('fill_profile', { last: 'Byron' });

      expect(fixture.componentInstance.formValue()).toEqual({ first: 'Ada', last: 'Byron' });
    });

    it('merges into a nested group instead of replacing it', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          {
            key: 'person',
            type: 'group',
            fields: [
              { key: 'first', type: 'input', value: 'Ada' },
              { key: 'last', type: 'input', value: 'Lovelace' },
            ],
          },
        ],
      } as unknown as FormConfig);

      await call('fill_profile', { person: { first: 'Grace' } });

      expect(fixture.componentInstance.formValue()).toEqual({ person: { first: 'Grace', last: 'Lovelace' } });
    });

    it('merges through two levels of nesting', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          {
            key: 'person',
            type: 'group',
            fields: [
              { key: 'first', type: 'input', value: 'Ada' },
              {
                key: 'address',
                type: 'group',
                fields: [
                  { key: 'city', type: 'input', value: 'London' },
                  { key: 'zip', type: 'input', value: 'E1' },
                ],
              },
            ],
          },
        ],
      } as unknown as FormConfig);

      await call('fill_profile', { person: { address: { city: 'Paris' } } });

      expect(fixture.componentInstance.formValue()).toEqual({
        person: { first: 'Ada', address: { city: 'Paris', zip: 'E1' } },
      });
    });

    it('scopes the readback to the leaf it wrote, not the whole group', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          {
            key: 'person',
            type: 'group',
            fields: [
              { key: 'first', type: 'input', value: 'Ada' },
              { key: 'secret', type: 'input', value: 'classified' },
            ],
          },
        ],
      } as unknown as FormConfig);

      const result = await call('fill_profile', { person: { first: 'Grace' } });

      expect(result).toContain('Grace');
      expect(result).not.toContain('classified');
    });

    it('reports live validation errors', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        defaultValidationMessages: { required: 'This field is required' },
        fields: [{ key: 'name', type: 'input', label: 'Name', required: true }],
      } as unknown as FormConfig);

      const result = await call('fill_profile', {});

      expect(result).toContain('Required right now: name');
      expect(result).toContain('name: This field is required');
    });

    it('evaluates cross-field validators against the values it just applied', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        defaultValidationMessages: { mismatch: 'passwords must match' },
        fields: [
          { key: 'password', type: 'input', label: 'Password', value: 'aaa' },
          {
            key: 'confirm',
            type: 'input',
            label: 'Confirm',
            value: 'aaa',
            validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'mismatch' }],
          },
        ],
      } as unknown as FormConfig);

      // A consistent change must stay valid. Evaluating against anything other
      // than the live form reports a false mismatch here.
      const result = await call('fill_profile', { password: 'bbb', confirm: 'bbb' });

      expect(result).toContain('No validation errors.');
    });

    it('reports a hidden field as not applicable', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'kind', type: 'input', label: 'Kind', value: 'basic' },
          {
            key: 'detail',
            type: 'input',
            label: 'Detail',
            logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'kind', operator: 'equals', value: 'basic' } }],
          },
        ],
      } as unknown as FormConfig);

      const result = await call('fill_profile', {});

      expect(result).toContain('Not currently applicable (do not send these): detail');
    });

    it('re-derives applicability from the values it applied', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'kind', type: 'input', label: 'Kind', value: 'basic' },
          {
            key: 'detail',
            type: 'input',
            label: 'Detail',
            logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'kind', operator: 'equals', value: 'basic' } }],
          },
        ],
      } as unknown as FormConfig);

      const result = await call('fill_profile', { kind: 'advanced' });

      expect(result).not.toContain('Not currently applicable');
    });

    it('never submits', async () => {
      const action = vi.fn();
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      await call('fill_profile', { name: 'Ada' });
      await delay(10);

      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('arrays', () => {
    const arrayForm = {
      options: { webMcp: { name: 'order', description: 'An order.' } },
      fields: [
        {
          key: 'lines',
          type: 'array',
          fields: [
            [
              { key: 'sku', type: 'input', value: 'a' },
              { key: 'qty', type: 'input', props: { type: 'number' }, value: 1 },
            ],
          ],
        },
      ],
    } as unknown as FormConfig;

    it('replaces a list whole', async () => {
      const fixture = await mount(arrayForm);

      await call('fill_order', { lines: [{ sku: 'b', qty: 2 }] });

      expect(plain(fixture.componentInstance.formValue())).toEqual({ lines: [{ sku: 'b', qty: 2 }] });
    });

    it('rejects an item with an unknown property', async () => {
      const fixture = await mount(arrayForm);

      const result = await call('fill_order', { lines: [{ sku: 'b', nope: true }] });

      expect(result).toContain('Unknown field "lines[0].nope"');
      expect(plain(fixture.componentInstance.formValue())).toEqual({ lines: [{ sku: 'a', qty: 1 }] });
    });

    it('reports a validation error inside an array item with its real path', async () => {
      await mount({
        options: { webMcp: { name: 'order', description: 'An order.' } },
        defaultValidationMessages: { required: 'This field is required' },
        fields: [
          {
            key: 'lines',
            type: 'array',
            fields: [[{ key: 'sku', type: 'input', value: '', required: true }]],
          },
        ],
      } as unknown as FormConfig);

      const result = await call('fill_order', {});

      expect(result).toContain('lines[0].sku: This field is required');
    });
  });

  describe('submit', () => {
    it('refuses invalid values and says the form was still changed', async () => {
      const action = vi.fn();
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        defaultValidationMessages: { required: 'This field is required' },
        fields: [
          { key: 'name', type: 'input', label: 'Name', required: true },
          { key: 'nickname', type: 'input', label: 'Nickname' },
        ],
      } as unknown as FormConfig);

      const result = await call('submit_profile', { nickname: 'Ada' });

      expect(result).toContain('Not submitted: validation failed.');
      expect(result).toContain('are still there');
      expect(action).not.toHaveBeenCalled();
    });

    it('applies values and runs the configured submission action', async () => {
      const action = vi.fn();
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', label: 'Name', required: true }],
      } as unknown as FormConfig);

      const result = await call('submit_profile', { name: 'Ada' });

      expect(result).toBe('Form submitted successfully.');
      expect(fixture.componentInstance.formValue()).toEqual({ name: 'Ada' });
      expect(action).toHaveBeenCalledOnce();
    });

    it('waits for an async action before reporting success', async () => {
      const order: string[] = [];
      const action = vi.fn(async () => {
        await delay(30);
        order.push('action');
      });

      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', required: true }],
      } as unknown as FormConfig);

      const result = await call('submit_profile', { name: 'Ada' });
      order.push('tool');

      expect(result).toBe('Form submitted successfully.');
      expect(order).toEqual(['action', 'tool']);
    });

    it('reports a rejected async action as a failure, not a success', async () => {
      const action = vi.fn(async () => {
        await delay(10);
        throw new Error('gateway exploded');
      });

      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', required: true }],
      } as unknown as FormConfig);

      const result = await call('submit_profile', { name: 'Ada' });

      expect(result).toContain('Not submitted: the submission failed.');
      expect(result).toContain('gateway exploded');
    });

    it('reports server-side validation errors that arrive after the action', async () => {
      const action = vi.fn(async () => {
        await delay(10);
        return [{ kind: 'server', message: 'That name is taken', field: undefined }];
      });

      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', required: true }],
      } as unknown as FormConfig);

      const result = await call('submit_profile', { name: 'Ada' });

      expect(result).toContain('Submitted, but it came back with errors.');
      expect(result).toContain('That name is taken');
    });

    it('reports a dropped concurrent submission as busy', async () => {
      const action = vi.fn(async () => {
        await delay(60);
      });

      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', required: true }],
      } as unknown as FormConfig);

      const first = call('submit_profile', { name: 'Ada' });
      await delay(20);
      const second = await call('submit_profile', { name: 'Grace' });

      expect(second).toContain('already submitting');
      expect(await first).toBe('Form submitted successfully.');
      expect(action).toHaveBeenCalledOnce();
    });

    it('says so plainly when the page handles submission itself', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        fields: [{ key: 'name', type: 'input', required: true }],
      } as unknown as FormConfig);

      expect(await call('submit_profile', { name: 'Ada' })).toContain('The page handled the submission itself');
    });

    it('submits values staged by an earlier fill call', async () => {
      const action = vi.fn();
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', label: 'Name', required: true }],
      } as unknown as FormConfig);

      await call('fill_profile', { name: 'Ada' });
      const result = await call('submit_profile', {});

      expect(result).toBe('Form submitted successfully.');
      expect(action).toHaveBeenCalledOnce();
    });
  });
});
