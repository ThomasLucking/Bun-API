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




export const queryTodos = () => db.query('select * from todos').all();

export const insertStmt = db.prepare(`
  INSERT INTO todos (title, content, due_date, done)
  VALUES ($title, $content, $due_date, $done) 
  RETURNING *
`);

export const insertTodo = (todo: { title: string, content: string, due_date: string, done: boolean }) => {
  return insertStmt.get({
    $title: todo.title,
    $content: todo.content,
    $due_date: todo.due_date,
    $done: todo.done ? 1 : 0
  });
};




const allTodos = db.query("select * from todos").all();
console.log("All Todos:", allTodos);


console.log("Database and table initialized successfully!");