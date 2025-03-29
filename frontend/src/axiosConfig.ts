import axios from "axios";

const api = axios.create({
  baseURL: "http://mnt-hosts.dev-strvictor.online/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Adiciona o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Trata erros de autenticação e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verifica se é um erro 401 (não autorizado) e se não é uma tentativa de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("token/refresh/")
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          console.log("Tentando atualizar o token...");
          const response = await api.post(
            "/token/refresh/",
            { refresh: refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          const { access } = response.data;
          console.log("Token atualizado com sucesso");

          localStorage.setItem("accessToken", access);
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        } catch (refreshError) {
          console.error("Falha ao atualizar o token", refreshError);
          // Limpa os tokens e redireciona para login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          // Usa window.location para garantir um redirecionamento completo
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        console.log("Nenhum refresh token disponível");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
