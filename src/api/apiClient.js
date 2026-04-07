import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5115/api"
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    if (status === 429) {
      window.dispatchEvent(
        new CustomEvent("apiError", {
          detail: "Too many requests. Please wait a moment."
        })
      );
    }

    if (status === 500) {
      window.dispatchEvent(
        new CustomEvent("apiError", {
          detail: "Something went wrong. Please try again."
        })
      );
    }

    return Promise.reject(err);
  }
);

export default apiClient;