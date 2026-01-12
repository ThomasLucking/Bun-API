import { Database } from 'bun:sqlite';
import type { Todo } from './Schema';
type SQLiteValue = string | number | null;



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

const validColumns = ['title', 'content', 'due_date', 'done'] as const;

export const modifyTodo = (id: number, updates: Partial<Todo>): Todo | null => {
  const keys = Object.keys(updates) as Array<keyof Todo>;

  const isSafe = keys.every(key => validColumns.includes(key));

  if(!isSafe){
    throw new Error("Security Violation: Unauthorized column access")
  }
  if (keys.length === 0) {
    throw new Error("No fields to update");
  }
  const setClause = keys.map((key) => `${key} = ?`).join(", ");

  const values: SQLiteValue[] = keys.map((key) => {
    const value = updates[key];
    if (typeof value === "boolean") return value ? 1 : 0;

    return (value as SQLiteValue) ?? null;
  });

  const transaction = db.transaction((targetId: number, params: SQLiteValue[]): Todo | null => {
    const sql = `UPDATE todos SET ${setClause} WHERE id = ? RETURNING *`;
    return db.prepare(sql).get(...params, targetId) as Todo | null;
  });

  return transaction(id, values);
};


export const findTodoById = (id: number): Todo | null => {
  return db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as Todo | null;
};

export const deleteTodoById = (id: number): boolean => {
  const transaction = db.transaction((todoId: number) => {  
    const result = db.prepare("DELETE FROM todos WHERE id = ?").run(todoId);
    return result.changes > 0;
  });
  
  return transaction(id);
};

export const insertTodo = (todo: Omit<Todo, 'id'>) => {
  const stmt = db.prepare(`
    INSERT INTO todos (title, content, due_date, done)
    VALUES ($title, $content, $due_date, $done) 
    RETURNING *
  `);
  
  return stmt.get({
    $title: todo.title,
    $content: todo.content,
    $due_date: todo.due_date,
    $done: todo.done ? 1 : 0
  }) as Todo;
};


const allTodos = db.query("select * from todos").all();
console.log("All Todos:", allTodos);


console.log("Database and table initialized successfully!");