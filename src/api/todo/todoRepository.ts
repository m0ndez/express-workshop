import { Todo } from './todoModel';

export const todos: Map<number, Todo> = new Map();

todos.set(1, { id: 1, detail: 'Alice homework', createdAt: new Date(), updatedAt: new Date() });
todos.set(2, { id: 2, detail: 'Bob homework', createdAt: new Date(), updatedAt: new Date() });

export const todoRepository = {
  findAllAsync: async (): Promise<Todo[]> => {
    return Array.from(todos.values());
  },

  findByIdAsync: async (id: number): Promise<Todo | null> => {
    return todos.get(id) || null;
  },

  createAsync: async (payload: Todo): Promise<Todo> => {
    todos.set(payload.id, payload);
    return payload;
  },

  updateAsync: async (payload: Todo): Promise<Todo> => {
    todos.set(payload.id, payload);
    return payload;
  },

  deleteAsync: async (id: number): Promise<void> => {
    todos.delete(id);
  },
};
