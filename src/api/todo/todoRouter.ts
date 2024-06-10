import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { GetTodoSchema, PatchTodoSchema, PostTodoSchema, TodoSchema } from './todoModel';
import { todoService } from './todoService';

export const todoRegistry = new OpenAPIRegistry();

todoRegistry.register('Todo', TodoSchema);

export const todoRouter: Router = (() => {
  const router = express.Router();

  todoRegistry.registerPath({
    method: 'get',
    path: '/todos',
    tags: ['Todo'],
    responses: createApiResponse(z.array(TodoSchema), 'Success'),
  });

  router.get('/', async (_req: Request, res: Response) => {
    const serviceResponse = await todoService.findAll();
    handleServiceResponse(serviceResponse, res);
  });

  todoRegistry.registerPath({
    method: 'get',
    path: '/todos/{id}',
    tags: ['Todo'],
    request: { params: GetTodoSchema.shape.params },
    responses: createApiResponse(TodoSchema, 'Success'),
  });

  router.get('/:id', validateRequest(GetTodoSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const serviceResponse = await todoService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  todoRegistry.registerPath({
    method: 'post',
    path: '/todos',
    tags: ['Todo'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: PostTodoSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(TodoSchema, 'Success'),
  });

  router.post('/', validateRequest(PostTodoSchema), async (req: Request, res: Response) => {
    const payload = req.body;
    const serviceResponse = await todoService.create(payload);
    handleServiceResponse(serviceResponse, res);
  });

  todoRegistry.registerPath({
    method: 'patch',
    path: '/todos/{id}',
    tags: ['Todo'],
    request: {
      params: PatchTodoSchema.shape.params,
      body: {
        content: {
          'application/json': {
            schema: PatchTodoSchema.shape.body,
          },
        },
      },
    },
    responses: createApiResponse(TodoSchema, 'Success'),
  });

  router.patch('/:id', validateRequest(PatchTodoSchema), async (req: Request, res: Response) => {
    const payload = {
      detail: req.body.detail,
      id: parseInt(req.params.id as string, 10),
    };

    const serviceResponse = await todoService.update(payload);
    handleServiceResponse(serviceResponse, res);
  });

  todoRegistry.registerPath({
    method: 'delete',
    path: '/todos/{id}',
    tags: ['Todo'],
    request: { params: GetTodoSchema.shape.params },
    responses: createApiResponse(TodoSchema, 'Success'),
  });

  router.delete('/:id', validateRequest(GetTodoSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const serviceResponse = await todoService.delete(id);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
