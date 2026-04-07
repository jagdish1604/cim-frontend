import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5115/api"
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    if (err.response?.status === 429) {
      alert("Too many requests. Please wait.");
    }
    return Promise.reject(err);
  }
);

export default apiClient;