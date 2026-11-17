// One axios instance used by the whole frontend.
// It automatically attaches the login token to every request.
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Runs before every request: add "Authorization: Bearer <token>" if the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// Runs after every response: if the token expired (401), log the user out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config && error.config.url.startsWith("/auth/login");
    if (error.response && error.response.status === 401 && !isLoginCall) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Turns an error into a message we can show to the user.
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (!error.response) {
    return "Cannot reach the server. If it was idle, please wait 30 seconds and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default api;
