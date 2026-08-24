const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export function getApiToken() {
  return localStorage.getItem("fitbuddy.token") || "";
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getApiToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response;
  try {
    response = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error("Unable to reach the FitBuddy server. Start the backend or check VITE_API_URL.");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  return body;
}
