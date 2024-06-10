import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { healthCheckRegistry } from '@/api/healthCheck/healthCheckRouter';
import { todoRegistry } from '@/api/todo/todoRouter';

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([healthCheckRegistry, todoRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
