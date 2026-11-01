/**
 * Centralized API Client for ReferralHub
 * Contract-first, supports JSON, FormData, and Blob downloads.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const getToken = () => localStorage.getItem("jwt_token");
export const setToken = (t) => {
  if (t) localStorage.setItem("jwt_token", t);
  else localStorage.removeItem("jwt_token");
};
export const clearToken = () => localStorage.removeItem("jwt_token");

export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Universal API Request Helper
 * @param {string} endpoint - e.g. "/jobs" or "/referrals"
 * @param {object} options - fetch options + optional responseType: 'blob' | 'json'
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    let errJson = null;
    try {
      errJson = await response.json();
    } catch {
      // ignore
    }
    throw new ApiError(401, errJson?.message || "Invalid or expired session. Please sign in again.");
  }

  if (!response.ok) {
    let errJson = null;
    let rawText = "";
    try {
      rawText = await response.text();
      errJson = JSON.parse(rawText);
    } catch {
      // not JSON
    }

    const status = response.status;
    const message = errJson?.message || rawText || `Request failed with status ${status}`;
    const fieldErrors = errJson?.errors || {};
    throw new ApiError(status, message, fieldErrors);
  }

  if (options.responseType === "blob") {
    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    let filename = "download";
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "");
      }
    }
    return { blob, filename, contentType: response.headers.get("content-type") };
  }

  // 204 No Content
  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Backward compatibility export
export const apiFetch = (path, options) => apiRequest(path, options);
export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
export const API = API_BASE_URL;