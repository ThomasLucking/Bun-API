import index from './index.html';
import { queryTodos, insertTodo } from './db.ts';
import * as v from 'valibot';
import { TodosSchema } from './Schema.ts'

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

          const validate = v.parse(TodosSchema, body);
          const newTodo = insertTodo(validate);

          return Response.json(newTodo);
        } catch (err: unknown) {
          if (err instanceof v.ValiError) {
            return Response.json({ success: false, error: "Invalid request body", issues: err.issues }, { status: 400 });
          }
          console.error("Error inserting todo:", err);
          return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
        }
      }
    }
  },

  fetch() {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
});

console.log(`Listening on ${server.url}`);