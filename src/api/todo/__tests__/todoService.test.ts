import { StatusCodes } from 'http-status-codes';
import { Mock } from 'vitest';

import { Todo } from '../todoModel';
import { todoRepository } from '../todoRepository';
import { todoService } from '../todoService';

vi.mock('@/api/todo/todoRepository');
vi.mock('@/server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('todoService', () => {
  const mockUsers: Todo[] = [
    { id: 1, detail: 'Alice', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, detail: 'Bob', createdAt: new Date(), updatedAt: new Date() },
  ];

  describe('findAll', () => {
    it('return all todos', async () => {
      // Arrange
      (todoRepository.findAllAsync as Mock).mockReturnValue(mockUsers);

      // Act
      const result = await todoService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Todos found');
      expect(result.responseObject).toEqual(mockUsers);
    });

    it('returns a not found error for no todos found', async () => {
      // Arrange
      (todoRepository.findAllAsync as Mock).mockReturnValue(null);

      // Act
      const result = await todoService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No Todos found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for findAllAsync', async () => {
      // Arrange
      (todoRepository.findAllAsync as Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await todoService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Error finding all todos: $Database error');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns a todo for a valid ID', async () => {
      // Arrange
      const testId = 1;
      const mockUser = mockUsers.find((todo) => todo.id === testId);
      (todoRepository.findByIdAsync as Mock).mockReturnValue(mockUser);

      // Act
      const result = await todoService.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Todo found');
      expect(result.responseObject).toEqual(mockUser);
    });

    it('handles errors for findByIdAsync', async () => {
      // Arrange
      const testId = 1;
      (todoRepository.findByIdAsync as Mock).mockRejectedValue(new Error('Database error'));
      // Act
      const result = await todoService.findById(testId);
      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain(`Error finding todo with id ${testId}`);
      expect(result.responseObject).toBeNull();
    });

    it('returns a not found error for non-existent ID', async () => {
      // Arrange
      const testId = 1;
      (todoRepository.findByIdAsync as Mock).mockReturnValue(null);
      // Act
      const result = await todoService.findById(testId);
      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Todo not found');
      expect(result.responseObject).toBeNull();
    });

    it('returns a bad request for negative ID', async () => {
      // Act
      const invalidInput = -1;
      const result = await todoService.findById(invalidInput);
      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Todo not found');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a todo', async () => {
      // Arrange
      const newTodo = { id: 3, detail: 'Charlie', createdAt: new Date(), updatedAt: new Date() };
      (todoRepository.createAsync as Mock).mockReturnValue(newTodo);

      // Act
      const result = await todoService.create(newTodo);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.CREATED);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Todo created');
      expect(result.responseObject).toEqual(newTodo);
    });
  });

  describe('update', () => {
    const existingTodo = { id: 1, detail: 'Alice homework', createdAt: new Date(), updatedAt: new Date() };
    it('updates a todo', async () => {
      // Arrange
      const updatedTodo = { ...existingTodo, detail: 'Alice updated' };
      (todoRepository.findByIdAsync as Mock).mockReturnValue(existingTodo);
      (todoRepository.updateAsync as Mock).mockReturnValue(updatedTodo);

      // Act
      const result = await todoService.update(updatedTodo);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Todo updated');
      expect(result.responseObject).toEqual(updatedTodo);
    });
  });

  describe('delete', () => {
    const existingTodo = { id: 1, detail: 'Alice homework', createdAt: new Date(), updatedAt: new Date() };
    it('deletes a todo', async () => {
      // Arrange
      (todoRepository.findByIdAsync as Mock).mockReturnValue(existingTodo);

      // Act
      const result = await todoService.delete(existingTodo.id);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Todo deleted');
      expect(result.responseObject).toBeNull();
    });
  });
});
