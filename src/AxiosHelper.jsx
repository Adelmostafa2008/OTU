import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

api.interceptors.response.use(
  (success) => {
    const data = success?.data;
    if (typeof data === "string") {
      success.plainMessage = data;
      success.message = data;
    } else if (data && typeof data === "object") {
      const msg = data.message || data.error || data.msg;
      if (typeof msg === "string") {
        success.plainMessage = msg;
        success.message = msg;
      }
    }
    return success;
  },

  async (err) => {
    if (err.config?.url == "/Reg/Refresh") {
      localStorage.removeItem("user");
      window.location.href = "/login";
      const data = err?.response?.data;
      if (typeof data === "string") {
        err.plainMessage = data;
        err.message = data;
      } else if (data && typeof data === "object") {
        const msg = data.message || data.error || data.msg;
        if (typeof msg === "string") {
          err.plainMessage = msg;
          err.message = msg;
        }
      }
      return Promise.reject(err);
    }

    if (err.response?.status != 401) {
      const data = err?.response?.data;
      if (typeof data === "string") {
        err.plainMessage = data;
        err.message = data;
        if (err.response) {
          err.response.plainMessage = data;
          err.response.message = data;
        }
      } else if (data && typeof data === "object") {
        const msg = data.message || data.error || data.msg;
        if (typeof msg === "string") {
          err.plainMessage = msg;
          err.message = msg;
          if (err.response) {
            err.response.plainMessage = msg;
            err.response.message = msg;
          }
        }
      }
      return Promise.reject(err);
    } else {
      if (err.config._retry) {
        const data = err?.response?.data;
        if (typeof data === "string") {
          err.plainMessage = data;
          err.message = data;
        } else if (data && typeof data === "object") {
          const msg = data.message || data.error || data.msg;
          if (typeof msg === "string") {
            err.plainMessage = msg;
            err.message = msg;
          }
        }
        return Promise.reject(err);
      }

      err.config._retry = true;

      try {
        const res = await api.post("/Reg/Refresh", {
          withCredentials: true,
        });

        try {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user) {
            const tokenData = res?.data;
            const token =
              typeof tokenData === "string"
                ? tokenData
                : tokenData?.["token"] || tokenData?.token || tokenData?.accessToken;
            if (token) {
              user.token = token;
              localStorage.setItem("user", JSON.stringify(user));
            }
            if (user?.token) {
              err.config.headers.Authorization = `Bearer ${user.token}`;
            }
          }
        } catch (e) {
          // ignore
        }

        return await api(err.config);
      } catch (error) {
        const data = error?.response?.data;
        if (typeof data === "string") {
          error.plainMessage = data;
          error.message = data;
        } else if (data && typeof data === "object") {
          const msg = data.message || data.error || data.msg;
          if (typeof msg === "string") {
            error.plainMessage = msg;
            error.message = msg;
          }
        }
        throw error;
      }
    }
  },
);

export default api;
