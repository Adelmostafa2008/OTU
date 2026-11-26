import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(onSuccess, onFailure) {
  refreshSubscribers.push({ onSuccess, onFailure });
}

function onRefreshSuccess(token) {
  refreshSubscribers.forEach(({ onSuccess }) => onSuccess(token));
  refreshSubscribers = [];
}

function onRefreshFailure(error) {
  refreshSubscribers.forEach(({ onFailure }) => onFailure(error));
  refreshSubscribers = [];
}

function setErrorMessage(target, data) {
  if (typeof data === "string") {
    target.plainMessage = data;
    target.message = data;
  } else if (data && typeof data === "object") {
    const msg = data.message || data.error || data.msg;
    if (typeof msg === "string") {
      target.plainMessage = msg;
      target.message = msg;
    }
  }
}

function extractToken(data) {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return null;
  return (
    data.token ||
    data.accessToken ||
    data.access_token ||
    data.data?.token ||
    data.data?.accessToken ||
    data.data?.access_token ||
    null
  );
}

function isRefreshRequest(config) {
  const url = config?.url || "";
  return url === "/Reg/Refresh" || url.endsWith("/Reg/Refresh");
}

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch {
    // ignore
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers = config.headers || {};
    // Let the browser/axios set the multipart boundary automatically.
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

api.interceptors.response.use(
  (success) => {
    setErrorMessage(success, success?.data);
    return success;
  },

  async (err) => {
    const originalConfig = err.config || {};

    if (isRefreshRequest(originalConfig)) {
      localStorage.removeItem("user");
      window.location.href = "/login";
      setErrorMessage(err, err?.response?.data);
      return Promise.reject(err);
    }

    if (err.response?.status !== 401) {
      const data = err?.response?.data;
      setErrorMessage(err, data);
      if (err.response) {
        setErrorMessage(err.response, data);
      }
      return Promise.reject(err);
    }

    if (originalConfig._retry) {
      setErrorMessage(err, err?.response?.data);
      return Promise.reject(err);
    }

    // Queue concurrent requests while a refresh is in progress so only one
    // refresh call is made (avoids refresh-token rotation invalidating others).
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (token) => {
            originalConfig.headers = originalConfig.headers || {};
            originalConfig.headers.Authorization = `Bearer ${token}`;
            originalConfig._retry = true;
            resolve(api(originalConfig));
          },
          (error) => {
            reject(error);
          },
        );
      });
    }

    originalConfig._retry = true;
    isRefreshing = true;

    try {
      const res = await api.post("/Reg/Refresh");

      const token = extractToken(res?.data);
      if (token) {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user) {
            user.token = token;
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch {
          // ignore
        }
      }

      const latestToken = (() => {
        try {
          return JSON.parse(localStorage.getItem("user"))?.token || token;
        } catch {
          return token;
        }
      })();

      if (latestToken) {
        originalConfig.headers = originalConfig.headers || {};
        originalConfig.headers.Authorization = `Bearer ${latestToken}`;
      }

      onRefreshSuccess(latestToken);
      return await api(originalConfig);
    } catch (refreshError) {
      setErrorMessage(refreshError, refreshError?.response?.data);
      onRefreshFailure(refreshError);
      // The refresh request's own failure is handled by the refresh-URL branch
      // above (logout + redirect). Reject queued/original callers here without
      // triggering an extra redirect.
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
