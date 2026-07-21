import axios from "axios";

(function migrateAuthSession() {
  const legacyToken = localStorage.getItem("access_token");
  const legacyUser = localStorage.getItem("user");
  if (legacyToken && !sessionStorage.getItem("access_token")) {
    sessionStorage.setItem("access_token", legacyToken);
    if (legacyUser) sessionStorage.setItem("user", legacyUser);
  }
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
})();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const PUBLIC_AUTH_BYPASS_PATHS = [
  "/auth/delete-account/verify",
  "/auth/delete-account/confirm",
  "/auth/forgot-password/send-otp",
  "/auth/forgot-password/verify-otp",
  "/auth/forgot-password/reset",
  "/auth/send-registration-otp",
  "/auth/check-registration-otp",
  "/auth/verify-registration-otp",
  "/payments/",
];

const shouldBypassUnauthorizedRedirect = (error) => {
  const requestUrl = error?.config?.url || "";
  return PUBLIC_AUTH_BYPASS_PATHS.some((path) => requestUrl.includes(path));
};

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !shouldBypassUnauthorizedRedirect(error)) {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user");
      const currentPath = window.location.pathname || "";
      const isProtected = currentPath.startsWith("/buyer") || 
                          currentPath.startsWith("/seller") || 
                          currentPath.startsWith("/dealer") || 
                          currentPath.startsWith("/admin");
      if (isProtected && currentPath !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
