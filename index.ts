import index from './index.html';
import { queryTodos, insertTodo, modifyTodo } from './db.ts';
import * as v from 'valibot';
import { ValiError } from 'valibot';
import { TodosSchema, OptionalTodoSchema } from './Schema.ts'
import type { Todo } from './Schema.ts'

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
      },
    },
    "/api/todos/:id": {
      PATCH: async (req) => {
        try {
          const id = Number(req.params.id);
          
          const body = await req.json();
          
         const validatedData = v.parse(OptionalTodoSchema, body);
          if (Object.keys(validatedData).length === 0) {
            return Response.json({ error: "No valid fields provided for update" }, { status: 400 });
          }
          const updatedTodo = modifyTodo(id, validatedData);
          if (!updatedTodo) {
            return Response.json({ success: false, message: "Todo not found" }, { status: 404 });
          }
          return Response.json({ success: true, data: updatedTodo }, {status: 200});

        } catch (error: any) {
          console.error("PATCH ERROR:", error);

          if (error instanceof ValiError) {
            return Response.json({
              success: false,
              error: "Validation Error",
              issues: error.issues
            }, { status: 400 }); 
          }
          return Response.json({ error: error.message || "Server Error" }, { status: 500 });
        }
      }
    }
  },

});

console.log(`Listening on ${server.url}`);