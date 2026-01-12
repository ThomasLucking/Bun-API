import * as v from 'valibot';

export const TodosSchema = v.object({
  title: v.string(),
  content: v.string(),
  due_date: v.nullable(v.string()),
  done: v.pipe(
    v.union([v.boolean(), v.number()]), 
    v.transform((val) => {
      if (val === 1) return true;
      if (val === 0) return false;
      return !!val; 
    })
  ),
});
export type Todo = v.InferOutput<typeof TodosSchema>;

export const OptionalTodoSchema = v.partial(TodosSchema);