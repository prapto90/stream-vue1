export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===============================
    // 1. API PROXY KE VPS PYTHON
    // ===============================
    if (url.pathname.startsWith("/api/")) {
      const target =
        env.API_BASE_URL + url.pathname.replace("/api", "");
        console.log("API:", env.API_BASE_URL);

      return fetch(target, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" ? request.body : null,
      });
    }

    // ===============================
    // 2. ROOT → index.html
    // ===============================
    if (url.pathname === "/") {
      return env.ASSETS.fetch(new Request("/index.html", request));
    }

    // ===============================
    // 3. FILE STATIS
    // ===============================
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) {
      return asset;
    }

    // ===============================
    // 4. SPA FALLBACK (Vue Router)
    // ===============================
    return env.ASSETS.fetch(new Request("/index.html", request));
  }
};
