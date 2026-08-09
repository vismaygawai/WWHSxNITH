import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});



// Handle 401 responses — auto-logout on expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      // Trigger storage event for AuthBridge in __root.tsx
      window.dispatchEvent(new StorageEvent("storage", { key: "user", newValue: null }));
    }
    return Promise.reject(error);
  },
);

export default api;
