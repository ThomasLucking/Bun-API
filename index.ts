import index from './index.html';
import { queryTodos, insertTodo, modifyTodo, findTodoById, deleteTodoById, db } from './db.ts';
import * as v from 'valibot';
import { ValiError } from 'valibot';
import { TodosSchema, OptionalTodoSchema } from './Schema.ts';


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Prefer, Origin",
};

const jsonResponse = (data: any, options: ResponseInit = {}) => {
  return new Response(JSON.stringify(data), {
    ...options,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};


const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/api/todos": {
      GET: () => {
        try {
          const data = queryTodos();
          if (!data) {
            return jsonResponse({ success: false, error: "No todos to fetch" }, { status: 400 });
          }
          return jsonResponse(data)
        } catch (err) {
          return jsonResponse({ success: false, error: "Internal Server Error" }, { status: 500 });
        }
      },
      POST: async (req) => {
        try {
          const body = await req.json();
          const validate = v.parse(TodosSchema, body);
          const newTodo = insertTodo(validate);
          return jsonResponse(newTodo);
        } catch (err: unknown) {
          if (err instanceof v.ValiError) {
            return jsonResponse({ success: false, error: "Invalid request body", issues: err.issues }, { status: 400 });
          }
          return jsonResponse({ success: false, error: "Internal Server Error" }, { status: 500 });

        }

      },
      DELETE: () => {
        try {
          const result = db.run("DELETE FROM todos");
          return jsonResponse({ success: true, message: `Deleted ${result.changes}` });
        } catch (err) {
          return jsonResponse({ error: "Failed to delete all tasks" }, { status: 500 });
        }
      }
    },

    "/api/todos/:id": {
      PATCH: async (req) => {
        try {
          const id = Number(req.params.id);
          const body = await req.json();
          const validatedData = v.parse(OptionalTodoSchema, body);
          const updatedTodo = modifyTodo(id, validatedData);
          if (!updatedTodo) {
            return jsonResponse({ success: false, message: "Todo not found" }, { status: 404 });
          }
          return jsonResponse({ success: true, data: updatedTodo }, { status: 200 });
        } catch (error: any) {
          if (error instanceof ValiError) {
            return jsonResponse({ success: false, error: "Validation Error", issues: error.issues }, { status: 400 });
          }
          return jsonResponse({ error: error.message || "Server Error" }, { status: 500 });
        }
      },
      DELETE: async (req) => {
        try {
          const id = Number(req.params.id);
          const wasDeleted = deleteTodoById(id);
          if (!wasDeleted) {
            return jsonResponse({ success: false, message: "Todo not found" }, { status: 404 });
          }
          return jsonResponse({ success: true, message: "Todo deleted successfully" }, { status: 200 });
        } catch (err: any) {
          return jsonResponse({ error: err.message || "Server Error" }, { status: 500 });
        }
      }
    }
  },

});



console.log(`Listening on ${server.url}`);