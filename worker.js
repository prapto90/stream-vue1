export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // proxy ke backend
    const target = env.API_BASE_URL + url.pathname;

    return fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" ? request.body : null
    });
  }
};
