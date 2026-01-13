import { Database, } from 'bun:sqlite';
import type { Todo } from './Schema';

export const db = new Database("mydb.sqlite", { create: true });
type SQLiteValue = string | number | bigint | Uint8Array | boolean | null;

const sql = `create table if not exists todos (
    id integer primary key autoincrement,
    title text not null check(length(title) <= 250),
    content text not null,
    due_date text,
    done boolean not null default 0
);`;

db.run(sql);

const validColumns = ["title", "content", "due_date", "done"];

export const queryTodos = () => db.query('select * from todos').all();

export const insertStmt = db.prepare(`
  insert into todos (title, content, due_date, done)
  values ($title, $content, $due_date, $done) 
  returning *
`);

export const modifyTodo = (id: number, updates: Partial<Todo>): Todo | null => {
  // get the keys of the object of the database
  const keys = Object.keys(updates) as Array<keyof Todo>;

  // verify them
  const isSafe = keys.every(key => validColumns.includes(key));
  if (!isSafe) {
    throw new Error("Security Violation: Unauthorized column access");
  }
  if (keys.length === 0) {
    throw new Error("No fields to update");
  }
  // Data transformation from true or false to 1 or 0
  const values: SQLiteValue[] = keys.map((key) => {
    const value = updates[key];
    if (typeof value === "boolean") return value ? 1 : 0;
    return (value as SQLiteValue) ?? null;
  });
  // Query template
  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  // setting the new values inside the database using db.transaction for it to be one atomic operation.
  const transaction = db.transaction((targetId: number, params: SQLiteValue[]): Todo | null => {
    const sql = `update todos set ${setClause} where id = ? returning *`;
    return db.prepare(sql).get(...params, targetId) as Todo | null;
  });

  return transaction(id, values);
};

export const findTodoById = (id: number) =>
  db.prepare("select * from todos where id = ?").get(id) as Todo | null;

export const deleteTodoById = (id: number) => {
  const result = db.prepare("delete from todos where id = ?").run(id);
  return result.changes > 0; 
};

export const insertTodo = (todo: Todo) => {
  return insertStmt.get({
    $title: todo.title,
    $content: todo.content,
    $due_date: todo.due_date,
    $done: todo.done ? 1 : 0
  }) as Todo;
};