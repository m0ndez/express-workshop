import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export type Todo = z.infer<typeof TodoSchema>;
export type PostTodoPayload = z.infer<typeof PostTodoSchema.shape.body>;

export const TodoSchema = z.object({
  id: commonValidations.id,
  detail: z.string().min(1, 'Detail must be at least 1 character long'),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const GetTodoSchema = z.object({
  params: TodoSchema.pick({ id: true }),
});
export const PostTodoSchema = z.object({
  body: TodoSchema.omit({ id: true, createdAt: true, updatedAt: true }),
});
export const PatchTodoSchema = z.object({
  body: TodoSchema.pick({ detail: true }),
  params: TodoSchema.pick({ id: true }),
});
