import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send the httpOnly refresh-token cookie
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("roomnest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent access-token refresh: if a request fails with 401 (expired access
// token), try exchanging the httpOnly refresh cookie for a new access token
// once, then retry the original request. If that also fails, the session is
// truly over and the app falls back to the logged-out state.
let refreshPromise = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = client.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        }
        const res = await refreshPromise;
        localStorage.setItem("roomnest_token", res.data.token);
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        return client(originalRequest);
      } catch {
        localStorage.removeItem("roomnest_token");
      }
    }

    return Promise.reject(error);
  }
);

export default client;
