import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Origine brute du backend (sans le préfixe /api) : nécessaire pour rediriger
// le navigateur vers /oauth2/authorization/google, qui n'est pas un endpoint REST.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Envoie automatiquement les cookies HttpOnly
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur : gère les 401 globalement.
// On exclut /auth/me : un 401 sur cet appel signifie juste "visiteur non
// connecté" (utilisé pour hydrater la session au chargement), pas une
// session expirée — sinon tout visiteur anonyme serait redirigé en boucle.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionCheck = error.config?.url?.includes("/auth/me");
    if (error.response?.status === 401 && !isSessionCheck && window.location.pathname !== "/auth") {
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);