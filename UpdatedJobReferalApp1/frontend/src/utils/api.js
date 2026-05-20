export const API = "http://localhost:9090";

export const getToken = () => localStorage.getItem("jwt_token");
export const setToken = (t) => localStorage.setItem("jwt_token", t);
export const clearToken = () => localStorage.removeItem("jwt_token");

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);
  if (!res.ok) {
    const err = await res.text().catch(() => "Request failed");
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json().catch(() => null);
}