return new Response(
  JSON.stringify({
    api_base: env.API_BASE_URL,
    path: new URL(request.url).pathname
  }),
  { headers: { "Content-Type": "application/json" } }
);
