export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===== API PROXY =====
    if (url.pathname.startsWith("/auth/")) {
      const target = env.API_BASE_URL + url.pathname;

      return fetch(target, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" ? request.body : null,
      });
    }

    // ===== SPA =====
    if (url.pathname === "/") {
      return env.ASSETS.fetch(new Request("/index.html", request));
    }

    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;

    return env.ASSETS.fetch(new Request("/index.html", request));
  }
};
