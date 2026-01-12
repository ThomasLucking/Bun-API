import * as v from 'valibot';

export const TodosSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty("Title cannot be empty")),
  content: v.string(),
  due_date: v.string(),
  done: v.boolean(),
});

export type Todo = v.InferOutput<typeof TodosSchema>;


export const OptionalTodoSchema = v.partial(TodosSchema)


