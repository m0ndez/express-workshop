import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { PostTodoPayload, Todo } from './todoModel';
import { todoRepository } from './todoRepository';

export const todoService = {
  findAll: async (): Promise<ServiceResponse<Todo[] | null>> => {
    try {
      const todos = await todoRepository.findAllAsync();
      if (!todos) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Todos found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<Todo[]>(ResponseStatus.Success, 'Todos found', todos, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding all todos: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<Todo | null>> => {
    try {
      const todo = await todoRepository.findByIdAsync(id);
      if (!todo) {
        return new ServiceResponse(ResponseStatus.Failed, 'Todo not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<Todo>(ResponseStatus.Success, 'Todo found', todo, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding todo with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  create: async (payload: PostTodoPayload): Promise<ServiceResponse<Todo | null>> => {
    try {
      const id = crypto.getRandomValues(new Uint32Array(1))[0];
      const todo: Todo = {
        id,
        detail: payload.detail,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newTodo = await todoRepository.createAsync(todo);
      return new ServiceResponse<Todo>(ResponseStatus.Success, 'Todo created', newTodo, StatusCodes.CREATED);
    } catch (ex) {
      const errorMessage = `Error creating todo: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (payload: { id: number; detail: string }): Promise<ServiceResponse<Todo | null>> => {
    try {
      const existingTodo = await todoRepository.findByIdAsync(payload.id);
      if (!existingTodo) {
        return new ServiceResponse(ResponseStatus.Failed, 'Todo not found', null, StatusCodes.NOT_FOUND);
      }
      const updatedTodo = await todoRepository.updateAsync({
        ...existingTodo,
        detail: payload.detail,
        updatedAt: new Date(),
      });
      return new ServiceResponse<Todo>(ResponseStatus.Success, 'Todo updated', updatedTodo, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error updating todo: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  delete: async (id: number): Promise<ServiceResponse<null>> => {
    try {
      const existingTodo = await todoRepository.findByIdAsync(id);
      if (!existingTodo) {
        return new ServiceResponse(ResponseStatus.Failed, 'Todo not found', null, StatusCodes.NOT_FOUND);
      }
      await todoRepository.deleteAsync(id);
      return new ServiceResponse<null>(ResponseStatus.Success, 'Todo deleted', null, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error deleting todo: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
