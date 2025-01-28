import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../axiosConfig';

const PrivateRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        console.log('Token encontrado:', token);
        try {
          // Enviando o token no corpo da requisição
          await api.post('token/verify/', {
            token: token, // Envia o token no payload
          });
          console.log('Token válido');
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token inválido ou expirado:', error.response?.data || error.message);
          setIsAuthenticated(false);
        }
      } else {
        console.log('Nenhum token encontrado');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Carregando...</div>; // Componente de carregamento enquanto verifica
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
