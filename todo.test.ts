import { expect, test, describe, beforeEach } from "bun:test";
import { db } from "../Bun-api/db";

const APP_URL = "http://localhost:3000";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  details?: any[];
}

describe("Todo API Console Debug Tests", () => {
  
  beforeEach(() => {
    db.run("DELETE FROM todos");
    
    db.run(
      "INSERT INTO todos (id, title, content, done) VALUES (?, ?, ?, ?)",
      1, 
      "Debug Task", 
      "Check the console logs", 
      0
    );
  });

  test("DEBUG: Successful Patch", async () => {
    const response = await fetch(`${APP_URL}/api/todos/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Logs should show this",
        done: true 
      }),
    });

    const body = (await response.json()) as ApiResponse;
    
    console.log("Response status:", response.status);
    console.log("Response body:", body);
    
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("DEBUG: Validation Failure", async () => {
    const response = await fetch(`${APP_URL}/api/todos/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: 12345 
      }),
    });

    const body = (await response.json()) as ApiResponse;
    
    console.log("Validation error status:", response.status);
    console.log("Validation error body:", body);
    
    expect(response.status).toBe(400);  // ✅ Changed to 400
    expect(body.success).toBe(false);
    expect(body.error).toBe("Validation Error");
    expect(body.details).toBeDefined();
  });

  test("DEBUG: Empty Body Test", async () => {
    const response = await fetch(`${APP_URL}/api/todos/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const body = (await response.json()) as ApiResponse;
    
    console.log("Empty body status:", response.status);
    console.log("Empty body response:", body);
    
    expect(response.status).toBe(400);
    expect(body.error).toBe("No valid fields provided for update");
  });

  test("DEBUG: Non-existent Todo", async () => {
    const response = await fetch(`${APP_URL}/api/todos/999`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "This todo doesn't exist"
      }),
    });

    const body = (await response.json()) as ApiResponse;
    
    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Todo not found");
  });
});