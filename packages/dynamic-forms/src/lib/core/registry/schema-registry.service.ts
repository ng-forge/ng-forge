import { Injectable } from '@angular/core';
import { SchemaDefinition } from '../../models/schemas/schema-definition';

@Injectable()
export class SchemaRegistryService {
  private readonly registeredSchemas = new Map<string, SchemaDefinition>();

  /**
   * Register a reusable schema
   */
  registerSchema(schema: SchemaDefinition): void {
    this.registeredSchemas.set(schema.name, schema);
  }

  /**
   * Get registered schema by name
   */
  getSchema(name: string): SchemaDefinition | undefined {
    return this.registeredSchemas.get(name);
  }

  /**
   * Get all registered schemas
   */
  getAllSchemas(): Map<string, SchemaDefinition> {
    return new Map(this.registeredSchemas);
  }

  /**
   * Clear all registered schemas
   */
  clearSchemas(): void {
    this.registeredSchemas.clear();
  }

  /**
   * Resolve schema from string reference or direct definition
   */
  resolveSchema(schema: string | SchemaDefinition): SchemaDefinition | null {
    if (typeof schema === 'string') {
      return this.getSchema(schema) || null;
    }
    return schema;
  }
}
