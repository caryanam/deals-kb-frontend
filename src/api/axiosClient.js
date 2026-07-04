import axios from "axios";

// ── One-time migration: move legacy localStorage token to sessionStorage ──────
// Users who were logged in before the sessionStorage migration will have
// their token in localStorage. Move it once so they don't get logged out.
(function migrateAuthSession() {
  const legacyToken = localStorage.getItem("access_token");
  const legacyUser = localStorage.getItem("user");
  if (legacyToken && !sessionStorage.getItem("access_token")) {
    sessionStorage.setItem("access_token", legacyToken);
    if (legacyUser) sessionStorage.setItem("user", legacyUser);
  }
  // Remove from localStorage so subsequent tabs do NOT auto-inherit the session
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
})();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Read token from sessionStorage (tab-isolated)
  const token = sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user");
      // Force page refresh and redirect to /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
