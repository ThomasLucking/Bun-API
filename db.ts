import { Database } from 'bun:sqlite';
import type { Todo } from './Schema';


export const db = new Database("mydb.sqlite", { create: true });

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
  insert into todos (title, content, due_date, done)
  values ($title, $content, $due_date, $done) 
  returning *
`);

export const modifyTodo = (id: number, updates: Partial<Todo>) => {
  const keys = Object.keys(updates) as Array<keyof typeof updates>;

  if (keys.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  
  const values = keys.map((key) => {
    const value = updates[key];
    if (typeof value === "boolean") return value ? 1 : 0;
    return value ?? null;    
  });
  
  const sql = `UPDATE todos SET ${setClause} WHERE id = ? RETURNING *`;

  const stmt = db.prepare(sql);
  const updatedTodo = stmt.get(...values as any[], id);

  return updatedTodo;
};




export const findTodoById = (id: number) => 
  db.prepare("SELECT * FROM todos WHERE id = ?").get(id);

export const deleteTodoById = (id: number) => {
  const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
  return stmt.run(id);
}

export const insertTodo = (todo: Todo) => {
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