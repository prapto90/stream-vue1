export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===== API AUTH PROXY =====
    if (url.pathname.startsWith("/auth/")) {
      const target = env.API_BASE_URL + url.pathname;

      const body =
        request.method !== "GET"
          ? await request.text()
          : null;

      return fetch(target, {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body,
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
