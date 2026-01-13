import { queryTodos, insertTodo, modifyTodo, deleteTodoById, db } from '../db/db';
import { TodosSchema, OptionalTodoSchema } from '../schemas/Schema';
import * as v from 'valibot';
import { jsonResponse } from '../utils/utils'; // Single source of truth

export const getRoute = () => {
    try {
        const data = queryTodos();
        if (!data || data.length === 0) {
            return jsonResponse({ success: false, error: "No todos found" }, { status: 404 });
        }
        return jsonResponse(data);
    } catch (err) {
        return jsonResponse({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};

export const postRoute = async (req: Request) => {
    try {
        const body = await req.json();
        const validate = v.parse(TodosSchema, body);
        const newTodo = insertTodo(validate);
        return jsonResponse(newTodo, { status: 201 });
    } catch (err: unknown) {
        if (err instanceof v.ValiError) {
            return jsonResponse(
                { success: false, error: "Validation Error", issues: err.issues },
                { status: 400 }
            );
        }
        return jsonResponse({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
};

export const deleteAllRoute = () => {
    try {
        const result = db.run("DELETE FROM todos");
        return jsonResponse({ success: true, message: `Deleted ${result.changes} tasks` });
    } catch (err) {
        return jsonResponse({ error: "Failed to delete tasks" }, { status: 500 });
    }
};

export const handleUpdateTodo = async (req: Request) => {
    try {

        const url = new URL(req.url);
        const id = Number(url.pathname.split('/').filter(Boolean).pop());

        if (isNaN(id)) {
            return jsonResponse({ success: false, error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const validatedData = v.parse(OptionalTodoSchema, body);

        const updatedTodo = modifyTodo(id, validatedData);

        if (!updatedTodo) {
            return jsonResponse({ success: false, message: "Todo not found" }, { status: 404 });
        }
        return jsonResponse({ success: true, data: updatedTodo });
    } catch (error: any) {
        if (error instanceof v.ValiError) {
            return jsonResponse({ success: false, error: "Validation Error", issues: error.issues }, { status: 400 });
        }
        return jsonResponse({ error: error.message || "Server Error" }, { status: 500 });
    }
};

export const deleteTodoRoute = (req: Request) => {
    try {
        const url = new URL(req.url);
        const id = Number(url.pathname.split('/').filter(Boolean).pop());

        if (isNaN(id)) {
            return jsonResponse({ success: false, error: "Invalid ID" }, { status: 400 });
        }

        const wasDeleted = deleteTodoById(id);
        if (!wasDeleted) {
            return jsonResponse({ success: false, message: "Todo not found" }, { status: 404 });
        }
        return jsonResponse({ success: true, message: "Todo deleted successfully" });
    } catch (err: any) {
        return jsonResponse({ error: err.message || "Server Error" }, { status: 500 });
    }
};