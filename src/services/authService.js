const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("fitbuddy.token");
}

async function parseResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API}${path}`, options);
    return await parseResponse(res);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Unable to reach the FitBuddy server. Start the backend or check VITE_API_URL.");
    }
    throw error;
  }
}

export async function requestPasswordReset(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export function googleSignInPlaceholder() {
  return {
    pendingBackend: true,
    message: "Google sign-in will be available when the backend is connected.",
  };
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("fitbuddy.user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && !user.id && user._id) user.id = String(user._id);
    return user;
  } catch {
    localStorage.removeItem("fitbuddy.user");
    return null;
  }
}

function cacheUser(user) {
  if (user) localStorage.setItem("fitbuddy.user", JSON.stringify(user));
  else localStorage.removeItem("fitbuddy.user");
}

export async function signup({ name, email, password }) {
  const data = await request("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
  });
  localStorage.setItem("fitbuddy.token", data.token);
  cacheUser(data.user);
  return data.user;
}

export async function login({ email, password }) {
  const data = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  localStorage.setItem("fitbuddy.token", data.token);
  cacheUser(data.user);
  return data.user;
}

export function logout() {
  localStorage.removeItem("fitbuddy.token");
  localStorage.removeItem("fitbuddy.user");
}

export async function persistUser(updated) {
  const data = await request("/api/auth/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updated),
  });
  cacheUser(data.user || data);
  return data.user || data;
}

export function getSession() {
  const token = getToken();
  return token ? { token } : null;
}
