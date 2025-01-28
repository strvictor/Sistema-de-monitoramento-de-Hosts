import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent } from "./ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useNavigate } from 'react-router-dom';
import api from '../axiosConfig'; // Importando o Axios configurado


import axios from 'axios';

import { RegisterForm } from "./RegisterForm";  // Importando o componente RegisterForm

export function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (data: { username: string; password: string }) => {
    try {
      const response = await api.post('token/', data);
  
      // Pegando o token JWT (access e refresh)
      const { access, refresh } = response.data;
  
      // Salvando os tokens no localStorage
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
  
      console.log("Login bem-sucedido, tokens armazenados!");
      console.log(access);
      console.log(refresh);
  

      navigate('/dashboard');  // Redireciona para a página Dashboard
      
      
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.response?.data || error.message);
      const errorAlert = document.getElementById('card-error');
      if (errorAlert) {
        errorAlert.classList.remove('hidden');
      }
    };
  };

  return (
    <div>
      <Alert id="card-error" className="mb-4 mt-4 hidden">
        <AlertTitle className="text-red-400">Ops, tivemos um problema!</AlertTitle>
        <AlertDescription className="text-red-100">
          E-mail ou senha inválidos.
        </AlertDescription>
      </Alert>
      <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin({ username, password });
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            E-mail
          </label>
          <Input
            id="username"
            type="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite seu e-mail"
            className="border border-gray-300"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            className="border border-gray-300"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>

      <div className="text-center mt-4">
        <p>Não tem uma conta? </p>
        <Button
          variant="link"
          onClick={() => setIsModalOpen(true)}
          className="text-blue-500 underline"
        >
        Cadastre-se agora!
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent  className="sm:max-w-[625px]">
            <RegisterForm /> 
        </DialogContent>
      </Dialog>
    </div>
  );
}
