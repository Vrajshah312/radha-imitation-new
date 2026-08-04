// Tiny fetch client with an axios-like shape so components read res.data and
// err.response.data.message. Same-origin — auth uses an httpOnly cookie.
async function request(method, path, { params, data } = {}) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const path2 = path.startsWith("/api") ? path.slice(4) : path;
  const url = new URL(path.startsWith("http") ? path : `/api${path2}`, base || "http://localhost:3000");
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || "Request failed");
    err.response = { data: json, status: res.status };
    throw err;
  }
  return { data: json };
}

const api = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
};

export default api;
