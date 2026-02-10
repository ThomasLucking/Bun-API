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

const handleOptions = () => new Response(null, { headers: corsHeaders });



const server = Bun.serve({
  port: 8080,
  routes: {
    "/": new Response(String(index), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html"
      }
    }),
    
    "/api/todos": {
      OPTIONS: handleOptions,
      GET: () => getRoute(),
      POST: (req) => postRoute(req),
      DELETE: () => deleteAllRoute(),
    },

    "/api/todos/:id": {
      OPTIONS: handleOptions,
      PATCH: (req) => handleUpdateTodo(req),
      DELETE: (req) => deleteTodoRoute(req),
    }
  },

});



console.log(`Listening on ${server.url}`);