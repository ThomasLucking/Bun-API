import index from './index.html';
import { queryTodos, insertTodo } from './db.ts';
import * as v from 'valibot';

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/api/todos": {  
      GET: () => {
        const data = queryTodos();
        return Response.json(data);
      },
      POST: async (req) => {
        try {
          const body = await req.json();
          
          const TodosSchema = v.object({
            title: v.pipe(v.string(), v.nonEmpty("Title cannot be empty")),
            content: v.string(),
            due_date: v.string(),
            done: v.boolean()
          });

          const validate = v.parse(TodosSchema, body);
          const newTodo = insertTodo(validate);

          return Response.json(newTodo);
        } catch (err: any) {
          return Response.json({ 
            success: false, 
            error: err.message || "Unknown error" 
          }, { status: 400 });
        }
      }
    }
  },

  fetch() {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
});

console.log(`Listening on ${server.url}`);