const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      // Required so the browser sends/receives the httpOnly session
      // cookie set by the server on login/signup.
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (networkError) {
    const err = new Error(
      "Couldn't reach the ExecutiveOS server. Check your connection and that the server is running."
    );
    err.cause = networkError;
    throw err;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no/invalid JSON body — fine for e.g. 204s
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
};

export default api;