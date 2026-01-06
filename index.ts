
import index from './index.html'; 
import { reqGET } from './db.ts';

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index, 
    "/api/todos": (req)=> {
      if(req.method === "GET"){
        const todos = reqGET()

        return Response.json(todos)
      }

      return new Response('Method does not exist')

    }
  }

});

console.log(`Listening on ${server.url}`);