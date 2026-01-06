
import index from './index.html'; 
import { getAllTodos } from './db.ts';

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index, 
    "/api/todos": (req)=> {
      switch(req.method) {
        case "GET": {
          const todos = getAllTodos()
          return Response.json()
        }

        default: {
          return new Response('Method does not exist',{ status: 404 })
      }
      }

    }
  }

});

console.log(`Listening on ${server.url}`);