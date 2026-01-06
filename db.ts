import { Database } from 'bun:sqlite';


const db = new Database("mydb.sqlite", { create: true });




const sql = `create table if not exists todos (
    id integer primary key autoincrement,
    title text not null check(length(title) <= 250),
    content text not null,
    due_date text,
    done boolean not null default 0
);`;

db.run(sql);

const insertTodo = db.prepare(`
  insert into todos (title, content, due_date)
  values ($title, $content, $due_date)
`);


export const reqGET = () => db.query('select * from todos').all();

insertTodo.run({
  $title: "Created Database",
  $content: "Test",
  $due_date: "2024-05-20"
});


const allTodos = db.query("select * from todos").all();
console.log("All Todos:", allTodos);


console.log("Database and table initialized successfully!");