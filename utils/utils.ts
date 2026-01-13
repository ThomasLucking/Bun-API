
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Prefer, Origin",
};

export const jsonResponse = (data: any, options: ResponseInit = {}) => {
  return new Response(JSON.stringify(data), {
    ...options,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};