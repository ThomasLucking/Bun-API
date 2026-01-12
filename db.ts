import { Database } from 'bun:sqlite';
import type { Todo } from './Schema';


export const db = new Database("mydb.sqlite", { create: true });

type DBResult = {
  changes: number;
  lastInsertRowid: number;
};


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
`);


export const modifyTodo = async (id: number, updates: Todo) => {
  // extract the values.
  const keys = Object.keys(updates) as (keyof Todo)[];

  if (keys.length === 0) {
    throw new Error("No fields to update");
  }
  // the set claude makes it so the values of the each item is ?, like a playholder to prevent sql injection
  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  // get the values of the new title and convert the boolean into 0 or 1's.
  const values = keys.map((key) => {
    const value = updates[key];

    return typeof value === "boolean" ? (value ? 1 : 0) : value;
  });

  // update the new values
  const sql = `UPDATE todos SET ${setClause} WHERE id = ?`


  const result = db.run(sql, [...values, id]);

  
  // return the new changes.
  return {
    changes: result.changes,
    lastInsertRowid: result.lastInsertRowid
  };
};


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