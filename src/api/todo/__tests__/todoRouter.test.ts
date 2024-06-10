import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { Todo } from '../todoModel';
import { todos } from '../todoRepository';

describe('Todo API Endpoints', () => {
  describe('GET /todos', () => {
    it('should return a list of todos', async () => {
      // Act
      const response = await request(app).get('/todos');
      const responseBody: ServiceResponse<Todo[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Todos found');
      expect(responseBody.responseObject.length).toEqual(todos.size);

      responseBody.responseObject.forEach((user, index) => compareUsers(todos.get(index + 1) as Todo, user));
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a todo for a valid ID', async () => {
      // Arrange
      const testId = 1;
      const expectedUser = todos.get(testId) as Todo;

      // Act
      const response = await request(app).get(`/todos/${testId}`);
      const responseBody: ServiceResponse<Todo> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Todo found');
      compareUsers(expectedUser, responseBody.responseObject);
    });

    it('should return a not found error for non-existent ID', async () => {
      // Arrange
      const testId = Number.MAX_SAFE_INTEGER;

      // Act
      const response = await request(app).get(`/todos/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Todo not found');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for invalid ID format', async () => {
      // Act
      const invalidInput = 'abc';
      const response = await request(app).get(`/todos/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });

  describe('POST /todos', () => {
    it('should create a new todo', async () => {
      // Arrange
      const newTodo: Todo = { id: 3, detail: 'Charlie homework', createdAt: new Date(), updatedAt: new Date() };

      // Act
      const response = await request(app).post('/todos').send(newTodo);
      const responseBody: ServiceResponse<Todo> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Todo created');
    });

    it('should return a bad request for missing detail', async () => {
      // Arrange
      const newTodo = { id: 4, detail: '' };

      // Act
      const response = await request(app).post('/todos').send(newTodo);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });

  describe('PATCH /todos/:id', () => {
    it('should update an existing todo', async () => {
      // Arrange
      const existingTodo = todos.get(1) as Todo;
      const updatedTodo = { ...existingTodo, detail: 'Alice updated' };

      // Act
      const response = await request(app).patch(`/todos/${existingTodo.id}`).send(updatedTodo);
      const responseBody: ServiceResponse<Todo> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Todo updated');
    });

    it('should return a not found error for non-existent ID', async () => {
      // Arrange
      const testId = Number.MAX_SAFE_INTEGER;

      // Act
      const response = await request(app).patch(`/todos/${testId}`).send({ detail: 'Updated' });
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Todo not found');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for missing detail', async () => {
      // Arrange
      const existingTodo = todos.get(1) as Todo;
      const updatedTodo = { ...existingTodo, detail: '' };

      // Act
      const response = await request(app).patch(`/todos/${existingTodo.id}`).send(updatedTodo);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });
});

function compareUsers(mockTodo: Todo, responseUser: Todo) {
  if (!mockTodo || !responseUser) {
    throw new Error('Invalid test data: mockUser or responseUser is undefined');
  }

  expect(responseUser.id).toEqual(mockTodo.id);
  expect(responseUser.detail).toEqual(mockTodo.detail);
  expect(new Date(responseUser.createdAt)).toEqual(mockTodo.createdAt);
  expect(new Date(responseUser.updatedAt)).toEqual(mockTodo.updatedAt);
}
