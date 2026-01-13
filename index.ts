import index from './index.html';

import { 
  getRoute, 
  postRoute, 
  deleteAllRoute, 
  handleUpdateTodo, 
  deleteTodoRoute 
} from './routes/routes.ts';


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
      GET: () => getRoute(),
      POST: (req) => postRoute(req),
      DELETE: () => deleteAllRoute(),
    },

    "/api/todos/:id": {
      PATCH: (req) => handleUpdateTodo(req),
      DELETE: (req) => deleteTodoRoute(req),
    }
  },

});



console.log(`Listening on ${server.url}`);